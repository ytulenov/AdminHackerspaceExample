"use client";

import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";

import { CellAction } from "./cell-action";

export type ProductColumn = {
  id: string;
  name: string;
  category: string;
  size: string;
  mode: string;
  mastertype: string;
  childrentype: string;
  description: string;
  thirdtype: string;
  createdAt: string;
  isFeatured: boolean;
  isArchived: boolean;
  values: {
    index: number;
    typevaluemaster: string;
    typevaluechildren: string;
    typevaluethird: string;
    quantity: number;
    color: string;
    price: number;
    images: {
      url: string;
    }[];
  }[];
};

export const columns: ColumnDef<ProductColumn>[] = [
  {
    accessorKey: "images",
    header: "Images",
    cell: ({ row }) => (
      <div className="p-4 max-w-full max-h-40 overflow-y-auto overflow-x-auto whitespace-pre-wrap break-all">
        {row.original.values.map((value, index) => (
          <div key={index} className="space-y-2 py-2">
            {value.images.map((image, imgIndex) => (
              //<img key={imgIndex} src={image.url} alt={`Image ${imgIndex}`} />
              <div
                key={imgIndex}
                className="w-32 h-32 flex-shrink-0 mr-2 rounded-md overflow-hidden"
              >
                <Image
                  src={image.url}
                  alt={`${imgIndex} Image`}
                  width={150}
                  height={150}
                  className="object-cover w-full h-full"
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    ),
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "isArchived",
    header: "Archived",
  },
  {
    accessorKey: "isFeatured",
    header: "Featured",
  },
  {
    accessorKey: "category",
    header: "Category",
  },
  {
    accessorKey: "size",
    header: "Size",
  },
  {
    accessorKey: "description",
    header: "Description",
  },
  {
    accessorKey: "mode",
    header: "Mode"
  },
  {
    accessorKey: "mastertype",
    header: "Master Type",
  },
  {
    accessorKey: "childrentype",
    header: "Children Type",
  },
  {
    accessorKey: "thirdtype",
    header: "Third Type",
  },
  {
    accessorKey: "values",
    header: "Values",
    cell: ({ row }) => {
      const sortedValues = row.original.values?.sort(
        (a, b) => a.index - b.index
      );

      return (
        <div>
          {sortedValues && sortedValues.length > 0 ? (
            sortedValues.map((value, index) => (
              <div key={index}>
                <div className="py-2">

                Index: {value.index}, 
                Quantity: {value.quantity}, 
                Price: {value.price}
                  {Number(row.original.mode) >= 2 && (
                    <>
                      , {row.original.mastertype}: {value.typevaluemaster}
                      {Number(row.original.mode) >= 3 && (
                        <>
                          , {row.original.childrentype}: {value.typevaluechildren}
                          {Number(row.original.mode) === 4 && (
                            <>
                              , {row.original.thirdtype}: {value.typevaluethird}
                            </>
                          )}
                        </>
                      )}
                    </>
                  )}
                </div>
                <div className="flex items-center gap-x-2">
                  {value.color}
                  <div
                    className="h-6 w-6 rounded-full border"
                    style={{ backgroundColor: value.color }}
                  />
                </div>
              </div>
            ))
          ) : (
            <div>No values available</div>
          )}
        </div>
      );
    },
  },

  {
    accessorKey: "createdAt",
    header: "Date",
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
