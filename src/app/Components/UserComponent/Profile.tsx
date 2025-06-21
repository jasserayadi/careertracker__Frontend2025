'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Typography,
  Card,
  CardBody,
  Button,
  Spinner,
  Input,
} from '@material-tailwind/react';
import {
  UserIcon,
  EnvelopeIcon,
  DocumentIcon,
  CalendarIcon,
  ArrowDownTrayIcon,
  AcademicCapIcon,
  CheckCircleIcon,
  XCircleIcon,
  BriefcaseIcon,
  CloudArrowUpIcon,
  TrophyIcon,
} from '@heroicons/react/24/solid';

interface Certificate {
  certificatId: number;
  certificatName: string;
  pdfUrl?: string;
  issueDate: string;
  expirationDate?: string;
  verificationCode: string;
  courseId: number;
}

interface Course {
  formationId: number;
  fullname: string;
  shortname: string;
  summary: string;
  moodleCategoryId: number;
  moodleCourseId: number;
  createdAt: string;
  updatedAt: string;
}

interface Job {
  jobId: number;
  jobName: string;
  jobDescription: string;
  requiredSkillsJson: string;
  users?: {
    userId: number;
    username: string;
    firstname: string;
    lastname: string;
    email: string;
  }[];
}

interface User {
  userId: number;
  username: string;
  firstname: string;
  lastname: string;
  email: string;
  dateCreation?: string;
  cv?: {
    cvFile: string;
  };
  courses?: Course[];
  badgeName?: string;
}

interface ProfilePageProps {
  userId: number;
}

const ProfilePage = ({ userId }: ProfilePageProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAllCourses, setShowAllCourses] = useState(false);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [courseCompletions, setCourseCompletions] = useState<Record<number, boolean>>({});
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [job, setJob] = useState<Job | null>(null);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [jobsError, setJobsError] = useState('');
  const [cvUploading, setCvUploading] = useState(false);
  const [userToUpdate, setUserToUpdate] = useState<User | null>(null);
  const [updateForm, setUpdateForm] = useState({
    username: '',
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);
  const router = useRouter();

  const fetchCourseCompletion = async (courseId: number) => {
    try {
      const response = await fetch(
        `http://localhost:5054/api/users/completion/${userId}/${courseId}`
      );
      if (!response.ok) return false;
      const data = await response.json();
      return data.completionStatus?.completed || false;
    } catch (error) {
      console.error('Error fetching completion status:', error);
      return false;
    }
  };

  const syncEnrollments = async (courses: Course[]) => {
    try {
      for (const course of courses) {
        const response = await fetch(
          `http://localhost:5054/api/Inscription/SyncEnrollments/${course.moodleCourseId}`,
          {
            method: 'POST',
          }
        );
        if (!response.ok) {
          console.error(`Failed to sync enrollments for course ${course.moodleCourseId}: ${response.statusText}`);
        }
      }
    } catch (error) {
      console.error('Error during enrollment sync:', error);
    }
  };

  const handleCvUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      alert('No file selected');
      return;
    }

    const file = event.target.files[0];
    if (!file.name.endsWith('.pdf')) {
      alert('Please upload a PDF file');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setCvUploading(true);
      const response = await fetch(
        `http://localhost:5054/api/users/upload-cv/${userId}`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error('Failed to upload CV');
      }

      const updatedUser = await response.json();
      setUser((prev) => ({
        ...prev!,
        cv: { cvFile: updatedUser.cvFile },
      }));
      alert('CV uploaded successfully');
    } catch (error) {
      console.error('Error uploading CV:', error);
      alert('Error uploading CV');
    } finally {
      setCvUploading(false);
      event.target.value = '';
    }
  };

  const prepareUpdateUser = (user: User) => {
    setUserToUpdate(user);
    setUpdateForm({
      username: user.username,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      password: '',
      confirmPassword: '',
    });
  };

  const handleUpdateFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUpdateForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setCvFile(e.target.files[0]);
  };

  const updateUser = async () => {
    if (!userToUpdate) return;

    try {
      const formData = new FormData();
      formData.append('username', updateForm.username);
      formData.append('firstname', updateForm.firstname);
      formData.append('lastname', updateForm.lastname);
      formData.append('email', updateForm.email);

      if (updateForm.password) {
        if (updateForm.password !== updateForm.confirmPassword) {
          throw new Error("Passwords don't match");
        }
        formData.append('password', updateForm.password);
      }

      if (cvFile) formData.append('cvFile', cvFile);

      const response = await fetch(`http://localhost:5054/api/users/update/${userToUpdate.userId}`, {
        method: 'PUT',
        body: formData,
      });

      if (!response.ok) throw new Error(await response.text());

      const updatedUser = await response.json();
      setUser(updatedUser);
      setUserToUpdate(null);
      setCvFile(null);
      alert('Profile updated successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    }
  };

  const deleteUser = async () => {
    if (userToDelete === null) return;

    try {
      const response = await fetch(`http://localhost:5054/api/users/delete/${userToDelete}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Delete failed');

      setUserToDelete(null);
      alert('Profile deleted successfully');
      router.push('/'); // Redirect to home or another page after deletion
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete error');
    }
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        console.log(`Fetching profile for userId: ${userId}`);
        // Fetch user data
        const userResponse = await fetch(`http://localhost:5054/api/users/id/${userId}`);
        if (!userResponse.ok) {
          const errorData = await userResponse.json().catch(() => ({}));
          throw new Error(errorData.message || `Failed to fetch user profile: ${userResponse.statusText}`);
        }
        let userData = await userResponse.json();

        // Fetch badge data
        try {
          const badgeResponse = await fetch(`http://localhost:5054/api/Badge/${userId}/badge`);
          const bodyText = await badgeResponse.text();
          console.log('Badge API response:', {
            status: badgeResponse.status,
            statusText: badgeResponse.statusText,
            body: bodyText,
          });
          if (badgeResponse.ok) {
            try {
              const badgeData = JSON.parse(bodyText);
              console.log('Badge data received:', badgeData);
              userData = { ...userData, badgeName: badgeData.badgeName || 'None' };
            } catch (jsonError) {
              console.error('Error parsing badge JSON:', jsonError);
              userData = { ...userData, badgeName: 'None' };
            }
          } else {
            console.warn(`Badge fetch failed: ${badgeResponse.status} ${badgeResponse.statusText}`);
            userData = { ...userData, badgeName: 'None' };
          }
        } catch (badgeError) {
          console.error('Error fetching badge:', badgeError);
          userData = { ...userData, badgeName: 'None' };
        }

        setUser(userData);

        // Fetch courses
        try {
          const coursesResponse = await fetch(`http://localhost:5054/api/Inscription/ByUser/${userId}`);
          if (coursesResponse.ok) {
            const coursesData = await coursesResponse.json();

            await syncEnrollments(coursesData);

            const completionStatuses = await Promise.all(
              coursesData.map(async (course: Course) => {
                const isCompleted = await fetchCourseCompletion(course.moodleCourseId);
                return { courseId: course.moodleCourseId, completed: isCompleted };
              })
            );

            const completionMap = completionStatuses.reduce((acc, curr) => {
              acc[curr.courseId] = curr.completed;
              return acc;
            }, {} as Record<number, boolean>);

            setUser((prev) => ({
              ...prev!,
              courses: coursesData.slice(0, 3),
            }));
            setAllCourses(coursesData);
            setCourseCompletions(completionMap);
          }
        } catch (coursesError) {
          console.error('Error fetching courses:', coursesError);
        }

        // Fetch certificates
        try {
          const certificatesResponse = await fetch(`http://localhost:5054/api/certificates/user/${userId}`);
          if (certificatesResponse.ok) {
            setCertificates(await certificatesResponse.json());
          }
        } catch (certificatesError) {
          console.error('Error fetching certificates:', certificatesError);
        }

        // Fetch job
        try {
          setJobsLoading(true);
          const jobsResponse = await fetch(`http://localhost:5054/api/jobs/users/${userId}/job`);
          console.log(`Job response status for userId ${userId}: ${jobsResponse.status} ${jobsResponse.statusText}`);
          const responseText = await jobsResponse.text();
          console.log(`Job response body: ${responseText}`);

          if (jobsResponse.status === 404) {
            setJob(null);
            setJobsError('');
            return;
          }

          if (!jobsResponse.ok) {
            let errorMessage = `Failed to fetch job: ${jobsResponse.statusText}`;
            try {
              const errorData = JSON.parse(responseText);
              errorMessage = errorData.message || errorMessage;
            } catch {
              // Non-JSON response
            }
            throw new Error(errorMessage);
          }

          if (!responseText) {
            setJob(null);
            setJobsError('');
            return;
          }

          const jobData = JSON.parse(responseText);
          setJob(jobData);
          setJobsError('');
        } catch (jobsError) {
          console.error('Error fetching job:', jobsError);
          setJobsError(jobsError instanceof Error ? jobsError.message : 'Failed to fetch job');
        } finally {
          setJobsLoading(false);
        }
      } catch (err) {
        console.error('Profile fetch error:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId]);

  const handleCourseClick = (courseId: number) => {
    router.push(`/Pages/UserPages/CourseCompletionStatus/${userId}/${courseId}`);
  };

  const toggleAllCourses = () => setShowAllCourses(!showAllCourses);

  const confirmDeleteUser = () => {
    setUserToDelete(userId);
  };

  const handleDownloadCertificate = async (certificateId: number) => {
    window.open(`http://localhost:5054/api/certificates/download/${certificateId}`, '_blank');
  };

  const handleVerifyCertificate = (verificationCode: string) => {
    window.open(`http://localhost:5054/api/certificates/verify/${verificationCode}`, '_blank');
  };

  const getBadgeDisplay = (badgeName?: string) => {
    console.log('Processing badgeName:', badgeName);
    switch (badgeName?.toLowerCase()) {
      case 'beginner':
        return { color: 'text-amber-400', text: 'Bronze Medal' };
      case 'amateur':
        return { color: 'text-gray-300', text: 'Silver Medal' };
      case 'pro':
        return { color: 'text-yellow-300', text: 'Gold Medal' };
      default:
        return { color: 'text-gray-500', text: 'No Badge Assigned' };
    }
  };

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
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-gray-900 text-white">
        <Typography variant="paragraph" className="text-center text-gray-300 py-8">
          User not found
        </Typography>
      </div>
    );
  }

  const badgeDisplay = getBadgeDisplay(user.badgeName);

  return (
    <main className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 text-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <Typography variant="h1" className="text-4xl md:text-5xl font-extrabold text-blue-300 mb-4">
            User Profile
          </Typography>
          <Typography className="text-xl text-gray-400 max-w-3xl mx-auto">
            View and manage your profile information, courses, and certificates
          </Typography>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Profile Section */}
          <div className="w-full lg:w-2/3">
            <Card className="bg-gray-800 hover:bg-gray-700 transition-all duration-300 border-2 border-blue-700 hover:border-blue-500">
              <CardBody className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* User Avatar Section */}
                  <div className="flex items-center justify-center md:justify-start">
                    <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-full bg-blue-900 flex items-center justify-center">
                      <UserIcon className="h-12 w-12 md:h-14 md:w-14 text-blue-400" />
                    </div>
                  </div>

                  {/* User Details Section */}
                  <div className="flex-1">
                    <Typography variant="h3" color="blue-gray" className="mb-4 text-blue-300">
                      {user.firstname} {user.lastname}
                    </Typography>

                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <UserIcon className="h-5 w-5 text-blue-400" />
                        <Typography className="font-normal text-gray-300">
                          <span className="font-semibold text-blue-300">Username:</span> {user.username}
                        </Typography>
                      </div>

                      <div className="flex items-center gap-3">
                        <EnvelopeIcon className="h-5 w-5 text-blue-400" />
                        <Typography className="font-normal text-gray-300">
                          <span className="font-semibold text-blue-300">Email:</span> {user.email}
                        </Typography>
                      </div>

                      <div className="flex items-center gap-3">
                        <CalendarIcon className="h-5 w-5 text-blue-400" />
                        <Typography className="font-normal text-gray-300">
                          <span className="font-semibold text-blue-300">Member since:</span>{' '}
                          {user.dateCreation
                            ? new Date(user.dateCreation).toLocaleDateString()
                            : 'Not specified'}
                        </Typography>
                      </div>

                      {user.cv?.cvFile && (
                        <div className="flex items-center gap-3">
                          <ArrowDownTrayIcon className="h-5 w-5 text-blue-400" />
                          <a
                            href={`http://localhost:5054/uploads/${user.cv.cvFile}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:underline"
                          >
                            Download CV
                          </a>
                        </div>
                      )}

                      <div className="flex items-center gap-3">
                        <TrophyIcon className={`h-5 w-5 ${badgeDisplay.color}`} />
                        <Typography className="font-normal text-gray-300">
                          <span className="font-semibold text-blue-300">Badge:</span>{' '}
                          <span className={badgeDisplay.color}>{badgeDisplay.text}</span>
                        </Typography>
                      </div>

                      <div className="flex items-center gap-3">
                        <BriefcaseIcon className="h-5 w-5 text-blue-400" />
                        {jobsLoading ? (
                          <div className="animate-pulse h-5 w-32 bg-gray-700 rounded"></div>
                        ) : jobsError ? (
                          <Typography className="font-normal text-red-400">
                            {jobsError}
                          </Typography>
                        ) : job ? (
                          <Typography className="font-normal text-gray-300">
                            <span className="font-semibold text-blue-300">Job:</span> {job.jobName}
                          </Typography>
                        ) : (
                          <Typography className="font-normal text-gray-500">
                            Not assigned to any job yet
                          </Typography>
                        )}
                      </div>
                    </div>

                    <div className="mt-6">
                      <Typography variant="h4" color="blue-gray" className="mb-3 text-blue-300">
                        Enrolled Courses
                      </Typography>
                      {allCourses.length > 0 ? (
                        <>
                          <div className="space-y-3">
                            {(showAllCourses ? allCourses : allCourses.slice(0, 3)).map((course) => (
                              <div
                                key={course.formationId}
                                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-gray-700 p-3 rounded-lg transition-colors border border-gray-700"
                                onClick={() => handleCourseClick(course.moodleCourseId)}
                              >
                                <div className="flex items-center gap-3">
                                  <AcademicCapIcon className="h-5 w-5 text-blue-400" />
                                  <div>
                                    <Typography className="font-semibold text-gray-300">
                                      {course.fullname}
                                    </Typography>
                                    <Typography variant="small" className="text-gray-400">
                                      {course.shortname}
                                    </Typography>
                                  </div>
                                </div>
                                {courseCompletions[course.moodleCourseId] ? (
                                  <div className="flex items-center gap-1 text-green-400 sm:ml-auto sm:pl-4">
                                    <CheckCircleIcon className="h-4 w-4" />
                                    <Typography variant="small">Completed</Typography>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1 text-amber-400 sm:ml-auto sm:pl-4">
                                    <XCircleIcon className="h-4 w-4" />
                                    <Typography variant="small">In Progress</Typography>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>

                          {allCourses.length > 3 && (
                            <button
                              className="flex items-center gap-1 mt-3 text-blue-400 hover:text-blue-300 text-sm"
                              onClick={toggleAllCourses}
                            >
                              {showAllCourses ? 'Show Less' : `View All (${allCourses.length})`}
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2}
                                stroke="currentColor"
                                className="h-4 w-4"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d={showAllCourses ? 'M19.5 12h-15' : 'M19.5 8.25l-7.5 7.5-7.5-7.5'}
                                />
                              </svg>
                            </button>
                          )}
                        </>
                      ) : (
                        <Typography className="text-gray-500 italic">
                          No courses enrolled yet
                        </Typography>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 mt-6">
                      <Button
                        onClick={() => user && prepareUpdateUser(user)}
                        className="flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 px-4 rounded-lg text-sm"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                        Edit Profile
                      </Button>
                      <Button
                        onClick={confirmDeleteUser}
                        className="flex items-center justify-center gap-1 bg-red-600 hover:bg-red-500 text-white font-medium py-2 px-4 rounded-lg text-sm"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Delete Profile
                      </Button>
                  
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Certificates Section */}
          <div className="w-full lg:w-1/3">
            <Typography variant="h4" color="blue-gray" className="mb-4 text-blue-300">
              My Certificates
            </Typography>

            {certificates.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {certificates.map((cert) => (
                  <Card key={cert.certificatId} className="bg-gray-800 hover:bg-gray-700 transition-all duration-300 border-2 border-blue-700 hover:border-blue-500">
                    <CardBody className="p-4">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-3 mb-3">
                          <DocumentIcon className="h-6 w-6 text-blue-400" />
                          <Typography variant="h6" className="truncate text-gray-300">
                            {cert.certificatName}
                          </Typography>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center mb-3 gap-1 text-gray-400">
                          <Typography variant="small">
                            Issued: {new Date(cert.issueDate).toLocaleDateString()}
                          </Typography>
                          {cert.expirationDate && (
                            <Typography variant="small">
                              Valid until: {new Date(cert.expirationDate).toLocaleDateString()}
                            </Typography>
                          )}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2">
                          {cert.pdfUrl && (
                            <Button
                              size="sm"
                              variant="outlined"
                              className="flex items-center justify-center gap-1 bg-blue-900 text-blue-400 hover:bg-blue-800 border-blue-700"
                              onClick={() => handleDownloadCertificate(cert.certificatId)}
                            >
                              <ArrowDownTrayIcon className="h-4 w-4" />
                              <span>Download</span>
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outlined"
                            className="flex items-center justify-center gap-1 bg-green-900 text-green-400 hover:bg-green-800 border-green-700"
                            onClick={() => handleVerifyCertificate(cert.verificationCode)}
                          >
                            <DocumentIcon className="h-4 w-4" />
                            <span>Verify</span>
                          </Button>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            ) : (
              <Typography className="text-gray-500 italic">
                No certificates available
              </Typography>
            )}
          </div>
        </div>

        {/* Edit User Modal */}
        {userToUpdate !== null && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <Typography variant="h3" className="text-2xl font-bold text-blue-300">
                  Edit User: {userToUpdate.username}
                </Typography>
                <button
                  onClick={() => setUserToUpdate(null)}
                  className="text-gray-400 hover:text-gray-300"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Typography variant="small" className="text-gray-400 mb-1">
                    Username
                  </Typography>
                  <Input
                    size="lg"
                    name="username"
                    value={updateForm.username}
                    onChange={handleUpdateFormChange}
                    className="!border-2 !border-blue-700 focus:!border-blue-400 !bg-gray-800 text-white"
                  />
                </div>
                <div>
                  <Typography variant="small" className="text-gray-400 mb-1">
                    First Name
                  </Typography>
                  <Input
                    size="lg"
                    name="firstname"
                    value={updateForm.firstname}
                    onChange={handleUpdateFormChange}
                    className="!border-2 !border-blue-700 focus:!border-blue-400 !bg-gray-800 text-white"
                  />
                </div>
                <div>
                  <Typography variant="small" className="text-gray-400 mb-1">
                    Last Name
                  </Typography>
                  <Input
                    size="lg"
                    name="lastname"
                    value={updateForm.lastname}
                    onChange={handleUpdateFormChange}
                    className="!border-2 !border-blue-700 focus:!border-blue-400 !bg-gray-800 text-white"
                  />
                </div>
                <div>
                  <Typography variant="small" className="text-gray-400 mb-1">
                    Email
                  </Typography>
                  <Input
                    size="lg"
                    name="email"
                    type="email"
                    value={updateForm.email}
                    onChange={handleUpdateFormChange}
                    className="!border-2 !border-blue-700 focus:!border-blue-400 !bg-gray-800 text-white"
                  />
                </div>
                <div>
                  <Typography variant="small" className="text-gray-400 mb-1">
                    New Password
                  </Typography>
                  <Input
                    size="lg"
                    name="password"
                    type="password"
                    value={updateForm.password}
                    onChange={handleUpdateFormChange}
                    className="!border-2 !border-blue-700 focus:!border-blue-400 !bg-gray-800 text-white"
                  />
                </div>
                {updateForm.password && (
                  <div>
                    <Typography variant="small" className="text-gray-400 mb-1">
                      Confirm Password
                    </Typography>
                    <Input
                      size="lg"
                      name="confirmPassword"
                      type="password"
                      value={updateForm.confirmPassword}
                      onChange={handleUpdateFormChange}
                      className="!border-2 !border-blue-700 focus:!border-blue-400 !bg-gray-800 text-white"
                    />
                  </div>
                )}
              </div>

              <div className="mt-6">
                <Typography variant="h6" className="text-lg font-semibold text-gray-300 mb-3">
                  Update CV
                </Typography>
                <div className="flex items-center gap-4">
                  {userToUpdate.cv?.cvFile && (
                    <a
                      href={`http://localhost:5054/uploads/${userToUpdate.cv.cvFile}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline flex items-center gap-2"
                    >
                      <DocumentIcon className="h-5 w-5" />
                      Current CV
                    </a>
                  )}
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className="block w-full text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-2 file:border-blue-700 file:text-sm file:font-semibold file:bg-blue-900 file:text-blue-300 hover:file:bg-blue-800"
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-4">
                <Button
                  onClick={() => setUserToUpdate(null)}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-gray-100 rounded-lg font-medium"
                >
                  Cancel
                </Button>
                <Button
                  onClick={updateUser}
                  className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium"
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Delete User Confirmation Modal */}
        {userToDelete !== null && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl shadow-2xl p-6 max-w-md w-full">
              <div className="text-center">
                <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <Typography variant="h3" className="text-lg font-medium text-gray-100 mt-3">
                  Delete User?
                </Typography>
                <Typography className="mt-2 text-gray-400">
                  This action cannot be undone. All user data will be permanently removed.
                </Typography>
              </div>
              <div className="mt-6 flex justify-center gap-4">
                <Button
                  onClick={() => setUserToDelete(null)}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-gray-100 rounded-lg font-medium"
                >
                  Cancel
                </Button>
                <Button
                  onClick={deleteUser}
                  className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-lg font-medium"
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default ProfilePage;