import { NextResponse  } from "next/server";
import prismadb from "@/lib/prismadb";
import Page from "@/app/(auth)/(routes)/sign-in/[[...sign-in]]/page";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",  
}
interface ItemType {
    id: string;
    productValueId: string;
    productIndex: number;
    productQuantity: number;
    productPrice: number;
  }

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
} 

function generateRandomValue(): number {
    return Math.floor(Math.random() * (97 - 27 + 1)) + 27;
  }



  

export async function POST(
    req: Request,
    { params }: { params: { storeId: string, confirmationid: number } }
){
    const { formData, productIds: items } = await req.json();

    if (!items ||  items.length === 0){
        return new NextResponse("Product ids are required", { status: 400 })
    }

    if (!formData){
        return new NextResponse("Invalid Address", { status: 400 })
    }

    const productIds: ItemType[] = items.map((item: ItemType) => ({
        id: item.id,
        productValueId: item.productValueId,
        productIndex: item.productIndex,
        productQuantity: item.productQuantity,
        productPrice: item.productPrice,
      }));

    /*const products = await prismadb.product.findMany({
    where:{ 
        id: {
            in: productIds
        }
    }
});*/

    const latestOrder = await prismadb.order.findFirst({
        where: {
          storeId: params.storeId, 
        },
        orderBy: {
          confirmationid: "desc",
        },
      }); 
    const randomValue = generateRandomValue();
    const confirmationId = latestOrder ? latestOrder.confirmationid + randomValue : 100000000;
    

    await Promise.all(
        productIds.map(async ({ productValueId, productQuantity }) => {
          await prismadb.productvalue.updateMany({
            where: { id: productValueId },
            data: { quantity: { decrement: productQuantity } },
          });
        })
      );

    const order = await prismadb.order.create({
        data: {
            storeId: params.storeId, 
            isBooked: true,
            orderItems: {
                create: productIds.map(({ id, productIndex, productQuantity, productValueId }) => ({
                  product: { connect: { id: id } },
                  productvalue: { connect: { id: productValueId } },
                  quantity: productQuantity,
                  productIndex: productIndex,
                }))
            },
            totalPrice: productIds.reduce((total, item) => {return total + Number(item.productPrice)*Number(item.productQuantity);}, 0),
            confirmationid: confirmationId,
            firstname: formData.firstname,
            lastname: formData.lastname,
            phone: formData.phone,
            studentId: formData.studentid,
            personalemail: formData.personalemail,
            studentemail: formData.studentemail,
        },
    });
    

    
    const responseData = {
        url: `${process.env.FRONTEND_STORE_URL}/cart?success=1&confirm=${order.id}`,
      };

    NextResponse.json(order)
    
    return NextResponse.json(responseData, { headers: corsHeaders });
}