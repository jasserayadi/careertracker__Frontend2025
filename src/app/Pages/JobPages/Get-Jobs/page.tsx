'use client'; // Mark this as a Client Component

import { Footer, Navbar } from "@/app/Components";
import GetJobs from "@/app/Components/JobComponent/GetJobs";

const JobsPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow p-8">
        <div className="grid place-items-center pb-20 text-center">
          <h2 className="text-3xl font-bold text-blue-gray-900">
       
          </h2>
          <p className="mt-2 text-gray-500 lg:w-5/12">
       
          </p>
        </div>
        <GetJobs />
      </main>
      <Footer />
    </div>
  );
};

export default JobsPage;