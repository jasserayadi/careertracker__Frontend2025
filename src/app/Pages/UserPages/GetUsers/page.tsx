"use client"; // ✅ Required for client-side components
import GetUsers from '@/app/Components/UserComponent/GetUsers';


const UsersPage = () => {
  return (
    <div>
      <h1>Userss Management</h1>
      <GetUsers />
    </div>
  );
};

export default UsersPage;