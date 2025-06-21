// app/Components/UserComponent/GetUsers.tsx
'use client';

import { useEffect, useState } from 'react';
import { 
  Typography, 
  Card, 
  Button
} from '@material-tailwind/react';
import { 
  UserIcon, 
  EnvelopeIcon, 
  DocumentIcon, 
  CalendarIcon,
  XMarkIcon
} from '@heroicons/react/24/solid';

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

  if (loading) return <Typography className="text-center text-gray-600">Loading users...</Typography>;
  if (error) return <Typography className="text-center text-red-500">Error: {error}</Typography>;

  return (
    <section className="w-full max-w-4xl mx-auto flex flex-col items-center px-4 py-10">
      <Typography variant="h2" className="text-center mb-2" color="blue-gray">
        User List
      </Typography>
      <Typography variant="lead" className="mb-16 w-full text-center font-normal !text-gray-500 lg:w-10/12">
        Click on any user to view job recommendations
      </Typography>

      <div className="grid grid-cols-1 gap-6 w-full">
        {users.map((user) => (
          <div 
            key={user.userId} 
            className="w-full hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => handleUserClick(user.userId)}
          >
            <Card className="w-full">
              <div className="p-6">
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
            </Card>
          </div>
        ))}
      </div>

      {/* Recommendations Modal */}
      {openRecommendations && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
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
            <div className="overflow-y-auto p-6 max-h-[60vh]">
              {recommendationsLoading ? (
                <Typography className="text-center py-8">Loading recommendations...</Typography>
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
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
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