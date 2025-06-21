'use client';

import React, { useEffect, useState, useRef } from "react";
import { Typography } from "@material-tailwind/react";
import { XMarkIcon, Bars3Icon, UserCircleIcon, ArrowRightOnRectangleIcon, UserPlusIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import Image from "next/image";

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

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const [user, setUser] = useState<{username: string} | null>(null);
  const [jobsDropdownOpen, setJobsDropdownOpen] = useState(false);
  const [usersDropdownOpen, setUsersDropdownOpen] = useState(false);
  const jobsDropdownRef = useRef<HTMLDivElement>(null);
  const usersDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5054';
        const response = await fetch(`http://localhost:5054/api/Auth/session`, {
          credentials: 'include',
        });
        
        if (response.ok) {
          const data = await response.json();
          setUser({ username: data.username });
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
  const toggleJobsDropdown = () => setJobsDropdownOpen(!jobsDropdownOpen);
  const toggleUsersDropdown = () => setUsersDropdownOpen(!usersDropdownOpen);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (jobsDropdownRef.current && !jobsDropdownRef.current.contains(event.target as Node)) {
        setJobsDropdownOpen(false);
      }
      if (usersDropdownRef.current && !usersDropdownRef.current.contains(event.target as Node)) {
        setUsersDropdownOpen(false);
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
        setUsersDropdownOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolling(window.scrollY > 0);
      setJobsDropdownOpen(false);
      setUsersDropdownOpen(false);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 z-50 w-full border-0 ${
      isScrolling ? "bg-white shadow-md" : "bg-transparent"
    }`}>
      <div className="container mx-auto flex items-center justify-between p-4">
        <div className="flex items-center">
          <Image 
            src="/CT/1631387546654-removebg-preview.png" 
            alt="Career Tracker Logo"
            width={40}
            height={40}
            className="mr-2"
          />
          <Typography variant="h6" color={isScrolling ? "blue-gray" : "white"}>
            Career Tracker
          </Typography>
        </div>
        
        <ul className={`ml-10 hidden items-center gap-8 lg:flex ${
          isScrolling ? "text-gray-900" : "text-white"
        }`}>
          <NavItem to="/Pages">Home</NavItem>
          
          <li className="relative flex justify-center" ref={jobsDropdownRef}>
            <div 
              className={`cursor-pointer px-4 py-2 rounded-md transition-all duration-200 ${
                jobsDropdownOpen ? (isScrolling ? "bg-gray-100 text-gray-900" : "bg-white bg-opacity-20") : ""
              } hover:bg-opacity-10 hover:bg-white`}
              onClick={toggleJobsDropdown}
              onMouseEnter={() => setJobsDropdownOpen(true)}
            >
              Jobs
            </div>
            {jobsDropdownOpen && (
              <div 
                className={`absolute top-full mt-2 w-56 rounded-lg shadow-xl ${
                  isScrolling ? "bg-white" : "bg-white bg-opacity-95 backdrop-blur-sm"
                } border border-gray-200 animate-fadeIn origin-top`}
                onMouseLeave={() => setJobsDropdownOpen(false)}
              >
                <div className="py-1">
                  <Link href="/Pages/JobPages/Get-Jobs" passHref>
                    <div 
                      className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer transition-all duration-200 active:scale-95"
                      onClick={() => setJobsDropdownOpen(false)}
                    >
                      View Jobs
                    </div>
                  </Link>
                  <Link href="/Pages/JobPages/create-job" passHref>
                    <div 
                      className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer transition-all duration-200 active:scale-95"
                      onClick={() => setJobsDropdownOpen(false)}
                    >
                      Create Job
                    </div>
                  </Link>
                </div>
              </div>
            )}
          </li>
          
          <NavItem to="/Pages/FormationPages/Get_Formations">Courses</NavItem>
          <NavItem to="/Pages/RecommendPages/RecommendJob">Recommendations</NavItem>
          
          <li className="relative flex justify-center" ref={usersDropdownRef}>
            <div 
              className={`cursor-pointer px-4 py-2 rounded-md transition-all duration-200 ${
                usersDropdownOpen ? (isScrolling ? "bg-gray-100 text-gray-900" : "bg-white bg-opacity-20") : ""
              } hover:bg-opacity-10 hover:bg-white`}
              onClick={toggleUsersDropdown}
              onMouseEnter={() => setUsersDropdownOpen(true)}
            >
              Users
            </div>
            {usersDropdownOpen && (
              <div 
                className={`absolute top-full mt-2 w-56 rounded-lg shadow-xl ${
                  isScrolling ? "bg-white" : "bg-white bg-opacity-95 backdrop-blur-sm"
                } border border-gray-200 animate-fadeIn origin-top`}
                onMouseLeave={() => setUsersDropdownOpen(false)}
              >
                <div className="py-1">
                  <Link href="/Pages/UserPages/GetUsers" passHref>
                    <div 
                      className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer transition-all duration-200 active:scale-95"
                      onClick={() => setUsersDropdownOpen(false)}
                    >
                      View users
                    </div>
                  </Link>
                  <Link href="http://localhost:3000/Pages/register" passHref>
                    <div 
                      className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer transition-all duration-200 active:scale-95"
                      onClick={() => setUsersDropdownOpen(false)}
                    >
                      Create a user
                    </div>
                  </Link>
                </div>
              </div>
            )}
          </li>
        </ul>

        <div className="hidden items-center gap-6 lg:flex">
          {user ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <UserCircleIcon className={`h-5 w-5 ${isScrolling ? "text-gray-900" : "text-white"}`} />
                <Typography 
                  variant="small" 
                  className={`font-medium ${isScrolling ? "text-gray-900" : "text-white"}`}
                >
                  {user.username}
                </Typography>
              </div>
              <div 
                onClick={handleLogout}
                className="flex items-center gap-2 cursor-pointer"
              >
                <ArrowRightOnRectangleIcon className={`h-5 w-5 ${isScrolling ? "text-gray-900" : "text-white"}`} />
                <Typography 
                  variant="small" 
                  className={`font-medium ${isScrolling ? "text-gray-900" : "text-white"}`}
                >
                  Logout
                </Typography>
              </div>
            </div>
          ) : (
            <>
              <Link href="/login" passHref>
                <div className="flex items-center gap-2 cursor-pointer">
                  <ArrowRightOnRectangleIcon className={`h-5 w-5 ${isScrolling ? "text-gray-900" : "text-white"}`} />
                  <Typography 
                    variant="small" 
                    className={`font-medium ${isScrolling ? "text-gray-900" : "text-white"}`}
                  >
                    Login
                  </Typography>
                </div>
              </Link>
              <Link href="/register" passHref>
                <div className="flex items-center gap-2 cursor-pointer">
                  <UserPlusIcon className={`h-5 w-5 ${isScrolling ? "text-gray-900" : "text-white"}`} />
                  <Typography 
                    variant="small" 
                    className={`font-medium ${isScrolling ? "text-gray-900" : "text-white"}`}
                  >
                    Register
                  </Typography>
                </div>
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
            <NavItem to="/Pages/RecommendPages/RecommendJob">Recommendations</NavItem>
            
            <li>
              <div 
                className={`cursor-pointer px-4 py-3 rounded-md transition-all ${
                  usersDropdownOpen ? "bg-gray-100" : ""
                }`}
                onClick={toggleUsersDropdown}
              >
                Users
              </div>
              {usersDropdownOpen && (
                <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-200 pl-4">
                  <Link href="/Pages/UserPages/GetUsers" passHref>
                    <div 
                      className="block py-2 px-3 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer rounded-md transition-all active:scale-95"
                      onClick={() => setUsersDropdownOpen(false)}
                    >
                      View users
                    </div>
                  </Link>
                  <Link href="http://localhost:3000/Pages/register" passHref>
                    <div 
                      className="block py-2 px-3 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer rounded-md transition-all active:scale-95"
                      onClick={() => setUsersDropdownOpen(false)}
                    >
                      Create a user
                    </div>
                  </Link>
                </div>
              )}
            </li>
          </ul>
          
          <div className="mt-4 flex flex-col gap-4">
            {user ? (
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-2">
                  <UserCircleIcon className="h-5 w-5" />
                  <Typography variant="small">{user.username}</Typography>
                </div>
                <div 
                  onClick={handleLogout}
                  className="flex items-center gap-3 p-2 cursor-pointer"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5" />
                  <Typography variant="small">Logout</Typography>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Link href="/login" passHref>
                  <div className="flex items-center gap-3 p-2 cursor-pointer">
                    <ArrowRightOnRectangleIcon className="h-5 w-5" />
                    <Typography variant="small">Login</Typography>
                  </div>
                </Link>
                <Link href="/register" passHref>
                  <div className="flex items-center gap-3 p-2 cursor-pointer">
                    <UserPlusIcon className="h-5 w-5" />
                    <Typography variant="small">Register</Typography>
                  </div>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

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

export default Navbar;