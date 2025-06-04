'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Typography, 
  Card, 
  CardBody,
  Button
} from '@material-tailwind/react';
import { 
  UserIcon, 
  EnvelopeIcon, 
  DocumentIcon, 
  CalendarIcon, 
  ArrowDownTrayIcon, 
  AcademicCapIcon,
  CheckCircleIcon,
  XCircleIcon
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

interface User {
  userId: number;
  username: string;
  firstname: string;
  lastname: string;
  email: string;
  dateCreation?: string;
  moodleUserId: number;
  role?: {
    roleName: string;
  };
  cv?: {
    cvFile: string;
  };
  courses?: Course[];
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

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // Fetch user data
        const userResponse = await fetch(`http://localhost:5054/api/users/id/${userId}`);
        if (!userResponse.ok) throw new Error('Failed to fetch user profile');
        const userData = await userResponse.json();
        setUser(userData);

        // Try to fetch courses (but don't fail if this fails)
        try {
          const coursesResponse = await fetch(`http://localhost:5054/api/Inscription/ByUser/${userId}`);
          if (coursesResponse.ok) {
            const coursesData = await coursesResponse.json();
            
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

            setUser(prev => ({
              ...prev!,
              courses: coursesData.slice(0, 3),
            }));
            setAllCourses(coursesData);
            setCourseCompletions(completionMap);
          }
        } catch (coursesError) {
          console.error('Error fetching courses:', coursesError);
          // Continue even if courses fail to load
        }

        // Try to fetch certificates (but don't fail if this fails)
        try {
          const certificatesResponse = await fetch(`http://localhost:5054/api/certificates/user/${userId}`);
          if (certificatesResponse.ok) {
            setCertificates(await certificatesResponse.json());
          }
        } catch (certificatesError) {
          console.error('Error fetching certificates:', certificatesError);
          // Continue even if certificates fail to load
        }

      } catch (err) {
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

  const handleEditProfile = () => {
    alert('Edit profile clicked');
  };

  const handleDeleteProfile = () => {
    alert('Delete profile clicked');
  };

  const handleDownloadCertificate = async (certificateId: number) => {
    window.open(`http://localhost:5054/api/certificates/download/${certificateId}`, '_blank');
  };

  const handleVerifyCertificate = (verificationCode: string) => {
    window.open(`http://localhost:5054/api/certificates/verify/${verificationCode}`, '_blank');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4 max-w-4xl mx-auto my-8">
        <Typography variant="paragraph" className="text-center text-red-600">
          Error: {error}
        </Typography>
      </div>
    );
  }

  if (!user) {
    return (
      <Typography variant="paragraph" className="text-center text-gray-600 py-8">
        User not found
      </Typography>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Profile Section */}
        <div className="w-full lg:w-2/3">
          <Typography variant="h2" className="text-left mb-6" color="blue-gray">
            User Profile
          </Typography>
          
          <Card className="shadow-lg">
            <CardBody className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* User Avatar Section */}
                <div className="flex items-center justify-center md:justify-start">
                  <div className="relative w-28 h-28 rounded-full bg-blue-gray-100 flex items-center justify-center">
                    <UserIcon className="h-14 w-14 text-blue-gray-500" />
                  </div>
                </div>

                {/* User Details Section */}
                <div className="flex-1">
                  <Typography variant="h3" color="blue-gray" className="mb-4">
                    {user.firstname} {user.lastname}
                  </Typography>

                  <div className="space-y-3">
                    {/* Email */}
                    <div className="flex items-center gap-3">
                      <EnvelopeIcon className="h-5 w-5 text-blue-gray-500" />
                      <Typography className="font-normal">
                        <span className="font-semibold">Email:</span> {user.email}
                      </Typography>
                    </div>

                    {/* Role */}
                    <div className="flex items-center gap-3">
                      <DocumentIcon className="h-5 w-5 text-blue-gray-500" />
                      <Typography className="font-normal">
                        <span className="font-semibold">Role:</span> {user.role?.roleName || 'No role'}
                      </Typography>
                    </div>

                    {/* Member Since */}
                    <div className="flex items-center gap-3">
                      <CalendarIcon className="h-5 w-5 text-blue-gray-500" />
                      <Typography className="font-normal">
                        <span className="font-semibold">Member since:</span> {user.dateCreation
                          ? new Date(user.dateCreation).toLocaleDateString()
                          : 'Not specified'}
                      </Typography>
                    </div>

                    {/* CV Download */}
                    {user.cv?.cvFile && (
                      <div className="flex items-center gap-3">
                        <ArrowDownTrayIcon className="h-5 w-5 text-blue-gray-500" />
                        <a
                          href={`http://localhost:5054/uploads/${user.cv.cvFile}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline"
                        >
                          Download CV
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Courses Section */}
                  <div className="mt-6">
                    <Typography variant="h4" color="blue-gray" className="mb-3">
                      Enrolled Courses
                    </Typography>
                    {allCourses.length > 0 ? (
                      <>
                        <div className="space-y-3">
                          {(showAllCourses ? allCourses : allCourses.slice(0, 3)).map((course) => (
                            <div
                              key={course.formationId}
                              className="flex items-center justify-between gap-3 cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-colors"
                              onClick={() => handleCourseClick(course.moodleCourseId)}
                            >
                              <div className="flex items-center gap-3">
                                <AcademicCapIcon className="h-5 w-5 text-blue-gray-500" />
                                <div>
                                  <Typography className="font-semibold">
                                    {course.fullname}
                                </Typography>
                                  <Typography variant="small" className="text-gray-600">
                                    {course.shortname}
                                  </Typography>
                                </div>
                              </div>
                              {courseCompletions[course.moodleCourseId] ? (
                                <div className="flex items-center gap-1 text-green-500">
                                  <CheckCircleIcon className="h-4 w-4" />
                                  <Typography variant="small">Completed</Typography>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1 text-amber-500">
                                  <XCircleIcon className="h-4 w-4" />
                                  <Typography variant="small">In Progress</Typography>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                        
                        {/* View All Courses Button */}
                        {allCourses.length > 3 && (
                          <button
                            className="flex items-center gap-1 mt-3 text-blue-500 hover:text-blue-700 text-sm"
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
                                d={showAllCourses ? "M19.5 12h-15" : "M19.5 8.25l-7.5 7.5-7.5-7.5"}
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

                  {/* Action Buttons */}
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={handleEditProfile}
                      className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded text-sm"
                    >
                      Edit Profile
                    </button>
                    <button
                      onClick={handleDeleteProfile}
                      className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded text-sm"
                    >
                      Delete Profile
                    </button>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Right Column - Certificates */}
        {certificates.length > 0 ? (
          <div className="w-full lg:w-1/3 mt-8 lg:mt-0">
            <Typography variant="h4" color="blue-gray" className="mb-4">
              My Certificates
            </Typography>
            <div className="space-y-4">
              {certificates.map((cert) => (
                <Card key={cert.certificatId} className="hover:shadow-lg transition-shadow">
                  <CardBody className="p-4">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-3 mb-3">
                        <DocumentIcon className="h-6 w-6 text-blue-500" />
                        <Typography variant="h6" className="truncate">
                          {cert.certificatName}
                        </Typography>
                      </div>
                      
                      <div className="flex justify-between items-center mb-3">
                        <Typography variant="small">
                          Issued: {new Date(cert.issueDate).toLocaleDateString()}
                        </Typography>
                        {cert.expirationDate && (
                          <Typography variant="small">
                            Valid until: {new Date(cert.expirationDate).toLocaleDateString()}
                          </Typography>
                        )}
                      </div>

                      <div className="flex gap-2">
                        {cert.pdfUrl && (
                          <div 
                            className="flex-1 flex items-center justify-center gap-1 bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-2 rounded cursor-pointer"
                            onClick={() => handleDownloadCertificate(cert.certificatId)}
                          >
                            <ArrowDownTrayIcon className="h-4 w-4" />
                            <span className="text-sm">Download</span>
                          </div>
                        )}
                        <div 
                          className="flex-1 flex items-center justify-center gap-1 bg-green-50 text-green-600 hover:bg-green-100 px-3 py-2 rounded cursor-pointer"
                          onClick={() => handleVerifyCertificate(cert.verificationCode)}
                        >
                          <DocumentIcon className="h-4 w-4" />
                          <span className="text-sm">Verify</span>
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <div className="w-full lg:w-1/3 mt-8 lg:mt-0">
            <Typography variant="h4" color="blue-gray" className="mb-4">
              My Certificates
            </Typography>
            <Typography className="text-gray-500 italic">
              No certificates available
            </Typography>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;