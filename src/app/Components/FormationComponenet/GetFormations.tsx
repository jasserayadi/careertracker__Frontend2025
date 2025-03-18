'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // Use Next.js's useRouter
import { Card, CardBody, Typography } from '@material-tailwind/react';

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
  const router = useRouter(); // Use Next.js's useRouter
  const [formations, setFormations] = useState<Formation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  // Fetch formations from the backend
  const fetchFormations = async () => {
    try {
      const response = await fetch('http://localhost:5054/api/formations');
      if (!response.ok) {
        throw new Error('Impossible de charger les formations.');
      }
      const data = await response.json();

      if (Array.isArray(data)) {
        setFormations(data);
      } else {
        throw new Error("Les données reçues ne sont pas une liste de formations.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  // Sync formations when the component mounts
  const syncFormations = async () => {
    setIsSyncing(true);
    setSyncStatus(null);

    try {
      const response = await fetch('http://localhost:5054/api/formations/sync', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Échec de la synchronisation.');
      }

      setSyncStatus('Formations synchronisées avec succès !');
      await fetchFormations(); // Refresh the list of formations after sync
    } catch (err) {
      setSyncStatus(err instanceof Error ? err.message : 'Une erreur est survenue lors de la synchronisation.');
    } finally {
      setIsSyncing(false);
    }
  };

  // Trigger sync and fetch formations when the component mounts
  useEffect(() => {
    const initialize = async () => {
      await syncFormations(); // Sync formations first
      await fetchFormations(); // Then fetch the updated list
    };

    initialize();
  }, []);

  const removeHtmlTags = (html: string) => {
    return html.replace(/<[^>]*>/g, '');
  };

  const handleFormationClick = (formationId: number) => {
    console.log('Formation clicked:', formationId); // Debugging
    router.push(`/Pages/CoursesPages/CoursesList/${formationId}`); // Navigate to the dynamic route
  };

  if (loading || isSyncing) {
    return <p className="text-center text-gray-600">Chargement des formations...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500">Erreur : {error}</p>;
  }

  return (
    <div className="container mx-auto px-10 py-20">
      <div className="grid place-items-center pb-20 text-center">
        <Typography variant="h2" color="blue-gray">
          Liste des Formations
        </Typography>
        <Typography variant="lead" className="mt-2 !text-gray-500 lg:w-5/12">
          Découvrez les formations disponibles et inscrivez-vous dès maintenant.
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

      {/* Formations List */}
      <div className="grid gap-6">
        {formations.map((formation, index) => (
          <div
            key={formation.formationId || `formation-${index}`}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleFormationClick(formation.formationId)} // Handle click
          >
            <Card className="p-6">
              <CardBody>
                <div className="grid grid-cols-1 gap-4">
                  <Typography variant="h3" color="blue-gray">
                    {formation.fullname || 'Nom de la formation non disponible'}
                  </Typography>
                  <Typography variant="h6" color="blue-gray">
                    {formation.shortname || 'Nom court non disponible'}
                  </Typography>
                  <Typography variant="small" className="font-normal !text-gray-500">
                    Date de création :{' '}
                    {formation.createdAt
                      ? new Date(formation.createdAt).toLocaleDateString()
                      : 'Non disponible'}
                  </Typography>
                  <Typography variant="paragraph" className="mt-4 w-full font-normal !text-gray-500">
                    {formation.summary
                      ? removeHtmlTags(formation.summary)
                      : 'Aucun résumé disponible.'}
                  </Typography>
                </div>
              </CardBody>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GetFormations;