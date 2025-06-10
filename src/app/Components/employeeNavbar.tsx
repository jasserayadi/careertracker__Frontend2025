'use client';

import React, { useEffect, useState, useRef } from "react";
import { Typography, Button } from "@material-tailwind/react";
import { XMarkIcon, Bars3Icon, UserCircleIcon } from "@heroicons/react/24/solid";
import Link from "next/link";

interface NavItemProps {
  children: React.ReactNode;
  to?: string;
}

function NavItem({ children, to }: NavItemProps) {
  return (
    <li>
      <Link href={to || "#"} passHref>
        {children}
      </Link>
    </li>
  );
}

export function EmployeeNavbar() {
  const [open, setOpen] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const [user, setUser] = useState<{ username: string; userId: number } | null>(null);
  const [jobsDropdownOpen, setJobsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5054';
        const response = await fetch(`${apiUrl}/api/Auth/session`, {
          credentials: 'include',
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('Session data:', data); // Debug: Log session response
          setUser({ username: data.username, userId: data.userId });
        } else {
          console.warn('Session check failed:', response.status);
        }
      } catch (error) {
        console.error('Session check failed:', error);
      }
    };
    checkSession();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch(`http://localhost:5054/api/Auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      setUser(null);
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleOpen = () => setOpen(!open);
  const toggleJobsDropdown = () => {
    setJobsDropdownOpen(!jobsDropdownOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setJobsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 960) {
        setOpen(false);
      } else {
        setJobsDropdownOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolling(window.scrollY > 0);
      setJobsDropdownOpen(false);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 z-50 w-full border-0 ${
      isScrolling ? "bg-white shadow-md" : "bg-transparent"
    }`}>
      <div className="container mx-auto flex items-center justify-between p-4">
        <Typography variant="h6" color={isScrolling ? "blue-gray" : "white"}>
          Career Tracker
        </Typography>
        
        <ul className={`ml-10 hidden items-center gap-8 lg:flex ${
          isScrolling ? "text-gray-900" : "text-white"
        }`}>
          <NavItem to="/Pages">Home</NavItem>
          <NavItem to={user ? `/Pages/UserPages/EmpProfile/${user.userId}` : "/login"}>
            Profile
          </NavItem>
        </ul>

        {/* Desktop Buttons */}
        <div className="hidden items-center gap-4 lg:flex">
          {user ? (
            <div className="flex items-center gap-2">
              <UserCircleIcon className="h-5 w-5 text-white" />
              <Typography variant="small" className="text-white">
                {user.username}
              </Typography>
              <div onClick={handleLogout} className="cursor-pointer">
                <Button color={isScrolling ? "gray" : "white"} size="sm">
                  Logout
                </Button>
              </div>
            </div>
          ) : (
            <>
              <Link href="/login" passHref>
                <Button color={isScrolling ? "gray" : "white"} size="sm">
                  Login
                </Button>
              </Link>
              <Link href="/register" passHref>
                <Button color={isScrolling ? "gray" : "white"} size="sm">
                  Register
                </Button>
              </Link>
            </>
          )}
        </div>

        <button
          className={`ml-auto inline-block p-2 lg:hidden ${
            isScrolling ? "text-gray-900" : "text-white"
          }`}
          onClick={handleOpen}
        >
          {open ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="container mx-auto mt-4 rounded-lg bg-white px-6 py-5 lg:hidden">
          <ul className="flex flex-col gap-4 text-blue-gray-900">
            <NavItem to="/Pages">Home</NavItem>
            <li>
              <div 
                className={`cursor-pointer px-4 py-3 rounded-md transition-all ${
                  jobsDropdownOpen ? "bg-gray-100" : ""
                }`}
                onClick={toggleJobsDropdown}
              >
                Jobs
              </div>
              {jobsDropdownOpen && (
                <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-200 pl-4">
                  <Link href="/Pages/JobPages/Get-Jobs" passHref>
                    <div 
                      className="block py-2 px-3 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer rounded-md transition-all active:scale-95"
                      onClick={() => setJobsDropdownOpen(false)}
                    >
                      View Jobs
                    </div>
                  </Link>
                  <Link href="/Pages/JobPages/create-job" passHref>
                    <div 
                      className="block py-2 px-3 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer rounded-md transition-all active:scale-95"
                      onClick={() => setJobsDropdownOpen(false)}
                    >
                      Create Job
                    </div>
                  </Link>
                </div>
              )}
            </li>
            <NavItem to="/Pages/FormationPages/Get_Formations">Courses</NavItem>
            <NavItem to="/Pages/UserPages/GetUsers">Users</NavItem>
            <NavItem to={user ? `/Pages/UserPages/Profile/${user.userId}` : "/login"}>
              Profile
            </NavItem>
          </ul>
          
          {/* Mobile Buttons */}
          <div className="mt-4 flex flex-col gap-4">
            {user ? (
              <div className="flex items-center gap-2">
                <UserCircleIcon className="h-5 w-5" />
                <Typography variant="small">{user.username}</Typography>
                <div className="w-full" onClick={handleLogout}>
                  <Button color="gray" size="sm" className="w-full">
                    Logout
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <Link href="/login" passHref>
                  <Button color="gray" size="sm" className="w-full">
                    Login
                  </Button>
                </Link>
                <Link href="/register" passHref>
                  <Button color="gray" size="sm" className="w-full">
                    Register
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}

      {/* Add these styles to your global CSS */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out forwards;
        }
      `}</style>
    </nav>
  );
}

export default EmployeeNavbar;