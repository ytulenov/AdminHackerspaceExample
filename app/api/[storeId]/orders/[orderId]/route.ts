import prismadb from "@/lib/prismadb";
import { NextResponse } from "next/server";

export async function GET ( 
    req: Request,
    {params}:{params:{ orderId: string}}
){
    try{
        if (!params.orderId){
            return new NextResponse("Order Id is required", {status: 400});
        }

        const order = await prismadb.order.findUnique({
            where: {
                id: params.orderId,
            },
            include:{ 
                orderItems: {
                    include: {
                        product: {
                            select:{
                                id: true,
                                name: true,
                                size: true,
                                mastertype: true,
                                mode: true,
                                childrentype: true,
                                thirdtype: true,
                            },
                        },
                        productvalue:{
                            select:{
                                id: true,
                                index: true,
                                price: true,
                                quantity: true,
                                typevaluemaster: true,
                                typevaluechildren: true,
                                typevaluethird: true,
                                images: true,
                                color: true
                            }
                        }
                    }
                }
            }
        });

        return NextResponse.json(order);

    }catch(error){
        console.log("[ORDER_GET}", error);
        return new NextResponse("Internal Error", {status: 500});
    }
};
