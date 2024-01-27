// Import necessary modules
import prismadb from "@/lib/prismadb";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const queryParams = new URL(request.url).searchParams;
  const searchQuery = queryParams.get("q");
  console.log("Received search query:", searchQuery);
  try {
    if (typeof searchQuery !== 'string'){
        throw new Error("Invalid request");
      }
    const posts = await prismadb.product.findMany({
        where: {
            OR: [
                {
                name: {
                    contains: searchQuery,
                }
                },
                {
                description: {
                    contains: searchQuery,
                }},
                {
                mastertype: {
                    contains: searchQuery,
                }},
                {childrentype: {
                    contains: searchQuery,
                }},
                {thirdtype: {
                    contains: searchQuery,
                }},
                {
                    size:{
                        value: {
                            contains: searchQuery,
                        }
                    }
                },
            ],
            
        },
        include: {
            category: true,
            size: true,
            values:{
                include:{
                    color: true,
                    images: true,
                }
            },
          },
    })
    return NextResponse.json( posts );

    } catch (error) {
        return new NextResponse("Internal Error", {status: 500});
    }
}