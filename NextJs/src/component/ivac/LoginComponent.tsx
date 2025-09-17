import React, {useState} from 'react';
import {PostRequest} from "@/utility/NetworkRequest";
import ivacState from "@/state/ivac_state";
import axios from "axios";
import axiosRetry from "axios-retry";

const LoginComponent = () => {
    const {setMessage} = ivacState();
    const [retrying, setRetrying] = useState(0);
    const [loginData, setLoginData] = useState({
        mobile_no: "",
        password: "",
        captcha_token: "0.L8eRyMQSiwZZ-Rc1__pavwxLUzfEXfNXoStHG75reHsv9PiS0689ab_-5pYVIha1fQYw_j011wCz0Urv3h0FAOsFEpbrVNMPNFtOLyd5LPOxZgToKBVcY0OP7DaZVXTVaZS7f6E81aYu34CbHMNy-H2kOCilx-vJgOARf-L04opxHyfWNuzTX6xDJYnr4lqc8InlX5hxMe95lQKtzES-nVQq8-YOT_6i72BZ2qtHGkTGZjdTfseyty6olLY-V2pu1bp3m8DxeMQUhb3VyRujXp9xML55WwwrtIvaIPHFn_H2WyJUTmSgHkkCGXYTYWFwjZCwbx1NUUjekzr5z71LO6ChLUOyhChlXcZas_C7vAHe7dGl8YOmkQq-hULbJu7Q-ATL2Ct0REmHbavzcXXaBQVD9Dzshp6m1BUdr-swV168M4pbCbdGvksDgGx-ubvhbQCeDp_XLW1OIrcrNnmdtK_MxIYh3SXvUZ5VMTdBd9xfr8pV0MnzHxJkvjI1yLtazeIQ1DSkT2vMHWVpkj_jnqQhcqnuImYzJ3KMF7ChZ2tjlCY3-WncvsHUATab3bFPC96-pJM36lU6ykSXuPMV9jw9qX6RcJWUrV_D_Bbb3XzIWYJJqJ_VL4_UA8xS87pZXl3nNIUmkubcfe58Az4JgDc0phqcZpKZ322mMgTDTSCWSoU_KVy44nutQHXpuOoNysD9FVdu-Z6RKVjpBQxsa28n7HyPwrWEXtjsRXXumVodWQaEVB4ZfmCfqBMS9Tn0T0zNBhkc1nRQ3StG0NpFn735J_5SV3IHNcIxtYCubOlJHLirxdIV2RjOZ0F8na9D8wtT3njut0_6JAjFgbG0Z1JDYTQdvFdcyOXixxItXTWhr3Kxdf7rlOiCgpmWxGA2m3wE24l-mUelRfs4H4bzzIBqX5ZhGKB-qE5r4JxHJlfrPrI3lWZwXPzBHQqRQz9s.cckXkF3zJo76JttYDI9XEg.820990af17f9529c07520df147ef162e521d027395c6a9cccf112c5cb8566d95",
        answer: 1,
        problem: "abc",
        otp: ""
    });
    axiosRetry(axios, { retries: 1, retryDelay: axiosRetry.exponentialDelay, shouldResetTimeout: true });

    const verifyMobile = async ()=>{
        if(loginData.mobile_no === ""){
            setMessage(false, "Mobile number is required");
            return;
        }
        try {
            const url = "https://payment.ivacbd.com/api/v2/mobile-verify";
            const payload = {
                mobile_no: loginData.mobile_no,
                captcha_token: loginData.captcha_token,
                answer: 1,
                problem: "abc"
            }
            // const res = await PostRequest(url,payload,retrying);
            const res = await axios.post(url, payload, { maxRedirects: retrying })
            if(res.data.status === "success"){
                setMessage(true, res.data.message);
                setTimeout(()=>{sendLoginOtp()}, 5000);
            }else {
                setMessage(false, res.data.message);
            }
        }catch (e) {
            setMessage(false, `${e}`);
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
            <div className="flex flex-col gap-2 py-2">
                <div className="cf-turnstile" data-sitekey="0x4AAAAAABpNUpzYeppBoYpe"></div>
                <script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
            </div>

            <div className="flex justify-between gap-3 items-center">
                <input value={loginData.mobile_no}
                       onChange={(e) => setLoginData({...loginData, mobile_no: e.target.value})}
                       type="tel" className="rounded border border-gray-300 p-2 my-2 w-full" pattern="[0-9]{11}"
                       placeholder="Enter IVAC mobile number" autoComplete="on"/>
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