'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Typography } from '@material-tailwind/react';
import {
  ChartPieIcon,
  CloudArrowDownIcon,
  CloudIcon,
  CheckCircleIcon,
  XCircleIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/solid';

import BackgroundCard from '@/app/Components/background-card';

interface OptionProps {
  icon: React.ElementType;
  title: string;
  children?: React.ReactNode;
  showStatusIcon?: boolean;
  isComplete?: boolean;
}

interface CompletionStatus {
  completed: boolean;
  aggregation: number;
  completions: {
    type: number;
    title: string;
    status: string;
    complete: boolean;
    timeCompleted?: number;
    details: {
      type: string;
      criteria: string;
      requirement: string;
      status: string;
    };
  }[];
  percentageCompletion: number;
}

interface MoodleGradeItem {
  id: number;
  itemName?: string;
  gradeRaw?: number | null;
  percentageformatted?: string | null;
  dateSubmitted?: number | null;
}

interface FeedbackData {
  userId: number;
  formationId: number;
  rate: number;
  message: string;
}

function Option({ icon: Icon, title, children, showStatusIcon = false, isComplete }: OptionProps) {
  return (
    <div className="flex gap-4">
      <div className="mb-4">
        {showStatusIcon ? (
          isComplete ? (
            <CheckCircleIcon className="text-green-500 h-6 w-6" />
          ) : (
            <XCircleIcon className="text-red-500 h-6 w-6" />
          )
        ) : (
          <Icon className="text-gray-900 h-6 w-6" />
        )}
      </div>
      <div>
        <Typography variant="h5" color="blue-gray" className="mb-2">
          {title}
        </Typography>
        {children && (
          <Typography className="mb-2 md:w-10/12 font-normal !text-gray-500">
            {children}
          </Typography>
        )}
      </div>
    </div>
  );
}

function extractActivityLink(criteria: string): { text: string; href: string } {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(criteria, 'text/html');
    const anchor = doc.querySelector('a');
    return anchor 
      ? { text: anchor.textContent || criteria, href: anchor.getAttribute('href') || '#' }
      : { text: criteria, href: '#' };
  } catch (error) {
    console.error('Error parsing criteria:', error);
    return { text: criteria, href: '#' };
  }
}

const StarRating = ({ value, onChange }: { value: number; onChange: (rating: number) => void }) => {
  const [hover, setHover] = useState(0);

  const renderStar = (index: number) => {
    const rating = hover || value;
    if (index < Math.floor(rating)) {
      // Full star
      return (
        <svg
          key={index}
          className="w-6 h-6 fill-yellow-400"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M12 2l2.582 5.233 5.778.798-4.189 4.077.989 5.767L12 17.667l-5.16 2.208.989-5.767-4.189-4.077 5.778-.798z" />
        </svg>
      );
    } else if (index === Math.floor(rating) && rating % 1 !== 0) {
      // Partial star
      const fillPercentage = (rating % 1) * 100;
      return (
        <svg
          key={index}
          className="w-6 h-6"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <clipPath id={`clip-${index}`}>
              <rect x="0" y="0" width={`${fillPercentage}%`} height="24" />
            </clipPath>
          </defs>
          <path
            d="M12 2l2.582 5.233 5.778.798-4.189 4.077.989 5.767L12 17.667l-5.16 2.208.989-5.767-4.189-4.077 5.778-.798z"
            fill="yellow-400"
            clipPath={`url(#clip-${index})`}
          />
          <path
            d="M12 2l2.582 5.233 5.778.798-4.189 4.077.989 5.767L12 17.667l-5.16 2.208.989-5.767-4.189-4.077 5.778-.798z"
            fill="none"
            stroke="yellow-400"
            strokeWidth="1"
          />
        </svg>
      );
    } else {
      // Outline star
      return (
        <svg
          key={index}
          className="w-6 h-6"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 2l2.582 5.233 5.778.798-4.189 4.077.989 5.767L12 17.667l-5.16 2.208.989-5.767-4.189-4.077 5.778-.798z"
            fill="none"
            stroke="yellow-400"
            strokeWidth="1"
          />
        </svg>
      );
    }
  };

  return (
    <div className="flex gap-1">
      {[0, 1, 2, 3, 4].map((index) => (
        <span
          key={index}
          onMouseEnter={() => setHover(index + 1)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(index + 1)} // Updated to allow up to 5
          className="cursor-pointer"
        >
          {renderStar(index)}
        </span>
      ))}
    </div>
  );
};

const EmpCourseCompletionStatus = () => {
  const params = useParams();
  const userId = params.userId as string;
  const courseId = params.courseId as string;
  
  const [completionStatus, setCompletionStatus] = useState<CompletionStatus | null>(null);
  const [grades, setGrades] = useState<MoodleGradeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [syncStatus, setSyncStatus] = useState<{ loading: boolean; error?: string; success?: boolean }>({ loading: false });
  const [feedback, setFeedback] = useState<FeedbackData>({
    userId: parseInt(userId),
    formationId: parseInt(courseId),
    rate: 0,
    message: '',
  });
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
                                         
        setSyncStatus({ loading: true });
        const syncRes = await fetch(`http://localhost:5054/api/Inscription/SyncEnrollments/${courseId}`, {
          method: 'POST'
        });
        
        if (!syncRes.ok) {
          throw new Error('Failed to sync enrollments');
        }
        
        setSyncStatus({ loading: false, success: true });
        
        const [completionRes, gradesRes] = await Promise.all([
          fetch(`http://localhost:5054/api/users/completion/${userId}/${courseId}`),
          fetch(`http://localhost:5054/api/users/grades/${courseId}/${userId}`)
        ]);

        if (!completionRes.ok) throw new Error('Failed to fetch completion status');
        if (!gradesRes.ok) throw new Error('Failed to fetch grades');

        const completionData = await completionRes.json();
        const gradesData = await gradesRes.json();

        if (!completionData.completionStatus) {
          throw new Error('Completion status data not found');
        }

        const safeGrades = (gradesData || []).map((grade: any) => ({
          id: grade.id || 0,
          itemName: grade.itemName || 'Unnamed Activity',
          gradeRaw: grade.gradeRaw ?? null,
          percentageformatted: grade.percentageformatted || '100.00 %',
          dateSubmitted: grade.dateSubmitted ?? null
        }));

        setCompletionStatus(completionData.completionStatus);
        setGrades(safeGrades);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred';
        setError(errorMessage);
        setSyncStatus({ loading: false, error: errorMessage });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, courseId]);

  const formatDate = (timestamp?: number | null) => {
    if (!timestamp) return 'Not submitted';
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5054/api/Feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedback),
      });

      if (res.ok) {
        setFeedbackSubmitted(true);
        setFeedback({ ...feedback, rate: 0, message: '' });
      } else {
        throw new Error('Failed to submit feedback');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while submitting feedback');
    }
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
          We couldn't load your course data. Please try again later.
        </Typography>
        {process.env.NODE_ENV === 'development' && (
          <Typography variant="small" className="text-center text-red-400 mt-2">
            Error: {error}
          </Typography>
        )}
      </div>
    );
  }

  return (
    <section className="w-full max-w-4xl mx-auto flex flex-col items-center px-4 py-10">
      <Typography variant="h2" className="text-center mb-2" color="blue-gray">
        Course Progress Overview
      </Typography>
      <Typography
        variant="lead"
        className="mb-16 w-full text-center font-normal !text-gray-500 lg:w-10/12"
      >
        Track your completion status and grades for this course
      </Typography>

      {/* Overall Progress */}
      <div className="w-full mb-16">
        <BackgroundCard title="Overall Progress">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2 p-4 bg-blue-gray-50 rounded-lg">
              {completionStatus?.completed ? (
                <CheckCircleIcon className="text-green-500 h-5 w-5" />
              ) : (
                <XCircleIcon className="text-red-500 h-5 w-5" />
              )}
              <div>
                <Typography variant="small" className="font-semibold text-gray-700">
                  Course Completion
                </Typography>
                <Typography variant="paragraph">
                  {completionStatus?.completed ? 'Completed' : 'In Progress'}
                </Typography>
              </div>
            </div>

            <div className="flex items-center gap-2 p-4 bg-blue-gray-50 rounded-lg">
              <ChartPieIcon className="text-blue-500 h-5 w-5" />
              <div>
                <Typography variant="small" className="font-semibold text-gray-700">
                  Progress
                </Typography>
                <Typography variant="paragraph">
                  {completionStatus?.percentageCompletion?.toFixed(0) || 0}%
                </Typography>
              </div>
            </div>

            <div className="flex items-center gap-2 p-4 bg-blue-gray-50 rounded-lg">
              <AcademicCapIcon className="text-amber-500 h-5 w-5" />
              <div>
                <Typography variant="small" className="font-semibold text-gray-700">
                  Grade Items
                </Typography>
                <Typography variant="paragraph">
                  {grades.length} activities
                </Typography>
              </div>
            </div>
          </div>
        </BackgroundCard>
      </div>

      {/* Grades Section */}
      <div className="w-full mb-16">
        <BackgroundCard title="Grades Overview">
          <div className="overflow-x-auto">
            {grades.length === 0 ? (
              <Typography variant="paragraph" className="font-normal text-gray-700 text-center py-8">
                No grade items available for this course
              </Typography>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ACTIVITY
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      GRADE
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      PERCENTAGE
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      SUBMITTED
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {grades.map((grade) => {
                    const hasGrade = grade.gradeRaw !== null && grade.gradeRaw !== undefined;
                    const gradeValue = hasGrade ? grade.gradeRaw?.toFixed(2) : 'N/A';
                    const percentage = grade.percentageformatted || '100.00 %';
                    const submittedStatus = grade.dateSubmitted ? 'Submitted' : 'Not submitted';

                    return (
                      <tr key={grade.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <input 
                              type="checkbox" 
                              checked={hasGrade}
                              readOnly
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <Typography variant="small" className="font-medium text-gray-900 ml-2">
                              {grade.itemName || 'Unnamed Activity'}
                            </Typography>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Typography variant="small" className="text-gray-500">
                            {gradeValue}
                          </Typography>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Typography variant="small" className="text-gray-500">
                            {percentage}
                          </Typography>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Typography variant="small" className="text-gray-500">
                            {submittedStatus}
                          </Typography>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </BackgroundCard>
      </div>

      {/* Activity Completion */}
      {completionStatus?.completions && completionStatus.completions.length > 0 && (
        <div className="w-full">
          <Typography variant="h3" className="mb-6" color="blue-gray">
            Activity Completion
          </Typography>
          
          {completionStatus.completions.map((completion, index) => {
            const { text, href } = extractActivityLink(completion.details.criteria);

            return (
              <div key={index} className="grid grid-cols-1 items-center md:grid-cols-2 gap-12 mb-16">
                {index % 2 === 0 ? (
                  <>
                    <BackgroundCard title={completion.title}>
                      <Typography variant="paragraph" className="font-normal text-gray-700">
                        <span className="font-semibold">Criteria:</span>{' '}
                        <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                          {text}
                        </a>
                      </Typography>
                    </BackgroundCard>
                    <div className="space-y-8">
                      <Option
                        icon={CloudIcon}
                        title={
                          completion.details.criteria.toLowerCase().includes('quiz')
                            ? `Quiz: ${completion.complete ? 'Done' : 'To Do'}`
                            : `Activity: ${completion.complete ? 'Done' : 'To Do'}`
                        }
                      />
                      <Option 
                        icon={ChartPieIcon} 
                        title="Completion Status"
                        showStatusIcon
                        isComplete={completion.complete}
                      />
                      {completion.timeCompleted && (
                        <Option 
                          icon={CloudArrowDownIcon} 
                          title="Completed On"
                        >
                          {new Date(completion.timeCompleted * 1000).toLocaleString()}
                        </Option>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-8">
                      <Option
                        icon={CloudIcon}
                        title={
                          completion.details.criteria.toLowerCase().includes('quiz')
                            ? `Quiz: ${completion.complete ? 'Done' : 'To Do'}`
                            : `Activity: ${completion.complete ? 'Done' : 'To Do'}`
                        }
                      />
                      <Option 
                        icon={ChartPieIcon} 
                        title="Completion Status"
                        showStatusIcon
                        isComplete={completion.complete}
                      />
                      {completion.timeCompleted && (
                        <Option 
                          icon={CloudArrowDownIcon} 
                          title="Completed On"
                        >
                          {new Date(completion.timeCompleted * 1000).toLocaleString()}
                        </Option>
                      )}
                    </div>
                    <BackgroundCard title={completion.title}>
                      <Typography variant="paragraph" className="font-normal text-gray-700">
                        <span className="font-semibold">Criteria:</span>{' '}
                        <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                          {text}
                        </a>
                      </Typography>
                    </BackgroundCard>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Feedback Button */}
      <div className="w-full mb-16">
        <BackgroundCard>
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200"
          >
            Provide Feedback
          </button>
        </BackgroundCard>
      </div>

      {/* Feedback Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <button
              onClick={() => setIsModalOpen(false)}
              className="float-right text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
            {feedbackSubmitted ? (
              <div className="text-center">
                <Typography variant="paragraph" className="text-green-600 py-4">
                  Thank you for your feedback!
                </Typography>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setFeedbackSubmitted(false);
                  }}
                  className="mt-4 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleFeedbackSubmit} className="space-y-6">
                <Typography variant="h4" className="text-center mb-4">Provide Feedback</Typography>
                <div>
                  <Typography variant="small" className="font-semibold text-gray-700 mb-2">
                    Rate This Course
                  </Typography>
                  <StarRating value={feedback.rate} onChange={(rate) => setFeedback({ ...feedback, rate })} />
                </div>
                <div>
                  <Typography variant="small" className="font-semibold text-gray-700 mb-2">
                    Your Feedback
                  </Typography>
                  <textarea
                    value={feedback.message}
                    onChange={(e) => setFeedback({ ...feedback, message: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y text-gray-900"
                    rows={4}
                    maxLength={1000}
                    placeholder="Share your thoughts about the course..."
                    style={{ color: '#1f2937' }}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200"
                >
                  Submit Feedback
                </button>
                {error && (
                  <Typography variant="small" className="text-center text-red-600 mt-2">
                    {error}
                  </Typography>
                )}
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default EmpCourseCompletionStatus;