'use client';

import React, { useEffect, useState } from "react";
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

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const [user, setUser] = useState<{username: string} | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      try {
        // Use hardcoded URL as fallback if env var fails
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

  useEffect(() => {
    const handleResize = () => window.innerWidth >= 960 && setOpen(false);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolling(window.scrollY > 0);
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
        
        <ul className={`ml-10 hidden items-center gap-6 lg:flex ${
          isScrolling ? "text-gray-900" : "text-white"
        }`}>
          <NavItem to="/">Home</NavItem>
          <NavItem to="/about">About Us</NavItem>
          <NavItem to="/contact">Contact Us</NavItem>
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
            <NavItem to="/">Home</NavItem>
            <NavItem to="/about">About Us</NavItem>
            <NavItem to="/contact">Contact Us</NavItem>
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
                  <div className="w-full">
                    <Button color="gray" size="sm" className="w-full">
                      Login
                    </Button>
                  </div>
                </Link>
                <Link href="/register" passHref>
                  <div className="w-full">
                    <Button color="gray" size="sm" className="w-full">
                      Register
                    </Button>
                  </div>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;