import prismadb from "@/lib/prismadb";
import { SubCategoryForm } from "./components/subcategory-form";

const SubCategoryPage = async ({
    params
}:{
    params: { subcategoryId: string, storeId: string } 
}) => {
    const subcategory = await prismadb.subcategory.findUnique({
        where:{
            id: params.subcategoryId 
        }
    }); 

    const subcategorytypes = await prismadb.subcategorytype.findMany({
        where:{
            subcategoryId: params.subcategoryId
        }
    });

    return(
        <div
            className = "flex-col"
        >
            <div
                className = "flex-1 space-y-4 p-8 pt-6"
            >
                <SubCategoryForm 
                    initialData = {subcategory}
                    types = {subcategorytypes}
                /> 
            </div>
        </div> 
    );
}

export default SubCategoryPage;