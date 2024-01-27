"use client";

import { StringValidation } from "zod";
import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import Image from "next/image";
import Priceperunit from "@/components/ui/price";
import TotalPrice from "@/components/ui/totalprice";


import { ColumnDef, CellContext } from "@tanstack/react-table";
import { Decimal } from "@prisma/client/runtime/library";

export type OrderColumn = {
  id: string;
  firstname: string;
  lastname: string;
  phone: string;
  studentId: string;
  personalemail: string;
  studentemail: string;
  isBooked: boolean;
  totalPrice: string;
  createdAt: string;
  confirmationid: number;
  product: {
    mastertype: string;
    childrentype: string;
    thirdtype: string;  
    name: string;
    price: number;
    typevaluemaster: string; 
    typevaluechildren: string; 
    typevaluethird: string; 
    mode: string; 
    size: string; 
    image: string; 
    color: string;
    quantity: number;
    index: number;
    category: string; 
  }[];
};


type OrderCellProps = {
  cell: CellContext<OrderColumn, keyof OrderColumn>;
};

const OrderCell: React.FC<OrderCellProps> = ({ cell }) => {
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderColumn['product']>([]);

  const handleOrderCellClick = () => {
    setSelectedOrder(cell.row.original.product);
    setShowOrderModal(true);
  };

  const closeModal = () => {
    setShowOrderModal(false);
  };

  return (
    <>
      <div className="feedback-cell" onClick={handleOrderCellClick}  style={{ cursor: 'pointer', textDecoration: 'underline' }}>
        {cell.row.original.product.length > 0
          ? `${cell.row.original.product[0].name}...` // Display the first mastertype as an example
          : "No products available"}
      </div>
      {showOrderModal && (
        <Modal
          title="Order Details"
          description="Products:"
          isOpen={showOrderModal}
          onClose={closeModal}
        >
          <div className="p-4 max-w-full max-h-80 overflow-y-auto overflow-x-auto whitespace-pre-wrap break-all">
          {selectedOrder.map((product, index) => (
              <div key={index} className="py-2 text-center object-center">
                <div
                className="w-48 h-48 mx-auto mb-4 flex-shrink-0 rounded-md overflow-hidden object-center"
              >
                <Image
                  src={product.image}
                  alt=""
                  width={150}
                  height={150}
                  className="object-cover w-full h-full"
                />
                </div>
                Name: {product.name}
                <br />
                Category: {product.category}
                {product.mode === '1' && (
                  <>
                    <br />
                  </>
                )}

                {product.mode === '2' && (
                  <>
                    <br />
                    {product.mastertype}: {product.typevaluemaster}
                    <br />
                  </>
                )}

                {product.mode === '3' && (
                  <>
                    <br />
                    {product.mastertype}: {product.typevaluemaster}
                    <br />
                    {product.childrentype}: {product.typevaluechildren}
                    <br />
                  </>
                )}  

                {product.mode === '4' && (
                  <>
                    <br />
                    {product.mastertype}: {product.typevaluemaster}
                    <br />
                    {product.childrentype}: {product.typevaluechildren}
                    <br />
                    {product.thirdtype}: {product.typevaluethird}
                    <br />
                  </>
                )}

                Quantities: {product.quantity}
                <br />
                <Priceperunit value={product.price} />
                <TotalPrice value={product.price} quantity={product.quantity} />
                Size: {product.size}
                <br />
                
                <div className="flex items-center justify-center">
                  <div
                    className="h-5 w-5 rounded-full border"
                    style={{ backgroundColor: product.color }}
                  />
                  <span className="ml-2">{product.color}</span>
                </div>
                <br />
              </div>
            ))}
          </div>
        </Modal>
      )}
    </>
  );
};





export const columns: ColumnDef<OrderColumn>[] = [
  {
    accessorKey: "confirmationid",
    header: "ID",
  },
  {
    accessorKey: "product",
    header: "Products",
    cell: OrderCell as any,

  },
  {
    accessorKey: "firstname",
    header: "First Name",
  },
  {
    accessorKey: "lastname",
    header: "Last Name",
  },
  {
    accessorKey: "studentId",
    header: "Student Id",
  },
  {
    accessorKey: "phone",
    header: "Phone Number",
  },
  {
    accessorKey: "personalemail",
    header: "Personal Email",
  },
  {
    accessorKey: "studentemail",
    header: "Student Email",
  },
  /*{
    accessorKey: "addressline1",
    header: "Address Line 1"
  },
  {
    accessorKey: "addressline2",
    header: "Address Line 2"
  },
  {
    accessorKey: "postal",
    header: "Postal Code"
  },
  {
    accessorKey: "city",
    header: "City"
  },
  {
    accessorKey: "country",
    header: "Country"
  },*/
  {
    accessorKey: "totalPrice",
    header: "Total price",
  },
  {
    accessorKey: "isBooked",
    header: "Booked",
  },
  {
    accessorKey: "createdAt",
    header: "Date",
  },
];

/*"use client"

import { Button } from "@/components/ui/button"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type BillboardColumn = {
  id: string;
  label: string;
  //status: string //"pending" | "processing" | "success" | "failed"
  //email: string
  createdAt: string;
}

export const columns: ColumnDef<BillboardColumn>[] = [
  /*{
    accessorKey: "status",
    header: "Status",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "amount",
    header: "Amount",
  },
  {
    accessorKey: "label",
    header: "Label",
    /*header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Email
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
  },},
  {
    accessorKey: "createdAt",
    header: "Date",
  },
]
*/
