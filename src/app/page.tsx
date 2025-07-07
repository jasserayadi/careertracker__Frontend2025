'use client';

import { Footer, Navbar } from '@/app/Components';
import LoginForm from '@/app/Components/UserComponent/LoginForm';

const LoginPage = () => {
  return (
    <div>
    
      <br /><br /><br />
      <LoginForm />
      <br /><br /><br /><br /><br />
      <Footer />
    </div>
  );
};

export default LoginPage;