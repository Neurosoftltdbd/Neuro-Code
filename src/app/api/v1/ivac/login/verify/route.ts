import {NextRequest, NextResponse} from "next/server";
import {PostRequest} from "@/utility/NetworkRequest";

let messageList: string[] = [];
export async function GET(request: NextRequest) {
    messageList = [];
    const loginData = request.json();
    const verifyLoginOpt = await PostRequest("https://api-payment.ivacbd.com/api/v2/login-otp",loginData);
    const resData = await verifyLoginOpt.json();
    if (resData.status === "success") {
        messageList.push("Login OTP verified successfully");
        const authToken: string = resData.data.access_token;
        localStorage.setItem('token', authToken);
        return NextResponse.json({ status: resData.status, message: resData.message, data: resData.data, messageList: messageList });
    }else {
        messageList.push("Login OTP verification failed");
        return NextResponse.json({ status: resData.status, message: resData.message, messageList: messageList });
    }
}