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
  ArrowDownIcon,
  ArrowUpIcon,
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
  itemname: string;
  graderaw: number | null;
  percentageformatted: string;
  datesubmitted?: number;
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
  const [sortConfig, setSortConfig] = useState<{key: keyof MoodleGradeItem; direction: 'asc' | 'desc'} | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        
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

        setCompletionStatus(completionData.completionStatus);
        setGrades(gradesData || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, courseId]);

  const requestSort = (key: keyof MoodleGradeItem) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedGrades = [...grades].sort((a, b) => {
    if (!sortConfig) return 0;
    
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    
    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;
    
    if (aValue < bValue) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return 'Not submitted';
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const getSortIcon = (key: keyof MoodleGradeItem) => {
    if (!sortConfig || sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' 
      ? <ArrowUpIcon className="h-4 w-4 ml-1 inline" />
      : <ArrowDownIcon className="h-4 w-4 ml-1 inline" />;
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
                  {completionStatus?.percentageCompletion || 0}%
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
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => requestSort('itemname')}
                    >
                      <span className="flex items-center">
                        Activity
                        {getSortIcon('itemname')}
                      </span>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => requestSort('graderaw')}
                    >
                      <span className="flex items-center">
                        Grade
                        {getSortIcon('graderaw')}
                      </span>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => requestSort('percentageformatted')}
                    >
                      <span className="flex items-center">
                        Percentage
                        {getSortIcon('percentageformatted')}
                      </span>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => requestSort('datesubmitted')}
                    >
                      <span className="flex items-center">
                        Submitted
                        {getSortIcon('datesubmitted')}
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedGrades.map((grade) => (
                    <tr key={grade.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <AcademicCapIcon className="h-5 w-5 text-blue-500 mr-2" />
                          <Typography variant="small" className="font-medium text-gray-900">
                            {grade.itemname}
                          </Typography>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Typography variant="small" className="text-gray-500">
                          {grade.graderaw?.toFixed(2) ?? 'N/A'}
                        </Typography>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Typography variant="small" className="text-gray-500">
                          {grade.percentageformatted || 'N/A'}
                        </Typography>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Typography variant="small" className="text-gray-500">
                          {formatDate(grade.datesubmitted)}
                        </Typography>
                      </td>
                    </tr>
                  ))}
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