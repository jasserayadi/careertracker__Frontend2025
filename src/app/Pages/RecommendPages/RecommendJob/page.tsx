'use client';
import { useEffect, useState } from 'react';
import {
  Typography,
  Card,
  Button,
  Avatar,
  Chip,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Tooltip,
  Spinner,
  Progress,
} from '@material-tailwind/react';
import {
  UserIcon,
  EnvelopeIcon,
  DocumentIcon,
  CalendarIcon,
  XMarkIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  ArrowPathIcon,
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
  job?: {
    jobId: number;
    jobName: string;
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

interface FormationRecommendation {
  formationId: number;
  fullname: string;
  summary: string;
  matchedSkills: string[];
  courseNames: string[];
  matchScore: number;
}

interface LearningStep {
  step: string;
  description: string;
  priority: number;
  estimatedHours: number;
}

interface AiLearningPath {
  skill: string;
  steps: LearningStep[];
  totalEstimatedHours: number;
}

interface LearningPath {
  matchedSkills: string[];
  missingSkills: string[];
  recommendedFormations: FormationRecommendation[];
  aiLearningPaths: AiLearningPath[];
}

interface AssignJobRequest {
  jobId: number;
}

const styles = `
  @keyframes progressFill {
    from {
      width: 0%;
    }
    to {
      width: var(--progress-width);
    }
  }

  @keyframes countUp {
    from {
      transform: translateY(10px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  .progress-bar {
    animation: progressFill 1.5s ease-out forwards;
    --tw-bg-opacity: 1;
    background-color: rgb(59 130 246 / var(--tw-bg-opacity));
  }

  .percentage-text {
    animation: countUp 1s ease-out forwards;
  }

  .red-chip {
    --tw-bg-opacity: 1;
    background-color: transparent;
    border-color: rgb(220 38 38 / var(--tw-border-opacity));
    color: rgb(220 38 38);
  }

  .red-chip:hover {
    background-color: rgb(220 38 38 / 0.1);
  }

  .gray-chip {
    --tw-bg-opacity: 1;
    background-color: rgb(107 114 128 / 0.1);
    color: rgb(107 114 128);
  }

  .gray-chip:hover {
    background-color: rgb(107 114 128 / 0.2);
  }

  .blue-chip {
    --tw-bg-opacity: 1;
    background-color: rgb(59 130 246 / 0.1);
    color: rgb(59 130 246);
  }

  .blue-chip:hover {
    background-color: rgb(59 130 246 / 0.2);
  }
`;

if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

const GetUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [recommendations, setRecommendations] = useState<JobRecommendation[]>([]);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const [openRecommendations, setOpenRecommendations] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [refreshLoading, setRefreshLoading] = useState(false);
  const [animatedPercentages, setAnimatedPercentages] = useState<{ [key: number]: number }>({});
  const [learningPath, setLearningPath] = useState<LearningPath | null>(null);
  const [openLearningPath, setOpenLearningPath] = useState(false);
  const [learningPathLoading, setLearningPathLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:5054/api/users');
      if (!response.ok) throw new Error('Failed to load users');
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.error('Error fetching users:', err);
      throw err;
    }
  };

  const processUserCVs = async (users: User[]) => {
    try {
      const usersWithCvs = users.filter(user => user.cv?.cvFile);
      await Promise.all(
        usersWithCvs.map(async (user) => {
          await fetch(`http://localhost:5054/api/cv/user/${user.userId}/extract`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'text/plain',
            },
          });
        })
      );
    } catch (err) {
      console.error('Error processing CVs:', err);
      throw err;
    }
  };

  const fetchRecommendations = async (userId: number) => {
    try {
      const response = await fetch(`http://localhost:5054/api/Recommendation/user/${userId}/jobs`);
      if (!response.ok) throw new Error('Failed to load recommendations');
      const data = await response.json();
      return data || [];
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      throw err;
    }
  };

  const fetchLearningPath = async (userId: number) => {
    try {
      const response = await fetch(`http://localhost:5054/api/Recommendation/user/${userId}/learning-path`);
      if (!response.ok) throw new Error('Failed to load learning path');
      return await response.json();
    } catch (err) {
      console.error('Error fetching learning path:', err);
      throw err;
    }
  };

  const refreshData = async () => {
    setRefreshLoading(true);
    try {
      const updatedUsers = await fetchUsers();
      setUsers(updatedUsers);
      if (selectedUser) {
        const updatedRecs = await fetchRecommendations(selectedUser);
        setRecommendations(updatedRecs);
        updatedRecs.forEach((job: JobRecommendation) => {
          animatePercentage(job.jobId, job.matchScore * 100);
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh data');
    } finally {
      setRefreshLoading(false);
    }
  };

  const animatePercentage = (id: number, targetPercentage: number) => {
    let start = 0;
    const duration = 1500;
    const increment = targetPercentage / (duration / 16);
    const startTime = performance.now();

    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const current = Math.floor(progress * targetPercentage);
      setAnimatedPercentages(prev => ({ ...prev, [id]: current }));
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };
    requestAnimationFrame(step);
  };

  useEffect(() => {
    const fetchAndProcessUsers = async () => {
      try {
        const usersData = await fetchUsers();
        await processUserCVs(usersData);
        setUsers(usersData);
        const usersWithCvs = usersData.filter(user => user.cv?.cvFile);
        const recResults = await Promise.all(
          usersWithCvs.map(user => fetchRecommendations(user.userId))
        );
        setRecommendations(recResults.flat());
        recResults.flat().forEach((job: JobRecommendation) => {
          animatePercentage(job.jobId, job.matchScore * 100);
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchAndProcessUsers();
  }, []);

  const handleUserClick = async (userId: number) => {
    setSelectedUser(userId);
    setRecommendationsLoading(true);
    try {
      const data = await fetchRecommendations(userId);
      setRecommendations(data);
      data.forEach((job: JobRecommendation) => {
        animatePercentage(job.jobId, job.matchScore * 100);
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading recommendations');
    } finally {
      setRecommendationsLoading(false);
      setOpenRecommendations(true);
    }
  };

  const handleViewLearningPath = async (userId: number) => {
    setSelectedUser(userId);
    setLearningPath(null);
    setLearningPathLoading(true);
    try {
      const data = await fetchLearningPath(userId);
      setLearningPath(data);
      setOpenLearningPath(true);
      data.recommendedFormations.forEach((formation: FormationRecommendation) => {
        animatePercentage(formation.formationId, formation.matchScore * 100);
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading learning path');
    } finally {
      setLearningPathLoading(false);
    }
  };

  const assignJobToUser = async (userId: number, jobId: number) => {
    setIsAssigning(true);
    try {
      const response = await fetch(`http://localhost:5054/api/users/${userId}/assign-job`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ jobId } as AssignJobRequest),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to assign job');
      }

      await refreshData();
    } catch (err) {
      console.error('Error assigning job:', err);
      setError(err instanceof Error ? err.message : 'Error assigning job');
    } finally {
      setIsAssigning(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <Spinner className="h-12 w-12" />
    </div>
  );

  if (error) return (
    <div className="flex justify-center items-center h-screen">
      <Card className="p-6 max-w-md text-center" style={{ backgroundColor: 'rgb(12, 16, 33)' }}>
        <Typography variant="h5" className="text-white mb-4">
          Error Loading Data
        </Typography>
        <Typography className="text-white mb-4">{error}</Typography>
        <Button onClick={refreshData} color="blue">
          Retry
        </Button>
      </Card>
    </div>
  );

  return (
    <section className="w-full max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <Typography variant="h2" className="text-center md:text-left text-white">
            User Management
          </Typography>
          <Typography variant="lead" className="mt-2 font-normal text-gray-300">
            Click on any user to view job recommendations or learning path
          </Typography>
        </div>
        <Button
          variant="outlined"
          className="flex items-center gap-2 text-white border-white hover:bg-white/10"
          onClick={refreshData}
          disabled={refreshLoading}
        >
          {refreshLoading ? (
            <ArrowPathIcon className="h-4 w-4 animate-spin" />
          ) : (
            <ArrowPathIcon className="h-4 w-4" />
          )}
          Refresh Data
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user) => (
          <Card
            key={user.userId}
            className="hover:shadow-lg transition-shadow h-full"
            style={{ backgroundColor: 'rgb(12, 16, 33)' }}
          >
            <div className="p-6 flex flex-col h-full">
              <div className="flex items-center gap-4 mb-4">
                <Avatar
                  src={`https://ui-avatars.com/api/?name=${user.firstname}+${user.lastname}&background=random`}
                  alt={`${user.firstname} ${user.lastname}`}
                  size="lg"
                  className="border border-white"
                />
                <div>
                  <Typography variant="h5" className="text-white">
                    {user.firstname} {user.lastname}
                  </Typography>
                  <Typography className="font-medium text-gray-300">
                    @{user.username}
                  </Typography>
                </div>
              </div>

              <div className="space-y-3 flex-grow">
                <div className="flex items-center gap-2">
                  <EnvelopeIcon className="h-5 w-5 text-gray-300" />
                  <Typography className="font-normal text-gray-300 truncate">
                    {user.email}
                  </Typography>
                </div>

                <div className="flex items-center gap-2">
                  <DocumentIcon className="h-5 w-5 text-gray-300" />
                  <Typography className="font-normal text-gray-300">
                    {user.role?.roleName || 'No role'}
                  </Typography>
                </div>

                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-gray-300" />
                  <Typography className="font-normal text-gray-300">
                    Joined: {user.dateCreation ? new Date(user.dateCreation).toLocaleDateString() : 'N/A'}
                  </Typography>
                </div>

                <div className="flex items-center gap-2">
                  <BriefcaseIcon className="h-5 w-5 text-gray-300" />
                  <Typography className="font-normal text-gray-300">
                    {user.job?.jobName || 'No job assigned'}
                  </Typography>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleUserClick(user.userId)}
                  className="flex items-center gap-2"
                  style={{ backgroundColor: 'rgb(59 130 246)' }}
                >
                  View Jobs
                </Button>
                {user.job && (
                  <Button
                    size="sm"
                    onClick={() => handleViewLearningPath(user.userId)}
                    className="flex items-center gap-2"
                    style={{ backgroundColor: 'rgb(16 185 129)' }}
                  >
                    <AcademicCapIcon className="h-4 w-4" />
                    Learning Path
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Dialog
        open={openRecommendations}
        handler={() => setOpenRecommendations(false)}
        size="lg"
        className="bg-white rounded-lg shadow-xl"
      >
        <DialogHeader className="bg-gray-50 border-b border-gray-200 rounded-t-lg">
          <div className="flex justify-between items-center w-full">
            <div>
              <Typography variant="h5" className="text-gray-900">
                Job Recommendations
              </Typography>
              <Typography variant="small" className="text-gray-500">
                {users.find(u => u.userId === selectedUser)?.firstname} {users.find(u => u.userId === selectedUser)?.lastname}
              </Typography>
            </div>
            <Button
              variant="text"
              size="sm"
              onClick={() => setOpenRecommendations(false)}
              className="text-gray-500 hover:bg-gray-100 rounded-full p-2"
            >
              <XMarkIcon className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>
        
        <DialogBody className="p-0 overflow-y-auto max-h-[70vh]">
          {recommendationsLoading ? (
            <div className="flex justify-center items-center h-40">
              <Spinner className="h-10 w-10" />
            </div>
          ) : recommendations.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {recommendations.map((job) => (
                <div key={job.jobId} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col space-y-4">
                    <div className="flex justify-between items-start">
                      <Typography variant="h6" className="font-semibold text-gray-900">
                        {job.jobName}
                      </Typography>
                      <Button
                        size="sm"
                        color="blue"
                        onClick={() => selectedUser && assignJobToUser(selectedUser, job.jobId)}
                        disabled={!selectedUser || isAssigning}
                        className="flex items-center gap-1"
                      >
                        {isAssigning ? (
                          <Spinner className="h-4 w-4" />
                        ) : (
                          <BriefcaseIcon className="h-4 w-4" />
                        )}
                        Assign
                      </Button>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <Typography variant="small" className="font-medium text-gray-500">
                          Match Score
                        </Typography>
                        <Typography variant="small" className="font-bold text-blue-600">
                          {Math.round(animatedPercentages[job.jobId] || 0)}%
                        </Typography>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="h-2.5 rounded-full bg-gradient-to-r from-blue-400 to-blue-600" 
                          style={{ 
                            width: `${animatedPercentages[job.jobId] || 0}%`,
                            transition: 'width 0.3s ease'
                          }}
                        ></div>
                      </div>
                    </div>
                    
                    <Typography className="text-gray-600 text-sm">
                      {job.jobDescription}
                    </Typography>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Typography variant="small" className="font-semibold text-gray-700 mb-2">
                          Matched Skills ({job.matchedSkills.length})
                        </Typography>
                        <div className="flex flex-wrap gap-2">
                          {job.matchedSkills.map((skill) => (
                            <Tooltip key={skill} content={`Matched skill: ${skill}`}>
                              <Chip
                                value={skill}
                                color="green"
                                className="text-xs px-2 py-1"
                              />
                            </Tooltip>
                          ))}
                        </div>
                      </div>
                      
                      {job.missingSkills.length > 0 && (
                        <div>
                          <Typography variant="small" className="font-semibold text-gray-700 mb-2">
                            Missing Skills ({job.missingSkills.length})
                          </Typography>
                          <div className="flex flex-wrap gap-2">
                            {job.missingSkills.map((skill) => (
                              <Tooltip key={skill} content={`Missing skill: ${skill}`}>
                                <Chip
                                  value={skill}
                                  color="red"
                                  variant="outlined"
                                  className="text-xs px-2 py-1 border-red-300 text-red-600"
                                />
                              </Tooltip>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <DocumentIcon className="h-12 w-12 text-gray-400 mb-4" />
              <Typography variant="h5" className="mb-2 text-gray-700">
                No Recommendations Found
              </Typography>
              <Typography className="text-gray-500 max-w-md">
                There are currently no job recommendations available for this user.
              </Typography>
            </div>
          )}
        </DialogBody>
        
        <DialogFooter className="bg-gray-50 border-t border-gray-200 rounded-b-lg px-6 py-4">
          <Button
            variant="text"
            color="gray"
            onClick={() => setOpenRecommendations(false)}
            className="mr-2"
          >
            Close
          </Button>
          <Button
            onClick={refreshData}
            disabled={refreshLoading}
            className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700"
          >
            {refreshLoading ? (
              <ArrowPathIcon className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowPathIcon className="h-4 w-4" />
            )}
            Refresh
          </Button>
        </DialogFooter>
      </Dialog>

      <Dialog
        open={openLearningPath}
        handler={() => setOpenLearningPath(false)}
        size="lg"
        className="bg-white rounded-lg shadow-xl"
      >
        <DialogHeader className="bg-gray-50 border-b border-gray-200 rounded-t-lg">
          <div className="flex justify-between items-center w-full">
            <div>
              <Typography variant="h5" className="text-gray-900">
                Learning Path
              </Typography>
              <Typography variant="small" className="text-gray-500">
                {users.find(u => u.userId === selectedUser)?.firstname}{' '}
                {users.find(u => u.userId === selectedUser)?.lastname}
              </Typography>
            </div>
            <Button
              variant="text"
              size="sm"
              onClick={() => setOpenLearningPath(false)}
              className="text-gray-500 hover:bg-gray-100 rounded-full p-2"
            >
              <XMarkIcon className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>

        <DialogBody className="p-0 overflow-y-auto max-h-[70vh]">
          {learningPathLoading ? (
            <div className="flex justify-center items-center h-40">
              <Spinner className="h-10 w-10" />
            </div>
          ) : learningPath ? (
            <div className="divide-y divide-gray-200">
              <div className="p-6 hover:bg-gray-50 transition-colors">
                <Typography variant="h6" className="font-semibold text-gray-900 mb-4">
                  Matched Skills
                </Typography>
                <div className="flex flex-wrap gap-2 mb-4">
                  {learningPath.matchedSkills.length > 0 ? (
                    learningPath.matchedSkills.map((skill, index) => (
                      <Tooltip key={`${skill}-${index}`} content={`Matched skill: ${skill}`}>
                        <Chip
                          value={skill}
                          color="green"
                          className="text-xs px-2 py-1"
                        />
                      </Tooltip>
                    ))
                  ) : (
                    <Typography className="text-gray-500">
                      No matched skills
                    </Typography>
                  )}
                </div>
              </div>

              <div className="p-6 hover:bg-gray-50 transition-colors">
                <Typography variant="h6" className="font-semibold text-gray-900 mb-4">
                  Missing Skills
                </Typography>
                <div className="flex flex-wrap gap-2 mb-4">
                  {learningPath.missingSkills.length > 0 ? (
                    learningPath.missingSkills.map((skill, index) => (
                      <Tooltip key={`${skill}-${index}`} content={`Missing skill: ${skill}`}>
                        <Chip
                          value={skill}
                          color="red"
                          variant="outlined"
                          className="text-xs px-2 py-1 border-red-300 text-red-600"
                        />
                      </Tooltip>
                    ))
                  ) : (
                    <Typography className="text-gray-500">
                      No missing skills
                    </Typography>
                  )}
                </div>
              </div>

              <div className="p-6 hover:bg-gray-50 transition-colors">
                <Typography variant="h6" className="font-semibold text-gray-900 mb-4">
                  Recommended Formations
                </Typography>
                {learningPath.recommendedFormations.length > 0 ? (
                  learningPath.recommendedFormations.map((formation) => (
                    <div key={formation.formationId} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex flex-col space-y-4">
                        <div className="flex justify-between items-start">
                          <Typography variant="h6" className="font-semibold text-gray-900">
                            {formation.fullname}
                          </Typography>
                          <Button
                            size="sm"
                            color="blue"
                            onClick={() => window.open(`http://localhost/Mymoodle/user/index.php?id=${formation.formationId}`, '_blank')}
                            className="flex items-center gap-1"
                          >
                            Enroll in Moodle
                          </Button>
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <Typography variant="small" className="font-medium text-gray-500">
                              Match Score
                            </Typography>
                            <Typography variant="small" className="font-bold text-blue-600">
                              {Math.round(animatedPercentages[formation.formationId] || 0)}%
                            </Typography>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                              className="h-2.5 rounded-full bg-gradient-to-r from-blue-400 to-blue-600"
                              style={{
                                width: `${animatedPercentages[formation.formationId] || 0}%`,
                                transition: 'width 0.3s ease'
                              }}
                            ></div>
                          </div>
                        </div>
                        <Typography className="text-gray-600 text-sm">
                          {formation.summary}
                        </Typography>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Typography variant="small" className="font-semibold text-gray-700 mb-2">
                              Matched Skills ({formation.matchedSkills.length})
                            </Typography>
                            <div className="flex flex-wrap gap-2">
                              {formation.matchedSkills.map((skill, index) => (
                                <Tooltip key={`${skill}-${index}`} content={`Matched skill: ${skill}`}>
                                  <Chip
                                    value={skill}
                                    color="green"
                                    className="text-xs px-2 py-1"
                                  />
                                </Tooltip>
                              ))}
                            </div>
                          </div>
                          <div>
                            <Typography variant="small" className="font-semibold text-gray-700 mb-2">
                              Courses
                            </Typography>
                            <div className="flex flex-wrap gap-2">
                              {formation.courseNames.map((course, index) => (
                                <Tooltip key={`${course}-${index}`} content={`Course: ${course}`}>
                                  <Chip
                                    value={course}
                                    className="gray-chip"
                                    size="sm"
                                  />
                                </Tooltip>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <DocumentIcon className="h-12 w-12 text-gray-400 mb-4" />
                    <Typography variant="h5" className="mb-2 text-gray-700">
                      No Recommended Formations
                    </Typography>
                    <Typography className="text-gray-500 max-w-md">
                      There are currently no formation recommendations available for this user.
                    </Typography>
                  </div>
                )}
              </div>

              <div className="p-6 hover:bg-gray-50 transition-colors">
                <Typography variant="h6" className="font-semibold text-gray-900 mb-4">
                  AI-Generated Learning Paths
                </Typography>
                {learningPath.aiLearningPaths.length > 0 ? (
                  learningPath.aiLearningPaths.map((path, index) => (
                    <div key={`${path.skill}-${index}`} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex flex-col space-y-4">
                        <div className="flex justify-between items-start">
                          <Typography variant="h6" className="font-semibold text-gray-900">
                            Learning Path for {path.skill}
                          </Typography>
                        </div>
                        <Typography variant="small" className="text-gray-600">
                          Total Estimated Hours: {path.totalEstimatedHours}
                        </Typography>
                        {path.steps.map((step, stepIndex) => (
                          <div key={`${step.step}-${stepIndex}`} className="mb-2">
                            <Typography variant="small" className="text-gray-900 font-medium">
                              Step {step.priority}: {step.step}
                            </Typography>
                            <Typography variant="small" className="text-gray-600">
                              {step.description}
                            </Typography>
                            <Typography variant="small" className="text-gray-500">
                              Estimated Hours: {step.estimatedHours}
                            </Typography>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <DocumentIcon className="h-12 w-12 text-gray-400 mb-4" />
                    <Typography variant="h5" className="mb-2 text-gray-700">
                      No AI-Generated Learning Paths
                    </Typography>
                    <Typography className="text-gray-500 max-w-md">
                      There are currently no AI-generated learning paths available for this user.
                    </Typography>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <DocumentIcon className="h-12 w-12 text-gray-400 mb-4" />
              <Typography variant="h5" className="mb-2 text-gray-700">
                No Learning Path Available
              </Typography>
              <Typography className="text-gray-500 max-w-md">
                No learning path could be generated for this user.
              </Typography>
            </div>
          )}
        </DialogBody>

        <DialogFooter className="bg-gray-50 border-t border-gray-200 rounded-b-lg px-6 py-4">
          <Button
            variant="text"
            color="gray"
            onClick={() => setOpenLearningPath(false)}
            className="mr-2"
          >
            Close
          </Button>
          <Button
            onClick={refreshData}
            disabled={refreshLoading}
            className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700"
          >
            {refreshLoading ? (
              <ArrowPathIcon className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowPathIcon className="h-4 w-4" />
            )}
            Refresh
          </Button>
        </DialogFooter>
      </Dialog>
    </section>
  );
};

export default GetUsers;