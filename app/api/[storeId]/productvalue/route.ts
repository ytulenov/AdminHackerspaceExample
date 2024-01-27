import prismadb from "@/lib/prismadb";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  {
    params,
  }: {
    params: {
      selectedMasterType: string;
      selectedChildrenType: string;
      selectedThirdType: string;
    };
  }
) {
  try {
    
    const productvalue = await prismadb.productvalue.findMany({
      where: {
        typevaluemaster: params.selectedMasterType,
        typevaluechildren: params.selectedChildrenType,
        typevaluethird: params.selectedThirdType,
        // Add other conditions as needed (e.g., categoryId, sizeId, isFeatured)
      },
    });

    return NextResponse.json(productvalue);
  } catch (error) {
    console.error("[PRODUCTS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}