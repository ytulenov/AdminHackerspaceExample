import prismadb from "@/lib/prismadb";
import { format } from "date-fns"
import { SubCategoryClient } from "./components/client";
import { SubCategoryColumn } from "./components/columns";

const SubCategoriesPage = async ({
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

export default SubCategoriesPage;