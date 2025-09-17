"use client";
import {useState} from "react";
import LoginComponent from "@/component/ivac/LoginComponent";
import MessageListComponent from "@/component/ivac/MessageListComponent";


const IvacPanelPage = () => {
    const [retrying, setRetrying] = useState(3);
    const [messages, setMessages] = useState<string[]>([]);
    const setMessage = (message: string) => {setMessages([...messages, message]);}
    const [cloudFlareToken, setCloudFlareToken] = useState("");

    const ivacCenters = [
        [[9, "IVAC, BARISAL"], [12, "IVAC, JESSORE"], [17, "IVAC, Dhaka (JFP)"], [20, "IVAC, SATKHIRA"]],
        [[5, "IVAC, CHITTAGONG"], [21, "IVAC, CUMILLA"], [22, "IVAC, NOAKHALI"], [23, "IVAC, BRAHMANBARIA"]],
        [[2, "IVAC , RAJSHAHI"], [7, "I[VAC, RANGPUR"], [18, "IVAC, THAKURGAON"], [19, "IVAC, BOGURA"], [24, "IVAC, KUSHTIA"]],
        [[4, "IVAC, SYLHET"], [8, "IVAC, MYMENSINGH"]],
        [[3, "IVAC, KHULNA"]]
    ];

    const [appData, setAppData] = useState({
        captcha_token_t6d8n3: cloudFlareToken,
        highcom: "4",
        webfile_id: "",
        webfile_id_repeat: "",
        ivac_id: "4",
        visa_type: "13",
        family_count: "0",
        visit_purpose: "Medical purpose entry",
        familyData: [] as { name: string, webfile_no: string, again_webfile_no: string }[]
    });









    const submitApplicationData = async (data:object) => {
        const response = await fetch("/api/ivac", {
            method: "POST",
            body: JSON.stringify(data),
        });
        const resData = await response.json();
        console.log(resData);
        //document.getElementById("log-message")!.appendChild(document.createTextNode(resData.message));
        for (const message of resData.messageList) {
            setMessage(message);
        }
    }



    return (
        <div className="p-4 bg-gray-200 h-screen w-full">
            <h2 className="text-2xl font-bold">IVAC Panel</h2>
            <hr/>
            <div className="flex gap-4">
                <div className="content mt-4 w-2/3 ">
                    <div className={"h-[80vh] overflow-y-scroll no-scrollbar"}>
                        <LoginComponent/>
                        {
                                <>


                                    <div className="application-data shadow-lg rounded p-4 my-2">
                                        <h2>Application Data</h2>
                                        <input value={appData.webfile_id} onChange={(e) => setAppData({...appData, webfile_id: e.target.value})} id="webfile" className="rounded border border-gray-300 p-2 my-2 w-full" type="text" placeholder="Enter IVAC Webfile"/>
                                        <div className="flex flex-col gap-2">
                                            <label htmlFor="highCommission">Select High Commission</label>
                                            <select value={appData.highcom} onChange={(e) => setAppData({...appData, highcom: e.target.value})} className="rounded border border-gray-300 p-2">
                                                <option value="4">Sylhet</option>
                                                <option value="1">Dhaka</option>
                                                <option value="2">Chittagong</option>
                                                <option value="3">Rajshahi</option>
                                                <option value="5">Khulna</option>
                                            </select>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label htmlFor="ivacCenter">Select IVAC Center</label>
                                            <select value={appData.ivac_id} onChange={(e) => setAppData({...appData, ivac_id: e.target.value})} id="ivacCenter" className="rounded border border-gray-300 p-2">
                                                {
                                                    ivacCenters[Number(appData.highcom) - 1].map((center, index) => <option key={index} value={center[0]}>{center[1]}</option>)
                                                }
                                            </select>
                                        </div>
                                        <input value={appData.visit_purpose} onChange={(e) => setAppData({...appData, visit_purpose: e.target.value})} id="visitPurpose" className="rounded border border-gray-300 p-2 my-2 w-full" type="text" placeholder="Enter Visit Purpose"/>
                                        <div>
                                            <label htmlFor="familyData">Family data: </label>
                                            <textarea
                                                value={appData.familyData.map(({ name, webfile_no }) => `${name}, ${webfile_no}`).join('\n')}
                                                onChange={(e) =>
                                                    {
                                                        const familyData = e.target.value.split('\n')
                                                            .filter(line => line.trim() !== '')
                                                            .map(line => {
                                                                const [name, webfileId] = line.split(',').map(item => item.trim());
                                                                return { name: name, webfile_no: webfileId, again_webfile_no: webfileId };
                                                            });
                                                        setAppData({...appData, familyData, family_count: familyData.length.toString()});
                                                        return null;
                                                    }
                                            }
                                                className="rounded border border-gray-300 p-2 my-2 w-full" name="familyData" id="familyData" cols={30} rows={5}></textarea>
                                        </div>
                                        <button className="bg-green-600 hover:bg-green-700 text-white p-2 rounded w-fit" onClick={() => submitApplicationData(appData)}>Submit</button>
                                    </div>
                                </>
                        }
                    </div>
                </div>
                <div className="log flex flex-col mt-4 w-1/3">
                    <MessageListComponent/>
                </div>
            </div>
        </div>
    );
};

export default IvacPanelPage;