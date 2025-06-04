import { Footer, Navbar } from "@/app/Components";
import { FixedPlugin } from "@/app/Components/fixed-plugin";
import CreateJobForm from "@/app/Components/JobComponent/RegisterJob";


const CreateJobPage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow p-4">
        <div className="container mx-auto">
        
          <CreateJobForm />
          
        </div>
      </main>
      <FixedPlugin />
      <Footer />
    </div>
  );
};

export default CreateJobPage;