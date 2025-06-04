'use client'; // Mark this as a Client Component

import { FixedPlugin, Footer, Navbar } from "@/app/Components";
import CourseCompletionStatus from "@/app/Components/UserComponent/CourseCompletionStatus";

interface CompletionStatusProps {
  params: {
    userId: string;
    courseId: string;
  };
}

export default function CompletionStatus({ params }: CompletionStatusProps) {
  return (
   
<div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow p-4">
        <div className="container mx-auto">
        
              <CourseCompletionStatus />
          
        </div>
      </main>
      <FixedPlugin />
      <Footer />
    </div>
  );
}



