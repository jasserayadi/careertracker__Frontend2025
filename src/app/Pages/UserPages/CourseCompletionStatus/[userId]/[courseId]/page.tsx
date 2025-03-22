'use client'; // Mark this as a Client Component

import CourseCompletionStatus from "@/app/Components/UserComponent/CourseCompletionStatus";

interface CompletionStatusProps {
  params: {
    userId: string;
    courseId: string;
  };
}

export default function CompletionStatus({ params }: CompletionStatusProps) {
  return (
    <div>
      <CourseCompletionStatus />
    </div>
  );
}