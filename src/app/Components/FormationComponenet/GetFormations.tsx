'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Typography, Button } from '@material-tailwind/react';
import CourseCard from '@/app/Components/course-card';

const COURSE_IMAGES = [
  "/image/blogs/blog-1.svg",
  "/image/blogs/blog2.svg",
  "/image/blogs/blog3.svg",
  "/image/blogs/blog4.svg"
];

interface Formation {
  formationId: number;
  fullname: string;
  shortname: string;
  summary: string;
  moodleCategoryId: number;
  moodleCourseId: number;
  createdAt: string;
}

const GetFormations = () => {
  const router = useRouter();
  const [formations, setFormations] = useState<Formation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  const fetchFormations = async () => {
    try {
      const response = await fetch('http://localhost:5054/api/formations');
      if (!response.ok) throw new Error('Failed to load formations');
      const data = await response.json();
      setFormations(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const syncFormations = async () => {
    setIsSyncing(true);
    setSyncStatus(null);
    try {
      const response = await fetch('http://localhost:5054/api/formations/sync', {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Sync failed');
      setSyncStatus('Formations synced successfully!');
      await fetchFormations();
    } catch (err) {
      setSyncStatus(err instanceof Error ? err.message : 'Sync error occurred');
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      await syncFormations();
      await fetchFormations();
    };
    initialize();
  }, []);

  const handleFormationClick = (formationId: number) => {
    router.push(`/Pages/CoursesPages/CoursesList/${formationId}`);
  };

  if (loading || isSyncing) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4 max-w-4xl mx-auto my-8">
        <Typography className="text-center text-red-600">Error: {error}</Typography>
      </div>
    );
  }

  return (
    <section className="pb-20 px-8">
      <div className="container mx-auto mb-20 text-center">
        <Typography variant="h2" color="blue-gray" className="mb-4">
          Available Formations
        </Typography>
        <Typography
          variant="lead"
          className="mx-auto w-full px-4 font-normal !text-gray-500 lg:w-6/12"
        >
          Browse through our available formations and find the one that fits your needs.
        </Typography>
        
        {syncStatus && (
          <Typography
            variant="small"
            className={`mt-2 ${
              syncStatus.includes('success') ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {syncStatus}
          </Typography>
        )}
      </div>

      <div className="container mx-auto grid grid-cols-1 gap-x-10 gap-y-20 md:grid-cols-2 xl:grid-cols-4">
        {formations.map((formation, index) => {
          const imageIndex = index % COURSE_IMAGES.length;
          const formationImage = COURSE_IMAGES[imageIndex];

          return (
            <div 
              key={formation.formationId}
              onClick={() => handleFormationClick(formation.formationId)}
              className="cursor-pointer"
            >
              <CourseCard 
                img={formationImage}
                title={formation.fullname}
                desc={formation.summary || 'No description available'}
                buttonLabel="VIEW DETAILS"
              />
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default GetFormations;