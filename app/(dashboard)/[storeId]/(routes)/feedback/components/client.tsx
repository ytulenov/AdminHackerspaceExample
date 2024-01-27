"use client";

import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { FeedbackColumn, columns } from "./columns";
import { DataTable } from "@/components/ui/data-table";

interface FeedbackClientProps {
  data: FeedbackColumn[];
}

export const FeedbackClient: React.FC<FeedbackClientProps> = ({ data }) => {
  return (
    <>
      <Heading
        title={`Feedbacks (${data.length})`}
        description="Manage feedback for your store"
      />
      <Separator />
      <DataTable columns={columns} data={data} searchKey="ordernumber" />
    </>
  );
};
