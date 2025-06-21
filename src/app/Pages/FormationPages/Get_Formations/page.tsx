'use client';

import { FixedPlugin, Footer, Navbar } from "@/app/Components";
import GetFormations from "@/app/Components/FormationComponenet/GetFormations";

export default function GetFormationsPage() {
  return (
    
   <div className="flex flex-col min-h-screen">
    <br /><br /><br /><br />
      <Navbar />
      <main className="flex-grow p-4">
        <div className="container mx-auto">
        
              <GetFormations />
          
        </div>
      </main>
      <FixedPlugin />
      <br></br>      <br></br>      <br></br>      <br></br>
      <Footer />
    </div>
  );
}




