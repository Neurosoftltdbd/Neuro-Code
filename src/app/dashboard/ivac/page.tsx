"use client";
import {useState} from "react";
import {PostRequest} from "./NetworkRequest";


const IvacPanelPage = () => {
    const [retrying, setRetrying] = useState(3);
    const [messages, setMessages] = useState<string[]>([]);
    const setMessage = (message: string) => {setMessages([...messages, message]);}
    const [cloudFlareToken, setCloudFlareToken] = useState("");
    const [personalInfo, setPersonalInfo] = useState({
        name: "",
        dob: "",
        gender: "",
    });
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

    const [loginData, setLoginData] = useState({
        mobile_no: "",
        password: "",
        captcha_token: cloudFlareToken,
        answer: 1,
        problem: "abc",
        otp: ""
    });

    const verifyMobile = async ()=>{
        if(loginData.mobile_no === ""){
            setMessage("Mobile number is required");
            return;
        }
        const res = await PostRequest("https://payment.ivacbd.com/api/v2/mobile-verify",{mobile_no: loginData.mobile_no}, retrying);
        if(res.status === "success"){
            setMessage(res.message);
            setTimeout(()=>{sendLoginOtp()}, 5000);
        }else {
            setMessage(res.message);
        }
    }
    const sendLoginOtp = async () => {
        if(loginData.password === ""){
            setMessage("Password is required");
            return;
        }
        const res = await PostRequest("https://payment.ivacbd.com/api/v2/login",{mobile_no: loginData.mobile_no, password:loginData.password}, retrying);
        if(res.status === "success"){
            setMessage(res.message);
        }else {
            setMessage(res.message);
        }
    }
    const verifyLoginOtp = async () => {
        if(loginData.otp === ""){
            setMessage("OTP is required");
            return;
        }
        const res = await PostRequest("https://payment.ivacbd.com/api/v2/login-otp",{mobile_no: loginData.mobile_no, password:loginData.password, otp:loginData.otp}, retrying);
        if(res.status === "success"){
            setMessage(res.message);
        }else {
            setMessage(res.message);
        }
    }







    const submitApplicationData = async (data:object) => {
        clearLog();
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
                <div className="content mt-4 w-2/3 overscroll-y-auto">
                    <div>
                        {
                                <>
                                    <div className="login-card flex flex-col gap-2 shadow-lg rounded p-4 my-2">
                                        <div className="flex justify-between gap-3 items-center">
                                            <input value={loginData.mobile_no} onChange={(e) => setLoginData({...loginData, mobile_no: e.target.value})}
                                                   type="tel" className="rounded border border-gray-300 p-2 my-2 w-full" placeholder="Enter IVAC mobile number" autoComplete="tel"/>
                                            <button onClick={verifyMobile} className="bg-green-600 hover:bg-green-700 text-white p-2 text-nowrap rounded">Verify mobile</button>
                                        </div>
                                        <div className="flex justify-between gap-3 items-center">
                                            <input value={loginData.password} onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                                                   type="password" className="rounded border border-gray-300 p-2 my-2 w-full" placeholder="Enter IVAC password"/>
                                            <button onClick={sendLoginOtp} className="bg-green-600 hover:bg-green-700 text-white p-2 text-nowrap rounded w-fit">Send login OTP</button>
                                        </div>
                                        <div className="flex justify-between gap-3 items-center">
                                            <input value={loginData.otp} onChange={(e) => setLoginData({...loginData, otp: e.target.value})}
                                                   type="text" className="rounded border border-gray-300 p-2 my-2 w-full" placeholder="Enter 6 digit OTP" />
                                            <button onClick={verifyLoginOtp} className="bg-green-600 hover:bg-green-700 text-white p-2 text-nowrap rounded w-fit">Verify OTP</button>
                                        </div>
                                    </div>

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
                                                    ivacCenters[appData.highcom - 1].map((center, index) => <option key={index} value={center[0]}>{center[1]}</option>)
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
                    <div className="log-header flex items-center justify-between">
                        <h3>Log message</h3>
                        <button onClick={() => setMessages([])} id="clear-log" className="bg-gray-400 hover:bg-gray-500 text-white p-2 rounded w-fit">Clear Log</button>
                    </div>
                    <div id="log-message">
                        {
                            messages && messages.map((msg, index) => <p key={index}>{"> " + msg}</p>)
                        }
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IvacPanelPage;