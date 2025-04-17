'use client';
import React, { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardBody, Typography } from '@material-tailwind/react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

export function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch(`http://localhost:5054/api/Auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      window.location.href = '/Pages'; // Redirect after login
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center">
      <section className="container mx-auto px-4 sm:px-10">
        <div className="grid place-items-center pb-10 text-center">
          <Typography variant="h2" color="blue-gray" className="text-3xl md:text-4xl">
            Welcome Back
          </Typography>
          <Typography variant="lead" className="mt-2 !text-gray-500 lg:w-5/12 text-sm md:text-base">
            Sign in to access your account and continue your learning journey.
          </Typography>
        </div>
        
        <Card className="px-6 pb-5">
          <CardBody>
            {error && (
              <Typography color="red" className="mb-4 text-center">
                {error}
              </Typography>
            )}
            
            <form onSubmit={handleSubmit}>
              {/* Username */}
              <div className="mb-6">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Username"
                    className="peer w-full rounded-[7px] border border-gray-300 bg-transparent px-3 py-2.5 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border focus:border-2 focus:border-blue-500 focus:outline-0"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    autoComplete="username"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="mb-6">
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    className="peer w-full rounded-[7px] border border-gray-300 bg-transparent px-3 py-2.5 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border focus:border-2 focus:border-blue-500 focus:outline-0"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="mt-8">
                <button
                  type="submit"
                  className={`w-full rounded-lg bg-blue-600 py-3 px-6 text-center align-middle font-sans text-xs font-bold uppercase text-white shadow-md shadow-blue-500/20 transition-all hover:shadow-lg hover:shadow-blue-500/40 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none ${
                    isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Signing In...' : 'Sign In'}
                </button>
              </div>
            </form>

            {/* Links */}
            <div className="mt-6 flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-4">
              <Typography variant="small" className="font-normal !text-gray-500">
                Don't have an account?{' '}
                <a href="/register" className="font-medium text-blue-500 transition-colors hover:text-blue-700">
                  Register
                </a>
              </Typography>
              <Typography variant="small" className="font-normal !text-gray-500">
                <a href="/forgot-password" className="font-medium text-blue-500 transition-colors hover:text-blue-700">
                  Forgot password?
                </a>
              </Typography>
            </div>
          </CardBody>
        </Card>
      </section>
    </div>
  );
}

export default LoginForm;