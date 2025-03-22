'use client'; // Mark this as a Client Component

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // Use next/navigation for routing
import { Typography, Card, CardBody, Button } from '@material-tailwind/react';
import { UserIcon, EnvelopeIcon, DocumentIcon, CalendarIcon, ArrowDownTrayIcon, AcademicCapIcon } from '@heroicons/react/24/solid';

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
  const router = useRouter(); // Initialize useRouter

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

        setUser({
          ...userData,
          courses: coursesData.slice(0, 3), // Only take the first 3 courses
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId]);

  const handleCourseClick = (courseId: number) => {
    // Navigate to the completion status page
    router.push(`/Pages/UserPages/CourseCompletionStatus/${userId}/${courseId}`);
  };

  if (loading) {
    return <Typography className="text-center text-gray-600">Loading profile...</Typography>;
  }

  if (error) {
    return <Typography className="text-center text-red-500">Error: {error}</Typography>;
  }

  if (!user) {
    return <Typography className="text-center text-gray-600">User not found</Typography>;
  }

  return (
    <section className="w-full max-w-4xl mx-auto flex flex-col items-center px-4 py-10">
      <Typography variant="h2" className="text-center mb-8" color="blue-gray">
        User Profile
      </Typography>
      <Card className="w-full shadow-lg">
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
                    {user.courses.map((course) => (
                      <div
                        key={course.formationId}
                        className="flex items-center gap-4 cursor-pointer hover:bg-gray-100 p-2 rounded"
                        onClick={() => handleCourseClick(course.moodleCourseId)}
                      >
                        <AcademicCapIcon className="h-6 w-6 text-blue-gray-500" />
                        <Typography className="font-normal text-gray-700">
                          <span className="font-semibold">{course.fullname}</span> ({course.shortname})
                        </Typography>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4 mt-6">
                <div onClick={() => alert('Edit profile clicked')}>
                  <Button
                    color="blue"
                    className="flex items-center gap-2"
                  >
                    Edit Profile
                  </Button>
                </div>
                <div onClick={() => alert('Delete profile clicked')}>
                  <Button
                    color="red"
                    className="flex items-center gap-2"
                  >
                    Delete Profile
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </section>
  );
};

export default ProfilePage;