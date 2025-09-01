// ==UserScript==
// @name         IVAC Full Auto Fill_Final
// @namespace    mylab.ivac.autofill
// @author       Rupon
// @match        https://payment.ivacbd.com/*
// @match        https://*.ivacbd.com/*
// @run-at       document-idle
// @inject-into  page
// @grant        none
// @version      3.5
// ==/UserScript==

(() => {
  // Utility functions
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const fire = (el, t) => el && el.dispatchEvent(new Event(t, {bubbles: true, cancelable: true}));

  const setReact = (el, v) => {
    if (!el) return false;
    const p = el instanceof HTMLInputElement ? HTMLInputElement.prototype :
              el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype :
              el instanceof HTMLSelectElement ? HTMLSelectElement.prototype :
              Object.getPrototypeOf(el);
    const d = Object.getOwnPropertyDescriptor(p, "value");
    d && d.set ? d.set.call(el, v) : el.value = v;
    el.focus?.();
    fire(el, "input");
    fire(el, "change");
    el.blur?.();
    return String(el.value ?? "") === String(v ?? "");
  };

  const missionSel = () => $('select#center') && $$('select#center').find(s =>
    [...s.options].some(o => /Dhaka|Chittagong|Rajshahi|Sylhet|Khulna/i.test(o.textContent || ""))
  );

  const ivacSel = () => $('select#center') && $$('select#center').find(s =>
    [...s.options].some(o => /^IVAC,/i.test(o.textContent || ""))
  );

  const saveBtn = () => $$('button').find(b => /Save and Next/i.test(b.textContent || ""));
  const enableBtn = b => {
    if (!b) return;
    b.disabled = false;
    b.removeAttribute('disabled');
    b.classList.remove('disabled', 'opacity-50', 'cursor-not-allowed');
  };

  const sleep = ms => new Promise(r => setTimeout(r, ms));

  const waitFor = (fn, ms = 1e4, step = 150) => new Promise(res => {
    const t0 = performance.now();
    const id = setInterval(() => {
      let v;
      try { v = fn(); } catch {}
      if (v) {
        clearInterval(id);
        res(v);
      } else if (performance.now() - t0 > ms) {
        clearInterval(id);
        res(null);
      }
    }, step);
  });

  const getData = () => {
    try {
      const r = localStorage.getItem("ivac_file_info");
      return r ? JSON.parse(r) : null;
    } catch {
      return null;
    }
  };

  // Auto-fill functions
  function fillApplication() {
    const D = getData();
    if (!D) return false;

    const ms = missionSel();
    if (ms && D.highCom != null) {
      ms.value = String(D.highCom);
      fire(ms, "change");
    }

    setReact($("#webfile_id"), D.applicant_webfile || D.webfile_id || "");

    const conf = $$("label").find(l => /ONCE AGAIN/i.test(l.textContent || ""))?.closest(".sm\\:col-span-3")?.querySelector("input");
    setReact(conf, D.applicant_webfile || D.webfile_id || "");

    const iv = ivacSel();
    if (iv && D.ivacId != null) {
      const opt = [...iv.options].find(o => String(o.value || "").endsWith("|" + D.ivacId));
      if (opt) {
        iv.value = opt.value;
        fire(iv, "change");
      }
    }

    const visa = $("#visa_type");
    if (visa && D.VisaTypeId != null) {
      visa.value = String(D.VisaTypeId);
      fire(visa, "change");
    }

    const fam = $("#family_count");
    if (fam && D.familyCount != null) {
      fam.value = String(D.familyCount);
      fire(fam, "change");
    }

    setReact($("#visit_purpose"), D.purposeTxt || "");
    enableBtn(saveBtn());
    console.log("[IVAC] Application filled");
    return true;
  }

  function fillFamily() {
    const D = getData();
    if (!D) return false;

    setReact($("#full-name"), D.applicant_name || "");
    setReact($("#email"), D.email || "");
    setReact($("#user_phone"), D.mobile || "");
    setReact($("#webfile_id"), D.applicant_webfile || D.webfile_id || "");

    // Fill family members data
    if (D.familyData && D.familyData.length > 0) {
      D.familyData.forEach((m, i) => {
        if (i >= 4) return; // Maximum 4 family members

        // Wait for inputs to be available
        setTimeout(() => {
          const nameInput = $(`#full-name-${i}`);
          const webFileInput = $(`#web-file-number-${i}`);
          const webFileRepeatInput = $(`#web-file-number-repeat-${i}`);

          if (nameInput) setReact(nameInput, m.name || "");
          if (webFileInput) setReact(webFileInput, m.webfile_no || "");
          if (webFileRepeatInput) setReact(webFileRepeatInput, m.webfile_no || "");
        }, 100 * (i + 1));
      });
    }

    enableBtn(saveBtn());
    console.log("[IVAC] Family filled");
    return true;
  }

  async function fillCurrentPage() {
    await waitFor(() => missionSel() || ivacSel() || ($("#email") && $("#user_phone")), 8000, 200);
    let did = false;

    if (missionSel() || ivacSel()) did = fillApplication() || did;
    if ($("#email") && $("#user_phone")) did = fillFamily() || did;

    if (!did) console.log("IVAC: No known form on this page.");
    return did;
  }

  // Input panel functions (compact)
  function createInputPanel() {
    if ($("#ivacInputPanel")) return $("#ivacInputPanel").style.display = "flex";

    const wrap = document.createElement("div");
    wrap.id = "ivacInputPanel";
    wrap.style.cssText = "position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.35);z-index:2147483646;";

    wrap.innerHTML = `
      <div id="ivacPanelContent" style="width:min(280px,80vw);background:#fff;border-radius:8px;box-shadow:0 8px 24px rgba(0,0,0,.2);padding:12px;max-height:85vh;overflow-y:auto;font:12px system-ui;cursor:move;">
        <div id="ivacFormContainer" style="display:grid;gap:8px">
          <div>
            <label style="display:block;font-weight:600;margin-bottom:2px;font-size:11px">High Commission:</label>
            <select id="ivacHighCom" style="width:100%;padding:4px;border:1px solid #ccc;border-radius:3px;font-size:11px">
              <option value="1">Dhaka</option>
              <option value="2">Chittagong</option>
              <option value="3">Rajshahi</option>
              <option value="4">Sylhet</option>
              <option value="5">Khulna</option>
            </select>
          </div>

          <div>
            <label style="display:block;font-weight:600;margin-bottom:2px;font-size:11px">IVAC Center:</label>
            <select id="ivacCenter" style="width:100%;padding:4px;border:1px solid #ccc;border-radius:3px;font-size:11px"></select>
          </div>

          <div>
            <label style="display:block;font-weight:600;margin-bottom:2px;font-size:11px">Web File No:</label>
            <input type="text" id="ivacWebFile" placeholder="Enter Web File" style="width:100%;padding:4px;border:1px solid #ccc;border-radius:3px;font-size:11px">
          </div>

          <div>
            <label style="display:block;font-weight:600;margin-bottom:2px;font-size:11px">Visa Type:</label>
            <select id="ivacVisaType" style="width:100%;padding:4px;border:1px solid #ccc;border-radius:3px;font-size:11px">
              <option value="3">TOURIST VISA</option>
              <option value="13" selected>MEDICAL VISA</option>
              <option value="1">BUSINESS VISA</option>
              <option value="6">ENTRY VISA</option>
              <option value="19">DOUBLE ENTRY VISA</option>
              <option value="2">STUDENT VISA</option>
              <option value="18">OTHERS VISA</option>
            </select>
          </div>

          <div>
            <label style="display:block;font-weight:600;margin-bottom:2px;font-size:11px">Family Members:</label>
            <select id="ivacFamilyCount" style="width:100%;padding:4px;border:1px solid #ccc;border-radius:3px;font-size:11px">
              <option value="0">0</option><option value="1">1</option><option value="2">2</option>
              <option value="3">3</option><option value="4">4</option>
            </select>
          </div>

          <div>
            <label style="display:block;font-weight:600;margin-bottom:2px;font-size:11px">Visit Purpose:</label>
            <textarea id="ivacVisitPurpose" placeholder="Enter Purpose" style="width:100%;padding:4px;border:1px solid #ccc;border-radius:3px;min-height:35px;resize:vertical;font-size:11px"></textarea>
          </div>

          <div>
            <label style="display:block;font-weight:600;margin-bottom:2px;font-size:11px">Family Data:</label>
            <textarea id="ivacFamilyData" placeholder="Format: NAME\nWEBFILE\nNAME\nWEBFILE" style="width:100%;padding:4px;border:1px solid #ccc;border-radius:3px;min-height:60px;resize:vertical;font-family:monospace;font-size:11px"></textarea>
          </div>

          <div style="display:flex;flex-wrap:wrap;gap:4px;justify-content:space-between;margin-top:6px;border-top:1px solid #eee;padding-top:8px">
            <button id="ivacClear" style="border:0;border-radius:3px;padding:4px 8px;font:600 11px system-ui;background:#f87171;color:#111;flex:1">Clear</button>
            <button id="ivacExport" style="border:0;border-radius:3px;padding:4px 8px;font:600 11px system-ui;background:#059669;color:#fff;flex:1">Export</button>
            <button id="ivacImport" style="border:0;border-radius:3px;padding:4px 8px;font:600 11px system-ui;background:#7c3aed;color:#fff;flex:1">Import</button>
            <button id="ivacCancel" style="border:0;border-radius:3px;padding:4px 8px;font:600 11px system-ui;background:#e5e7eb;color:#111;flex:1">Cancel</button>
            <button id="ivacSave" style="border:0;border-radius:3px;padding:4px 8px;font:600 11px system-ui;background:#16a34a;color:#fff;flex:1">Save</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(wrap);

    // Make panel draggable
    let isDragging = false;
    let dragOffsetX, dragOffsetY;
    const panelContent = $("#ivacPanelContent");

    panelContent.addEventListener("mousedown", (e) => {
      if (e.target.tagName !== "INPUT" && e.target.tagName !== "SELECT" && e.target.tagName !== "TEXTAREA" && e.target.tagName !== "BUTTON") {
        isDragging = true;
        dragOffsetX = e.clientX - panelContent.getBoundingClientRect().left;
        dragOffsetY = e.clientY - panelContent.getBoundingClientRect().top;
        panelContent.style.cursor = "grabbing";
      }
    });

    document.addEventListener("mousemove", (e) => {
      if (isDragging) {
        panelContent.style.position = "absolute";
        panelContent.style.left = (e.clientX - dragOffsetX) + "px";
        panelContent.style.top = (e.clientY - dragOffsetY) + "px";
        panelContent.style.transform = "none";
        panelContent.style.margin = "0";
      }
    });

    document.addEventListener("mouseup", () => {
      if (isDragging) {
        isDragging = false;
        panelContent.style.cursor = "move";
      }
    });

    wrap.addEventListener("click", e => {
      if (e.target === wrap) wrap.style.display = "none";
    });

    $("#ivacCancel").onclick = () => wrap.style.display = "none";

    $("#ivacClear").onclick = () => {
      localStorage.removeItem("ivac_file_info");
      $("#ivacHighCom").value = "1";
      $("#ivacWebFile").value = "";
      $("#ivacVisaType").value = "13";
      $("#ivacFamilyCount").value = "0";
      $("#ivacVisitPurpose").value = "";
      $("#ivacFamilyData").value = "";

      updateIvacCenters();
      // Set default IVAC center to Dhaka (JFP)
      setTimeout(() => {
        $("#ivacCenter").value = "17";
      }, 100);
    };

    $("#ivacExport").onclick = () => {
      const data = getData();
      if (!data) return;

      // Format data for export
      const exportData = {
        file_info: {
          applicant_webfile: data.webfile_id || "",
          purposeTxt: data.purposeTxt || "",
          highCom: data.highCom || 1,
          ivacId: data.ivacId || 17,
          VisaTypeId: data.VisaTypeId || 13,
          familyData: data.familyData || []
        }
      };

      const jsonData = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonData], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "ivac_data.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };

    $("#ivacImport").onclick = () => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".json";

      input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const importData = JSON.parse(event.target.result);
            const fileInfo = importData.file_info || importData;

            // Format data for storage
            const data = {
              highCom: fileInfo.highCom || 1,
              ivacId: fileInfo.ivacId || 17,
              webfile_id: fileInfo.applicant_webfile || "",
              VisaTypeId: fileInfo.VisaTypeId || 13,
              familyCount: fileInfo.familyData ? fileInfo.familyData.length : 0,
              purposeTxt: fileInfo.purposeTxt || "",
              familyData: fileInfo.familyData || []
            };

            localStorage.setItem("ivac_file_info", JSON.stringify(data));

            // Update panel with imported data
            if (data.highCom) $("#ivacHighCom").value = data.highCom;
            if (data.webfile_id) $("#ivacWebFile").value = data.webfile_id;
            if (data.VisaTypeId) $("#ivacVisaType").value = data.VisaTypeId;
            if (data.familyCount) $("#ivacFamilyCount").value = data.familyCount;
            if (data.purposeTxt) $("#ivacVisitPurpose").value = data.purposeTxt;

            // Format family data for display
            if (data.familyData && data.familyData.length > 0) {
              let familyText = "";
              data.familyData.forEach(member => {
                familyText += `${member.name || ''}\n${member.webfile_no || ''}\n`;
              });
              $("#ivacFamilyData").value = familyText.trim();
            }

            updateIvacCenters();
            // Set IVAC center after updating the centers list
            setTimeout(() => {
              if (data.ivacId) $("#ivacCenter").value = data.ivacId;
            }, 100);
          } catch (error) {
            console.error("Import error:", error);
            alert("Error importing file. Please check the file format.");
          }
        };
        reader.readAsText(file);
      };

      input.click();
    };

    $("#ivacSave").onclick = () => {
      // Parse family data
      const familyDataText = $("#ivacFamilyData").value;
      const familyData = [];

      if (familyDataText) {
        const lines = familyDataText.split('\n');

        // Check if more than 4 sets
        if (lines.length > 8) {
          alert("Maximum 4 family members allowed");
          return;
        }

        for (let i = 0; i < lines.length; i += 2) {
          if (i + 1 < lines.length) {
            familyData.push({
              name: lines[i].trim(),
              webfile_no: lines[i + 1].trim()
            });
          }
        }
      }

      const data = {
        highCom: parseInt($("#ivacHighCom").value),
        ivacId: parseInt($("#ivacCenter").value),
        webfile_id: $("#ivacWebFile").value,
        VisaTypeId: parseInt($("#ivacVisaType").value),
        familyCount: familyData.length,
        purposeTxt: $("#ivacVisitPurpose").value,
        familyData: familyData
      };
      localStorage.setItem("ivac_file_info", JSON.stringify(data));
      wrap.style.display = "none";
      // Removed the auto-fill call when saving
    };

    updateIvacCenters();

    const savedData = getData();
    if (savedData) {
      if (savedData.highCom) $("#ivacHighCom").value = savedData.highCom;
      if (savedData.webfile_id) $("#ivacWebFile").value = savedData.webfile_id;
      if (savedData.VisaTypeId) $("#ivacVisaType").value = savedData.VisaTypeId;
      if (savedData.familyCount) $("#ivacFamilyCount").value = savedData.familyCount;
      if (savedData.purposeTxt) $("#ivacVisitPurpose").value = savedData.purposeTxt;

      // Format family data for display
      if (savedData.familyData && savedData.familyData.length > 0) {
        let familyText = "";
        savedData.familyData.forEach(member => {
          familyText += `${member.name || ''}\n${member.webfile_no || ''}\n`;
        });
        $("#ivacFamilyData").value = familyText.trim();
      }

      updateIvacCenters();
      // Set IVAC center after updating the centers list
      setTimeout(() => {
        if (savedData.ivacId) $("#ivacCenter").value = savedData.ivacId;
      }, 100);
    } else {
      // Set default values if no saved data
      $("#ivacHighCom").value = "1";
      $("#ivacVisaType").value = "13";
      updateIvacCenters();
      // Set default IVAC center to Dhaka (JFP)
      setTimeout(() => {
        $("#ivacCenter").value = "17";
      }, 100);
    }
    $("#ivacHighCom").addEventListener("change", updateIvacCenters);
  }

  function updateIvacCenters() {
    const selectedHighCom = $("#ivacHighCom").value;
    const ivacCenters = {
      1: [[9,"IVAC, BARISAL"],[12,"IVAC, JESSORE"],[17,"IVAC, Dhaka (JFP)"],[20,"IVAC, SATKHIRA"]],
      2: [[5,"IVAC, CHITTAGONG"],[21,"IVAC, CUMILLA"],[22,"IVAC, NOAKHALI"],[23,"IVAC, BRAHMANBARIA"]],
      3: [[2,"IVAC , RAJSHAHI"],[7,"IVAC, RANGPUR"],[18,"IVAC, THAKURGAON"],[19,"IVAC, BOGURA"],[24,"IVAC, KUSHTIA"]],
      4: [[4,"IVAC, SYLHET"],[8,"IVAC, MYMENSINGH"]],
      5: [[3,"IVAC, KHULNA"]]
    };
    const centerSelect = $("#ivacCenter");
    centerSelect.innerHTML = '';
    ivacCenters[selectedHighCom]?.forEach(([v,n]) => {
      const opt = document.createElement("option");
      opt.value = v;
      opt.textContent = n;
      centerSelect.appendChild(opt);
    });
  }

  // Floating Buttons
  function addButtons() {
    if ($("#ivacButtonsContainer")) return;
    const container = document.createElement("div");
    container.id = "ivacButtonsContainer";
    container.style.cssText = "position:fixed;bottom:20px;left:20px;z-index:2147483647;display:flex;flex-direction:column;gap:8px;";

    const addBtn = document.createElement("button");
    addBtn.textContent = "ADD";
    addBtn.title = "Open Input Panel";
    addBtn.style.cssText = "padding:8px 12px;font:600 12px system-ui;color:#fff;background:#dc2626;border:0;border-radius:6px;box-shadow:0 3px 8px rgba(0,0,0,.18);cursor:pointer;width:60px;transition:all 0.2s ease;";
    addBtn.onmouseover = () => addBtn.style.transform = "translateY(-2px)";
    addBtn.onmouseout = () => addBtn.style.transform = "translateY(0)";
    addBtn.onclick = () => createInputPanel();

    const autoFillBtn = document.createElement("button");
    autoFillBtn.textContent = "FILL";
    autoFillBtn.title = "Auto Fill Form";
    autoFillBtn.style.cssText = "padding:8px 12px;font:600 12px system-ui;color:#fff;background:#2563eb;border:0;border-radius:6px;box-shadow:0 3px 8px rgba(0,0,0,.18);cursor:pointer;width:60px;transition:all 0.2s ease;";
    autoFillBtn.onmouseover = () => autoFillBtn.style.transform = "translateY(-2px)";
    autoFillBtn.onmouseout = () => autoFillBtn.style.transform = "translateY(0)";
    autoFillBtn.onclick = () => enhancedAutoFill();

    document.body.appendChild(container);
    container.appendChild(addBtn);
    container.appendChild(autoFillBtn);
  }

  // Enhanced auto-fill function that handles both cases
  async function enhancedAutoFill() {
    const D = getData();
    if (!D) {
      console.log("[IVAC] No data found, please add data first");
      return false;
    }

    console.log("[IVAC] Starting enhanced auto-fill");

    // Try to fill application form first
    let filled = false;

    // Wait for form elements to be available
    await waitFor(() => missionSel() || ivacSel() || ($("#email") && $("#user_phone")), 10000, 200);

    // Try to fill application form
    if (missionSel() || ivacSel()) {
      console.log("[IVAC] Filling application form");
      filled = fillApplication();
    }

    // Try to fill family form
    if ($("#email") && $("#user_phone")) {
      console.log("[IVAC] Filling family form");
      filled = fillFamily() || filled;
    }

    // If family data exists, wait a bit and try to fill family members
    if (D.familyData && D.familyData.length > 0) {
      console.log("[IVAC] Found family data, waiting to fill family members");
      await sleep(1000);

      D.familyData.forEach((m, i) => {
        if (i >= 4) return; // Maximum 4 family members

        setTimeout(() => {
          const nameInput = $(`#full-name-${i}`);
          const webFileInput = $(`#web-file-number-${i}`);
          const webFileRepeatInput = $(`#web-file-number-repeat-${i}`);

          if (nameInput) {
            setReact(nameInput, m.name || "");
            console.log(`[IVAC] Filled family member ${i+1} name: ${m.name || ""}`);
          }
          if (webFileInput) {
            setReact(webFileInput, m.webfile_no || "");
            console.log(`[IVAC] Filled family member ${i+1} webfile: ${m.webfile_no || ""}`);
          }
          if (webFileRepeatInput) {
            setReact(webFileRepeatInput, m.webfile_no || "");
            console.log(`[IVAC] Filled family member ${i+1} webfile repeat: ${m.webfile_no || ""}`);
          }
        }, 500 * (i + 1));
      });
    }

    // Enable save button if found
    setTimeout(() => {
      enableBtn(saveBtn());
    }, 1500);

    return filled;
  }

  // Initialize
  function init() {
    addButtons();

    // Check if we have saved data
    if (getData()) {
      console.log("[IVAC] Saved data found");
    }
  }

  // Start when page is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, {once: true});
  } else {
    init();
  }
})();