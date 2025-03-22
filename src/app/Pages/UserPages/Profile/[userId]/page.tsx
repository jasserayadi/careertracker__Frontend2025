import ProfilePage from '@/app/Components/UserComponent/Profile';
import { Footer, Navbar } from '@/app/Components';

interface ProfileProps {
  params: {
    userId: string;
  };
}

export default function Profile({ params }: ProfileProps) {
  return (
    <div>
      <Navbar />
      <br /><br /><br />
      <ProfilePage userId={Number(params.userId)} />
      <br /><br /><br /><br /><br />
      <Footer />
    </div>
  );
}