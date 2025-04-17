'use client';

import { useEffect, useState } from 'react';
import { Card, CardBody, Typography, Button, Chip, Input } from '@material-tailwind/react';
import { CheckIcon, TrashIcon, PencilIcon, PlusIcon } from '@heroicons/react/24/outline';

interface Job {
  jobId: number;
  jobName: string;
  jobDescription: string;
  requiredSkillsJson: string;
}

const GetJobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentJob, setCurrentJob] = useState<Job | null>(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState('');
  const [newSkill, setNewSkill] = useState('');

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5054/api/jobs');
      if (!response.ok) throw new Error('Failed to load jobs');
      const data = await response.json();
      setJobs(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
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
        const errorData = await response.json();
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
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4 max-w-2xl mx-auto my-8">
        <Typography variant="paragraph" className="text-center text-red-600">
          Error: {error}
        </Typography>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Main content container */}
      <div className={`container mx-auto px-4 md:px-8 py-10 transition-all duration-200 ${showEditModal ? 'blur-sm' : ''}`}>
        {/* Header */}
        <div className="text-center mb-12">
          <Typography variant="h2" className="font-bold text-gray-900 mb-2">
            Job Listings
          </Typography>
          <Typography variant="lead" className="text-gray-600 max-w-2xl mx-auto">
            Manage current job opportunities
          </Typography>
        </div>
        
        {/* Job List */}
        <div className="space-y-6">
          {jobs.map((job) => {
            const skills = parseSkills(job.requiredSkillsJson);
            
            return (
              <Card key={job.jobId} className="rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <CardBody className="p-6">
                  <div className="flex flex-col md:flex-row justify-between gap-6">
                    <div className="flex-1">
                      <Typography variant="h4" className="font-bold text-gray-900 mb-2">
                        {job.jobName}
                      </Typography>
                      <Typography variant="paragraph" className="text-gray-600 mb-4">
                        {job.jobDescription}
                      </Typography>
                      
                      {/* Skills Display */}
                      {skills.length > 0 && (
                        <div className="mt-4">
                          <Typography variant="small" className="font-semibold text-gray-700 mb-2">
                            Required Skills:
                          </Typography>
                          <div className="flex flex-wrap gap-2">
                            {skills.map((skill, index) => (
                              <Chip
                                key={index}
                                value={skill}
                                className="rounded-full bg-blue-50 text-blue-700"
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex md:justify-end items-start gap-2">
                      <Button
                        onClick={() => handleEditClick(job)}
                        className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600"
                      >
                        <PencilIcon className="h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleDeleteClick(job)}
                        className="flex items-center gap-2 bg-red-500 hover:bg-red-600"
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
          
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl relative z-10">
            <div className="flex justify-between items-center mb-4">
              <Typography variant="h4" className="text-black">Edit Job</Typography>
              <button 
                onClick={() => setShowEditModal(false)} 
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleUpdateJob} className="space-y-4">
              <div>
                <label className="block text-black mb-2">Job Name</label>
                <input
                  type="text"
                  value={currentJob.jobName}
                  onChange={(e) => setCurrentJob({...currentJob, jobName: e.target.value})}
                  className="w-full p-2 border rounded text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-black mb-2">Job Description</label>
                <textarea
                  value={currentJob.jobDescription}
                  onChange={(e) => setCurrentJob({...currentJob, jobDescription: e.target.value})}
                  className="w-full p-2 border rounded text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={5}
                  required
                />
              </div>

              {/* Skills Editor */}
              <div>
                <label className="block text-black mb-2">Required Skills</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                    className="flex-1 p-2 border rounded text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Add a skill"
                  />
                  <Button
                    type="button"
                    onClick={handleAddSkill}
                    className="flex items-center gap-1"
                    disabled={!newSkill.trim()}
                  >
                    <PlusIcon className="h-4 w-4" /> Add
                  </Button>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {parseSkills(currentJob.requiredSkillsJson).map((skill, index) => (
                    <div key={index} className="flex items-center gap-1 bg-blue-50 px-3 py-1 rounded-full">
                      <span className="text-blue-700">{skill}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded border border-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateLoading}
                  className={`px-4 py-2 rounded text-white ${updateLoading ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'}`}
                >
                  {updateLoading ? 'Updating...' : 'Update'}
                </button>
              </div>
              {updateError && <p className="text-red-500 text-sm mt-2">{updateError}</p>}
              {updateSuccess && <p className="text-green-500 text-sm mt-2">{updateSuccess}</p>}
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && currentJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <Typography variant="h5" className="mb-4 text-black">Confirm Deletion</Typography>
            <Typography className="mb-6 text-black">
              Are you sure you want to delete the job "{currentJob.jobName}"?
            </Typography>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded border border-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteJob}
                className="px-4 py-2 bg-red-500 text-white hover:bg-red-600 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GetJobs;