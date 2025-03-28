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

const CourseCompletionStatus = () => {
  const params = useParams();
  const userId = params.userId as string;
  const courseId = params.courseId as string;
  
  const [completionStatus, setCompletionStatus] = useState<CompletionStatus | null>(null);
  const [grades, setGrades] = useState<MoodleGradeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [syncStatus, setSyncStatus] = useState<{ loading: boolean; error?: string; success?: boolean }>({ loading: false });
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
                                         
        // First, sync enrollments
        setSyncStatus({ loading: true });
        const syncRes = await fetch(`http://localhost:5054/api/Inscription/SyncEnrollments/${courseId}`, {
          method: 'POST'
        });
        
        if (!syncRes.ok) {
          throw new Error('Failed to sync enrollments');
        }
        
        setSyncStatus({ loading: false, success: true });
        
        // Then fetch completion status and grades
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
          {grades.length === 0 ? (
            <Typography variant="paragraph" className="font-normal text-gray-700 text-center py-8">
              No grade items available for this course
            </Typography>
          ) : (
            <div className="overflow-x-auto">
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
            </div>
          )}
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
    </section>
  );
};

export default CourseCompletionStatus;