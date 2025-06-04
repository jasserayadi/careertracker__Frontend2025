import { FixedPlugin, Footer, Navbar } from "@/app/Components";
import { CoursesListClient } from "@/app/Components/CoursesComponent/CoursesList";

export default function CourseListPage() {
  return  <div className="flex flex-col min-h-screen">
    
      <Navbar />
      <main className="flex-grow p-4">
        <div className="container mx-auto">
        
          <CoursesListClient />
          
        </div>
      </main>
      <FixedPlugin />
      <Footer />
    </div>;
}









 