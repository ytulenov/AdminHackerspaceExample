import prismadb from "@/lib/prismadb";
import { format } from "date-fns";
import { FeedbackClient } from "./components/client";
import { FeedbackColumn } from "./components/columns";
import { formatter } from "@/lib/utils";

const FeedbackPage = async ({ params }: { params: { storeId: string } }) => {
  const feedback = await prismadb.feedback.findMany({
    where: {
      storeId: params.storeId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const formattedFeedback: FeedbackColumn[] = feedback.map((item) => ({
    id: item.id,
    firstname: item.firstname,
    lastname: item.lastname,
    phone: item.phone,
    studentId: item.studentId,
    email: item.email,
    ordernumber: item.ordernumber,
    feedbackIn: item.feedbackIn,
    createdAt: format(item.createdAt, "MMMM do, yyyy"),
    reviewed: item.reviewed,
  }));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <FeedbackClient data={formattedFeedback} />
      </div>
    </div>
  );
};

export default FeedbackPage;
