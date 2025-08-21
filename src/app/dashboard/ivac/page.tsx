"use client";
import {useState} from "react";
import {getCloudflareToken} from "@/app/dashboard/ivac/BreakHumanCaptch";

const IvacPanelPage = () => {
    const [isLogin, setIsLogin] = useState(false);

    const [appData, setAppData] = useState({
        webfileId: "",
        highCommission: "4",
        ivacId: "4",
        visaType: "13",
        familyCount: 0,
        visitPurpose: "Medical purpose",
        familyData: [] as { name: string, webfileId: string }[]
    });

    const [loginData, setLoginData] = useState({
        mobileNo: "",
        password: "",
        otp: "",
        captcha_token: ""
    });
    const sendLoginOtp = async () => {
        clearLog();
        const res = await fetch("/api/ivac/get-captcha-token");
        const data = await res.json();
        const token = data.captchaToken;
        if(token){
            loginData.captcha_token = token;
            const response = await fetch("/api/ivac/login", {
                method: "POST",
                body: JSON.stringify(loginData),
            });
            const resData = await response.json();
            if (resData.status === "success") {
                setMessage(resData.message);
            }else {
                setMessage(resData.message);
            }
        }else {
            setMessage("Failed to get Cloudflare token");
        }
    }
    const verifyLoginOtp = async () => {
        clearLog();
        const response = await fetch("/api/ivac/login/verify", {
            method: "POST",
            body: JSON.stringify(loginData),
        });
        const resData = await response.json();
        if (resData.status === "success") {
            setMessage(resData.message);
            localStorage.setItem("token", resData.data.access_token);
            setIsLogin(true);
        }else {
            setMessage(resData.message);
        }
    }




    const handleSubmit = async (data:object) => {
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

    const setMessage = (msg:string) => document.getElementById("log-message")!.appendChild(document.createTextNode(msg));
    const clearLog = () => {
        document.getElementById("log-message")!.innerHTML = "";
    }


    return (
        <div className="p-4 bg-gray-200 h-screen w-full">
            <h2 className="text-2xl font-bold">IVAC Panel</h2>
            <hr/>
            <div className="flex gap-4">
                <div className="content mt-4 w-2/3">
                    <div>
                        {
                            isLogin ?
                                <>
                                    <div className="logout-from-ivac flex justify-between gap-2 shadow-md rounded p-4 my-4">
                                        <p>You are logged in to IVAC panel.</p>
                                        <button id="logout-from-ivac" className="bg-gray-600 hover:bg-gray-700 text-white p-2 rounded w-fit">Logout from IVAC</button>
                                    </div>
                                    <div>
                                        <input value={appData.webfileId} onChange={(e) => setAppData({...appData, webfileId: e.target.value})} id="webfile" className="rounded border border-gray-300 p-2 my-2 w-full" type="text" placeholder="Enter IVAC Webfile"/>
                                        <div className="flex flex-col gap-2">
                                            <label htmlFor="highCommission">Select High Commission</label>
                                            <select value={appData.highCommission} onChange={(e) => setAppData({...appData, highCommission: e.target.value})} name="highCommission" id="selectHighCommission" className="rounded border border-gray-300 p-2">
                                                <option value="4">Sylhet</option>
                                                <option value="1">Dhaka</option>
                                                <option value="2">Chittagong</option>
                                                <option value="3">Rajshahi</option>
                                                <option value="5">Khulna</option>
                                            </select>
                                        </div>
                                        <input value={appData.visitPurpose} onChange={(e) => setAppData({...appData, visitPurpose: e.target.value})} id="visitPurpose" className="rounded border border-gray-300 p-2 my-2 w-full" type="text" placeholder="Enter Visit Purpose"/>
                                        <div>
                                            <label htmlFor="familyData">Family data: </label>
                                            <textarea
                                                value={appData.familyData.map(({ name, webfileId }) => `${name}, ${webfileId}`).join('\n')}
                                                onChange={(e) =>
                                                    {
                                                        const familyData = e.target.value.split('\n')
                                                            .filter(line => line.trim() !== '') // Good practice to filter out empty lines
                                                            .map(line => {
                                                                const [name, webfileId] = line.split(',').map(item => item.trim());
                                                                return { name, webfileId };
                                                            });
                                                        setAppData({...appData, familyData, familyCount: familyData.length});
                                                    }
                                            }
                                                className="rounded border border-gray-300 p-2 my-2 w-full" name="familyData" id="familyData" cols={30} rows={5}></textarea>
                                        </div>

                                        <button className="bg-green-600 hover:bg-green-700 text-white p-2 rounded w-fit" onClick={() => handleSubmit(appData)}>Submit</button>

                                    </div>
                                </>
                                :
                                <div className="login-to-ivac flex flex-col gap-2 shadow-md rounded p-4">
                                    <input value={loginData.mobileNo}
                                           onChange={(e) => setLoginData({...loginData, mobileNo: e.target.value})}
                                           type="tel" className="rounded border border-gray-300 p-2 my-2"
                                           placeholder="Enter IVAC mobile number"
                                           autoComplete="tel"
                                    />
                                    <input value={loginData.password}
                                           onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                                           type="password" className="rounded border border-gray-300 p-2 my-2"
                                           placeholder="Enter IVAC password"/>
                                    <button onClick={sendLoginOtp} className="bg-green-600 hover:bg-green-700 text-white p-2 rounded w-fit">Send login OTP</button>
                                    <input value={loginData.otp} onChange={(e) => setLoginData({...loginData, otp: e.target.value})} type="text" className="rounded border border-gray-300 p-2 my-2" placeholder="Enter 6 digit OTP" />
                                    <button onClick={verifyLoginOtp} className="bg-green-600 hover:bg-green-700 text-white p-2 rounded w-fit">Verify OTP</button>
                                </div>

                        }
                    </div>
                </div>
                <div className="log flex flex-col mt-4 w-1/3">
                    <div className="log-header flex items-center justify-between">
                        <h3>Log message</h3>
                        <button onClick={clearLog} id="clear-log" className="bg-gray-400 hover:bg-gray-500 text-white p-2 rounded w-fit">Clear Log</button>
                    </div>
                    <div id="log-message"></div>
                </div>
            </div>
        </div>
    );
};

export default IvacPanelPage;