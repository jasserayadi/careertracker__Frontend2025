'use client';

import { useEffect, useState } from 'react';
import { Card, CardBody, Typography, Button, Spinner } from '@material-tailwind/react';
import { CheckIcon, TrashIcon, PencilIcon, PlusIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import Chip from '@material-tailwind/react/components/Chip';

interface Job {
  jobId: number;
  jobName: string;
  jobDescription: string;
  requiredSkillsJson: string;
}

interface User {
  userId: number;
  username: string;
  firstname: string;
  lastname: string;
  email: string;
  jobId?: number;
  job?: {
    jobId: number;
    jobName: string;
  };
}

const GetJobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [currentJob, setCurrentJob] = useState<Job | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState('');
  const [newSkill, setNewSkill] = useState('');

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5054/api/jobs');
      if (!response.ok) throw new Error(`Failed to load jobs: ${response.statusText}`);
      const data = await response.json();
      setJobs(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsersByJob = async (jobId: number) => {
    setUsersLoading(true);
    setUsersError('');
    setUsers([]);
    try {
      const response = await fetch(`http://localhost:5054/api/Jobs/${jobId}/users`);
      
      if (response.status === 404) {
        setUsers([]);
        return;
      }

      if (!response.ok) {
        throw new Error(`Failed to load users: ${response.statusText}`);
      }

      const usersData = await response.json();
      setUsers(Array.isArray(usersData) ? usersData : []);
    } catch (err) {
      console.error('Error in fetchUsersByJob:', err);
      if (!(err instanceof Error && err.message.includes('No users found'))) {
        setUsersError(err instanceof Error ? err.message : 'An error occurred while fetching users');
      }
    } finally {
      setUsersLoading(false);
    }
  };

  const parseSkills = (skillsJson: string): string[] => {
    try {
      return JSON.parse(skillsJson) || [];
    } catch {
      return [];
    }
  };

  const handleEditClick = (job: Job) => {
    setCurrentJob({
      ...job,
      requiredSkillsJson: job.requiredSkillsJson
    });
    setShowEditModal(true);
    setUpdateError('');
    setUpdateSuccess('');
    setNewSkill('');
  };

  const handleDeleteClick = (job: Job) => {
    setCurrentJob(job);
    setShowDeleteModal(true);
  };

  const handleViewTeamClick = (job: Job) => {
    setCurrentJob(job);
    setShowUsersModal(true);
    fetchUsersByJob(job.jobId);
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && currentJob) {
      const currentSkills = parseSkills(currentJob.requiredSkillsJson);
      if (!currentSkills.includes(newSkill.trim())) {
        const updatedSkills = [...currentSkills, newSkill.trim()];
        setCurrentJob({
          ...currentJob,
          requiredSkillsJson: JSON.stringify(updatedSkills)
        });
        setNewSkill('');
      }
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    if (currentJob) {
      const currentSkills = parseSkills(currentJob.requiredSkillsJson);
      const updatedSkills = currentSkills.filter(skill => skill !== skillToRemove);
      setCurrentJob({
        ...currentJob,
        requiredSkillsJson: JSON.stringify(updatedSkills)
      });
    }
  };

  const handleUpdateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentJob) return;

    try {
      setUpdateLoading(true);
      const response = await fetch(`http://localhost:5054/api/jobs/${currentJob.jobId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          JobName: currentJob.jobName,
          JobDescription: currentJob.jobDescription,
          RequiredSkillsJson: currentJob.requiredSkillsJson
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update job');
      }

      setUpdateSuccess('Job updated successfully!');
      await fetchJobs();
      setTimeout(() => setShowEditModal(false), 1500);
    } catch (err) {
      setUpdateError(err instanceof Error ? err.message : 'Failed to update job');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleDeleteJob = async () => {
    if (!currentJob) return;

    try {
      const response = await fetch(`http://localhost:5054/api/jobs/${currentJob.jobId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete job');

      await fetchJobs();
      setShowDeleteModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete job');
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <Spinner className="h-16 w-16 text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-gray-900">
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-red-800">Error</h3>
              <p className="text-red-700">{error}</p>
              <Button 
                onClick={fetchJobs} 
                color="red" 
                variant="text" 
                className="mt-2"
              >
                Retry
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 text-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Typography variant="h1" className="text-4xl md:text-5xl font-extrabold text-blue-300 mb-4">
            Job Management
          </Typography>
          <Typography className="text-xl text-gray-400 max-w-3xl mx-auto">
            Manage all job positions and their requirements
          </Typography>
        </div>
        
        {/* Job List */}
        <div className="space-y-6">
          {jobs.map((job) => {
            const skills = parseSkills(job.requiredSkillsJson);
            
            return (
              <Card key={job.jobId} className="bg-gray-800 hover:bg-gray-700 transition-all duration-300 border-2 border-blue-700 hover:border-blue-500">
                <CardBody className="p-6">
                  <div className="flex flex-col md:flex-row justify-between gap-6">
                    <div className="flex-1">
                      <Typography
                        variant="h4"
                        className="font-bold text-blue-300 mb-2"
                      >
                        {job.jobName}
                      </Typography>
                      <Typography variant="paragraph" className="text-gray-300 mb-4">
                        {job.jobDescription}
                      </Typography>
                      
                      {/* Skills Display */}
                      {skills.length > 0 && (
                        <div className="mt-4">
                          <Typography variant="small" className="font-semibold text-blue-300 mb-2">
                            Required Skills:
                          </Typography>
                          <div className="flex flex-wrap gap-2">
                            {skills.map((skill, index) => (
                              <Chip
                                key={index}
                                value={skill}
                                className="rounded-full bg-blue-900 text-blue-300"
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex md:justify-end items-start gap-2">
                      <Button
                        onClick={() => handleViewTeamClick(job)}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-500"
                      >
                        <UserGroupIcon className="h-4 w-4" />
                        View Team
                      </Button>
                      <Button
                        onClick={() => handleEditClick(job)}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500"
                      >
                        <PencilIcon className="h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleDeleteClick(job)}
                        className="flex items-center gap-2 bg-red-600 hover:bg-red-500"
                      >
                        <TrashIcon className="h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && currentJob && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div 
            className="absolute inset-0 bg-black bg-opacity-30"
            onClick={() => setShowEditModal(false)}
          ></div>
          
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl relative z-10 border-2 border-blue-700">
            <div className="flex justify-between items-center mb-4">
              <Typography variant="h4" className="text-blue-300">Edit Job</Typography>
              <button 
                onClick={() => setShowEditModal(false)} 
                className="text-gray-400 hover:text-gray-300 text-2xl"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleUpdateJob} className="space-y-4">
              <div>
                <label className="block text-blue-300 mb-2">Job Name</label>
                <input
                  type="text"
                  value={currentJob.jobName}
                  onChange={(e) => setCurrentJob({...currentJob, jobName: e.target.value})}
                  className="w-full p-2 border-2 border-blue-700 rounded bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-blue-300 mb-2">Job Description</label>
                <textarea
                  value={currentJob.jobDescription}
                  onChange={(e) => setCurrentJob({...currentJob, jobDescription: e.target.value})}
                  className="w-full p-2 border-2 border-blue-700 rounded bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={5}
                  required
                />
              </div>

              {/* Skills Editor */}
              <div>
                <label className="block text-blue-300 mb-2">Required Skills</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                    className="flex-1 p-2 border-2 border-blue-700 rounded bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Add a skill"
                  />
                  <Button
                    type="button"
                    onClick={handleAddSkill}
                    className="flex items-center gap-1 bg-blue-600 hover:bg-blue-500"
                    disabled={!newSkill.trim()}
                  >
                    <PlusIcon className="h-4 w-4" /> Add
                  </Button>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {parseSkills(currentJob.requiredSkillsJson).map((skill, index) => (
                    <div key={index} className="flex items-center gap-1 bg-blue-900 px-3 py-1 rounded-full">
                      <span className="text-blue-300">{skill}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="text-red-400 hover:text-red-300"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-4">
                <Button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-gray-300 hover:bg-gray-700 rounded border border-gray-600"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateLoading}
                  className={`px-4 py-2 rounded ${updateLoading ? 'bg-blue-700 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500'}`}
                >
                  {updateLoading ? 'Updating...' : 'Update'}
                </Button>
              </div>
              {updateError && <p className="text-red-400 text-sm mt-2">{updateError}</p>}
              {updateSuccess && <p className="text-green-400 text-sm mt-2">{updateSuccess}</p>}
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && currentJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full border-2 border-blue-700">
            <Typography variant="h5" className="mb-4 text-blue-300">Confirm Deletion</Typography>
            <Typography className="mb-6 text-gray-300">
              Are you sure you want to delete the job "{currentJob.jobName}"?
            </Typography>
            <div className="flex justify-end space-x-3">
              <Button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-300 hover:bg-gray-700 rounded border border-gray-600"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteJob}
                className="px-4 py-2 bg-red-600 text-white hover:bg-red-500 rounded"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Users Modal */}
      {showUsersModal && currentJob && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div 
            className="absolute inset-0 bg-black bg-opacity-30"
            onClick={() => setShowUsersModal(false)}
          ></div>
          
          <div className="bg-gray-800 rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden relative z-10 border-2 border-blue-700">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
              <div className="flex justify-between items-center">
                <div>
                  <Typography variant="h3" className="text-white font-bold">
                    Team Members
                  </Typography>
                  <Typography variant="lead" className="text-blue-200 mt-1">
                    {currentJob.jobName}
                  </Typography>
                </div>
                <button 
                  onClick={() => setShowUsersModal(false)} 
                  className="text-white hover:text-blue-200 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 120px)' }}>
              {usersLoading ? (
                <div className="flex justify-center items-center h-32">
                  <Spinner className="h-10 w-10 text-blue-500" />
                </div>
              ) : usersError ? (
                <div className="text-center py-8">
                  <Typography variant="h6" className="text-red-400 mb-4">
                    Error loading team members
                  </Typography>
                  <Typography className="text-gray-400 mb-4">
                    {usersError}
                  </Typography>
                  <Button
                    onClick={() => currentJob && fetchUsersByJob(currentJob.jobId)}
                    className="bg-blue-600 hover:bg-blue-500 flex items-center gap-2 mx-auto"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                    </svg>
                    Try Again
                  </Button>
                </div>
              ) : users.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {users.map((user) => (
                    <Card key={user.userId} className="bg-gray-700 hover:bg-gray-600 transition-all duration-300 border border-gray-600">
                      <CardBody className="p-5">
                        <div className="flex items-start gap-4">
                          <div className="bg-blue-900 p-3 rounded-full">
                            <UserGroupIcon className="h-6 w-6 text-blue-400" />
                          </div>
                          <div className="flex-1">
                            <Typography variant="h5" className="text-blue-300 mb-1">
                              {user.firstname} {user.lastname}
                            </Typography>
                            <Typography variant="small" className="text-gray-400 mb-2">
                              @{user.username}
                            </Typography>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <Typography variant="small" className="text-gray-300">
                                  {user.email}
                                </Typography>
                              </div>
                              {user.job && (
                                <div className="flex items-center gap-2">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                  </svg>
                                  <Typography variant="small" className="text-gray-300">
                                    {user.job.jobName}
                                  </Typography>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="mx-auto w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mb-4">
                    <UserGroupIcon className="h-12 w-12 text-gray-500" />
                  </div>
                  <Typography variant="h5" className="text-gray-400 mb-2">
                    No Team Members Assigned
                  </Typography>
                  <Typography className="text-gray-500 max-w-md mx-auto">
                    This job position doesn't have any team members assigned yet.
                  </Typography>
                </div>
              )}
            </div>
            
            {/* Modal Footer */}
            <div className="bg-gray-700 px-6 py-4 border-t border-gray-600 flex justify-end">
              <Button
                onClick={() => setShowUsersModal(false)}
                className="bg-blue-600 hover:bg-blue-500"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default GetJobs;