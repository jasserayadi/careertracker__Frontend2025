'use client'; // Mark this as a Client Component

import { useState } from 'react';
import { Card, CardBody, Button, Typography } from "@material-tailwind/react";
import { CheckIcon } from "@heroicons/react/24/outline";

interface Job {
  jobId?: number;
  jobName: string;
  jobDescription: string;
}

const CreateJobForm = () => {
  const [job, setJob] = useState<Job>({
    jobName: '',
    jobDescription: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setJob((prevJob) => ({
      ...prevJob,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('http://localhost:5054/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(job),
      });

      if (!response.ok) {
        throw new Error('Échec de la création du job');
      }

      const createdJob = await response.json();
      console.log('Job créé :', createdJob);

      // Reset the form after successful submission
      setJob({
        jobName: '',
        jobDescription: '',
      });

      setSuccess('Job créé avec succès !');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center">
      <section className="container mx-auto px-10">
        <div className="grid place-items-center pb-20 text-center">
            <br></br>
          <Typography variant="h2" color="blue-gray">
            Créer un nouveau Job
          </Typography>
          <Typography variant="lead" className="mt-2 !text-gray-500 lg:w-5/12">
            Remplissez les détails du job pour commencer.
          </Typography>
        </div>
        <Card className="px-6 pb-5">
          <CardBody>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Typography variant="h6" color="blue-gray" className="mb-2">
                  Nom du Job :
                </Typography>
                <input
                  type="text"
                  id="jobName"
                  name="jobName"
                  value={job.jobName}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-lg"
                />
              </div>
              <div>
                <Typography variant="h6" color="blue-gray" className="mb-2">
                  Description du Job :
                </Typography>
                <textarea
                  id="jobDescription"
                  name="jobDescription"
                  value={job.jobDescription}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-lg"
                  rows={5}
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                color="gray"
                className="w-full mt-6"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  </div>
                ) : (
                  'Créer'
                )}
              </Button>
              {error && (
                <Typography variant="small" color="red" className="text-center">
                  {error}
                </Typography>
              )}
              {success && (
                <Typography variant="small" color="green" className="text-center">
                  {success}
                </Typography>
              )}
            </form>
          </CardBody>
        </Card>
      </section>
    </div>
  );
};

export default CreateJobForm;