'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Typography } from '@material-tailwind/react';
import { XMarkIcon, Bars3Icon, UserCircleIcon, TrophyIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';
import Image from 'next/image';

interface NavItemProps {
  children: React.ReactNode;
  to?: string;
}

function NavItem({ children, to }: NavItemProps) {
  return (
    <li>
      <Link href={to || '#'} passHref>
        {children}
      </Link>
    </li>
  );
}

const getBadgeIcon = (badge: string | null) => {
  switch (badge?.toLowerCase()) {
    case 'amateur':
      return <TrophyIcon className="h-5 w-5 text-gray-400" title="Silver Medal (Amateur)" />;
    case 'beginner':
      return <TrophyIcon className="h-5 w-5 text-amber-700" title="Bronze Medal (Beginner)" />;
    case 'pro':
      return <TrophyIcon className="h-5 w-5 text-yellow-400" title="Gold Medal (Pro)" />;
    default:
      return null;
  }
};

const getBadgeMessage = (badge: string | null) => {
  switch (badge?.toLowerCase()) {
    case 'amateur':
      return "Congratulations on earning the Silver Medal! You're making great progress.";
    case 'beginner':
      return 'Well done on achieving the Bronze Medal! Keep learning and growing.';
    case 'pro':
      return 'Amazing work! The Gold Medal reflects your expertise and dedication.';
    default:
      return 'No badge earned yet. Keep working to unlock your first medal!';
  }
};

export function EmployeeNavbar() {
  const [open, setOpen] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const [user, setUser] = useState<{ username: string; userId: number; roleName?: string } | null>(null);
  const [badge, setBadge] = useState<string | null>(null);
  const [jobsDropdownOpen, setJobsDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Check session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5054';
        const response = await fetch(`${apiUrl}/api/Auth/session`, {
          credentials: 'include', // Send cookies
        });

        if (response.ok) {
          const data = await response.json();
          console.log('EmployeeNavbar session data:', data); // Debug log
          console.log('Current path:', window.location.pathname); // Debug log
          setUser({ username: data.username, userId: data.userId, roleName: data.roleName });
          // Redirect to admin page if role is Admin and not already on admin page
          if (data.roleName === 'Admin' && !window.location.pathname.startsWith('/Pages')) {
            console.log('Redirecting Admin to /Pages'); // Debug log
            window.location.href = '/Pages';
          } else if (!data.roleName) {
            console.warn('EmployeeNavbar: roleName missing in session data, skipping role-based redirection');
          }
        } else if (response.status === 401) {
          console.log('EmployeeNavbar: Unauthorized, redirecting to login'); // Debug log
          window.location.href = '/';
        }
      } catch (error) {
        console.error('EmployeeNavbar session check failed:', error);
      }
    };
    checkSession();
  }, []);

  // Fetch badge when user is set
  useEffect(() => {
    const fetchBadge = async () => {
      if (user?.userId) {
        try {
          const token = localStorage.getItem('token');
          console.log('Fetching badge with token:', token); // Debug log
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5054';
          const response = await fetch(`${apiUrl}/api/Badge/${user.userId}/badge`, {
            headers: {
              Authorization: `Bearer ${token || ''}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            setBadge(data.badgeName || 'No Badge');
          } else if (response.status === 401) {
            console.log('Badge fetch: Unauthorized, clearing token and redirecting'); // Debug log
            localStorage.removeItem('token');
            window.location.href = '/';
          } else {
            console.error('Badge fetch failed with status:', response.status);
          }
        } catch (error) {
          console.error('Badge fetch failed:', error);
        }
      }
    };
    fetchBadge();
  }, [user]);

  // Handle logout
  const handleLogout = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5054';
      await fetch(`${apiUrl}/api/Auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      setUser(null);
      setBadge(null);
      localStorage.removeItem('token'); // Clear token on logout
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleOpen = () => setOpen(!open);
  const toggleJobsDropdown = () => setJobsDropdownOpen(!jobsDropdownOpen);
  const openModal = () => badge && setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // Close dropdowns and modal on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setJobsDropdownOpen(false);
      }
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        closeModal();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeModal();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 960) {
        setOpen(false);
      } else {
        setJobsDropdownOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolling(window.scrollY > 0);
      setJobsDropdownOpen(false);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 z-50 w-full border-0 ${isScrolling ? 'bg-white shadow-md' : 'bg-transparent'}`}
    >
      <div className="container mx-auto flex items-center justify-between p-4">
        <div className="flex items-center">
          <Image
            src="/CT/1631387546654-removebg-preview.png"
            alt="Career Tracker Logo"
            width={40}
            height={40}
            className="mr-2"
          />
          <Typography variant="h6" color={isScrolling ? 'blue-gray' : 'white'}>
            Career Tracker
          </Typography>
        </div>

        <ul
          className={`ml-10 hidden items-center gap-8 lg:flex ${isScrolling ? 'text-gray-900' : 'text-white'}`}
        >
          <NavItem to="/Pages">Home</NavItem>
          <NavItem to={user ? `/Pages/UserPages/EmpProfile/${user.userId}` : '/login'}>
            Profile
          </NavItem>
        </ul>

        <div className="hidden items-center gap-4 lg:flex">
          {user ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <UserCircleIcon className={`h-5 w-5 ${isScrolling ? 'text-gray-900' : 'text-white'}`} />
                <Typography
                  variant="small"
                  className={`font-medium ${isScrolling ? 'text-gray-900' : 'text-white'}`}
                >
                  {user.username}
                </Typography>
                {getBadgeIcon(badge) && (
                  <button onClick={openModal} className="focus:outline-none">
                    {getBadgeIcon(badge)}
                  </button>
                )}
              </div>
              <div onClick={handleLogout} className="flex items-center gap-2 cursor-pointer">
                <ArrowRightOnRectangleIcon
                  className={`h-5 w-5 ${isScrolling ? 'text-gray-900' : 'text-white'}`}
                />
                <Typography
                  variant="small"
                  className={`font-medium ${isScrolling ? 'text-gray-900' : 'text-white'}`}
                >
                  Logout
                </Typography>
              </div>
            </div>
          ) : (
            <Link href="/login" passHref>
              <div className="flex items-center gap-2 cursor-pointer">
                <ArrowRightOnRectangleIcon
                  className={`h-5 w-5 ${isScrolling ? 'text-gray-900' : 'text-white'}`}
                />
                <Typography
                  variant="small"
                  className={`font-medium ${isScrolling ? 'text-gray-900' : 'text-white'}`}
                >
                  Login
                </Typography>
              </div>
            </Link>
          )}
        </div>

        <button
          className={`ml-auto inline-block p-2 lg:hidden ${isScrolling ? 'text-gray-900' : 'text-white'}`}
          onClick={handleOpen}
        >
          {open ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="container mx-auto mt-4 rounded-lg bg-white px-6 py-5 lg:hidden">
          <ul className="flex flex-col gap-4 text-blue-gray-900">
            <NavItem to="/Pages">Home</NavItem>
            <NavItem to={user ? `/Pages/UserPages/EmpProfile/${user.userId}` : '/login'}>
              Profile
            </NavItem>
          </ul>

          <div className="mt-4 flex flex-col gap-4">
            {user ? (
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-2">
                  <UserCircleIcon className="h-5 w-5" />
                  <Typography variant="small" className="flex items-center gap-1">
                    {user.username}
                    {getBadgeIcon(badge) && (
                      <button onClick={openModal} className="focus:outline-none">
                        {getBadgeIcon(badge)}
                      </button>
                    )}
                  </Typography>
                </div>
                <div onClick={handleLogout} className="flex items-center gap-3 p-2 cursor-pointer">
                  <ArrowRightOnRectangleIcon className="h-5 w-5" />
                  <Typography variant="small">Logout</Typography>
                </div>
              </div>
            ) : (
              <Link href="/login" passHref>
                <div className="flex items-center gap-3 p-2 cursor-pointer">
                  <ArrowRightOnRectangleIcon className="h-5 w-5" />
                  <Typography variant="small">Login</Typography>
                </div>
              </Link>
            )}
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div ref={modalRef} className="bg-white rounded-lg p-6 max-w-xs w-full shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Your Badge</h2>
              <button onClick={closeModal} className="text-gray-600 hover:text-gray-800 focus:outline-none">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="flex flex-col items-center gap-4">
              <div className="text-6xl">{getBadgeIcon(badge)}</div>
              <Typography variant="paragraph" className="text-center text-gray-700">
                {getBadgeMessage(badge)}
              </Typography>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-5px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out forwards;
        }
      `}</style>
    </nav>
  );
}

export default EmployeeNavbar;