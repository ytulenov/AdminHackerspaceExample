"use client";

import * as z from "zod";
import axios from "axios";
import { Subcategory, Subcategorytype, Subcategorytypevalue } from "@prisma/client";
import { Heading } from "@/components/ui/heading"
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useForm, SubmitHandler, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "react-hot-toast";
import { useParams, useRouter } from "next/navigation";
import { AlertModal } from "@/components/modals/alert-modal"; 

const formSchema = z.object({ 
    name: z.string().min(1),
    SubCategoryTypes: z.object({
        type: z.string().min(1),
        values:z.object({
            value: z.string().min(1)
        }).array()
    }).array(),
})

type SubCategoryFormValues = z.infer<typeof formSchema>;


interface SubCategoryFormProps {
    initialData: Subcategory & { types: (Subcategorytype & { values: Subcategorytypevalue[] })[] } | null;
    types: (Subcategorytype & { values: Subcategorytypevalue[] })[];
    values: Subcategorytypevalue[]
  }
 
export const SubCategoryForm: React.FC<SubCategoryFormProps> = ({
    initialData,
    types
}) => { 
    const params = useParams();
    const router = useRouter();
    const [createButtonPressed, setCreateButtonPressed] = useState(false);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const title = initialData ? "Edit subcategory" : "Create subcategory";
    const description = initialData ? "Edit a subcategory" : "Add a new subcategory";
    const toastMessage = initialData ? "SubCategory updated." : "SubCategory created.";
    const action = initialData ? "Save changes" : "Create";

     
    const form = useForm<SubCategoryFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData || {
          name: "",
          SubCategoryTypes:  [{ type: "", values: [{value: ""}] }],
        },
      });
    const { control, register, setValue } = form;
    const { fields, append, remove } = useFieldArray({
        control,
        name: "SubCategoryTypes",
    });

    useEffect(() => {
        setValue("SubCategoryTypes", types.map((type) => ({ 
            type: type.type, 
            values: type.values.map((value) => ({ value: value.value })),
            /*[
                {value: "1"},
                {value: "2"},
                {value: "3"},
            ]*/
        })));
      }, [setValue]);
    

    const onSubmit = async (data: SubCategoryFormValues) => {
        try{
            setLoading(true);
            setCreateButtonPressed(true); // Set the flag when the "Create" button is pressed
            if (initialData){
                await axios.patch(`/api/${params.storeId}/subcategories/${params.subcategoryId}`, data);
            }else{
                await axios.post(`/api/${params.storeId}/subcategories`, data);
            }
            router.refresh();
            router.push(`/${params.storeId}/subcategories`);
            toast.success(toastMessage);
        }catch(error){
            toast.error("Something went wrong.");
        }finally{
            setLoading(false);
            setCreateButtonPressed(false); // Reset the flag after submission
        }
    };

    const onDelete = async () => {
        try{
            setLoading(true);
            await axios.delete(`/api/${params.storeId}/subcategories/${params.subcategoryId}`)
            router.refresh();
            router.push(`/${params.storeId}/subcategories`);
            toast.success("SubCategory deleted.");
        }catch(error){
            toast.error("Make sure you removed all products using this subcategory first.")
        }finally{
            setLoading(false);
            setOpen(false);
        }
    }

    return(
        <>
        <AlertModal 
            isOpen = {open}
            onClose = {() => setOpen(false)}
            onConfirm = {onDelete}
            loading = {loading} 
        />
            <div className="flex items-center justify-between">
                <Heading  
                    title={title}
                    description={description}
                />
                {initialData && (
                    <Button
                        disabled = {loading}
                        variant = "destructive"
                        size = "icon"
                        onClick = {() => setOpen(true)}
                    >
                        <Trash 
                            className = "h-4 w-4"
                        />
                    </Button>
                )}
            </div>
            <Separator />
            <Form
                {...form}
            >
                <form
                    onSubmit =  {form.handleSubmit(onSubmit)}
                    className = "space-y-8 w-full"
                >
                    <div
                        className = "grid grid-cols-3 gap-8"
                    >
                        <FormField 
                            control = {form.control}
                            name = "name"
                            render = {({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Name
                                    </FormLabel>
                                    <FormControl>
                                        <Input 
                                            disabled = {loading}
                                            placeholder = "SubCategory name"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="space-y-8">
                    {fields.map((field, index) => (
                        <div key={field.id} className="grid grid-cols-3 gap-8 items-center">
                            <FormField
                            control={control}
                            name={`SubCategoryTypes.${index}.type`}
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Type {index + 1}</FormLabel>
                                <FormControl>
                                    <Input disabled={loading} placeholder="Type" {...field} />
                                </FormControl>
                                {createButtonPressed && <FormMessage />}
                                </FormItem>
                            )}
                            />

                            {/* Correct mapping of values */}
                            <div>
                            {field.values.map((value, valueIndex) => (
                                <FormField
                                key={valueIndex}
                                control={control}
                                name={`SubCategoryTypes.${index}.values.${valueIndex}.value`}
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Value {valueIndex + 1}</FormLabel>
                                    <FormControl>
                                        <Input disabled={loading} placeholder="Value" {...field} />
                                    </FormControl>
                                    </FormItem>
                                )}
                                />
                                
                            ))}
                            </div>

                            <div className="flex items-center mt-8">
                            <Button disabled={loading} onClick={() => remove(index)} variant="destructive" size="icon">
                                <Trash className="h-4 w-4" />
                            </Button>
                            </div>
                        </div>
                        ))}
                        <Button
                        disabled={loading}
                        onClick={() => append({ type: "", values: [{ value: "" }] })}
                        >
                        Add SubCategory Type
                        </Button>
                    </div>


                    <Button
                        disabled = {loading}
                        className = "ml-auto"
                        type = "submit"
                    >
                        {action}
                    </Button>
                </form>
            </Form>
        </>
    );
};