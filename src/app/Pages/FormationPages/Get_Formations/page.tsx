'use client';

import GetFormations from "@/app/Components/FormationComponenet/GetFormations";

export default function GetFormationsPage() {
  return (
    <div className="container mx-auto px-10 py-10">
      <h1 className="text-2xl font-bold text-center mb-6">Formations</h1>
      <GetFormations />
    </div>
  );
}
