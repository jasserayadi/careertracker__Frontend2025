'use client'; // Mark this as a Client Component

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation'; // Use next/navigation for routing
import { Typography, Card, CardBody } from '@material-tailwind/react';

interface CompletionStatus {
  completed: boolean;
  aggregation: number;
  completions: {
    type: number;
    title: string;
    status: string;
    complete: boolean;
    timeCompleted?: number;
    details: {
      type: string;
      criteria: string;
      requirement: string;
      status: string;
    };
  }[];
  percentageCompletion: number;
}

const CourseCompletionStatus = () => {
  const params = useParams(); // Use useParams from next/navigation
  const userId = params.userId as string;
  const courseId = params.courseId as string;
  const [completionStatus, setCompletionStatus] = useState<CompletionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCompletionStatus = async () => {
      try {
        const response = await fetch(`http://localhost:5054/api/users/completion/${userId}/${courseId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch completion status');
        }
        const data = await response.json();
        setCompletionStatus(data.completionStatus);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchCompletionStatus();
  }, [userId, courseId]);

  if (loading) {
    return <Typography className="text-center text-gray-600">Loading completion status...</Typography>;
  }

  if (error) {
    return <Typography className="text-center text-red-500">Error: {error}</Typography>;
  }

  if (!completionStatus) {
    return <Typography className="text-center text-gray-600">Completion status not found</Typography>;
  }

  return (
    <section className="w-full max-w-4xl mx-auto flex flex-col items-center px-4 py-10">
      <Typography variant="h2" className="text-center mb-8" color="blue-gray">
        Course Completion Status
      </Typography>
      <Card className="w-full shadow-lg">
        <CardBody className="p-8">
          <Typography variant="h4" color="blue-gray" className="mb-4">
            Completion Status: {completionStatus.completed ? 'Completed' : 'Not Completed'}
          </Typography>
          <Typography className="font-normal text-gray-700 mb-4">
            <span className="font-semibold">Percentage Completion:</span> {completionStatus.percentageCompletion}%
          </Typography>
          <div className="space-y-4">
            {completionStatus.completions.map((completion, index) => (
              <div key={index} className="p-4 border rounded">
                <Typography variant="h6" color="blue-gray">
                  {completion.title}
                </Typography>
                <Typography className="font-normal text-gray-700">
                  <span className="font-semibold">Status:</span> {completion.status}
                </Typography>
                <Typography className="font-normal text-gray-700">
                  <span className="font-semibold">Complete:</span> {completion.complete ? 'Yes' : 'No'}
                </Typography>
                {completion.timeCompleted && (
                  <Typography className="font-normal text-gray-700">
                    <span className="font-semibold">Time Completed:</span> {new Date(completion.timeCompleted * 1000).toLocaleString()}
                  </Typography>
                )}
                <Typography className="font-normal text-gray-700">
                  <span className="font-semibold">Details:</span> {completion.details.criteria}
                </Typography>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </section>
  );
};

export default CourseCompletionStatus;