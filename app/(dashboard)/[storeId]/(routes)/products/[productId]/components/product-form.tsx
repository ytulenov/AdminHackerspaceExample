"use client";

import * as z from "zod";
import axios from "axios";
import {
  Category,
  Color,
  Image,
  Product,
  Size,
  Productvalue,
} from "@prisma/client";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react";
import { useForm, SubmitHandler, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "react-hot-toast";
import { useParams, useRouter } from "next/navigation";
import { AlertModal } from "@/components/modals/alert-modal";
import ImageUpload from "@/components/ui/image-upload";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const formSchema = z.object({
  name: z.string().min(1),
  categoryId: z.string().min(1),
  sizeId: z.string().min(1),
  isFeatured: z.boolean().default(false).optional(),
  isArchived: z.boolean().default(false).optional(),
  mode: z.string().min(1),
  description: z.string(),
  mastertype: z.string().optional(),
  childrentype: z.string().optional(),
  thirdtype: z.string().optional(),
  values: z
    .object({
      typevaluechildren: z.string().optional(),
      typevaluemaster: z.string().optional(),
      colorId: z.string().min(1),
      price: z.coerce.number().min(1),
      typevaluethird: z.string().optional(),
      images: z.object({ url: z.string() }).array(),
      quantity: z.coerce.number().min(1),
      index: z.coerce.number().min(1),
    })
    .array(),
});

type ProductFormValues = z.infer<typeof formSchema>;

interface ProductFormProps {
  initialData:
    | (Product & {
        values: Productvalue[];
      })
    | null;
  categories: Category[];
  sizes: Size[];
  colors: Color[];
}

export const ProductForm: React.FC<ProductFormProps> = ({
  initialData,
  categories,
  sizes,
  colors,
}) => {
  const params = useParams();
  const router = useRouter();
  const [createButtonPressed, setCreateButtonPressed] = useState(false);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const title = initialData ? "Edit product" : "Create product";
  const description = initialData ? "Edit a product" : "Add a new product";
  const toastMessage = initialData ? "Product updated." : "Product created.";
  const action = initialData ? "Save changes" : "Create";

  const defaultValues = initialData
    ? {
        ...initialData,
        //price: parseFloat(String(initialData?.price)),
        values: initialData.values
          .map((value) => ({
            ...value,
            price: parseFloat(String(value?.price)),
          }))
          .sort((a, b) => a.index - b.index),
        //values: [...initialData.values].sort((a, b) => a.index - b.index),
      }
    : {
        name: "",
        mode: "1",
        values: [
          {
            typevaluechildren: "",
            colorId: " ",
            typevaluemaster: " ",
            quantity: 0,
            index: 1,
            images: [],
            price: 0,
            typevaluethird: " ",
          },
        ],
        mastertype: " ",
        childrentype: " ",
        thirdtype: " ",
        description: " ",
        categoryId: "",
        sizeId: "",
        isFeatured: false,
        isArchived: false,
      };

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const { control, register, setValue } = form;
  const { fields, append, remove } = useFieldArray({
    control,
    name: "values",
  });

  const onSubmit = async (data: ProductFormValues) => {
    try {
      if (!form.formState.isValid) {
        toast.error("Please fill in all required fields.");
        return;
      }
      setLoading(true);

      if (initialData) {
        await axios.patch(
          `/api/${params.storeId}/products/${params.productId}`,
          data
        );
      } else {
        await axios.post(`/api/${params.storeId}/products`, data);
      }
      router.refresh();
      router.push(`/${params.storeId}/products`);
      toast.success(toastMessage);
    } catch (error) {
      toast.error("Something went wrong.");
    } finally {
      setCreateButtonPressed(false);
      setLoading(false);
      // Reset the flag after submission
    }
  };

  const onDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(`/api/${params.storeId}/products/${params.productId}`);
      router.refresh();
      router.push(`/${params.storeId}/products`);
      toast.success("Product deleted.");
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={loading}
      />
      <div className="flex items-center justify-between">
        <Heading title={title} description={description} />
        {initialData && (
          <Button
            disabled={loading}
            variant="destructive"
            size="sm"
            onClick={() => setOpen(true)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        )}
      </div>
      <Separator />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 w-full"
        >
          <div className="md:grid md:grid-cols-3 gap-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="Product name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    disabled={loading}
                    onValueChange={field.onChange}
                    value={field.value}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          defaultValue={field.value}
                          placeholder="Select a category"
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sizeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Size</FormLabel>
                  <Select
                    disabled={loading}
                    onValueChange={field.onChange}
                    value={field.value}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          defaultValue={field.value}
                          placeholder="Select a size"
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {sizes.map((size) => (
                        <SelectItem key={size.id} value={size.id}>
                          {size.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isFeatured"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      // @ts-ignore
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Featured</FormLabel>
                    <FormDescription>
                      This product will appear on the home page
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isArchived"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      // @ts-ignore
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Archived</FormLabel>
                    <FormDescription>
                      This product will not appear anywhere in the store.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="Product description"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="md:grid md:grid-cols-3 gap-8">
            <FormField
              control={form.control}
              name="mode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mode</FormLabel>
                  <Select
                    disabled={loading}
                    onValueChange={field.onChange}
                    value={field.value.toString()}
                    defaultValue={field.value.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          defaultValue={field.value.toString()}
                          placeholder="Select a mode"
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem key="1" value="1">
                        Mode 1
                      </SelectItem>
                      <SelectItem key="2" value="2">
                        Mode 2
                      </SelectItem>
                      <SelectItem key="3" value="3">
                        Mode 3
                      </SelectItem>
                      <SelectItem key="4" value="4">
                        Mode 4
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="md:grid md:grid-cols-3 gap-7">
            {form.watch("mode") === "1" && (
              <>
                <div className="md:col-span-2">
                  {fields
                    .filter((field) => field.index === 1)
                    .map((field, index) => (
                      <div
                        key={field.id}
                        className="grid grid-cols-4 gap-8 items-center"
                      >
                        <FormField
                          control={form.control}
                          name={`values.${index}.images`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Images</FormLabel>
                              <FormControl>
                                <ImageUpload
                                  value={field.value.map((image) => image.url)}
                                  disabled={loading}
                                  onChange={(url) =>
                                    field.onChange([...field.value, { url }])
                                  }
                                  onRemove={(url) =>
                                    field.onChange([
                                      ...field.value.filter(
                                        (current) => current.url !== url
                                      ),
                                    ])
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`values.${index}.price`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Price</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  disabled={loading}
                                  placeholder="9.99"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={control}
                          name={`values.${index}.quantity`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Quantity #{index + 1}</FormLabel>
                              <FormControl>
                                <Input
                                  disabled={loading}
                                  placeholder="Type"
                                  {...field}
                                />
                              </FormControl>
                              {createButtonPressed && <FormMessage />}
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`values.${index}.colorId`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Color</FormLabel>
                              <Select
                                disabled={loading}
                                onValueChange={field.onChange}
                                value={field.value}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue
                                      defaultValue={field.value}
                                      placeholder="Select a color"
                                    />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {colors.map((color) => (
                                    <SelectItem key={color.id} value={color.id}>
                                      {color.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    ))}
                </div>
              </>
            )}

            {form.watch("mode") === "2" && (
              <>
                <div className="md:col-span-1">
                  <FormField
                    control={form.control}
                    name="mastertype"
                    render={({ field }) => (
                      <div className="col-span-3">
                        <FormItem>
                          <FormLabel>Master Type</FormLabel>
                          <FormControl>
                            <Input
                              disabled={loading}
                              placeholder="Master type"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      </div>
                    )}
                  />
                </div>
                <div></div>
                <div className="md:col-span-2">
                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="grid grid-cols-5 gap-8 items-center"
                    >
                      <FormField
                        control={form.control}
                        name={`values.${index}.images`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Images</FormLabel>
                            <FormControl>
                              <ImageUpload
                                value={field.value.map((image) => image.url)}
                                disabled={loading}
                                onChange={(url) =>
                                  field.onChange([...field.value, { url }])
                                }
                                onRemove={(url) =>
                                  field.onChange([
                                    ...field.value.filter(
                                      (current) => current.url !== url
                                    ),
                                  ])
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control}
                        name={`values.${index}.typevaluemaster`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Master #{index + 1}</FormLabel>
                            <FormControl>
                              <Input
                                disabled={loading}
                                placeholder="Value"
                                {...field}
                              />
                            </FormControl>
                            {createButtonPressed && <FormMessage />}
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`values.${index}.price`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Price</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                disabled={loading}
                                placeholder="9.99"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control}
                        name={`values.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quantity #{index + 1}</FormLabel>
                            <FormControl>
                              <Input
                                disabled={loading}
                                placeholder="Type"
                                {...field}
                              />
                            </FormControl>
                            {createButtonPressed && <FormMessage />}
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`values.${index}.colorId`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Color</FormLabel>
                            <Select
                              disabled={loading}
                              onValueChange={field.onChange}
                              value={field.value}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue
                                    defaultValue={field.value}
                                    placeholder="Select a color"
                                  />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {colors.map((color) => (
                                  <SelectItem key={color.id} value={color.id}>
                                    {color.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex items-center mt-8 col-span-3 md:col-span-1">
                        <Button
                          disabled={loading}
                          onClick={() => remove(index)}
                          variant="destructive"
                          size="icon"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center mt-8 col-span-3">
                    <Button
                      disabled={loading}
                      onClick={() => {
                        setCreateButtonPressed(true); // Set createButtonPressed to true when Create button is clicked
                        append({
                          typevaluemaster: "",
                          typevaluechildren: "",
                          colorId: "",
                          typevaluethird: "",
                          quantity: 0,
                          price: 0,
                          images: [],
                          index: fields.length + 1,
                        });
                      }}
                    >
                      Add Value
                    </Button>
                  </div>
                </div>
              </>
            )}

            {form.watch("mode") === "3" && (
              <>
                <div className="grid grid-cols-2 gap-7 items-center">
                  <FormField
                    control={form.control}
                    name="mastertype"
                    render={({ field }) => (
                      <div className="col-span-3">
                        <FormItem>
                          <FormLabel>Master Type</FormLabel>
                          <FormControl>
                            <Input
                              disabled={loading}
                              placeholder="Master type"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      </div>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="childrentype"
                    render={({ field }) => (
                      <div className="col-span-3">
                        <FormItem>
                          <FormLabel>Children type</FormLabel>
                          <FormControl>
                            <Input
                              disabled={loading}
                              placeholder="Children type"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      </div>
                    )}
                  />
                </div>

                <div></div>
                <div className="md:col-span-2">
                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="grid grid-cols-6 gap-7 items-center"
                    >
                      <FormField
                        control={form.control}
                        name={`values.${index}.images`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Images</FormLabel>
                            <FormControl>
                              <ImageUpload
                                value={field.value.map((image) => image.url)}
                                disabled={loading}
                                onChange={(url) =>
                                  field.onChange([...field.value, { url }])
                                }
                                onRemove={(url) =>
                                  field.onChange([
                                    ...field.value.filter(
                                      (current) => current.url !== url
                                    ),
                                  ])
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control}
                        name={`values.${index}.typevaluemaster`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Master #{index + 1}</FormLabel>
                            <FormControl>
                              <Input
                                disabled={loading}
                                placeholder="Value"
                                {...field}
                              />
                            </FormControl>
                            {createButtonPressed && <FormMessage />}
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control}
                        name={`values.${index}.typevaluechildren`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Children #{index + 1}</FormLabel>
                            <FormControl>
                              <Input
                                disabled={loading}
                                placeholder="Value"
                                {...field}
                              />
                            </FormControl>
                            {createButtonPressed && <FormMessage />}
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`values.${index}.price`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Price</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                disabled={loading}
                                placeholder="9.99"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control}
                        name={`values.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quantity #{index + 1}</FormLabel>
                            <FormControl>
                              <Input
                                disabled={loading}
                                placeholder="Type"
                                {...field}
                              />
                            </FormControl>
                            {createButtonPressed && <FormMessage />}
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`values.${index}.colorId`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Color</FormLabel>
                            <Select
                              disabled={loading}
                              onValueChange={field.onChange}
                              value={field.value}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue
                                    defaultValue={field.value}
                                    placeholder="Select a color"
                                  />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {colors.map((color) => (
                                  <SelectItem key={color.id} value={color.id}>
                                    {color.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex items-center mt-8">
                        <Button
                          disabled={loading}
                          onClick={() => remove(index)}
                          variant="destructive"
                          size="icon"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center mt-8 col-span-3">
                    <Button
                      disabled={loading}
                      onClick={() => {
                        setCreateButtonPressed(true); // Set createButtonPressed to true when Create button is clicked
                        append({
                          typevaluemaster: "",
                          typevaluechildren: "",
                          colorId: "",
                          typevaluethird: "",
                          quantity: 0,
                          price: 0,
                          images: [],
                          index: fields.length + 1,
                        });
                      }}
                    >
                      Add Value
                    </Button>
                  </div>
                </div>
              </>
            )}
            {form.watch("mode") === "4" && (
              <>
                <div className="grid grid-cols-3 gap-7 items-center">
                  <FormField
                    control={form.control}
                    name="mastertype"
                    render={({ field }) => (
                      <div className="col-span-3">
                        <FormItem>
                          <FormLabel>Master Type</FormLabel>
                          <FormControl>
                            <Input
                              disabled={loading}
                              placeholder="Master type"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      </div>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="childrentype"
                    render={({ field }) => (
                      <div className="col-span-3">
                        <FormItem>
                          <FormLabel>Children type</FormLabel>
                          <FormControl>
                            <Input
                              disabled={loading}
                              placeholder="Children name"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      </div>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="thirdtype"
                    render={({ field }) => (
                      <div className="col-span-3">
                        <FormItem>
                          <FormLabel>Third type</FormLabel>
                          <FormControl>
                            <Input
                              disabled={loading}
                              placeholder="Third name"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      </div>
                    )}
                  />
                </div>

                <div></div>
                <div className="md:col-span-2">
                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="grid grid-cols-7 gap-7 items-center"
                    >
                      <FormField
                        control={form.control}
                        name={`values.${index}.images`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Images</FormLabel>
                            <FormControl>
                              <ImageUpload
                                value={field.value.map((image) => image.url)}
                                disabled={loading}
                                onChange={(url) =>
                                  field.onChange([...field.value, { url }])
                                }
                                onRemove={(url) =>
                                  field.onChange([
                                    ...field.value.filter(
                                      (current) => current.url !== url
                                    ),
                                  ])
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control}
                        name={`values.${index}.typevaluemaster`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Master #{index + 1}</FormLabel>
                            <FormControl>
                              <Input
                                disabled={loading}
                                placeholder="Value"
                                {...field}
                              />
                            </FormControl>
                            {createButtonPressed && <FormMessage />}
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control}
                        name={`values.${index}.typevaluechildren`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Children #{index + 1}</FormLabel>
                            <FormControl>
                              <Input
                                disabled={loading}
                                placeholder="Value"
                                {...field}
                              />
                            </FormControl>
                            {createButtonPressed && <FormMessage />}
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control}
                        name={`values.${index}.typevaluethird`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Third #{index + 1}</FormLabel>
                            <FormControl>
                              <Input
                                disabled={loading}
                                placeholder="Value"
                                {...field}
                              />
                            </FormControl>
                            {createButtonPressed && <FormMessage />}
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`values.${index}.price`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Price</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                disabled={loading}
                                placeholder="9.99"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control}
                        name={`values.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quantity #{index + 1}</FormLabel>
                            <FormControl>
                              <Input
                                disabled={loading}
                                placeholder="Type"
                                {...field}
                              />
                            </FormControl>
                            {createButtonPressed && <FormMessage />}
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`values.${index}.colorId`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Color</FormLabel>
                            <Select
                              disabled={loading}
                              onValueChange={field.onChange}
                              value={field.value}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue
                                    defaultValue={field.value}
                                    placeholder="Select a color"
                                  />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {colors.map((color) => (
                                  <SelectItem key={color.id} value={color.id}>
                                    {color.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex items-center mt-8">
                        <Button
                          disabled={loading}
                          onClick={() => remove(index)}
                          variant="destructive"
                          size="icon"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center mt-8 col-span-3">
                    <Button
                      disabled={loading}
                      onClick={() => {
                        setCreateButtonPressed(true); // Set createButtonPressed to true when Create button is clicked
                        append({
                          typevaluemaster: "",
                          typevaluechildren: "",
                          colorId: "",
                          typevaluethird: "",
                          quantity: 0,
                          price: 0,
                          images: [],
                          index: fields.length + 1,
                        });
                      }}
                    >
                      Add Value
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>

          <Button disabled={loading} className="ml-auto" type="submit">
            {action}
          </Button>
        </form>
      </Form>
    </>
  );
};
