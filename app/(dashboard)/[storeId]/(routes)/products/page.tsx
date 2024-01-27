import { format } from "date-fns";

import prismadb from "@/lib/prismadb";
import { formatter } from "@/lib/utils";

import { ProductsClient } from "./components/client";
import { ProductColumn } from "./components/columns";

const ProductsPage = async ({
  params
}: {
  params: { storeId: string }
}) => {
  const products = await prismadb.product.findMany({
    where: {
      storeId: params.storeId
    },
    include: {
      category: true, 
      size: true, 
      values: {
        include:{
          images: true,
          color: true,
        }
      },
    },
    orderBy: { 
      createdAt: 'desc'
    }
  });

  const formattedProducts: ProductColumn[] = products.map((item) => ({
    id: item.id,
    name: item.name,
    isFeatured: item.isFeatured,
    isArchived: item.isArchived,
    mastertype: item.mastertype,
    mode: item.mode,
    description: item.description,
    childrentype: item.childrentype,
    thirdtype: item.thirdtype,
    values: item.values.map((value) => ({
      index: value.index,
      price: value.price,
      typevaluemaster: value.typevaluemaster,
      typevaluechildren: value.typevaluechildren,
      typevaluethird: value.typevaluethird,
      quantity: value.quantity,
      color: value.color.value,
      images: value.images,
    })),
    category: item.category.name,
    size: item.size.name,
    createdAt: format(item.createdAt, 'MMMM do, yyyy'),
  }));


  /*const SubCategoriesPage = async ({
    params
}:{ 
    params: {storeId: string}
}) => {
    const subcategories = await prismadb.subcategory.findMany({
        where:{
            storeId: params.storeId 
        },
        include:{
            types: true
        },
        orderBy: {
            createdAt: 'desc'
        } 
    }); 

    const formattedSubCategories: SubCategoryColumn[] = subcategories.map((item)=>({
        id: item.id,
        name: item.name,
        createdAt: format(item.createdAt, "MMMM do, yyyy"),
        types: item.types.map(( Subcategorytype ) => Subcategorytype.type).join(', '),
    }));

    return( 
        <div
            className = "flex-col"
        >
            <div
                className = "flex-1 space-y-4 p-8 pt-6"
            >
                <SubCategoryClient data={formattedSubCategories}/>
            </div>
        </div>
    ); 
}

export default SubCategoriesPage;*/

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <ProductsClient data={formattedProducts} />
      </div>
    </div>
  );
};

export default ProductsPage;