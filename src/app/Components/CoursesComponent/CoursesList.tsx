'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation'; // Use Next.js's useParams
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

const CoursesList = () => {
  const params = useParams();
  const formationId = params.formationId as string; // Extract formationId from params
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  // Fetch courses from the backend
  const fetchCourses = async () => {
    try {
      console.log('Fetching courses for formationId:', formationId); // Debugging
      const response = await fetch(`http://localhost:5054/api/Course/by-formation/${formationId}`);
      if (!response.ok) {
        throw new Error('Impossible de charger les cours.');
      }
      const data: Course[] = await response.json();
      console.log('Courses data:', data); // Debugging
      setCourses(data);
    } catch (err) {
      console.error('Error fetching courses:', err); // Debugging
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  // Sync course contents when the component mounts
  const syncCourseContents = async () => {
    setIsSyncing(true);
    setSyncStatus(null);

    try {
      const response = await fetch(`http://localhost:5054/api/Course/sync/${formationId}`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Échec de la synchronisation des contenus de cours.');
      }

      setSyncStatus('Contenus de cours synchronisés avec succès !');
      await fetchCourses(); // Refresh the list of courses after sync
    } catch (err) {
      setSyncStatus(err instanceof Error ? err.message : 'Une erreur est survenue lors de la synchronisation.');
    } finally {
      setIsSyncing(false);
    }
  };

  // Trigger sync and fetch courses when the component mounts
  useEffect(() => {
    const initialize = async () => {
      await syncCourseContents(); // Sync course contents first
      await fetchCourses(); // Then fetch the updated list of courses
    };

    initialize();
  }, [formationId]);

  if (loading || isSyncing) {
    return <p className="text-center text-gray-600">Chargement des cours...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500">Erreur : {error}</p>;
  }

  if (courses.length === 0) {
    return <p className="text-center text-gray-600">Aucun cours disponible pour cette formation.</p>;
  }

  return (
    <div className="container mx-auto px-10 py-20">
      <div className="grid place-items-center pb-20 text-center">
        <Typography variant="h2" color="blue-gray">
          Liste des Cours
        </Typography>

        {/* Sync Status Message */}
        {syncStatus && (
          <p className={`mt-2 text-sm ${
            syncStatus.includes('succès') ? 'text-green-600' : 'text-red-600'
          }`}>
            {syncStatus}
          </p>
        )}
      </div>

      {/* Courses List */}
      <div className="grid gap-6">
        {courses.map((course, index) => (
          <Card key={course.courseId || `course-${index}`} className="p-6">
            <CardBody>
              <div className="grid grid-cols-1 gap-4">
                <Typography variant="h3" color="blue-gray">
                  {course.name || 'Nom du cours non disponible'}
                </Typography>
                <Typography variant="paragraph" className="font-normal !text-gray-500">
                  {course.summary || 'Aucun résumé disponible.'}
                </Typography>
                {/* Display URL */}
                {course.url && (
                  <Typography variant="small" className="font-normal !text-gray-500">
                    <strong>URL:</strong>{' '}
                    <a
                      href={course.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      {course.url}
                    </a>
                  </Typography>
                )}
                {/* Display ModName */}
                {course.modName && (
                  <Typography variant="small" className="font-normal !text-gray-500">
                    <strong>Module:</strong> {course.modName}
                  </Typography>
                )}
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CoursesList;