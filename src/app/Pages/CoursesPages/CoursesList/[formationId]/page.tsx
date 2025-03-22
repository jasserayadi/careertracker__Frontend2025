// Pages/CoursesPages/CoursesList/[formationId]/page.tsx


import { useParams } from 'next/navigation';
import CoursesList from '@/app/Components/CoursesComponent/CoursesList';

export default function CourseListPage() {
  const params = useParams();
  const formationId = params.formationId as string;

  console.log('Formation ID from URL:', formationId); // Debugging

  return (
    <div>
      <CoursesList />
    </div>
  );
}