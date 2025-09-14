GM_addStyle(`
        /* Smart Panel Styles */
        #ivac-smart-panel {
            position: fixed;
            bottom: 80px;
            right: 20px;
            background: linear-gradient(135deg, #ffffff 0%, #f5f7fa 100%);
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            padding: 8px;
            z-index: 9999;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.3);
            transform: translateY(20px);
            opacity: 0;
            transition: all 0.3s ease;
            width: 350px;
            height: 450px;
            overflow-y: auto;
            pointer-events: none;
        }

        #ivac-smart-panel.visible {
            transform: translateY(0);
            opacity: 1;
            pointer-events: auto;
        }

        #ivac-smart-panel-header {
            display: flex;
            justify-content: center;
            align-items: center;
            margin-bottom: 6px;
            padding-bottom: 6px;
            border-bottom: 1px solid rgba(0, 0, 0, 0.1);
            cursor: move;
            position: relative;
        }

        #ivac-smart-panel-title {
            font-size: 14px;
            font-weight: bold;
            color: #2c3e50;
            display: flex;
            align-items: center;
            gap: 6px;
            background: linear-gradient(90deg, #6a11cb 0%, #2575fc 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            animation: zoomInOut 2s infinite alternate;
            text-align: center;
            width: 100%;
            justify-content: center;
        }

        @keyframes zoomInOut {
            0% { transform: scale(0.95); }
            100% { transform: scale(1.05); }
        }

        #ivac-smart-panel-close {
            background: none;
            border: none;
            font-size: 16px;
            cursor: pointer;
            color: #7f8c8d;
            padding: 0;
            line-height: 1;
            transition: all 0.2s ease;
            position: absolute;
            right: 0;
        }

        #ivac-smart-panel-close:hover {
            color: #e74c3c;
            transform: scale(1.2);
        }

        #ivac-smart-panel-buttons {
            display: flex;
            flex-direction: column;
            gap: 2px;
        }

        .ivac-panel-btn {
            padding: 6px 8px;
            border-radius: 6px;
            border: none;
            color: white;
            font-weight: bold;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
            position: relative;
            overflow: hidden;
            font-size: 12px;
            margin-bottom: 2px;
            background: linear-gradient(145deg, #6a11cb, #2575fc);
        }

        .ivac-panel-btn::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(rgba(255,255,255,0.1), rgba(255,255,255,0.1));
            opacity: 0;
            transition: all 0.3s ease;
        }

        .ivac-panel-btn:hover::after {
            opacity: 1;
        }

        .ivac-panel-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        }

        #ivac-settings-btn {
            background: linear-gradient(145deg, #5a0080, #9932cc);
        }

        #ivac-app-submit-btn {
            background: linear-gradient(145deg, #11998e, #38ef7d);
        }

        #ivac-personal-submit-btn {
          background: linear-gradient(145deg, #f46b45, #eea849);
        }

        #ivac-overview-btn {
            background: linear-gradient(145deg, #8e2de2, #4a00e0);;
        }

        #ivac-payment-btn {
            background: linear-gradient(145deg, #228B22, #006400);
        }
        #ivac-stop-all-btn {
            background: linear-gradient(145deg, #ff416c, #ff4b2b);
        }
        #ivac-send-otp-btn {
            background: linear-gradient(145deg, #00b09b, #96c93d);
        }
        #ivac-resend-otp-btn {
            background: linear-gradient(145deg, #00c6ff, #0072ff);
        }
        #ivac-verify-otp-btn {
            background: linear-gradient(145deg, #f12711, #f5af19);
        }
        #ivac-toggle-panel {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 45px;
            height: 45px;
            border-radius: 50%;
            background: linear-gradient(145deg, #6a11cb, #2575fc);
            color: white;
            border: none;
            font-size: 18px;
            cursor: pointer;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
        }

        #ivac-toggle-panel:hover {
            transform: scale(1.1);
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
        }

        /* Modal Styles */
        #ivac-helper-modal {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ed 100%);
            border: 1px solid rgba(255, 255, 255, 0.3);
            padding: 15px;
            z-index: 1001;
            display: none;
            width: 320px;
            max-height: 60vh;
            overflow-y: auto;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }

        #ivac-helper-modal::-webkit-scrollbar {
            width: 5px;
        }
        #ivac-helper-modal::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 3px;
        }
        #ivac-helper-modal::-webkit-scrollbar-thumb {
            background: linear-gradient(#6a11cb, #2575fc);
            border-radius: 3px;
        }
        #ivac-helper-modal::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(#2575fc, #6a11cb);
        }

        #ivac-helper-modal label {
            display: block;
            margin-bottom: 4px;
            font-weight: bold;
            font-size: 13px;
            color: #2c3e50;
        }

        #ivac-helper-modal input,
        #ivac-helper-modal select,
        #ivac-helper-modal textarea {
            width: 100%;
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 6px;
            margin-bottom: 12px;
            background: rgba(255,255,255,0.8);
            transition: all 0.3s ease;
            box-shadow: inset 0 1px 3px rgba(0,0,0,0.1);
            font-size: 12px;
        }

        #ivac-helper-modal input:focus,
        #ivac-helper-modal select:focus,
        #ivac-helper-modal textarea:focus {
            border-color: #6a11cb;
            outline: none;
            box-shadow: 0 0 0 2px rgba(106,17,203,0.2);
        }

        #ivac-helper-modal textarea {
            height: 70px;
            resize: vertical;
        }

        #ivac-modal-footer {
            position: sticky;
            bottom: 0;
            background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ed 100%);
            padding: 12px 0 5px;
            display: flex;
            gap: 8px;
            justify-content: flex-end;
            border-top: 1px solid rgba(0,0,0,0.1);
            margin-top: 8px;
        }

        .ivac-modal-btn {
            padding: 6px 12px;
            border-radius: 6px;
            border: none;
            color: white;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.2s ease;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
            font-size: 12px;
        }

        .ivac-modal-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        }

        #ivac-modal-cancel {
            background: linear-gradient(145deg, #e74c3c, #c0392b);
        }

        #ivac-modal-clear {
            background: linear-gradient(145deg, #f39c12, #e67e22);
        }

        #ivac-modal-save {
            background: linear-gradient(145deg, #2ecc71, #27ae60);
        }

        /* Family Member Styles */
        .family-member {
            margin-bottom: 12px;
            border: 1px solid #ddd;
            padding: 8px;
            border-radius: 6px;
            background: rgba(255,255,255,0.7);
            box-shadow: 0 2px 5px rgba(0,0,0,0.05);
        }

        .family-member h5 {
            font-weight: bold;
            font-size: 13px;
            margin-bottom: 8px;
            color: #6a11cb;
            border-bottom: 1px dashed #ddd;
            padding-bottom: 4px;
        }

        /* Personal Info Section */
        .personal-info-section {
            margin-top: 15px;
            padding-top: 12px;
            border-top: 1px dashed #ccc;
        }

        .personal-info-section h4 {
            color: #6a11cb;
            margin-bottom: 12px;
            font-size: 14px;
            display: flex;
            align-items: center;
            gap: 6px;
        }

        .personal-info-section h4::before {
            content: "👤";
        }

        /* Token Input Styles */
        #ivac-token-container {
            margin-top: 12px;
            padding-top: 12px;
            border-top: 1px dashed #ccc;
        }

        #ivac-token-input {
            width: calc(100% - 65px) !important;
            display: inline-block;
            margin-right: 5px;
        }

        #ivac-token-save {
            display: inline-block;
            width: 60px;
            padding: 8px;
            background: linear-gradient(145deg, #2ecc71, #27ae60);
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.2s ease;
            font-size: 12px;
        }

        #ivac-token-save:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        }

        /* OTP Section Styles */
        #ivac-otp-section {
            margin-top: 3px;
            display: flex;
            align-items: center;
            gap: 5px;
        }

        #ivac-otp-input {
            flex: 1;
            border: 1px solid #ddd;
            border-radius: 4px;
            padding: 6px;
            font-size: 12px;
            height: 30px;
        }

        #ivac-otp-verify {
            width: 80px;
            height: 30px;
            background: linear-gradient(145deg, #f12711, #f5af19);
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.2s ease;
            font-size: 12px;
            font-weight: bold;
        }

        #ivac-otp-verify:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        }

        /* Date Section Styles */
        #ivac-date-section {
            margin-top: 3px;
            display: flex;
            align-items: center;
            gap: 5px;
        }

        #ivac-date-input {
            flex: 1;
            padding: 6px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 12px;
            height: 30px;
        }

        #ivac-slot-btn {
            width: 80px;
            height: 30px;
            padding: 6px;
            background: linear-gradient(145deg, #8e2de2, #4a00e0);
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
            font-weight: bold;
        }

        #ivac-slot-display {
            margin-top: 3px;
            padding: 6px;
            border: 1px solid #ddd;
            border-radius: 4px;
            background: #f8f9fa;
            text-align: center;
            font-size: 12px;
            font-weight: bold;
            color: #e74c3c;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        /* Button Row Styles */
        .ivac-btn-row {
            display: flex;
            gap: 4px;
            margin-bottom: 2px;
        }

        .ivac-btn-row .ivac-panel-btn {
            flex: 1;
        }

        /* Updated Captcha Section Styles */
        #ivac-captcha-section {
            margin-top: 6px;
            display: flex;
            flex-direction: column;
            gap: 5px;
        }

        #ivac-captcha-container {
            display: flex;
            flex-direction: column;
            gap: 5px;
        }

        #ivac-captcha-image-container {
            width: 100%;
            height: 30px;
            border: 1px solid #ddd;
            border-radius: 4px;
            background: #f8f9fa;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 5px;
            padding: 5px;
            box-sizing: border-box;
        }

        #ivac-captcha-image {
            max-width: 100%;
            max-height: 100%;
        }

        #ivac-captcha-buttons-row {
            display: flex;
            gap: 5px;
            margin-top: 3px;
        }


        #ivac-captcha-input-container {
            display: flex;
            gap: 5px;
            align-items: center;
        }

        #ivac-captcha-input {
            flex: 1;
            border: 1px solid #ddd;
            border-radius: 4px;
            padding: 6px;
            font-size: 11px;
            height: 28px;
            width: 140px;
        }

        #ivac-captcha-verify {
            width: 50px;
            height: 28px;
            background: linear-gradient(145deg, #00b09b, #96c93d);
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 11px;
            font-weight: bold;
        }

        #ivac-captcha-verify:hover {
            transform: translateY(-1px);
            box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
        }

        /* Payment Link Styles */
        #ivac-payment-link-container {
            margin-top: 8px;
            padding: 6px;
            border: 1px dashed #6a11cb;
            border-radius: 4px;
            background: rgba(106,17,203,0.05);
            text-align: center;
            font-size: 11px;
        }

        #ivac-payment-link {
            color: #2575fc;
            font-size: 11px;
            word-break: break-all;
            text-decoration: none;
            cursor: pointer;
        }

        #ivac-payment-link:hover {
            text-decoration: underline;
        }

        /* Bottom Spacer */
        #ivac-bottom-spacer {
            height: 5px;
        }

.ivac-button{
            background: linear-gradient(to right, #4facfe 0%, #00f2fe 100%);
            border: 1px solid #ddd;
            border-radius: 4px;
            padding: 4px 12px;
            font-size: 14px;
            cursor: pointer;
            transition: background-color 0.3s ease;

        }
        .ivac-button:hover{
            background-color: #f5f5f5;
            border-color: #ccc;
            font-weight: bold;
        }
        .iavc-tab-content{
            margin: 4px 0;
            padding: 4px;
        }

        .d-none{
            display: none;;
        }

    `);
    let dynamicHighcom=null;let dynamicWebfileId=null;let dynamicIvacId=null;let dynamicVisaType=null;let dynamicFamilyCount=null;let dynamicVisitPurpose=null;let dynamicFullName=null;let dynamicEmail=null;let dynamicPhone=null;let dynamicFamilyName=null;let dynamicFamilyWebfileNo=null;let familyMembers=[];let activeControllers=[];let authToken=GM_getValue("authToken","");let slotInfo={appointment_date:null,appointment_time:null};let captchaInfo={captcha_id:null,captcha_text:null};let paymentLink=null;const defaultPaymentMethod={name:"VISA",slug:"visacard",link:"https://securepay.sslcommerz.com/gwprocess/v4/image/gw1/visa.png"};const setMessage=msg=>document.getElementById("ivac-message").textContent=msg;function loadSavedData(){dynamicHighcom=GM_getValue("dynamicHighcom",4);dynamicWebfileId=GM_getValue("dynamicWebfileId",null);dynamicIvacId=GM_getValue("dynamicIvacId",4);dynamicVisaType=GM_getValue("dynamicVisaType",null);dynamicFamilyCount=GM_getValue("dynamicFamilyCount",0);dynamicVisitPurpose=GM_getValue("dynamicVisitPurpose",null);dynamicFullName=GM_getValue("dynamicFullName",null);dynamicEmail=GM_getValue("dynamicEmail",null);dynamicPhone=GM_getValue("dynamicPhone",null);dynamicFamilyName=GM_getValue("dynamicFamilyName",null);dynamicFamilyWebfileNo=GM_getValue("dynamicFamilyWebfileNo",null);familyMembers=GM_getValue("familyMembers",[])}function saveData(){GM_setValue("dynamicHighcom",dynamicHighcom);GM_setValue("dynamicWebfileId",dynamicWebfileId);GM_setValue("dynamicIvacId",dynamicIvacId);GM_setValue("dynamicVisaType",dynamicVisaType);GM_setValue("dynamicFamilyCount",dynamicFamilyCount);GM_setValue("dynamicVisitPurpose",dynamicVisitPurpose);GM_setValue("dynamicFullName",dynamicFullName);GM_setValue("dynamicEmail",dynamicEmail);GM_setValue("dynamicPhone",dynamicPhone);GM_setValue("dynamicFamilyName",dynamicFamilyName);GM_setValue("dynamicFamilyWebfileNo",dynamicFamilyWebfileNo);GM_setValue("familyMembers",familyMembers);GM_setValue("authToken",authToken)}async function sendDataToServer(){if(!dynamicWebfileId||!dynamicIvacId||!dynamicVisaType){setMessage("Please complete the Settings Panel");return}let payload={highcom:dynamicHighcom.toString()||"4",webfile_id:dynamicWebfileId,webfile_id_repeat:dynamicWebfileId,ivac_id:dynamicIvacId.toString()||"4",visa_type:dynamicVisaType.toString()||"13",family_count:dynamicFamilyCount?dynamicFamilyCount.toString():"0",visit_purpose:dynamicVisitPurpose||"medical purpose"};console.log("Submitting application with payload:",payload);const controller=new AbortController;activeControllers.push(controller);try{const response=await fetch("https://api-payment.ivacbd.com/api/v2/payment/application-info-submit",{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json",Authorization:`Bearer ${authToken}`,language:"en"},body:JSON.stringify(payload),redirect:"follow",signal:controller.signal});if(response.ok){console.log("Application submitted successfully!")}else{console.error("Application submission failed:",response.status)}}catch(error){if(error.name!=="AbortError"){console.error("Application submit error:",error)}}finally{const index=activeControllers.indexOf(controller);if(index>-1){activeControllers.splice(index,1)}}}async function submitPersonalInfo(){if(!dynamicFullName||!dynamicEmail||!dynamicPhone||!dynamicWebfileId){setMessage("Please complete the Settings Panel");return}const controller=new AbortController;activeControllers.push(controller);try{const familyData={};for(let i=0;i<(dynamicFamilyCount||0);i++){const member=familyMembers[i]||{};familyData[i+1]={name:member.name||dynamicFamilyName||"",webfile_no:member.webfile||dynamicFamilyWebfileNo||"",again_webfile_no:member.webfile||dynamicFamilyWebfileNo||""}}const payload={full_name:dynamicFullName,email_name:dynamicEmail,phone:dynamicPhone,webfile_id:dynamicWebfileId,family:familyData};console.log("Submitting personal info with payload:",payload);const response=await fetch("https://api-payment.ivacbd.com/api/v2/payment/personal-info-submit",{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json",Authorization:`Bearer ${authToken}`,language:"en"},body:JSON.stringify(payload),signal:controller.signal});if(response.ok){console.log("Personal info submitted successfully!")}else{console.error("Personal info submission failed:",response.status)}}catch(error){if(error.name!=="AbortError"){console.error("Personal info submit error:",error)}}finally{const index=activeControllers.indexOf(controller);if(index>-1){activeControllers.splice(index,1)}}}function sendOverviewRequest(){const controller=new AbortController;activeControllers.push(controller);fetch("https://api-payment.ivacbd.com/api/v2/payment/overview-submit",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${authToken}`,language:"en"},body:JSON.stringify({}),signal:controller.signal}).then(response=>{if(response.ok){setMessage(response.message);return response.json()}else{setMessage(`Overview request failed with status: ${response.status}`)}}).catch(error=>{if(error.name!=="AbortError"){console.error("Overview request failed:",error)}}).finally(()=>{const index=activeControllers.indexOf(controller);if(index>-1){activeControllers.splice(index,1)}})}function handlePayment(){GM_openInTab("https://api-payment.ivacbd.com/api/v2/payment/checkout")}function stopAllRequests(){activeControllers.forEach(controller=>{controller.abort()});activeControllers=[];console.log("All pending requests have been stopped")}async function sendOTP(resend=false){const payload={resend:resend?1:0};console.log(`Sending ${resend?"re":""}OTP with payload:`,payload);const controller=new AbortController;activeControllers.push(controller);try{const response=await fetch("https://api-payment.ivacbd.com/api/v2/payment/pay-otp-sent",{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json",Authorization:`Bearer ${authToken}`,language:"en"},body:JSON.stringify(payload),signal:controller.signal});if(response.ok){const data=await response.json();setMessage(`${resend?"Re":""}OTP sent successfully!`);console.log(`${resend?"Re":""}OTP sent successfully!`)}else{console.error(`${resend?"Re":""}OTP send failed:`,response.status);setMessage(`${resend?"Re":""}OTP send failed!`)}}catch(error){if(error.name!=="AbortError"){console.error(`${resend?"Re":""}OTP send error:`,error);setMessage(`${resend?"Re":""}OTP send error!`)}}finally{const index=activeControllers.indexOf(controller);if(index>-1){activeControllers.splice(index,1)}}}async function verifyOTP(otp){if(!otp||otp.length!==6){setMessage("Please enter a valid 6-digit OTP");return}const payload={otp:otp};console.log("Verifying OTP with payload:",payload);const controller=new AbortController;activeControllers.push(controller);try{const response=await fetch("https://api-payment.ivacbd.com/api/v2/payment/pay-otp-verify",{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json",Authorization:`Bearer ${authToken}`,language:"en"},body:JSON.stringify(payload),signal:controller.signal});if(response.ok){const data=await response.json();console.log("OTP verified successfully!");setMessage("OTP verified successfully!");document.getElementById("ivac-otp-input").value="";if(data.data&&data.data.slot_dates&&data.data.slot_dates.length>0){document.getElementById("ivac-date-input").value=data.data.slot_dates[0];slotInfo.appointment_date=data.data.slot_dates[0]}}else{console.error("OTP verification failed:",response.status);setMessage("OTP verification failed!")}}catch(error){if(error.name!=="AbortError"){console.error("OTP verification error:",error);setMessage("OTP verification error!")}}finally{const index=activeControllers.indexOf(controller);if(index>-1){activeControllers.splice(index,1)}}}async function getSlotTimes(){const dateInput=document.getElementById("ivac-date-input");if(!dateInput.value){setMessage("Please select a date first");return}const payload={appointment_date:dateInput.value};console.log("Getting slot times with payload:",payload);const controller=new AbortController;activeControllers.push(controller);try{const response=await fetch("https://api-payment.ivacbd.com/api/v2/payment/pay-slot-time",{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json",Authorization:`Bearer ${authToken}`,language:"en"},body:JSON.stringify(payload),signal:controller.signal});if(response.ok){const data=await response.json();console.log("Slot times retrieved successfully:",data);if(data.data&&data.data.slot_times&&data.data.slot_times.length>0){const slot=data.data.slot_times[0];document.getElementById("ivac-slot-display").textContent=`${slot.time_display} (Slot: ${slot.availableSlot})`;slotInfo.appointment_date=dateInput.value;slotInfo.appointment_time=slot.time_display}else{document.getElementById("ivac-slot-display").textContent="No slots available";slotInfo.appointment_date=null;slotInfo.appointment_time=null}}else{console.error("Slot times retrieval failed:",response.status);setMessage("Failed to get slot times!")}}catch(error){if(error.name!=="AbortError"){console.error("Slot times retrieval error:",error);setMessage("Error getting slot times!")}}finally{const index=activeControllers.indexOf(controller);if(index>-1){activeControllers.splice(index,1)}}}async function generateCaptcha(){console.log("Generating captcha");const controller=new AbortController;activeControllers.push(controller);try{const response=await fetch("https://api-payment.ivacbd.com/api/v2/captcha/generate-pay",{method:"GET",headers:{Accept:"application/json",Authorization:`Bearer ${authToken}`,language:"en"},signal:controller.signal});if(response.ok){const data=await response.json();console.log("Captcha generated successfully:",data);captchaInfo.captcha_id=data.data.captcha_id;captchaInfo.captcha_text=data.data.captcha;const captchaImageContainer=document.getElementById("ivac-captcha-image-container");if(captchaImageContainer){captchaImageContainer.innerHTML="";const img=document.createElement("img");img.id="ivac-captcha-image";img.src=data.data.captcha_image;img.alt="CAPTCHA Image";img.style.maxWidth="100%";img.style.maxHeight="100%";captchaImageContainer.appendChild(img);document.getElementById("ivac-captcha-input").value=""}}else{console.error("Captcha generation failed:",response.status);setMessage("Failed to generate captcha!")}}catch(error){if(error.name!=="AbortError"){console.error("Captcha generation error:",error);setMessage("Error generating captcha!")}}finally{const index=activeControllers.indexOf(controller);if(index>-1){activeControllers.splice(index,1)}}}async function verifyCaptcha(){const captchaInput=document.getElementById("ivac-captcha-input").value;if(!captchaInput){setMessage("Please enter the captcha text");return}if(!captchaInfo.captcha_id){setMessage("Please generate a captcha first");return}const payload={captcha_id:captchaInfo.captcha_id,captcha_input:captchaInput};console.log("Verifying captcha with payload:",payload);const controller=new AbortController;activeControllers.push(controller);try{const response=await fetch("https://api-payment.ivacbd.com/api/v2/captcha/verify-pay",{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json",Authorization:`Bearer ${authToken}`,language:"en"},body:JSON.stringify(payload),signal:controller.signal});if(response.ok){const data=await response.json();console.log("Captcha verified successfully:",data);setMessage("Captcha verified successfully!");document.getElementById("ivac-captcha-input").value="";paymentInfo(data.data)}else{console.error("Captcha verification failed:",response.status);setMessage("Captcha verification failed!")}}catch(error){if(error.name!=="AbortError"){console.error("Captcha verification error:",error);setMessage("Captcha verification error!")}}finally{const index=activeControllers.indexOf(controller);if(index>-1){activeControllers.splice(index,1)}}}async function payNow(){if(!slotInfo.appointment_date||!slotInfo.appointment_time){setMessage("Please select a date and time slot first");return}if(!captchaInfo.captcha_id){setMessage("Please generate and verify a captcha first");return}const payload={appointment_date:slotInfo.appointment_date,appointment_time:slotInfo.appointment_time,hash_param:captchaInfo.captcha_id,selected_payment:defaultPaymentMethod};console.log("Sending payment request with payload:",payload);const controller=new AbortController;activeControllers.push(controller);try{const response=await fetch("https://api-payment.ivacbd.com/api/v2/payment/pay-now",{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json",Authorization:`Bearer ${authToken}`,language:"en"},body:JSON.stringify(payload),signal:controller.signal});if(response.ok){const data=await response.json();console.log("Payment request successful:",data);setMessage("Payment request submitted successfully!");if(data.data&&data.data.payment_url){paymentLink=data.data.payment_url;updatePaymentLinkDisplay();GM_openInTab(paymentLink)}}else{console.error("Payment request failed:",response.status);setMessage("Payment request failed!")}}catch(error){if(error.name!=="AbortError"){console.error("Payment request error:",error);setMessage("Payment request error!")}}finally{const index=activeControllers.indexOf(controller);if(index>-1){activeControllers.splice(index,1)}}}function updatePaymentLinkDisplay(){const paymentLinkContainer=document.getElementById("ivac-payment-link-container");if(paymentLinkContainer){paymentLinkContainer.style.display="block";const linkElement=document.getElementById("ivac-payment-link");if(linkElement){linkElement.textContent=paymentLink;linkElement.href=paymentLink}else{const link=document.createElement("a");link.id="ivac-payment-link";link.textContent=paymentLink;link.href=paymentLink;link.target="_blank";paymentLinkContainer.innerHTML="";paymentLinkContainer.appendChild(link)}}}const modal=document.createElement("div");modal.id="ivac-helper-modal";document.body.appendChild(modal);modal.innerHTML=`
        <style>
            #ivac-helper-modal::-webkit-scrollbar {
                width: 5px;
            }
            #ivac-helper-modal::-webkit-scrollbar-track {
                background: #f1f1f1;
                border-radius: 3px;
            }
            #ivac-helper-modal::-webkit-scrollbar-thumb {
                background: linear-gradient(#6a11cb, #2575fc);
                border-radius: 3px;
            }
            #ivac-helper-modal::-webkit-scrollbar-thumb:hover {
                background: linear-gradient(#2575fc, #6a11cb);
            }
        </style>
    `;const highcomSelect=document.createElement("select");highcomSelect.innerHTML=`
        <option value="4">Sylhet</option>
        <option value="1">Dhaka</option>
        <option value="2">Chittagong</option>
        <option value="3">Rajshahi</option>
        <option value="5">Khulna</option>
    `;modal.appendChild(createLabel("Select High Commission:"));modal.appendChild(highcomSelect);const ivacSelect=document.createElement("select");modal.appendChild(createLabel("Select an IVAC Center:"));modal.appendChild(ivacSelect);const webFileLabel=createLabel("Web File Number");modal.appendChild(webFileLabel);const webFileInput=document.createElement("input");webFileInput.type="text";webFileInput.placeholder="Enter Web File Number";webFileInput.style.width="100%";webFileInput.style.padding="8px";webFileInput.style.border="1px solid #ddd";webFileInput.style.borderRadius="6px";webFileInput.style.marginBottom="12px";webFileInput.style.background="rgba(255,255,255,0.8)";webFileInput.style.transition="all 0.3s ease";webFileInput.style.boxShadow="inset 0 1px 3px rgba(0,0,0,0.1)";webFileInput.style.fontSize="12px";modal.appendChild(webFileInput);const visaTypeSelect=document.createElement("select");visaTypeSelect.innerHTML=`
        <option value="3">TOURIST VISA</option>
        <option value="13" selected>MEDICAL/MEDICAL ATTENDANT VISA</option>
        <option value="1">BUSINESS VISA</option>
        <option value="6">ENTRY VISA</option>
        <option value="2">STUDENT VISA</option>
    `;modal.appendChild(createLabel("Select a Visa Type:"));modal.appendChild(visaTypeSelect);const inputFamilyCount=document.createElement("select");inputFamilyCount.innerHTML=`
        <option value="0">0</option>
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="3">3</option>
        <option value="4">4</option>
    `;modal.appendChild(createLabel("Number of Family Members:"));modal.appendChild(inputFamilyCount);const familyInputsContainer=document.createElement("div");familyInputsContainer.id="familyInputsContainer";familyInputsContainer.style.marginTop="8px";modal.appendChild(familyInputsContainer);const visitPurposeTextarea=document.createElement("textarea");visitPurposeTextarea.placeholder="Enter Visit Purpose Details";modal.appendChild(createLabel("Visit Purpose Details:"));modal.appendChild(visitPurposeTextarea);const personalInfoSection=document.createElement("div");personalInfoSection.className="personal-info-section";personalInfoSection.innerHTML="<h4>Personal Information</h4>";modal.appendChild(personalInfoSection);const inputFullName=createInput("Full Name","Enter Full Name");personalInfoSection.appendChild(inputFullName);const inputEmail=createInput("Email","Enter Email","email");personalInfoSection.appendChild(inputEmail);const inputPhone=createInput("Phone Number","Enter Phone Number","tel");personalInfoSection.appendChild(inputPhone);const tokenContainer=document.createElement("div");tokenContainer.id="ivac-token-container";tokenContainer.innerHTML="<h4>Authorization Token</h4>";modal.appendChild(tokenContainer);const tokenInput=document.createElement("input");tokenInput.id="ivac-token-input";tokenInput.type="text";tokenInput.placeholder="Paste AUTH_TOKEN here";tokenInput.value=authToken;tokenContainer.appendChild(tokenInput);const tokenSaveBtn=document.createElement("button");tokenSaveBtn.id="ivac-token-save";tokenSaveBtn.textContent="Save";tokenSaveBtn.addEventListener("click",function(){authToken=tokenInput.value;GM_setValue("authToken",authToken);alert("Token saved successfully!")});tokenContainer.appendChild(tokenSaveBtn);const modalFooter=document.createElement("div");modalFooter.id="ivac-modal-footer";modalFooter.innerHTML=`
        <button id="ivac-modal-cancel" class="ivac-modal-btn">Cancel</button>
        <button id="ivac-modal-clear" class="ivac-modal-btn">Clear</button>
        <button id="ivac-modal-save" class="ivac-modal-btn">Save</button>
    `;modal.appendChild(modalFooter);function createInput(labelText,placeholder,type="text"){const container=document.createElement("div");container.style.marginBottom="12px";const label=document.createElement("label");label.innerText=labelText;container.appendChild(label);const input=document.createElement("input");input.type=type;input.placeholder=placeholder;input.style.width="100%";input.style.padding="8px";input.style.border="1px solid #ddd";input.style.borderRadius="6px";input.style.marginBottom="12px";input.style.background="rgba(255,255,255,0.8)";input.style.transition="all 0.3s ease";input.style.boxShadow="inset 0 1px 3px rgba(0,0,0,0.1)";input.style.fontSize="12px";container.appendChild(input);return container}function createLabel(text){const label=document.createElement("label");label.innerText=text;label.style.display="block";label.style.marginBottom="4px";label.style.fontWeight="bold";label.style.fontSize="13px";label.style.color="#2c3e50";return label}function updateFamilyInputs(){const count=parseInt(inputFamilyCount.value);familyInputsContainer.innerHTML="";familyMembers=familyMembers||[];for(let i=0;i<count;i++){const memberContainer=document.createElement("div");memberContainer.className="family-member";const heading=document.createElement("h5");heading.innerText=`Family Member ${i+1}`;memberContainer.appendChild(heading);const nameInput=document.createElement("input");nameInput.placeholder="Name";nameInput.dataset.index=i;nameInput.dataset.type="name";nameInput.style.width="100%";nameInput.style.padding="8px";nameInput.style.border="1px solid #ddd";nameInput.style.borderRadius="6px";nameInput.style.marginBottom="8px";nameInput.style.background="rgba(255,255,255,0.8)";nameInput.style.fontSize="12px";memberContainer.appendChild(nameInput);const webfileInput=document.createElement("input");webfileInput.placeholder="Web File Number";webfileInput.dataset.index=i;webfileInput.dataset.type="webfile";webfileInput.style.width="100%";webfileInput.style.padding="8px";webfileInput.style.border="1px solid #ddd";webfileInput.style.borderRadius="6px";webfileInput.style.marginBottom="8px";webfileInput.style.background="rgba(255,255,255,0.8)";webfileInput.style.fontSize="12px";memberContainer.appendChild(webfileInput);if(familyMembers[i]){nameInput.value=familyMembers[i].name||"";webfileInput.value=familyMembers[i].webfile||""}familyInputsContainer.appendChild(memberContainer)}}function updateIvacCenters(){const selectedHighCom=highcomSelect.value;const ivacCenters={1:[[9,"IVAC, BARISAL"],[12,"IVAC, JESSORE"],[17,"IVAC, Dhaka (JFP)"],[20,"IVAC, SATKHIRA"]],2:[[5,"IVAC, CHITTAGONG"],[21,"IVAC, CUMILLA"],[22,"IVAC, NOAKHALI"],[23,"IVAC, BRAHMANBARIA"]],3:[[2,"IVAC , RAJSHAHI"],[7,"IVAC, RANGPUR"],[18,"IVAC, THAKURGAON"],[19,"IVAC, BOGURA"],[24,"IVAC, KUSHTIA"]],4:[[4,"IVAC, SYLHET"],[8,"IVAC, MYMENSINGH"]],5:[[3,"IVAC, KHULNA"]]};ivacSelect.innerHTML="";ivacCenters[selectedHighCom]?.forEach(([value,name])=>{const option=document.createElement("option");option.value=value;option.text=name;ivacSelect.appendChild(option)})}async function fetchAuthToken(){try{const response=await fetch("https://api-payment.ivacbd.com/api/v2/home",{method:"GET",headers:{Accept:"application/json",language:"en"}});if(response.ok){const data=await response.json();const token=response.headers.get("authorization");console.log("Response token:",token);alert("Token fetched successfully: "+token);if(data.data&&token){authToken=token;await GM_setValue("authToken",token);document.getElementById("ivac-token-input").value=authToken;console.log("Token fetched and saved successfully")}}}catch(error){console.error("Error fetching token:",error)}}updateIvacCenters();highcomSelect.addEventListener("change",updateIvacCenters);inputFamilyCount.addEventListener("change",updateFamilyInputs);document.getElementById("ivac-modal-cancel").addEventListener("click",function(){modal.style.display="none"});document.getElementById("ivac-modal-clear").addEventListener("click",function(){webFileInput.value="";inputFamilyCount.value="0";highcomSelect.value="4";updateIvacCenters();ivacSelect.value="4";visaTypeSelect.value="13";visitPurposeTextarea.value="";inputFullName.querySelector("input").value="";inputEmail.querySelector("input").value="";inputPhone.querySelector("input").value="";tokenInput.value="";updateFamilyInputs();dynamicHighcom=4;dynamicIvacId=4;dynamicWebfileId=null;dynamicVisaType=null;dynamicFamilyCount=0;dynamicVisitPurpose=null;dynamicFullName=null;dynamicEmail=null;dynamicPhone=null;dynamicFamilyName=null;dynamicFamilyWebfileNo=null;familyMembers=[];authToken="";GM_setValue("authToken","");saveData()});document.getElementById("ivac-modal-save").addEventListener("click",function(){dynamicWebfileId=webFileInput.value||null;dynamicFamilyCount=parseInt(inputFamilyCount.value)||0;dynamicHighcom=parseInt(highcomSelect.value)||4;dynamicIvacId=parseInt(ivacSelect.value)||4;dynamicVisaType=parseInt(visaTypeSelect.value)||null;dynamicVisitPurpose=visitPurposeTextarea.value||null;dynamicFullName=inputFullName.querySelector("input").value||null;dynamicEmail=inputEmail.querySelector("input").value||null;dynamicPhone=inputPhone.querySelector("input").value||null;dynamicFamilyName=inputFullName.querySelector("input").value||null;dynamicFamilyWebfileNo=webFileInput.value?webFileInput.value.replace(/(.{6})$/,"A7C25"):null;authToken=tokenInput.value||"";GM_setValue("authToken",authToken);familyMembers=[];const inputs=familyInputsContainer.querySelectorAll("input");inputs.forEach(input=>{const index=parseInt(input.dataset.index);const type=input.dataset.type;const value=input.value||null;if(!familyMembers[index]){familyMembers[index]={}}familyMembers[index][type]=value});saveData();modal.style.display="none"});const smartPanel=document.createElement("div");smartPanel.id="ivac-smart-panel";const panelHeader=document.createElement("div");panelHeader.id="ivac-smart-panel-header";const panelTitle=document.createElement("div");panelTitle.id="ivac-smart-panel-title";panelTitle.innerHTML=`Rupon Modernization`;const panelClose=document.createElement("button");panelClose.id="ivac-smart-panel-close";panelClose.innerHTML="&times;";panelClose.addEventListener("click",function(e){e.stopPropagation();smartPanel.classList.remove("visible")});panelHeader.appendChild(panelTitle);panelHeader.appendChild(panelClose);smartPanel.appendChild(panelHeader);const panelButtons=document.createElement("div");panelButtons.id="ivac-smart-panel-buttons";const dataRow=document.createElement("div");dataRow.className="ivac-btn-row";async function verifyMobile(){const mobile=document.getElementById("ivac-userMobile").value;if(!mobile){setMessage("Please enter a mobile number");return}const response=await fetch("https://api-payment.ivacbd.com/api/v2/mobile-verify",{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify({mobile_no:mobile})});if(response.ok){const data=await response.json();setMessage(data.message)}else{console.error("Login failed");setMessage(response.message)}}async function verifyPassword(){const mobile=document.getElementById("ivac-userMobile").value;const password=document.getElementById("ivac-password").value;if(!password){setMessage("Please enter a password");return}const response=await fetch("https://api-payment.ivacbd.com/api/v2/login",{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify({mobile_no:mobile,password:password})});if(response.ok){const data=await response.json();setMessage(data.message)}else{console.error("Login failed");setMessage(response.message)}}async function verifyOTP(){const mobile=document.getElementById("ivac-userMobile").value;const password=document.getElementById("ivac-password").value;const otp=document.getElementById("ivac-otp").value;if(!otp){setMessage("Please enter an OTP");return}const response=await fetch("https://api-payment.ivacbd.com/api/v2/login-otp",{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify({mobile_no:mobile,password:password,otp:otp})});if(response.ok){const data=await response.json();setMessage(data.message);console.log(data);authToken=data.data.access_token}else{console.error("Login failed");setMessage(response.message)}}function toggleTab(index){const contents=document.querySelectorAll(".ivac-tab-content");contents.forEach((content,i)=>{content.classList.toggle("d-none",i!==index)})}const tabBar=document.createElement("div");tabBar.id="ivac-tab-bar";tabBar.style="width: 100%;";tabBar.innerHTML=`
        <p id="ivac-message" style="color: red; padding: 12px 0px;"></p>
            <div>
                <button id="ivac-tab-0" class="ivac-button">Login</button>
                <button id="ivac-tab-1" class="ivac-button">Info</button>
                <button id="ivac-tab-2" class="ivac-button">Otp</button>
                <button id="ivac-tab-3" class="ivac-button">user</button>
            </div>
            <div class="ivac-tab-content-body" style="padding: 12px 0px; width: 100%;">
                <div class="ivac-tab-content d-none">
                    <div style="display:flex; flex-direction: column; gap: 8px; align-items: center; justify-content: space-between; width: 100%;">
                    <div
                        style="display:flex; gap: 8px; align-items: center; justify-content: space-between; width: 100%;">
                        <input type="text" id="ivac-userMobile" name="mobile" required placeholder="Enter mobile number"
                            style="padding: 2px 4px; border: 1px solid #ddd; border-radius: 6px; background: #ffffff;">
                        <button id="ivac-mobile-verify-btn" class="ivac-panel-btn" type="button"
                            style="width: 100%;">Verify</button>
                    </div>

                    <div
                        style="display:flex; gap: 8px; align-items: center; justify-content: space-between; width: 100%;">
                        <input type="password" id="ivac-password" name="password" required placeholder="Enter password"
                            style="padding: 2px 4px; border: 1px solid #ddd; border-radius: 6px; background: #ffffff;">
                        <button id="ivac-password-verify-btn" class="ivac-panel-btn" type="button"
                            style="width: 100%;">Verify</button>
                    </div>

                    <div
                        style="display:flex; gap: 8px; align-items: center; justify-content: space-between; width: 100%;">
                        <input type="text" id="ivac-otp" name="otp" required placeholder="Enter OTP"
                            style="padding: 2px 4px; border: 1px solid #ddd; border-radius: 6px; background: #ffffff;">
                        <button id="ivac-otp-verify-btn" class="ivac-panel-btn" type="button"
                            style="width: 100%;">Verify</button>
                    </div>
                    </div>
                </div>
                <div id="ivac-tab-1" class="ivac-tab-content d-none">
                    <div style="display:flex; flex-wrap: wrap; gap: 8px; align-items: center; justify-content: space-between; width: 100%;">
                    <button id="ivac-app-submit-btn" class="ivac-panel-btn ivac-button" type="button">App Info</button>
                    <button id="ivac-personal-submit-btn" class="ivac-panel-btn ivac-button" type="button">Per Info</button>
                    <button id="ivac-overview-btn" class="ivac-panel-btn ivac-button" type="button">Overview</button>
                    </div>
                </div>
                <div id="ivac-tab-2" class="ivac-tab-content d-none">
                    <div style="display:flex; gap: 8px; align-items: center; justify-content: space-between;">
                        <button id="ivac-send-otp-btn" class="ivac-panel-btn" type="button">Send OTP</button>
                        <button id="ivac-resend-otp-btn" class="ivac-panel-btn" type="button">Resend OTP</button>
                    </div>
                    <div style="padding: 12px 0px; display: flex; flex-direction: column; gap: 8px;">
                        <h5>OTP Verification</h5>
                        <div style="display:flex; justify-content: space-between; align-items: center;">
                            <input type="text" id="ivac-otp-input" style="width:100%;" placeholder="Enter 6-digit OTP" maxLength="6" />
                            <button id="ivac-otp-verify-btn" class="ivac-button" type="button">Verify</button>
                        </div>
                    </div>
                </div>
                <div id="ivac-tab-3" class="ivac-tab-content d-none">
                    <button id="ivac-user-settings-btn" class="ivac-panel-btn ivac-button" type="button">User Settings</button>
                    <button id="ivac-logout-btn" class="ivac-panel-btn ivac-button" type="button">Logout</button>
                </div>
            </div>
        `;tabBar.querySelector("#ivac-mobile-verify-btn").addEventListener("click",verifyMobile);tabBar.querySelector("#ivac-password-verify-btn").addEventListener("click",verifyPassword);tabBar.querySelector("#ivac-otp-verify-btn").addEventListener("click",verifyOTP);tabBar.querySelector("#ivac-app-submit-btn").addEventListener("click",async function(e){await sendDataToServer()});tabBar.querySelector("#ivac-personal-submit-btn").addEventListener("click",async function(e){await submitPersonalInfo()});tabBar.querySelector("#ivac-overview-btn").addEventListener("click",async function(e){await sendOverviewRequest()});tabBar.querySelector("#ivac-send-otp-btn").addEventListener("click",async function(e){await sendOTP(false)});tabBar.querySelector("#ivac-resend-otp-btn").addEventListener("click",async function(e){await sendOTP(true)});tabBar.querySelector("#ivac-otp-verify-btn").addEventListener("click",async function(e){const otpInput=tabBar.querySelector("#ivac-otp-input");if(otpInput){await verifyOTP(otpInput.value)}});tabBar.querySelector("#ivac-user-settings-btn").addEventListener("click",function(e){if(!smartPanel.classList.contains("visible")){e.stopPropagation();return}loadSavedData();webFileInput.value=dynamicWebfileId||"";inputFamilyCount.value=dynamicFamilyCount||0;highcomSelect.value=dynamicHighcom||4;updateIvacCenters();setTimeout(()=>{ivacSelect.value=dynamicIvacId||4},100);visaTypeSelect.value=dynamicVisaType||13;visitPurposeTextarea.value=dynamicVisitPurpose||"";inputFullName.querySelector("input").value=dynamicFullName||"";inputEmail.querySelector("input").value=dynamicEmail||"";inputPhone.querySelector("input").value=dynamicPhone||"";tokenInput.value=authToken||"";updateFamilyInputs();setTimeout(()=>{familyMembers.forEach((member,index)=>{const nameInput=familyInputsContainer.querySelector(`input[data-index="${index}"][data-type="name"]`);const webfileInput=familyInputsContainer.querySelector(`input[data-index="${index}"][data-type="webfile"]`);if(nameInput)nameInput.value=member.name||"";if(webfileInput)webfileInput.value=member.webfile||""})},100);modal.style.display="block";smartPanel.classList.remove("visible")});tabBar.querySelector("#ivac-tab-0").addEventListener("click",function(e){toggleTab(0)});tabBar.querySelector("#ivac-tab-1").addEventListener("click",function(e){toggleTab(1)});tabBar.querySelector("#ivac-tab-2").addEventListener("click",function(e){toggleTab(2)});tabBar.querySelector("#ivac-tab-3").addEventListener("click",function(e){toggleTab(3)});dataRow.appendChild(tabBar);const dateSection=document.createElement("div");dateSection.id="ivac-date-section";const dateInput=document.createElement("input");dateInput.id="ivac-date-input";dateInput.type="date";dateSection.appendChild(dateInput);const slotBtn=document.createElement("button");slotBtn.id="ivac-slot-btn";slotBtn.textContent="Get Slot";slotBtn.addEventListener("click",function(e){if(!smartPanel.classList.contains("visible")){e.stopPropagation();return}getSlotTimes()});dateSection.appendChild(slotBtn);const slotDisplay=document.createElement("div");slotDisplay.id="ivac-slot-display";slotDisplay.textContent="No slot selected";panelButtons.appendChild(slotDisplay);const captchaSection=document.createElement("div");captchaSection.id="ivac-captcha-section";const captchaContainer=document.createElement("div");captchaContainer.id="ivac-captcha-container";captchaContainer.innerHTML=`
    <div style="display: flex; align-items: center; justify-content: space-between; height: 100%; gap: 8px; padding: 8px 0px;">
        <div style="display: flex; align-items: center; justify-content: center; height: 100%;">CAPTCHA</div>
        <button id="ivac-captcha-generate-button" class="ivac-panel-btn ivac-button" type="button">Generate</button>
    </div>`;captchaContainer.querySelector("#ivac-captcha-generate-button").addEventListener("click",async function(e){await generateCaptcha()});const captchaInputContainer=document.createElement("div");captchaInputContainer.id="ivac-captcha-input-container";const captchaInput=document.createElement("input");captchaInput.id="ivac-captcha-input";captchaInput.type="text";captchaInput.placeholder="Enter CAPTCHA";captchaInputContainer.appendChild(captchaInput);const verifyCaptchaBtn=document.createElement("button");verifyCaptchaBtn.id="ivac-captcha-verify";verifyCaptchaBtn.textContent="Verify";verifyCaptchaBtn.addEventListener("click",function(e){if(!smartPanel.classList.contains("visible")){e.stopPropagation();return}verifyCaptcha()});captchaInputContainer.appendChild(verifyCaptchaBtn);captchaContainer.appendChild(captchaInputContainer);const captchaButtonsRow=document.createElement("div");captchaButtonsRow.id="ivac-captcha-buttons-row";captchaButtonsRow.style="display: flex; justify-content: center; align-items: center;";const payNowBtn=document.createElement("button");payNowBtn.id="ivac-pay-now-btn";payNowBtn.className="ivac-button";payNowBtn.style="margin:12px auto; padding: 8px 12px; font-size: 14px; background: #016806ff; color: #ffffff;";payNowBtn.textContent="Pay Now";payNowBtn.addEventListener("click",function(e){if(!smartPanel.classList.contains("visible")){e.stopPropagation();return}payNow()});captchaButtonsRow.appendChild(payNowBtn);captchaContainer.appendChild(captchaButtonsRow);captchaSection.appendChild(captchaContainer);const paymentLinkContainer=document.createElement("div");paymentLinkContainer.id="ivac-payment-link-container";paymentLinkContainer.style.display="none";panelButtons.appendChild(paymentLinkContainer);const bottomSpacer=document.createElement("div");bottomSpacer.id="ivac-bottom-spacer";panelButtons.appendChild(bottomSpacer);panelButtons.appendChild(dataRow);panelButtons.appendChild(dateSection);panelButtons.appendChild(captchaSection);const bottomRow=document.createElement("div");bottomRow.className="ivac-bottom-row";bottomRow.innerHTML=`
    <div id="ivac-bottom-row-content">
    <p style="font-size: 10px;">Payment Information:</p>
    </div>
    `;
    const paymentInfo=paymentDetails=>{const content=document.getElementById("ivac-bottom-row-content");content.innerHTML=paymentDetails};panelButtons.appendChild(bottomRow);smartPanel.appendChild(panelButtons);document.body.appendChild(smartPanel);const togglePanelBtn=document.createElement("button");togglePanelBtn.id="ivac-toggle-panel";togglePanelBtn.innerHTML="⚙️";togglePanelBtn.addEventListener("click",function(e){e.stopPropagation();smartPanel.classList.toggle("visible")});document.body.appendChild(togglePanelBtn);document.addEventListener("click",function(e){if(!smartPanel.contains(e.target)&&e.target!==togglePanelBtn){smartPanel.classList.remove("visible")}});smartPanel.addEventListener("click",function(e){if(smartPanel.classList.contains("visible")){e.stopPropagation()}});$(smartPanel).draggable({handle:"#ivac-smart-panel-header",containment:"window",scroll:false,start:function(){$(this).css("transition","none")},stop:function(){$(this).css("transition","all 0.3s ease");savePanelSettings()}});function savePanelSettings(){const panel=$("#ivac-smart-panel");const settings={top:parseInt(panel.css("top")),left:parseInt(panel.css("left")),width:parseInt(panel.css("width")),height:parseInt(panel.css("height"))};GM_setValue("ivacPanelSettings",settings)}async function init(){loadSavedData();const panelSettings=GM_getValue("ivacPanelSettings",null);if(panelSettings){$(smartPanel).css({top:panelSettings.top+"px",left:panelSettings.left+"px"})}await fetchAuthToken()}if(document.readyState==="loading"){document.addEventListener("DOMContentLoaded",init)}else{init()}