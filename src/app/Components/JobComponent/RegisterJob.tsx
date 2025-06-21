'use client';

import { Card, CardBody, Button, Typography, Spinner } from "@material-tailwind/react";
import { CheckIcon, PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useState } from 'react';

interface Job {
  JobName: string;
  JobDescription: string;
  RequiredSkills: string[];
}

const RegisterJob = () => {
  const [job, setJob] = useState<Job>({
    JobName: '',
    JobDescription: '',
    RequiredSkills: [],
  });
  const [newSkill, setNewSkill] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setJob(prev => ({ ...prev, [name]: value }));
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !job.RequiredSkills.includes(newSkill.trim())) {
      setJob(prev => ({
        ...prev,
        RequiredSkills: [...prev.RequiredSkills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setJob(prev => ({
      ...prev,
      RequiredSkills: prev.RequiredSkills.filter(skill => skill !== skillToRemove)
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
        body: JSON.stringify({
          JobName: job.JobName,
          JobDescription: job.JobDescription,
          RequiredSkillsJson: JSON.stringify(job.RequiredSkills),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create job');
      }

      // Reset form on success
      setJob({
        JobName: '',
        JobDescription: '',
        RequiredSkills: []
      });
      setNewSkill('');
      setSuccess('Job created successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 text-white">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <Typography variant="h1" className="text-4xl md:text-5xl font-extrabold text-blue-300 mb-4">
            Create New Job
          </Typography>
          <Typography className="text-xl text-gray-400 max-w-3xl mx-auto">
            Fill in the job details to get started
          </Typography>
        </div>

        <Card className="bg-gray-800 border-2 border-blue-700 hover:border-blue-500 transition-all duration-300">
          <CardBody>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Typography variant="h5" className="mb-2 text-blue-300">
                  Job Name
                </Typography>
                <input
                  type="text"
                  name="JobName"
                  value={job.JobName}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400"
                  placeholder="Enter job title"
                />
              </div>
              
              <div>
                <Typography variant="h5" className="mb-2 text-blue-300">
                  Job Description
                </Typography>
                <textarea
                  name="JobDescription"
                  value={job.JobDescription}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400"
                  rows={5}
                  placeholder="Describe the job responsibilities and requirements"
                />
              </div>
              
              <div>
                <Typography variant="h5" className="mb-2 text-blue-300">
                  Required Skills
                </Typography>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                    className="mt-1 block w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400"
                    placeholder="Add required skills"
                  />
                  <Button
                    type="button"
                    onClick={handleAddSkill}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500"
                    disabled={!newSkill.trim()}
                  >
                    <PlusIcon className="h-5 w-5" /> Add
                  </Button>
                </div>
                
                {job.RequiredSkills.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {job.RequiredSkills.map((skill, index) => (
                      <div key={index} className="flex items-center gap-1 bg-gray-700 px-3 py-1 rounded-full border border-blue-500">
                        <span className="text-gray-300">{skill}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <Button
                type="submit"
                disabled={loading}
                className="w-full mt-6 bg-blue-600 hover:bg-blue-500"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Spinner className="h-5 w-5" />
                    Processing...
                  </div>
                ) : (
                  'Create Job'
                )}
              </Button>
              
              {error && (
                <div className="bg-red-900 bg-opacity-50 border-l-4 border-red-500 p-4 rounded">
                  <Typography variant="small" color="red" className="flex items-center gap-2">
                    <XMarkIcon className="h-5 w-5" />
                    {error}
                  </Typography>
                </div>
              )}
              
              {success && (
                <div className="bg-green-900 bg-opacity-50 border-l-4 border-green-500 p-4 rounded">
                  <Typography variant="small" color="green" className="flex items-center gap-2">
                    <CheckIcon className="h-5 w-5" />
                    {success}
                  </Typography>
                </div>
              )}
            </form>
          </CardBody>
        </Card>
      </div>
    </main>
  );
};

export default RegisterJob;