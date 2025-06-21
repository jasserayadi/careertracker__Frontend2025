'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Typography, Button, Spinner, Card, CardBody } from '@material-tailwind/react';
import { ArrowPathIcon, TrashIcon } from '@heroicons/react/24/outline';

const COURSE_IMAGES = [
  "/image/blogs/blog-1.svg",
  "/image/blogs/blog2.svg",
  "/image/blogs/blog3.svg",
  "/image/blogs/blog4.svg"
];

interface Formation {
  formationId: number;
  fullname: string;
  shortname: string;
  summary: string;
  moodleCategoryId: number;
  moodleCourseId: number;
  createdAt: string;
}

const GetFormations = () => {
  const router = useRouter();
  const [formations, setFormations] = useState<Formation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [expandedSummaries, setExpandedSummaries] = useState<Record<number, boolean>>({});

  const stripHtml = (html: string) => {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '');
  };

  const fetchFormations = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5054/api/formations');
      if (!response.ok) throw new Error('Failed to load formations');
      const data = await response.json();
      setFormations(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const syncFormations = async () => {
    setIsSyncing(true);
    setSyncStatus(null);
    try {
      const response = await fetch('http://localhost:5054/api/formations/sync', {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Sync failed');
      setSyncStatus('Successfully synced with server');
      await fetchFormations();
    } catch (err) {
      setSyncStatus(err instanceof Error ? err.message : 'Sync error occurred');
    } finally {
      setIsSyncing(false);
    }
  };

  const deleteFormation = async (formationId: number) => {
    if (!window.confirm(`Are you sure you want to delete this formation? This action cannot be undone.`)) {
      return;
    }
    
    setIsDeleting(formationId);
    try {
      const response = await fetch(`http://localhost:5054/api/formations/${formationId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete formation');
      
      setFormations(formations.filter(f => f.formationId !== formationId));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete formation');
    } finally {
      setIsDeleting(null);
    }
  };

  const toggleSummary = (formationId: number) => {
    setExpandedSummaries(prev => ({
      ...prev,
      [formationId]: !prev[formationId]
    }));
  };

  useEffect(() => {
    const initialize = async () => {
      await syncFormations();
      await fetchFormations();
    };
    initialize();
  }, []);

  const handleFormationClick = (formationId: number) => {
    router.push(`/Pages/CoursesPages/CoursesList/${formationId}`);
  };

  if (loading || isSyncing) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <Spinner className="h-16 w-16 text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-gray-900">
        <div className="bg-red-900/10 border-l-4 border-red-500 p-4 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-red-400">Error</h3>
              <p className="text-red-300">{error}</p>
              <Button 
                onClick={fetchFormations} 
                color="red" 
                variant="text" 
                className="mt-2 text-red-300 hover:text-red-200"
              >
                Retry
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header with refresh button on the right */}
        <div className="flex justify-between items-center mb-12">
          <div className="text-center md:text-left">
            <Typography variant="h1" className="text-4xl md:text-5xl font-extrabold text-blue-300 mb-4">
              Available Courses
            </Typography>
            <Typography className="text-xl text-gray-400">
              Browse through our available courses and find the one that fits your needs
            </Typography>
          </div>
          
          <Button
            onClick={syncFormations}
            color="blue"
            variant="text"
            className="p-2 rounded-full hover:bg-blue-900/30"
            disabled={isSyncing}
            aria-label="Refresh courses"
          >
            {isSyncing ? (
              <Spinner className="h-5 w-5" />
            ) : (
              <ArrowPathIcon className="h-5 w-5" />
            )}
          </Button>
        </div>

        {syncStatus && (
          <div className={`mb-6 p-3 rounded-lg ${
            syncStatus.includes('Successfully') ? 'bg-green-900/10 border border-green-800 text-green-400' : 'bg-red-900/10 border border-red-800 text-red-400'
          }`}>
            {syncStatus}
          </div>
        )}

        {/* Course Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {formations.map((formation, index) => {
            const imageIndex = index % COURSE_IMAGES.length;
            const formationImage = COURSE_IMAGES[imageIndex];
            const isExpanded = expandedSummaries[formation.formationId] || false;
            const cleanSummary = stripHtml(formation.summary || '');
            const shortDescription = cleanSummary 
              ? cleanSummary.length > 100 && !isExpanded
                ? `${cleanSummary.substring(0, 100)}...` 
                : cleanSummary
              : 'No description available';

            return (
              <Card 
                key={formation.formationId}
                className="bg-gray-800 border-2 border-gray-700 hover:border-blue-500 transition-all duration-300 h-full"
              >
                <CardBody className="p-6 flex flex-col h-full">
                  <div className="relative group flex flex-col h-full">
                    {/* Course Image */}
                    <div className="mb-4 overflow-hidden rounded-lg">
                      <img 
                        src={formationImage} 
                        alt={formation.fullname}
                        className="w-full h-40 object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    
                    {/* Course Content */}
                    <div 
                      onClick={() => handleFormationClick(formation.formationId)}
                      className="cursor-pointer flex-grow"
                    >
                      <Typography variant="h5" className="text-blue-300 mb-2">
                        {formation.fullname}
                      </Typography>
                      <Typography className="text-gray-400 mb-2">
                        {shortDescription}
                      </Typography>
                      {cleanSummary && cleanSummary.length > 100 && (
                        <Button
                          variant="text"
                          size="sm"
                          className="p-0 text-blue-400 hover:text-blue-300 text-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSummary(formation.formationId);
                          }}
                        >
                          {isExpanded ? 'See Less' : 'See More'}
                        </Button>
                      )}
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="mt-auto flex justify-between items-center pt-4">
                      <Button
                        onClick={() => handleFormationClick(formation.formationId)}
                        className="bg-blue-600 hover:bg-blue-500 w-full"
                      >
                        View Details
                      </Button>
                      
                      <Button
                        variant="text"
                        color="red"
                        size="sm"
                        className="ml-2 p-2 hover:bg-red-900/30 rounded-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteFormation(formation.formationId);
                        }}
                        disabled={isDeleting === formation.formationId}
                      >
                        {isDeleting === formation.formationId ? (
                          <Spinner className="h-4 w-4" />
                        ) : (
                          <TrashIcon className="h-5 w-5" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>

        {formations.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mb-4 border border-dashed border-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <Typography variant="h5" className="text-gray-400 mb-2">
              No Courses Available
            </Typography>
            <Typography className="text-gray-500 max-w-md mx-auto">
              There are currently no courses to display. Try syncing with the server.
            </Typography>
          </div>
        )}
      </div>
    </main>
  );
};

export default GetFormations;