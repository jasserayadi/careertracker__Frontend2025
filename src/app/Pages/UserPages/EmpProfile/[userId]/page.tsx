import ProfilePage from '@/app/Components/UserComponent/Profile';
import { Footer, Navbar } from '@/app/Components';
import EmployeeNavbar from '@/app/Components/employeeNavbar';
import EmpProfilePage from '@/app/Components/UserComponent/EmpProfile';

interface ProfileProps {
  params: {
    userId: string;
  };
}

export default function Profile({ params }: ProfileProps) {
  return (
    <div>
      <EmployeeNavbar />
      <br /><br /><br />
      <EmpProfilePage userId={Number(params.userId)} />
      <br /><br /><br /><br /><br />
      <Footer />
    </div>
  );
}