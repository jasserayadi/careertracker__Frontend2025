'use client'; // Mark this as a Client Component

import { FixedPlugin, Footer, Navbar } from "@/app/Components";
import EmployeeNavbar from "@/app/Components/employeeNavbar";
import CourseCompletionStatus from "@/app/Components/UserComponent/CourseCompletionStatus";
import EmpCourseCompletionStatus from "@/app/Components/UserComponent/EmpCourseCompletionStatus";

interface CompletionStatusProps {
  params: {
    userId: string;
    courseId: string;
  };
}

export default function CompletionStatus({ params }: CompletionStatusProps) {
  return (
   
<div className="flex flex-col min-h-screen">
      <EmployeeNavbar />
      <main className="flex-grow p-4">
        <div className="container mx-auto">
        
              <EmpCourseCompletionStatus />
          
        </div>
      </main>
      <FixedPlugin />
      <Footer />
    </div>
  );
}



