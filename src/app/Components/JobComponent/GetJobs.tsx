'use client'; // Mark this as a Client Component

import { useEffect, useState } from 'react';
import { Card, CardBody, Typography, Button } from '@material-tailwind/react';
import { CheckIcon } from '@heroicons/react/24/outline';

interface Job {
  jobId: number;
  jobName: string;
  jobDescription: string;
}

const GetJobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch('http://localhost:5054/api/jobs');
        if (!response.ok) {
          throw new Error('Échec du chargement des jobs');
        }
        const data = await response.json();

        console.log('Réponse de l’API :', data);

        // Check if the response is an array
        if (Array.isArray(data)) {
          setJobs(data); // Use the array directly
        } else {
          console.error("Données reçues :", data);
          throw new Error("Les données reçues ne sont pas un tableau de jobs");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  if (loading) {
    return <p className="text-center text-gray-600">Chargement des jobs...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500">Erreur : {error}</p>;
  }

  return (
    <div className="container mx-auto px-10 py-20">
      <div className="grid place-items-center pb-20 text-center">
        <Typography variant="h2" color="blue-gray">
          Liste des Jobs
        </Typography>
        <Typography variant="lead" className="mt-2 !text-gray-500 lg:w-5/12">
          Explorez les opportunités disponibles et postulez dès maintenant.
        </Typography>
      </div>
      <div className="grid gap-6">
        {jobs.map((job) => (
          <Card key={job.jobId} className="p-6">
            <CardBody>
              <div className="grid grid-cols-1 items-center gap-20 lg:grid-cols-2">
                <div>
                  <Typography variant="h3" color="blue-gray">
                    {job.jobName}
                  </Typography>
                  <Typography
                    variant="paragraph"
                    className="mb-10 mt-2 w-full font-normal !text-gray-500"
                  >
                    {job.jobDescription}
                  </Typography>
                  <div className="flex flex-wrap items-center gap-x-20 gap-y-6">
                    <Typography variant="h6" color="blue-gray">
                      Détails du Job
                    </Typography>
                    <hr className="w-72 bg-gray-500" />
                  </div>
                  <div className="mt-8 grid grid-cols-2 justify-between gap-x-12 gap-y-2">
                    <div className="flex items-center gap-4">
                      <CheckIcon
                        className="h-4 w-4 text-gray-900"
                        strokeWidth={3}
                      />
                      <Typography
                        variant="paragraph"
                        className="font-normal !text-gray-500"
                      >
                        Temps plein
                      </Typography>
                    </div>
                    <div className="flex items-center gap-4">
                      <CheckIcon
                        className="h-4 w-4 text-gray-900"
                        strokeWidth={3}
                      />
                      <Typography
                        variant="paragraph"
                        className="font-normal !text-gray-500"
                      >
                        Télétravail possible
                      </Typography>
                    </div>
                  </div>
                </div>
                <div className="grid place-items-center lg:justify-end">
                  <Typography variant="h6" color="blue-gray">
                    Postulez maintenant
                  </Typography>
                  <Button color="gray" className="my-3">
                    Postuler
                  </Button>
                  <Typography
                    variant="small"
                    className="font-normal !text-gray-500"
                  >
                    Offre valable jusqu'au 31/12/2024
                  </Typography>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default GetJobs;