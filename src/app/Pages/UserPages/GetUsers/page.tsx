"use client"; // ✅ Required for client-side components

import { Footer, Navbar } from '@/app/Components';
import GetUsers from '@/app/Components/UserComponent/GetUsers';

const UsersPage = () => {
  return (
    <div>
      {/* Navbar at the top of the page */}
      <Navbar />

      {/* Main content */}
      <main className="min-h-screen">
        <br></br> <br></br>
        <h1 className="text-center text-3xl font-bold my-8">Users Management</h1>
        <GetUsers />
      </main>

      {/* Footer at the bottom of the page */}
      <Footer />
    </div>
  );
};

export default UsersPage;