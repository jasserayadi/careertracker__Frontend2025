'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Typography, 
  Card, 
  CardBody
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

interface CourseCompletionStatus {
  completed: boolean;
  aggregation: number;
  completions: {
    type: number;
    title: string;
    status: string;
    complete: boolean;
    timecompleted?: number;
    details: {
      type: string;
      criteria: string;
      requirement: string;
      status: string;
    };
  }[];
  percentageCompletion: number;
}

const ProfilePage = ({ userId }: ProfilePageProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAllCourses, setShowAllCourses] = useState(false);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [courseCompletions, setCourseCompletions] = useState<Record<number, boolean>>({});
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
        const [userResponse, coursesResponse] = await Promise.all([
          fetch(`http://localhost:5054/api/users/id/${userId}`),
          fetch(`http://localhost:5054/api/Inscription/ByUser/${userId}`),
        ]);

        if (!userResponse.ok || !coursesResponse.ok) {
          throw new Error('Failed to fetch user profile or courses');
        }

        const userData = await userResponse.json();
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

        setUser({
          ...userData,
          courses: coursesData.slice(0, 3),
        });
        setAllCourses(coursesData);
        setCourseCompletions(completionMap);
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
    <div className="pl-6 pr-4 py-10"> {/* Changed to left-aligned container */}
      <Typography variant="h2" className="text-left mb-8" color="blue-gray"> {/* Left-aligned heading */}
        User Profile
      </Typography>
      <Card className="w-full md:w-[600px] shadow-lg">{/* Removed mx-auto */}
        <CardBody className="p-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* User Avatar Section */}
            <div className="flex items-center justify-center md:justify-start">
              <div className="relative w-32 h-32 rounded-full bg-blue-gray-100 flex items-center justify-center">
                <UserIcon className="h-16 w-16 text-blue-gray-500" />
              </div>
            </div>

            {/* User Details Section */}
            <div className="flex-1">
              <Typography variant="h3" color="blue-gray" className="mb-6">
                {user.firstname} {user.lastname}
              </Typography>

              {/* Email */}
              <div className="flex items-center gap-4 mb-4">
                <EnvelopeIcon className="h-6 w-6 text-blue-gray-500" />
                <Typography className="font-normal text-gray-700">
                  <span className="font-semibold">Email:</span> {user.email}
                </Typography>
              </div>

              {/* Role */}
              <div className="flex items-center gap-4 mb-4">
                <DocumentIcon className="h-6 w-6 text-blue-gray-500" />
                <Typography className="font-normal text-gray-700">
                  <span className="font-semibold">Role:</span> {user.role?.roleName || 'No role'}
                </Typography>
              </div>

              {/* Member Since */}
              <div className="flex items-center gap-4 mb-4">
                <CalendarIcon className="h-6 w-6 text-blue-gray-500" />
                <Typography className="font-normal text-gray-700">
                  <span className="font-semibold">Member since:</span> {user.dateCreation
                    ? new Date(user.dateCreation).toLocaleDateString()
                    : 'Not specified'}
                </Typography>
              </div>

              {/* CV Download */}
              {user.cv?.cvFile && (
                <div className="flex items-center gap-4 mb-4">
                  <ArrowDownTrayIcon className="h-6 w-6 text-blue-gray-500" />
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

              {/* Courses Section */}
              {user.courses && user.courses.length > 0 && (
                <div className="mt-6">
                  <Typography variant="h4" color="blue-gray" className="mb-4">
                    Enrolled Courses
                  </Typography>
                  <div className="space-y-4">
                    {(showAllCourses ? allCourses : user.courses).map((course) => (
                      <div
                        key={course.formationId}
                        className="flex items-center justify-between gap-4 cursor-pointer hover:bg-gray-100 p-3 rounded-lg"
                        onClick={() => handleCourseClick(course.moodleCourseId)}
                      >
                        <div className="flex items-center gap-4">
                          <AcademicCapIcon className="h-6 w-6 text-blue-gray-500" />
                          <div>
                            <Typography className="font-semibold text-gray-900">
                              {course.fullname}
                            </Typography>
                            <Typography variant="small" className="text-gray-600">
                              {course.shortname}
                            </Typography>
                          </div>
                        </div>
                        {courseCompletions[course.moodleCourseId] ? (
                          <div className="flex items-center gap-1 text-green-500">
                            <CheckCircleIcon className="h-5 w-5" />
                            <Typography variant="small">Completed</Typography>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-amber-500">
                            <XCircleIcon className="h-5 w-5" />
                            <Typography variant="small">In Progress</Typography>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {/* View All Courses Button */}
                  {allCourses.length > 3 && (
                    <button
                      className="flex items-center gap-2 mt-4 text-blue-500 hover:text-blue-700"
                      onClick={toggleAllCourses}
                    >
                      {showAllCourses ? 'Show Less' : `View All ${allCourses.length} Courses`}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="h-5 w-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d={showAllCourses ? "M19.5 12h-15" : "M19.5 8.25l-7.5 7.5-7.5-7.5"}
                        />
                      </svg>
                    </button>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4 mt-6">
                <button
                  onClick={handleEditProfile}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center gap-2"
                >
                  Edit Profile
                </button>
                <button
                  onClick={handleDeleteProfile}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded flex items-center gap-2"
                >
                  Delete Profile
                </button>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default ProfilePage;