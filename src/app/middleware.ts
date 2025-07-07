import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  const url = request.nextUrl.clone();

  // Define protected routes and their required roles
  const protectedRoutes = [
    {
      path: '/Pages/HomeEmployee',
      roles: ['NewEmploye'],
    },
    {
      path: '/Pages/UserPages/EmpProfile',
      roles: ['NewEmploye'],
    },
    {
      path: '/Pages/JobPages/Get-Jobs',
      roles: ['Admin'],
    },
    {
      path: '/Pages/JobPages/create-job',
      roles: ['Admin'],
    },
    {
      path: '/Pages/UserPages/GetUsers',
      roles: ['Admin'],
    },
    {
      path: '/Pages/register',
      roles: ['Admin'],
    },
  ];

  const currentPath = url.pathname;

  const matchedRoute = protectedRoutes.find((route) => 
    currentPath.startsWith(route.path));

  if (!matchedRoute) {
    return null; // Allow access to non-protected routes
  }

  if (!token) {
    // Redirect to login
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-jwt-secret-key') as { 
      userId: string; 
role: string };
    const userRole = decoded.role;

    if (!matchedRoute.roles.includes(userRole)) {
      // Redirect to a forbidden page or home based on role
      url.pathname = userRole === 'Admin' ? '/Pages' : '/Pages/HomeEmployee';
      return NextResponse.redirect(url);
    }

    return NextResponse.next(); // Allow access
  } catch (error) {
    console.error('JWT verification failed:', error);
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: [
    '/Pages/HomeEmployee',
    '/Pages/UserPages/EmpProfile/:path*',
    '/Pages/JobPages/Get-Jobs',
    '/Pages/JobPages/create-job/:id?',
    '/Pages/UserPages/GetUsers',
    '/Pages/register',
  ],
};