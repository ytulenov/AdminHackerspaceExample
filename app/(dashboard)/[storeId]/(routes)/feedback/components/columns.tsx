"use client";

import { StringValidation } from "zod";
import { Checkbox } from "@/components/ui/checkbox";
// Import necessary components and styles
import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { ColumnDef, CellContext } from "@tanstack/react-table";

export type FeedbackColumn = {
  id: string;
  firstname: string;
  lastname: string;
  phone: string;
  studentId: string;
  email: string;
  createdAt: string;
  ordernumber: string;
  feedbackIn: string;
  reviewed: boolean;
};

type FeedbackCellProps = {
  cell: CellContext<FeedbackColumn, keyof FeedbackColumn>;
};

const FeedbackCell: React.FC<FeedbackCellProps> = ({ cell }) => {
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState("");

  const feedbackIn = cell.row.original.feedbackIn as string;

  const handleFeedbackCellClick = () => {
    setSelectedFeedback(feedbackIn);
    setShowFeedbackModal(true);
  };

  const closeModal = () => {
    setShowFeedbackModal(false);
  };

  return (
    <>
      <div className="feedback-cell" onClick={handleFeedbackCellClick}>
        {feedbackIn.length > 30
          ? `${feedbackIn.substring(0, 30)}...`
          : feedbackIn}
      </div>
      {showFeedbackModal && (
        <Modal
          title="Feedback Details" // Provide the title prop
          description="Feedback content:" // Provide the description prop
          isOpen={showFeedbackModal}
          onClose={closeModal}
          // Add any additional props expected by your Modal component
        >
          <div className="p-4 max-w-full max-h-80 overflow-y-auto overflow-x-auto whitespace-pre-wrap break-all">
            {selectedFeedback}
          </div>
        </Modal>
      )}
    </>
  );
};

export const columns: ColumnDef<FeedbackColumn>[] = [
  {
    accessorKey: "ordernumber",
    header: "Order Number",
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
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "feedbackIn",
    header: "Feedback",
    cell: FeedbackCell as any,
  },
  {
    accessorKey: "createdAt",
    header: "Date",
  },
  {
    accessorKey: "reviewed",
    header: "Reviewed",
    cell: ({ cell }) => (
      <Checkbox
        checked={cell.row.original.reviewed}
        onChange={() => {
          cell.row.original.reviewed = !cell.row.original.reviewed;
        }}
      />
    ),
  },
];