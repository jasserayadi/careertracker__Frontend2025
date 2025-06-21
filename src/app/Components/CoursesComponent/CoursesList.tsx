'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardBody, Typography, Button, Spinner } from '@material-tailwind/react';

interface Course {
  courseId: number;
  name: string;
  summary?: string;
  content?: string;
  moodleCourseId?: number;
  moodleSectionId?: number;
  url?: string;
  modName?: string;
  modIcon?: string;
  modPurpose?: string;
  formationId: number;
  createdAt?: string;
  updatedAt?: string;
  test?: Test[];
  moodleBookId?: number;
}

interface Inscription {
  inscriptionId: number;
  inscriptionDate: string;
  user: {
    userId: number;
    username: string;
    firstname: string;
    lastname: string;
    email: string;
  };
}

interface Test {
  testId: number;
  title: string;
  courId?: Course;
  moodleQuizId?: number;
  questions: {
    questionId: number;
    questionType: string;
    choices: string[];
    correctAnswer: string;
    questionText?: string;
  }[];
}

interface Feedback {
  feedbackId: number;
  userId: number;
  formationId: number;
  rate: number;
  message: string;
  user: {
    username: string;
    firstname: string;
    lastname: string;
  };
  createdAt: string;
}

export const CoursesListClient = () => {
  const params = useParams();
  const formationId = params.formationId as string;

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [inscriptions, setInscriptions] = useState<Inscription[]>([]);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [bookSyncStatus, setBookSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [enrollmentSyncStatus, setEnrollmentSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [quizSyncStatus, setQuizSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');

  const [openQuizModal, setOpenQuizModal] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<Course | null>(null);
  const [quizDetails, setQuizDetails] = useState<Test[]>([]);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizError, setQuizError] = useState('');

  const [openBookModal, setOpenBookModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Course | null>(null);
  const [bookContent, setBookContent] = useState<string>('');
  const [bookLoading, setBookLoading] = useState(false);
  const [bookError, setBookError] = useState('');

  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackError, setFeedbackError] = useState('');

  const hasSyncedEnrollments = useRef(false);
  const isSyncing = useRef(false);
  const hasSyncedQuizzes = useRef(false);

  const syncEnrollments = async () => {
    if (isSyncing.current || hasSyncedEnrollments.current) {
      console.log('Enrollment sync already in progress or completed, skipping...');
      return;
    }

    isSyncing.current = true;
    try {
      setEnrollmentSyncStatus('syncing');
      setError('');
      const response = await fetch(
        `http://localhost:5054/api/Inscription/SyncEnrollments/${formationId}`,
        { method: 'POST' }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Enrollment synchronization failed: ${errorText}`);
      }

      hasSyncedEnrollments.current = true;
      setEnrollmentSyncStatus('success');
      const inscriptionsResponse = await fetch(`http://localhost:5054/api/Inscription/ByCourse/${formationId}`);
      const inscriptionsData = inscriptionsResponse.status === 404 ? [] : await inscriptionsResponse.json();
      setInscriptions(inscriptionsData);

      if (inscriptionsData.length > 0) {
        await syncQuizzes(inscriptionsData[0].user.userId);
      }
    } catch (err) {
      console.error('Error syncing enrollments:', err);
      setEnrollmentSyncStatus('error');
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during enrollment sync';
      setError(errorMessage);
    } finally {
      isSyncing.current = false;
    }
  };

  const syncQuizzes = async (userId: number) => {
    if (hasSyncedQuizzes.current) {
      console.log('Quiz sync already completed, skipping...');
      return;
    }

    try {
      setQuizSyncStatus('syncing');
      console.log(`Syncing quizzes for user ${userId}`);
      hasSyncedQuizzes.current = true;
      for (const course of courses) {
        if (course.modName === 'quiz' && course.moodleCourseId) {
          console.log(`Saving quizzes for course ${course.moodleCourseId}`);
          const saveResponse = await fetch(
            `http://localhost:5054/api/Quiz/save-quizzes/${course.moodleCourseId}/${userId}`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );

          if (!saveResponse.ok) {
            const errorData = await saveResponse.json();
            console.error(`Failed to save quizzes for course ${course.moodleCourseId}: ${errorData.message || 'Unknown error'}`);
            continue;
          }

          if (course.test) {
            for (const test of course.test) {
              if (test.moodleQuizId) {
                console.log(`Updating correct answers for quiz ${test.moodleQuizId}`);
                const updateResponse = await fetch(
                  `http://localhost:5054/api/Quiz/update-correct-answers/${test.moodleQuizId}/${userId}`,
                  {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                  }
                );

                if (!updateResponse.ok) {
                  const errorData = await updateResponse.json();
                  console.error(`Failed to update correct answers for quiz ${test.moodleQuizId}: ${errorData.message || 'Unknown error'}`);
                }
              }
            }
          }
        }
      }
      setQuizSyncStatus('success');
    } catch (err) {
      console.error('Error syncing quizzes:', err);
      setQuizSyncStatus('error');
      setError(err instanceof Error ? err.message : 'An error occurred during quiz sync');
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      setSyncStatus('syncing');
      const syncResponse = await fetch(
        `http://localhost:5054/api/Course/sync/${formationId}`,
        { method: 'POST' }
      );

      if (!syncResponse.ok) {
        throw new Error(`Course synchronization failed: ${syncResponse.statusText}`);
      }

      setBookSyncStatus('syncing');
      const bookSyncResponse = await fetch(
        `http://localhost:5054/api/Course/sync-books/${formationId}`,
        { method: 'POST' }
      );

      if (!bookSyncResponse.ok) {
        throw new Error(`Book ID synchronization failed: ${bookSyncResponse.statusText}`);
      }

      setSyncStatus('success');
      setBookSyncStatus('success');

      const coursesResponse = await fetch(`http://localhost:5054/api/Course/by-formation/${formationId}`);
      if (!coursesResponse.ok) throw new Error(`Failed to load courses: ${coursesResponse.statusText}`);
      const coursesData = await coursesResponse.json();
      console.log('Courses data:', coursesData);
      setCourses(coursesData);
    } catch (err) {
      console.error('Error fetching data:', err);
      setSyncStatus('error');
      setBookSyncStatus('error');
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchFeedbacks = async () => {
    try {
      setFeedbackLoading(true);
      setFeedbackError('');
      const response = await fetch(`http://localhost:5054/api/Feedback/formation/${formationId}`);
      if (!response.ok) throw new Error(`Failed to load feedbacks: ${response.statusText}`);
      const data = await response.json();
      setFeedbacks(data);
    } catch (err) {
      console.error('Fetch feedbacks error:', err);
      setFeedbackError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setFeedbackLoading(false);
    }
  };

  const handleOpenQuizModal = async (course: Course) => {
    setSelectedQuiz(course);
    setOpenQuizModal(true);
    setQuizLoading(true);
    setQuizError('');
    setQuizDetails([]);

    try {
      if (!course.moodleCourseId || isNaN(course.moodleCourseId)) {
        throw new Error('Invalid or missing Moodle course ID');
      }

      const moodleQuizId = course.test?.[0]?.moodleQuizId;
      console.log('Fetching quiz details:', {
        moodleCourseId: course.moodleCourseId,
        moodleQuizId: moodleQuizId,
        courseName: course.name,
      });

      const url = `http://localhost:5054/api/Quiz/by-course/${course.moodleCourseId}${
        moodleQuizId !== undefined && !isNaN(moodleQuizId) ? `?moodleQuizId=${moodleQuizId}` : ''
      }`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        let errorMessage = '';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || response.statusText;
        } catch {
          errorMessage = response.statusText || 'Unknown error';
        }

        if (response.status === 404) {
          setQuizError('No quiz found for this course.');
        } else if (response.status === 400) {
          setQuizError(`Bad request: ${errorMessage}`);
          console.error('Bad Request details:', errorMessage);
        } else {
          throw new Error(`Failed to load quiz details: ${errorMessage}`);
        }
      } else {
        const data = await response.json();
        setQuizDetails(data);
        if (data.length === 0) {
          setQuizError('No quiz details available for this course.');
        }
      }
    } catch (err) {
      console.error('Error fetching quiz details:', err);
      setQuizError(err instanceof Error ? err.message : 'An error occurred while fetching quiz details');
    } finally {
      setQuizLoading(false);
    }
  };

  const handleOpenBookModal = async (course: Course) => {
    setSelectedBook(course);
    setOpenBookModal(true);
    setBookLoading(true);
    setBookError('');
    setBookContent('');

    try {
      if (!course.moodleCourseId) {
        throw new Error('Course is not linked to Moodle');
      }

      const response = await fetch(
        `http://localhost:5054/api/Course/content/${course.moodleCourseId}`
      );

      if (!response.ok) {
        if (response.status === 404) {
          setBookError('Book content not found for this course.');
        } else {
          throw new Error(`Failed to load book content: ${response.statusText}`);
        }
      } else {
        const data = await response.json();
        setBookContent(data.content || '');
        if (!data.content) {
          setBookError('No book content available for this course.');
        }
      }
    } catch (err) {
      console.error('Error fetching book content:', err);
      setBookError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setBookLoading(false);
    }
  };

  const handleRetryAll = async () => {
    setLoading(true);
    setError('');
    setFeedbackError('');
    setSyncStatus('idle');
    setBookSyncStatus('idle');
    setEnrollmentSyncStatus('idle');
    setQuizSyncStatus('idle');
    hasSyncedEnrollments.current = false;
    isSyncing.current = false;
    hasSyncedQuizzes.current = false;

    try {
      await fetchData();
      await syncEnrollments();
      await fetchFeedbacks();
    } catch (err) {
      console.error('Retry all error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during retry');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchAllData = async () => {
      await fetchData();
      await syncEnrollments();
      await fetchFeedbacks();
    };

    fetchAllData();

    return () => {
      hasSyncedEnrollments.current = false;
      isSyncing.current = false;
      hasSyncedQuizzes.current = false;
    };
  }, [formationId]);

  if (loading || feedbackLoading || enrollmentSyncStatus === 'syncing' || quizSyncStatus === 'syncing') {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <div className="text-center">
          <Spinner className="h-16 w-16 text-blue-500 mb-4" />
          <Typography variant="h6" className="text-gray-300">
            {syncStatus === 'syncing' ? 'Synchronizing courses...' :
             enrollmentSyncStatus === 'syncing' ? 'Synchronizing enrollments...' :
             quizSyncStatus === 'syncing' ? 'Synchronizing quizzes...' :
             'Loading data...'}
          </Typography>
          {bookSyncStatus === 'syncing' && (
            <Typography variant="small" className="text-gray-400 mt-2">
              Synchronizing book IDs...
            </Typography>
          )}
        </div>
      </div>
    );
  }

  if (error || feedbackError || quizSyncStatus === 'error') {
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
              <p className="text-red-700">
                {error.includes('Concurrency error') ?
                  'A concurrency issue occurred during synchronization. Please try again.' :
                  `Error: ${error || feedbackError}`}
              </p>
              {bookSyncStatus === 'error' && (
                <p className="text-red-700 text-sm mt-1">(Book ID synchronization failed)</p>
              )}
              {enrollmentSyncStatus === 'error' && (
                <p className="text-red-700 text-sm mt-1">(Enrollment synchronization failed)</p>
              )}
              {quizSyncStatus === 'error' && (
                <p className="text-red-700 text-sm mt-1">(Quiz synchronization failed)</p>
              )}
              <div className="flex gap-3 mt-3">
                <Button 
                  onClick={handleRetryAll}
                  color="red"
                  variant="text"
                  className="flex items-center gap-1"
                >
                  Retry All
                </Button>
                {enrollmentSyncStatus === 'error' && (
                  <Button 
                    onClick={syncEnrollments}
                    disabled={isSyncing.current}
                    color="red"
                    variant="text"
                    className="flex items-center gap-1"
                  >
                    Retry Enrollment Sync
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 text-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <Typography variant="h1" className="text-4xl md:text-5xl font-extrabold text-blue-300 mb-4">
            Formation Management
          </Typography>
          <Typography className="text-xl text-gray-400 max-w-3xl mx-auto">
            Manage courses, enrollments, and feedback for this formation
          </Typography>
        </div>

        {syncStatus === 'error' && (
          <div className="bg-red-900 bg-opacity-50 border-l-4 border-red-500 p-4 mb-6 rounded">
            <Typography variant="paragraph" className="text-red-300">
              Course sync completed with errors. Data shown may be outdated.
            </Typography>
          </div>
        )}
        {enrollmentSyncStatus === 'error' && (
          <div className="bg-red-900 bg-opacity-50 border-l-4 border-red-500 p-4 mb-6 rounded">
            <Typography variant="paragraph" className="text-red-300">
              Enrollment sync completed with errors. Enrollment data shown may be outdated.
            </Typography>
          </div>
        )}

        <div className="flex justify-end mb-6">
          <button
            onClick={handleRetryAll}
            disabled={loading || isSyncing.current}
            className={`p-2 rounded-full transition-colors duration-300 ${
              loading || isSyncing.current
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-500'
            }`}
            title="Sync All Data"
          >
            <svg
              className={`w-6 h-6 text-white ${loading || isSyncing.current ? 'animate-spin' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-1/2">
            <Typography variant="h4" className="mb-4 text-blue-300">
              Courses in this Formation
            </Typography>
            <div className="space-y-4">
              {courses.length > 0 ? (
                courses.map((course) => (
                  <Card key={course.courseId} className="bg-gray-800 hover:bg-gray-700 transition-all duration-300 border-2 border-blue-700 hover:border-blue-500">
                    <CardBody>
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <Typography variant="h5" className="mb-2 text-blue-300">
                            {course.name}
                          </Typography>
                          {course.summary && (
                            <Typography variant="small" className="text-gray-400">
                              {course.summary}
                            </Typography>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {course.modName === 'quiz' && course.moodleCourseId && (
                            <Button
                              size="sm"
                              onClick={() => handleOpenQuizModal(course)}
                              disabled={!course.moodleCourseId || isNaN(course.moodleCourseId)}
                              className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600"
                            >
                              View Quiz
                            </Button>
                          )}
                          {course.modName === 'book' && (
                            <Button
                              size="sm"
                              onClick={() => handleOpenBookModal(course)}
                              className="bg-green-600 hover:bg-green-500"
                            >
                              View Book
                            </Button>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        {course.url && (
                          <div>
                            <Typography variant="small" className="font-semibold text-blue-300">
                              URL:
                            </Typography>
                            <a
                              href={course.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:underline break-all"
                            >
                              {course.url}
                            </a>
                          </div>
                        )}
                        {course.modName && (
                          <div>
                            <Typography variant="small" className="font-semibold text-blue-300">
                              Module:
                            </Typography>
                            <Typography variant="small" className="text-gray-400">
                              {course.modName}
                            </Typography>
                          </div>
                        )}
                      </div>
                    </CardBody>
                  </Card>
                ))
              ) : (
                <Typography variant="paragraph" className="text-gray-500 italic">
                  No courses available in this formation.
                </Typography>
              )}
            </div>
          </div>

          <div className="w-full lg:w-1/2">
            <Typography variant="h4" className="mb-4 text-blue-300">
              Enrolled Students
            </Typography>
            {inscriptions.length > 0 ? (
              <div className="space-y-4">
                {inscriptions.map((inscription) => (
                  <Card key={inscription.inscriptionId} className="bg-gray-800 hover:bg-gray-700 transition-all duration-300 border-2 border-blue-700 hover:border-blue-500">
                    <CardBody>
                      <Typography variant="h6" className="mb-1 text-blue-300">
                        {inscription.user.firstname} {inscription.user.lastname}
                      </Typography>
                      <Typography variant="small" className="text-gray-400">
                        <span className="font-semibold">Username:</span> {inscription.user.username}
                      </Typography>
                      <Typography variant="small" className="text-gray-400">
                        <span className="font-semibold">Email:</span> {inscription.user.email}
                      </Typography>
                      <Typography variant="small" className="text-gray-400">
                        <span className="font-semibold">Enrolled:</span> {new Date(inscription.inscriptionDate).toLocaleDateString()}
                      </Typography>
                    </CardBody>
                  </Card>
                ))}
              </div>
            ) : (
              <Typography variant="paragraph" className="text-gray-500 italic">
                No students enrolled in this formation.
              </Typography>
            )}
          </div>
        </div>

        <div className="mt-8 w-full">
          <Typography variant="h4" className="mb-4 text-blue-300">
            Feedbacks
          </Typography>
          {feedbacks.length > 0 ? (
            <div className="space-y-4">
              {feedbacks.map((feedback) => (
                <Card key={feedback.feedbackId} className="bg-gray-800 hover:bg-gray-700 transition-all duration-300 border-2 border-blue-700 hover:border-blue-500">
                  <CardBody>
                    <Typography variant="h6" className="mb-1 text-blue-300">
                      {feedback.user?.firstname || 'Unknown'} {feedback.user?.lastname || 'User'} ({feedback.user?.username || 'unknown'})
                    </Typography>
                    <div className="flex items-center mb-2">
                      <Typography variant="small" className="font-semibold text-gray-400 mr-2">
                        Rating:
                      </Typography>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-5 h-5 ${i < feedback.rate ? 'text-yellow-400' : 'text-gray-500'}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="ml-2 text-gray-400 text-sm">
                        ({feedback.rate}/5)
                      </span>
                    </div>
                    <Typography variant="small" className="text-gray-400 mb-2">
                      <span className="font-semibold">Date:</span> {new Date(feedback.createdAt).toLocaleDateString()}
                    </Typography>
                    {feedback.message && (
                      <Typography variant="small" className="text-gray-300">
                        {feedback.message}
                      </Typography>
                    )}
                  </CardBody>
                </Card>
              ))}
            </div>
          ) : (
            <Typography variant="paragraph" className="text-gray-500 italic">
              No feedbacks available for this formation.
            </Typography>
          )}
        </div>

        {openQuizModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col border-2 border-blue-700">
              <div className="px-6 py-4 border-b border-gray-700 bg-gray-900 rounded-t-xl">
                <h3 className="text-xl font-semibold text-blue-300">
                  {selectedQuiz?.name || 'Quiz Details'}
                </h3>
              </div>
              <div className="p-6 overflow-y-auto flex-1">
                {quizLoading ? (
                  <div className="flex justify-center items-center h-32">
                    <Spinner className="h-10 w-10 text-blue-500" />
                    <Typography variant="small" className="ml-4 text-gray-300">
                      Loading quiz details for {selectedQuiz?.name || 'course'}...
                    </Typography>
                  </div>
                ) : quizError ? (
                  <div className="text-red-400 text-center py-4">
                    <p>{quizError}</p>
                    <p className="text-sm mt-2">Please ensure the course is properly linked to Moodle and try again.</p>
                    <Button
                      onClick={() => handleOpenQuizModal(selectedQuiz!)}
                      className="bg-blue-600 hover:bg-blue-500 mt-4"
                    >
                      Retry
                    </Button>
                  </div>
                ) : quizDetails.length > 0 ? (
                  <div className="space-y-6">
                    {quizDetails.map((test, testIndex) => (
                      <div key={test.testId} className="border border-gray-700 rounded-lg p-6 bg-gray-700">
                        <h4 className="text-lg font-semibold text-blue-300 mb-4">{test.title}</h4>
                        {test.questions.length > 0 ? (
                          test.questions.map((question, questionIndex) => (
                            <div key={question.questionId} className="mb-6">
                              <h5 className="text-md font-medium text-blue-200 mb-2">
                                Question {questionIndex + 1}: {question.questionText || 'Question'}
                              </h5>
                              <div className="space-y-3 mb-4">
                                {question.choices?.map((choice, i) => (
                                  <div key={i} className="flex items-center gap-3">
                                    <span className="bg-gray-600 text-gray-300 rounded-full w-6 h-6 flex items-center justify-center text-sm">
                                      {String.fromCharCode(65 + i)}
                                    </span>
                                    <span className="text-gray-300">{choice}</span>
                                  </div>
                                ))}
                              </div>
                              {question.correctAnswer && (
                                <div className="bg-green-900 bg-opacity-50 p-4 rounded-md border border-green-800">
                                  <p className="font-semibold text-green-300 text-sm mb-1">Correct Answer:</p>
                                  <p className="text-green-300 font-medium">{question.correctAnswer}</p>
                                </div>
                              )}
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500">No questions available for this test.</p>
                        )}
                      </div>
                    ))}
                    {selectedQuiz?.moodleCourseId && (
                      <div className="text-center">
                        <a
                          href={`http://localhost/blymoodol/mod/quiz/view.php?id=${selectedQuiz.moodleCourseId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:underline text-sm"
                        >
                          View full quiz on Moodle
                        </a>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-4">No quiz details available</p>
                )}
              </div>
              <div className="px-4 py-3 border-t border-gray-700 bg-gray-900 rounded-b-xl flex justify-end">
                <Button
                  onClick={() => {
                    setOpenQuizModal(false);
                    setQuizError('');
                  }}
                  className="bg-blue-600 hover:bg-blue-500"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}

        {openBookModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col border-2 border-blue-700">
              <div className="px-6 py-4 border-b border-gray-700 bg-gray-900 rounded-t-xl">
                <h3 className="text-xl font-semibold text-blue-300">
                  {selectedBook?.name || 'Book Content'}
                </h3>
              </div>
              <div className="p-6 overflow-y-auto flex-1">
                {bookLoading ? (
                  <div className="flex justify-center items-center h-32">
                    <Spinner className="h-10 w-10 text-green-500" />
                  </div>
                ) : bookError ? (
                  <div className="text-red-400 text-center py-4">{bookError}</div>
                ) : bookContent ? (
                  <div className="prose max-w-none text-gray-300" dangerouslySetInnerHTML={{ __html: bookContent }} />
                ) : (
                  <p className="text-center text-gray-500 py-4">No book content available</p>
                )}
              </div>
              <div className="px-4 py-3 border-t border-gray-700 bg-gray-900 rounded-b-xl flex justify-end">
                <Button
                  onClick={() => setOpenBookModal(false)}
                  className="bg-green-600 hover:bg-green-500"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};