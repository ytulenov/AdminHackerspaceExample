import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function POST(
    req: Request,
    { params }: { params: { storeId: string}}
){
    try{
        const { userId } = auth(); 
        const body = await req.json()
        const { 
            name,
            mode,
            categoryId,
            sizeId,
            isArchived,
            isFeatured,
            childrentype,
            description,
            thirdtype,
            mastertype,
            values,
         } = body;

        if(!userId){
            return new NextResponse("Unautenticated", {status: 403});
        }

        if(!name){
            return new NextResponse("Name is Required", {status: 400});
        }

        if(!values || !values.length){
            return new NextResponse("Values, Price, Quantities and Colors are Required", {status: 400});
        }

        if(!mode){
            return new NextResponse("Mode is Required", {status: 400});
        }

        if(!categoryId){
            return new NextResponse("Category Id is Required", {status: 400});
        }

        if(!sizeId){
            return new NextResponse("Size Id is Required", {status: 400});
        }

        if (!params.storeId){
            return new NextResponse("Store ID is Required", {status: 400});
        }
 
        const storeByUserId = await prismadb.store.findFirst({
            where: {
                id: params.storeId,
                userId,
            }
        });

        if (!storeByUserId){
            return new NextResponse("Unauthorized", {status: 405});
        }
        const product = await prismadb.product.create({
            data: {
                name,
                isFeatured,
                isArchived,
                categoryId,
                mode,
                description,
                sizeId,
                mastertype,
                childrentype,
                thirdtype,
                storeId: params.storeId,
                values: {
                  createMany: {
                    data: values.map((value: {
                      typevaluemaster: string;
                      typevaluechildren: string;
                      typevaluethird: string;
                      price: number;
                      colorId: string;
                      quantity: number;
                      index: number;
                    }) => ({
                      typevaluemaster: value.typevaluemaster,
                      typevaluechildren: value.typevaluechildren,
                      typevaluethird: value.typevaluethird,
                      price: value.price,
                      colorId: value.colorId,
                      quantity: value.quantity,
                      index: value.index,
                      
                    })),
                  },
                },
              },
              
            });
            for (const value of values) {
                const createdValue = await prismadb.productvalue.findFirst({
                  where: {
                    // Define a unique condition to find the created value
                    // For example, based on a unique field like index
                    index: value.index,
                    productId: product.id,
                  },
                });
              
                if (createdValue) {
                  const createdImages = await prismadb.image.createMany({
                    data: value.images.map((image: { url: string }) => ({
                      url: image.url,
                      productvalueId: createdValue.id,
                    })),
                  });

                  NextResponse.json(createdImages);
                }
              }
            
        

        return NextResponse.json(product);

    }catch(error){
        console.log("[PRODUCTS_POST", error)
        return new NextResponse("Internal Error ", {status: 500});
    }   
};

export async function GET(
    req: Request,
    { params }: { params: { storeId: string}}
){
    try{
        const { searchParams } = new URL(req.url);
        const categoryId = searchParams.get("categoryId") || undefined;
        const sizeId = searchParams.get("sizeId") || undefined;
        const isFeatured = searchParams.get("isFeatured") || undefined;

        if (!params.storeId){
            return new NextResponse("Store ID is Required", {status: 400});
        }

        const products = await prismadb.product.findMany({
            where:{
                storeId: params.storeId,
                categoryId,
                sizeId,
                isFeatured: isFeatured ? true : undefined,
                isArchived: false
            },
            include:{
                values: {
                  include:{
                    images: true,
                    color: true
                  }
                },
                category: true,
                size: true,
            },
            orderBy:{
                createdAt: "desc"
            }
        });
        
        return NextResponse.json(products);

    }catch(error){
        console.log("[PRODUCTS_GET", error)
        return new NextResponse("Internal Error", {status: 500});
    }
};