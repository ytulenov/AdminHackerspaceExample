import { NextResponse  } from "next/server";
import prismadb from "@/lib/prismadb";
import Page from "@/app/(auth)/(routes)/sign-in/[[...sign-in]]/page";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",  
}

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
} 

export async function POST(
    req: Request,
    { params }: { params: { storeId: string } }
){
    const { formData } = await req.json();


    const feedback = await prismadb.feedback.create({
        data: {
            storeId: params.storeId,
            firstname: formData.firstname,
            lastname: formData.lastname,
            phone: formData.phone,
            studentId: formData.studentid,
            email: formData.email,
            ordernumber: formData.ordernumber,
            feedbackIn: formData.feedbackIn,
            reviewed: formData.reviewed,
        },
    })
    
    NextResponse.json(feedback)
    

    return NextResponse.json({ url: `${process.env.FRONTEND_STORE_URL}/feedback?success=1` }, {
        headers: corsHeaders
    })
}