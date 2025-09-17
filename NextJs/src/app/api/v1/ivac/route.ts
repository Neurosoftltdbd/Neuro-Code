import {NextRequest, NextResponse} from "next/server";
import {PostRequest} from "@/utility/NetworkRequest";

let ivacData: object = {
    webfileId: "",
    highCommission: "4",
    ivacId: "4",
    visaType: "13",
    familyCount: 0,
    visitPurpose: "Medical purpose",
    familyData: []
};
let messageList: string[] = [];

export async function GET(request: NextRequest) {

        return NextResponse.json({ status: "success", message: "API is working" });

}


export async function POST(request: NextRequest){
    messageList = [];
    const initialData = await request.json();
    ivacData = initialData;

    const appInfo = await PostRequest("https://api-payment.ivacbd.com/api/v2/payment/application-info-submit", {
        highcom: initialData.highCommission,
        webfile_id: initialData.webfileId,
        webfile_id_repeat: initialData.webfileId,
        ivac_id: initialData.ivacId,
        visa_type: initialData.visaType,
        family_count: initialData.familyCount,
        visit_purpose: initialData.visitPurpose
    }, 2);
    if (appInfo.status === "success") {
        messageList.push("App info submit success");
        const personalInfo = await PostRequest("https://api-payment.ivacbd.com/api/v2/payment/personal-info-submit", {
            full_name: initialData.fullName,
            email_name: initialData.email,
            phone: initialData.phone,
            webfile_id: initialData.webfileId,
            family: initialData.familyData
        }, 2);
        if (personalInfo.status === "success") {
            messageList.push("Personal info submit success");
            const sendOverview = await PostRequest("https://api-payment.ivacbd.com/api/v2/payment/overview-submit", {}, 2);
            if (sendOverview.status === "success") {
                messageList.push("Overview submit success");
                const sendOtp = await PostRequest("https://api-payment.ivacbd.com/api/v2/payment/pay-otp-sent", {resend: 0}, 2);
                if (sendOtp.status === "success") {
                    messageList.push("Otp sent successfully");
                    return NextResponse.json({ status: "success", message: "Otp sent successfully", messageList: messageList });
                }else {
                    messageList.push("Otp send failed");
                    return NextResponse.json({ status: "error", message: "Otp send failed", messageList: messageList });
                }
            }else {
                messageList.push("Overview failed");
                return NextResponse.json({ status: "error", message: "Overview failed", messageList: messageList });
            }
        }else {
            messageList.push("Personal info submit failed");
            return NextResponse.json({ status: "error", message: "Personal info submit failed", messageList: messageList });
        }
    }else{
        messageList.push("Application info submit failed");
        return NextResponse.json({ status: "error", message: "Application info submit failed", messageList: messageList });
    }

}