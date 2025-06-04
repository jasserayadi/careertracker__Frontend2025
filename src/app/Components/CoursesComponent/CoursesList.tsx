'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardBody, Typography, Button } from '@material-tailwind/react';

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
  questions: {
    questionId: number;
    questionType: string;
    choices: string[];
    correctAnswer: string;
    questionText?: string;
  }[];
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

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Step 1: Sync courses with Moodle
      setSyncStatus('syncing');
      const syncResponse = await fetch(
        `http://localhost:5054/api/Course/sync/${formationId}`,
        { method: 'POST' }
      );

      if (!syncResponse.ok) {
        throw new Error('Course synchronization failed');
      }
      
      // Step 2: Sync book IDs specifically
      setBookSyncStatus('syncing');
      const bookSyncResponse = await fetch(
        `http://localhost:5054/api/Course/sync-books/${formationId}`,
        { method: 'POST' }
      );
      
      if (!bookSyncResponse.ok) {
        throw new Error('Book ID synchronization failed');
      }
      
      setSyncStatus('success');
      setBookSyncStatus('success');
      
      // Step 3: Load the updated data
      const [coursesResponse, inscriptionsResponse] = await Promise.all([
        fetch(`http://localhost:5054/api/Course/by-formation/${formationId}`),
        fetch(`http://localhost:5054/api/Inscription/ByCourse/${formationId}`)
      ]);

      if (!coursesResponse.ok) throw new Error('Failed to load courses');
      if (!inscriptionsResponse.ok && inscriptionsResponse.status !== 404) {
        throw new Error('Failed to load enrollments');
      }

      const coursesData = await coursesResponse.json();
      const inscriptionsData = inscriptionsResponse.status === 404 ? [] : await inscriptionsResponse.json();

      setCourses(coursesData);
      setInscriptions(inscriptionsData);

    } catch (err) {
      console.error('Error:', err);
      setSyncStatus('error');
      setBookSyncStatus('error');
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenQuizModal = async (course: Course) => {
    setSelectedQuiz(course);
    setOpenQuizModal(true);
    setQuizLoading(true);
    setQuizError('');
    setQuizDetails([]);

    try {
      const moodleQuizId = course.test;
      const response = await fetch(
        `http://localhost:5054/api/Quiz/by-course/${course.moodleCourseId}` + 
        (moodleQuizId ? `?moodleQuizId=${moodleQuizId}` : '')
      );

      if (!response.ok) {
        if (response.status === 404) {
          setQuizError('No quiz found for this course.');
        } else {
          throw new Error('Failed to load quiz details');
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
      setQuizError(err instanceof Error ? err.message : 'An error occurred');
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
          throw new Error('Failed to load book content');
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

  useEffect(() => {
    fetchData();
  }, [formationId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <Typography variant="paragraph" className="text-gray-600">
          {syncStatus === 'syncing' ? 'Synchronizing courses...' : 'Loading data...'}
        </Typography>
        {bookSyncStatus === 'syncing' && (
          <Typography variant="paragraph" className="text-gray-600">
            Synchronizing book IDs...
          </Typography>
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4 max-w-4xl mx-auto my-8">
        <Typography variant="paragraph" className="text-center text-red-600">
          Error: {error}
        </Typography>
        {bookSyncStatus === 'error' && (
          <Typography variant="small" className="text-center text-red-600 mt-2">
            (Book ID synchronization failed)
          </Typography>
        )}
        <div className="flex justify-center mt-4">
          <button 
            onClick={fetchData}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Typography variant="h2" color="blue-gray" className="mb-8">
        Formation Management
      </Typography>

      {syncStatus === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <Typography variant="paragraph" className="text-red-600">
            Sync completed with errors. Data shown may be outdated.
          </Typography>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-6">
        {/* Courses List */}
        <div className="w-full md:w-1/2">
          <Typography variant="h4" className="mb-4">
            Courses in this Formation
          </Typography>
          <div className="space-y-3">
            {courses.length > 0 ? (
              courses.map((course) => (
                <Card key={course.courseId} className="hover:shadow-lg transition-shadow">
                  <CardBody>
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <Typography variant="h5" className="mb-2">
                          {course.name}
                        </Typography>
                        {course.summary && (
                          <Typography variant="small" className="text-gray-600">
                            {course.summary}
                          </Typography>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {course.modName === 'quiz' && (
                          <Button
                            size="sm"
                            onClick={() => handleOpenQuizModal(course)}
                            className="shrink-0"
                          >
                            View Quiz
                          </Button>
                        )}
                        {course.modName === 'book' && (
                          <Button
                            size="sm"
                            onClick={() => handleOpenBookModal(course)}
                            className="shrink-0 bg-green-500 hover:bg-green-600"
                          >
                            View Book
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      {course.url && (
                        <div>
                          <Typography variant="small" className="font-semibold text-gray-700">
                            URL:
                          </Typography>
                          <a
                            href={course.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline break-all"
                          >
                            {course.url}
                          </a>
                        </div>
                      )}
                      {course.modName && (
                        <div>
                          <Typography variant="small" className="font-semibold text-gray-700">
                            Module:
                          </Typography>
                          <Typography variant="small" className="text-gray-600">
                            {course.modName}
                          </Typography>
                        </div>
                      )}
                    </div>
                  </CardBody>
                </Card>
              ))
            ) : (
              <Typography variant="paragraph" className="text-gray-600">
                No courses available in this formation.
              </Typography>
            )}
          </div>
        </div>

        {/* Enrolled Students */}
        <div className="w-full md:w-1/2">
          <Typography variant="h4" className="mb-4">
            Enrolled Students
          </Typography>
          {inscriptions.length > 0 ? (
            <div className="space-y-3">
              {inscriptions.map((inscription) => (
                <Card key={inscription.inscriptionId} className="hover:shadow-md transition-shadow">
                  <CardBody>
                    <Typography variant="h6" className="mb-1">
                      {inscription.user.firstname} {inscription.user.lastname}
                    </Typography>
                    <Typography variant="small" className="text-gray-600">
                      <span className="font-semibold">Username:</span> {inscription.user.username}
                    </Typography>
                    <Typography variant="small" className="text-gray-600">
                      <span className="font-semibold">Email:</span> {inscription.user.email}
                    </Typography>
                    <Typography variant="small" className="text-gray-600">
                      <span className="font-semibold">Enrolled:</span> {new Date(inscription.inscriptionDate).toLocaleDateString()}
                    </Typography>
                  </CardBody>
                </Card>
              ))}
            </div>
          ) : (
            <Typography variant="paragraph" className="text-gray-600">
              No students enrolled in this formation.
            </Typography>
          )}
        </div>
      </div>

      {/* Quiz Modal */}
      {openQuizModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
              <h3 className="text-xl font-semibold text-gray-800">
                {selectedQuiz?.name || 'Quiz Details'}
              </h3>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              {quizLoading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : quizError ? (
                <div className="text-red-500 text-center py-4">{quizError}</div>
              ) : quizDetails.length > 0 ? (
                <div className="space-y-6">
                  <div className="border border-gray-200 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">
                      {quizDetails[0].questions[0]?.questionText || 'Question'}
                    </h4>
                    <div className="space-y-3 mb-6">
                      {quizDetails[0].questions[0]?.choices?.map((choice, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <span className="bg-gray-200 text-gray-800 rounded-full w-6 h-6 flex items-center justify-center text-sm">
                            {String.fromCharCode(65 + i)}
                          </span>
                          <span className="text-gray-700">{choice}</span>
                        </div>
                      ))}
                    </div>
                    <div className="bg-green-50 p-4 rounded-md border border-green-100">
                      <p className="font-semibold text-green-800 text-sm mb-1">Correct Answer:</p>
                      <p className="text-green-800 font-medium">{quizDetails[0].questions[0]?.correctAnswer}</p>
                    </div>
                  </div>
                  {selectedQuiz?.moodleCourseId && (
                    <div className="text-center">
                      <a 
                        href={`http://localhost/blymoodol/mod/quiz/view.php?id=${selectedQuiz.moodleCourseId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm"
                      >
                        View full quiz on Moodle
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-center text-gray-600 py-4">No quiz details available</p>
              )}
            </div>
            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 rounded-b-lg flex justify-end">
              <button
                onClick={() => setOpenQuizModal(false)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Book Modal */}
      {openBookModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
              <h3 className="text-xl font-semibold text-gray-800">
                {selectedBook?.name || 'Book Content'}
              </h3>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              {bookLoading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-500"></div>
                </div>
              ) : bookError ? (
                <div className="text-red-500 text-center py-4">{bookError}</div>
              ) : bookContent ? (
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: bookContent }} />
              ) : (
                <p className="text-center text-gray-600 py-4">No book content available</p>
              )}
            </div>
            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 rounded-b-lg flex justify-end">
              <button
                onClick={() => setOpenBookModal(false)}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};