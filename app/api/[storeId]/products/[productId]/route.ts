import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function GET ( 
    req: Request,
    {params}:{params:{ productId: string}}
){ 
    try{
        if (!params.productId){
            return new NextResponse("Product Id is required", {status: 400});
        }

        const product = await prismadb.product.findUnique({
            where: {
                id: params.productId,
            },
            include:{
                values: {
                    include:{
                        images: true,
                        color: true
                    },
                },
                category: true,
                size: true,
            },
        });

        return NextResponse.json(product);

    }catch(error){
        console.log("[PRODUCT_GET}", error);
        return new NextResponse("Internal Error", {status: 500});
    }
};

export async function PATCH ( 
    req: Request,
    {params}:{params:{storeId: string, productId:string}}
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

        await prismadb.product.update({
            where: {
                id: params.productId,
            },
            data:{
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
                values:{
                    deleteMany:{}
                },
            }
        });

        const product = await prismadb.product.update({
            where:{
                id: params.productId
            },
            data: {
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
        })
        
        for (const value of values) {
            const createdValue = await prismadb.productvalue.findFirst({
              where: {
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

              NextResponse.json(createdImages);}}

              const remainingValues = await prismadb.productvalue.findMany({
                where: {
                  productId: params.productId,
                },
                orderBy: {
                  index: 'asc',
                },
              });
              
              // Update indexes of remaining values
              for (let i = 0; i < remainingValues.length; i++) {
                await prismadb.productvalue.update({
                  where: {
                    id: remainingValues[i].id,
                  },
                  data: {
                    index: i + 1, // Assuming index starts from 1
                  },
                });
              }

        return NextResponse.json(product);

        
              
    }catch(error){
        console.log("[PRODUCT_PATCH}", error);
        return new NextResponse("Internal Error", {status: 500});
    }
};

export async function DELETE ( 
    req: Request,
    {params}:{params:{storeId:string, productId: string}}
){
    try{
        const { userId } = auth();

        if(!userId){
            return new NextResponse("Unauthenticated", {status:403});
        }

        if (!params.productId){
            return new NextResponse("Product Id is required", {status: 400});
        }

        const storeByUserId = await prismadb.store.findFirst({
            where: {
                id: params.storeId,
                userId
            }
        });

        if (!storeByUserId){
            return new NextResponse("Unauthorized", {status: 405});
        }

        const product = await prismadb.product.deleteMany({
            where: {
                id: params.productId,
            }
        });

        return NextResponse.json(product);

    }catch(error){
        console.log("[PRODUCT_DELETE}", error);
        return new NextResponse("Internal Error", {status: 500});
    }
};


