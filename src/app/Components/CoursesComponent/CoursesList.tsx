'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardBody, Typography } from '@material-tailwind/react';

interface Course {
  courseId: number;
  name: string;
  summary?: string;
  content?: string;
  moodleCourseId?: number;
  moodleSectionId?: number;
  url?: string;
  modName?: string;
  modIcon?: string;
  modPurpose?: string;
  formationId: number;
  createdAt?: string;
  updatedAt?: string;
}

interface Inscription {
  inscriptionId: number;
  inscriptionDate: string;
  user: {
    userId: number;
    username: string;
    firstname: string;
    lastname: string;
    email: string;
  };
}

export const CoursesListClient = () => {
  const params = useParams();
  const formationId = params.formationId as string;

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [inscriptions, setInscriptions] = useState<Inscription[]>([]);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // First perform the sync
      setSyncStatus('syncing');
      const syncResponse = await fetch(
        `http://localhost:5054/api/Course/sync/${formationId}`,
        { method: 'POST' }
      );

      if (!syncResponse.ok) {
        throw new Error('Sync failed');
      }
      setSyncStatus('success');

      // Then fetch the updated data
      const [coursesResponse, inscriptionsResponse] = await Promise.all([
        fetch(`http://localhost:5054/api/Course/by-formation/${formationId}`),
        fetch(`http://localhost:5054/api/Inscription/ByCourse/${formationId}`)
      ]);

      if (!coursesResponse.ok) throw new Error('Failed to load courses');
      if (!inscriptionsResponse.ok && inscriptionsResponse.status !== 404) {
        throw new Error('Failed to load enrollments');
      }

      const coursesData = await coursesResponse.json();
      const inscriptionsData = inscriptionsResponse.status === 404 ? [] : await inscriptionsResponse.json();

      setCourses(coursesData);
      setInscriptions(inscriptionsData);

    } catch (err) {
      console.error('Error:', err);
      setSyncStatus('error');
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [formationId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        {syncStatus === 'syncing' && (
          <Typography variant="paragraph" className="text-gray-600">
            Synchronizing with Moodle...
          </Typography>
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4 max-w-4xl mx-auto my-8">
        <Typography variant="paragraph" className="text-center text-red-600">
          Error: {error}
        </Typography>
        <div className="flex justify-center mt-4">
          <button 
            onClick={fetchData}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Typography variant="h2" color="blue-gray" className="mb-8">
        Formation Management
      </Typography>

      {syncStatus === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <Typography variant="paragraph" className="text-red-600">
            Sync completed with errors. Data shown may be outdated.
          </Typography>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/2">
          <Typography variant="h4" className="mb-4">
            Courses in this Formation
          </Typography>
          <div className="space-y-3">
            {courses.length > 0 ? (
              courses.map((course) => (
                <Card key={course.courseId} className="hover:shadow-lg">
                  <CardBody>
                    <Typography variant="h5" className="mb-2">
                      {course.name}
                    </Typography>
                    {course.summary && (
                      <Typography variant="small" className="text-gray-600">
                        {course.summary}
                      </Typography>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      {course.url && (
                        <div>
                          <Typography variant="small" className="font-semibold text-gray-700">
                            URL:
                          </Typography>
                          <a
                            href={course.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline break-all"
                          >
                            {course.url}
                          </a>
                        </div>
                      )}
                      {course.modName && (
                        <div>
                          <Typography variant="small" className="font-semibold text-gray-700">
                            Module:
                          </Typography>
                          <Typography variant="small" className="text-gray-600">
                            {course.modName}
                          </Typography>
                        </div>
                      )}
                    </div>
                  </CardBody>
                </Card>
              ))
            ) : (
              <Typography variant="paragraph" className="text-gray-600">
                No courses available in this formation.
              </Typography>
            )}
          </div>
        </div>

        <div className="w-full md:w-1/2">
          <Typography variant="h4" className="mb-4">
            Enrolled Students
          </Typography>
          {inscriptions.length > 0 ? (
            <div className="space-y-3">
              {inscriptions.map((inscription) => (
                <Card key={inscription.inscriptionId} className="hover:shadow-md">
                  <CardBody>
                    <Typography variant="h6" className="mb-1">
                      {inscription.user.firstname} {inscription.user.lastname}
                    </Typography>
                    <Typography variant="small" className="text-gray-600">
                      <span className="font-semibold">Username:</span> {inscription.user.username}
                    </Typography>
                    <Typography variant="small" className="text-gray-600">
                      <span className="font-semibold">Email:</span> {inscription.user.email}
                    </Typography>
                    <Typography variant="small" className="text-gray-600">
                      <span className="font-semibold">Enrolled:</span> {new Date(inscription.inscriptionDate).toLocaleDateString()}
                    </Typography>
                  </CardBody>
                </Card>
              ))}
            </div>
          ) : (
            <Typography variant="paragraph" className="text-gray-600">
              No students enrolled in this formation.
            </Typography>
          )}
        </div>
      </div>
    </div>
  );
};