import {NextRequest, NextResponse} from "next/server";
import {PostRequest} from "@/app/dashboard/ivac/NetworkRequest";
import puppeteer from "puppeteer";

let messageList: string[] = [];

export async function POST(req: NextRequest) {
    messageList = [];
    const userData = await req.json();



    const verifyMobileNo = await PostRequest("https://api-payment.ivacbd.com/api/v2/mobile-verify", {
        mobile_no: userData.mobileNo,
        captcha_token:""
    });
    if (verifyMobileNo.status === "success") {
        messageList.push("Mobile number verified successfully");
        const sendLoginOtp = await PostRequest("https://api-payment.ivacbd.com/api/v2/login", {
            mobile_no: userData.mobileNo,
            password: userData.password
        });
        if (sendLoginOtp.status === "success") {
            messageList.push(sendLoginOtp.message);
            return NextResponse.json({ status: sendLoginOtp.status,message: sendLoginOtp.message, messageList: messageList });
        }else {
            messageList.push(sendLoginOtp.message);
            return  NextResponse.json({ status: sendLoginOtp.status,message: sendLoginOtp.message, messageList: messageList });
        }
    }else {
        messageList.push(verifyMobileNo.message);
        return NextResponse.json({ status: verifyMobileNo.status ,message: verifyMobileNo.message, messageList: messageList });
    }
}