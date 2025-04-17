'use client';

import { Card, CardBody, Button, Typography } from "@material-tailwind/react";
import { CheckIcon, PlusIcon } from "@heroicons/react/24/outline";
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
    <div className="grid min-h-screen place-items-center">
      <section className="container mx-auto px-10">
        <div className="grid place-items-center pb-20 text-center">
          <Typography variant="h2" color="blue-gray">
            Create New Job
          </Typography>
          <Typography variant="lead" className="mt-2 !text-gray-500 lg:w-5/12">
            Fill in the job details to get started.
          </Typography>
        </div>
        
        <Card className="px-6 pb-5">
          <CardBody>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Typography variant="h6" color="blue-gray" className="mb-2">
                  Job Name:
                </Typography>
                <input
                  type="text"
                  name="JobName"
                  value={job.JobName}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-lg"
                />
              </div>
              
              <div>
                <Typography variant="h6" color="blue-gray" className="mb-2">
                  Job Description:
                </Typography>
                <textarea
                  name="JobDescription"
                  value={job.JobDescription}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-lg"
                  rows={5}
                />
              </div>
              
              <div>
                <Typography variant="h6" color="blue-gray" className="mb-2">
                  Required Skills:
                </Typography>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                    className="mt-1 block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-lg"
                  />
                  <Button
                    type="button"
                    onClick={handleAddSkill}
                    className="flex items-center gap-2"
                    disabled={!newSkill.trim()}
                  >
                    <PlusIcon className="h-5 w-5" /> Add
                  </Button>
                </div>
                
                {job.RequiredSkills.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {job.RequiredSkills.map((skill, index) => (
                      <div key={index} className="flex items-center gap-1 bg-blue-gray-50 px-3 py-1 rounded-full">
                        <span>{skill}</span>
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
                )}
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
                  'Create Job'
                )}
              </Button>
              
              {error && (
                <Typography variant="small" color="red" className="text-center">
                  {error}
                </Typography>
              )}
              
              {success && (
                <div className="flex items-center justify-center gap-2">
                  <CheckIcon className="h-5 w-5 text-green-500" />
                  <Typography variant="small" color="green">
                    {success}
                  </Typography>
                </div>
              )}
            </form>
          </CardBody>
        </Card>
      </section>
    </div>
  );
};

export default RegisterJob;