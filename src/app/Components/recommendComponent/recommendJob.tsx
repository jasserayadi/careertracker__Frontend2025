'use client';

import { useEffect, useState } from 'react';
import { Typography, Card, Button, Spinner } from '@material-tailwind/react';
import { UserIcon, EnvelopeIcon, DocumentIcon, CalendarIcon, XMarkIcon, CheckIcon } from '@heroicons/react/24/solid';

interface User {
  userId: number;
  username: string;
  firstname: string;
  lastname: string;
  email: string;
  dateCreation?: string;
  role?: {
    roleName: string;
  };
  cv?: {
    cvFile: string;
  };
  jobs?: {
    jobId: number;
    jobName: string;
  }[];
}

interface JobRecommendation {
  jobId: number;
  jobName: string;
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  jobDescription: string;
}

const GetUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [recommendations, setRecommendations] = useState<JobRecommendation[]>([]);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const [openRecommendations, setOpenRecommendations] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('http://localhost:5054/api/users');
        if (!response.ok) throw new Error('Failed to load users');
        const data = await response.json();
        setUsers(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const fetchRecommendations = async (userId: number) => {
    setRecommendationsLoading(true);
    try {
      const response = await fetch(`http://localhost:5054/api/Recommendation/user/${userId}/jobs`);
      if (!response.ok) throw new Error('Failed to load recommendations');
      const data = await response.json();
      setRecommendations(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading recommendations');
    } finally {
      setRecommendationsLoading(false);
    }
  };

  const handleUserClick = async (userId: number) => {
    setSelectedUser(userId);
    await fetchRecommendations(userId);
    setOpenRecommendations(true);
  };

  const assignJobToUser = async (userId: number, jobId: number, jobName: string) => {
    try {
      const response = await fetch(`http://localhost:5054/api/users/${userId}/assign-job`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ jobId })
      });

      if (!response.ok) throw new Error('Failed to assign job');

      // Update local state
      setUsers(prevUsers => prevUsers.map(user => {
        if (user.userId === userId) {
          return {
            ...user,
            jobs: [...(user.jobs || []), { jobId, jobName }]
          };
        }
        return user;
      }));

      setSuccessMessage(`Successfully assigned ${jobName} to user`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error assigning job');
      setTimeout(() => setError(''), 3000);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <Spinner className="h-12 w-12" />
    </div>
  );

  if (error) return (
    <div className="text-center py-10">
      <Typography color="red" variant="h5" className="mb-2">
        Error
      </Typography>
      <Typography className="text-red-500">{error}</Typography>
    </div>
  );

  return (
    <section className="w-full max-w-4xl mx-auto flex flex-col items-center px-4 py-10">
      <Typography variant="h2" className="text-center mb-2" color="blue-gray">
        User List
      </Typography>
      <Typography variant="lead" className="mb-8 w-full text-center font-normal !text-gray-500 lg:w-10/12">
        Click on any user to view job recommendations
      </Typography>

      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 text-green-800 rounded flex items-center gap-2">
          <CheckIcon className="h-5 w-5" />
          {successMessage}
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-800 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 w-full">
        {users.map((user) => (
          <Card key={user.userId} className="w-full hover:shadow-lg transition-shadow">
            <div 
              className="p-6 cursor-pointer" 
              onClick={() => handleUserClick(user.userId)}
            >
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex items-center justify-center md:justify-start">
                  <UserIcon className="h-12 w-12 text-blue-gray-900" />
                </div>
                <div className="flex-1">
                  <Typography variant="h5" color="blue-gray" className="mb-2">
                    {user.firstname} {user.lastname}
                  </Typography>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <EnvelopeIcon className="h-5 w-5 text-gray-700" />
                      <Typography className="font-normal !text-gray-500">
                        {user.email}
                      </Typography>
                    </div>
                    <div className="flex items-center gap-2">
                      <DocumentIcon className="h-5 w-5 text-gray-700" />
                      <Typography className="font-normal !text-gray-500">
                        {user.role?.roleName || 'No role'}
                      </Typography>
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-5 w-5 text-gray-700" />
                      <Typography className="font-normal !text-gray-500">
                        {user.dateCreation ? new Date(user.dateCreation).toLocaleDateString() : 'Not specified'}
                      </Typography>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {user.jobs && user.jobs.length > 0 && (
              <div className="px-6 pb-4">
                <Typography variant="small" className="font-bold mb-1">
                  Assigned Jobs:
                </Typography>
                <div className="flex flex-wrap gap-2">
                  {user.jobs.map(job => (
                    <span key={job.jobId} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                      {job.jobName}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Recommendations Modal */}
      {openRecommendations && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-6 border-b">
              <Typography variant="h5" color="blue-gray">
                Job Recommendations
              </Typography>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setOpenRecommendations(false)}
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="overflow-y-auto p-6 flex-1">
              {recommendationsLoading ? (
                <div className="flex justify-center py-8">
                  <Spinner className="h-8 w-8" />
                </div>
              ) : recommendations.length > 0 ? (
                <div className="space-y-4">
                  {recommendations.map((job) => (
                    <Card key={job.jobId} className="mb-4">
                      <div className="p-6">
                        <Typography variant="h5" className="mb-2">
                          {job.jobName}
                        </Typography>
                        <Typography color="blue" className="mb-4 font-bold">
                          Match Score: {(job.matchScore * 100).toFixed(0)}%
                        </Typography>
                        <Typography className="mb-4">
                          {job.jobDescription}
                        </Typography>
                        <div className="mt-4">
                          <Typography variant="small" className="font-bold">
                            Matched Skills:
                          </Typography>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {job.matchedSkills.map((skill) => (
                              <span key={skill} className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                        {job.missingSkills.length > 0 && (
                          <div className="mt-2">
                            <Typography variant="small" className="font-bold">
                              Missing Skills:
                            </Typography>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {job.missingSkills.map((skill) => (
                                <span key={skill} className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="mt-4">
                          <Button
                            className="bg-blue-500 hover:bg-blue-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (selectedUser) {
                                assignJobToUser(selectedUser, job.jobId, job.jobName);
                              }
                            }}
                          >
                            Assign This Job
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Typography className="text-center py-8">No job recommendations found for this user.</Typography>
              )}
            </div>
            <div className="flex justify-end p-4 border-t">
              <Button
                className="bg-gray-500 hover:bg-gray-600"
                onClick={() => setOpenRecommendations(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default GetUsers;