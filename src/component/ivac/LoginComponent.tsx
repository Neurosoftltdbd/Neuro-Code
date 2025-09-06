import React, {useState} from 'react';
import {PostRequest} from "@/utility/NetworkRequest";
import ivacState from "@/state/ivac_state";
import {loginApi} from "@/utility/ApiList";

const LoginComponent = () => {
    const {setMessage} = ivacState();
    const [retrying, setRetrying] = useState(3);
    const [loginData, setLoginData] = useState({
        mobile_no: "",
        password: "",
        captcha_token: "",
        answer: 1,
        problem: "abc",
        otp: ""
    });

    const verifyMobile = async ()=>{
        if(loginData.mobile_no === ""){
            setMessage(false, "Mobile number is required");
            return;
        }
        const res = await PostRequest(
            "https://payment.ivacbd.com/api/v2/mobile-verify",
            {mobile_no: loginData.mobile_no},
            retrying
        );
        if(res.status === "success"){
            setMessage(true, res.message);
            setTimeout(()=>{sendLoginOtp()}, 5000);
        }else {
            setMessage(false, res.message);
        }
    }
    const sendLoginOtp = async () => {
        if(loginData.password === ""){
            setMessage(false, "Password is required");
            return;
        }
        const res = await PostRequest(
            "https://payment.ivacbd.com/api/v2/login",
            {mobile_no: loginData.mobile_no, password:loginData.password},
            retrying
        );
        if(res.status === "success"){
            setMessage(true, res.message);
        }else {
            setMessage(false, res.message);
        }
    }
    const verifyLoginOtp = async () => {
        if(loginData.otp === ""){
            setMessage(false, "OTP is required");
            return;
        }
        const res = await PostRequest("https://payment.ivacbd.com/api/v2/login-otp",
            {mobile_no: loginData.mobile_no, password:loginData.password, otp:loginData.otp}, retrying);
        if(res.status === "success"){
            setMessage(true, res.message);
        }else {
            setMessage(false, res.message);
        }
    }


    return (
        <div className="login-card flex flex-col gap-2 bg-gray-100 shadow-lg rounded p-4 my-2">
            <div className="flex justify-between gap-3 items-center">
                <input value={loginData.mobile_no}
                       onChange={(e) => setLoginData({...loginData, mobile_no: e.target.value})}
                       type="tel" className="rounded border border-gray-300 p-2 my-2 w-full"
                       placeholder="Enter IVAC mobile number" autoComplete="mobile"/>
                <button onClick={verifyMobile}
                        className="bg-green-700 hover:bg-green-800 text-white p-2 text-nowrap rounded">Verify mobile
                </button>
            </div>
            <div className="flex justify-between gap-3 items-center">
                <input value={loginData.password}
                       onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                       type="password" className="rounded border border-gray-300 p-2 my-2 w-full"
                       placeholder="Enter IVAC password"/>
                <button onClick={sendLoginOtp}
                        className="bg-green-700 hover:bg-green-800 text-white p-2 text-nowrap rounded w-fit">Send login
                    OTP
                </button>
            </div>
            <div className="flex justify-between gap-3 items-center">
                <input value={loginData.otp} onChange={(e) => setLoginData({...loginData, otp: e.target.value})}
                       type="text" className="rounded border border-gray-300 p-2 my-2 w-full"
                       placeholder="Enter 6 digit OTP"/>
                <button onClick={verifyLoginOtp}
                        className="bg-green-700 hover:bg-green-800 text-white p-2 text-nowrap rounded w-fit">Verify OTP
                </button>
            </div>
        </div>
    );
};

export default LoginComponent;