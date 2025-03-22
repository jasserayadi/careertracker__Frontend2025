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
          throw new Error('Failed to load jobs');
        }
        const data = await response.json();

        console.log('API Response:', data);

        // Check if the response is an array
        if (Array.isArray(data)) {
          setJobs(data); // Use the array directly
        } else {
          console.error("Received data:", data);
          throw new Error("Received data is not an array of jobs");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  if (loading) {
    return <p className="text-center text-gray-600">Loading jobs...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500">Error: {error}</p>;
  }

  return (
    <div className="container mx-auto px-10 py-20">
      <div className="grid place-items-center pb-20 text-center">
        <Typography variant="h2" color="blue-gray">
          Job Listings
        </Typography>
        <Typography variant="lead" className="mt-2 !text-gray-500 lg:w-5/12">
          Explore available opportunities and apply now.
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
                      Job Details
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
                        Full-time
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
                        Remote work possible
                      </Typography>
                    </div>
                  </div>
                </div>
                <div className="grid place-items-center lg:justify-end">
                  <Typography variant="h6" color="blue-gray">
                    Apply Now
                  </Typography>
                  <Button color="gray" className="my-3">
                    Apply
                  </Button>
                  <Button color="blue" className="my-3">
                    See Profile
                  </Button>
                  <Typography
                    variant="small"
                    className="font-normal !text-gray-500"
                  >
                    Offer valid until 12/31/2024
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

