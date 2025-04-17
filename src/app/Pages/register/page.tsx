"use client"; // ✅ Required for client-side components
import { Footer, Navbar } from '@/app/Components';
import RegisterForm from '@/app/Components/UserComponent/RegisterForm';






const RegisterPage = () => {
  return (
    <div>
     
     <Navbar />
     <br /><br /><br />
      <RegisterForm />
      <br /><br /><br /><br /><br />
      <Footer />
    </div>
  );
};

export default RegisterPage;

