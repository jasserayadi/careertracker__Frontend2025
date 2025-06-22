'use client';
import React, { useState, useEffect, FormEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardBody, Typography } from '@material-tailwind/react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

function ResetPasswordForm() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5054';

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token.');
      return;
    }

    const validateToken = async () => {
      try {
        console.log('Validating token with API URL:', apiUrl, 'Token:', token);
        const response = await fetch(`${apiUrl}/api/Auth/validate-reset-token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({ token }),
          credentials: 'include',
        });

        console.log('Validate token response status:', response.status);
        console.log('Validate token response headers:', Object.fromEntries([...response.headers.entries()]));

        if (!response.ok) {
          const contentType = response.headers.get('Content-Type');
          let errorMessage = `Invalid or expired reset token (Status: ${response.status})`;
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
          } else {
            const errorText = await response.text();
            console.error('Non-JSON response:', errorText);
            errorMessage += `. Non-JSON response: ${errorText}`;
          }
          throw new Error(errorMessage);
        }

        const data = await response.json();
        if (!data.isValid) {
          setError('Invalid or expired reset token.');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to connect to the server. Please check CORS settings or network.';
        setError(errorMessage);
        console.error('Token validation error:', err);
      }
    };

    validateToken();
  }, [token, apiUrl]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');
    setError('');

    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      setError('Password must be at least 8 characters, including 1 digit, 1 lowercase, 1 uppercase, and 1 special character.');
      setIsSubmitting(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      setIsSubmitting(false);
      return;
    }

    try {
      console.log('Resetting password with API URL:', apiUrl);
      const response = await fetch(`${apiUrl}/api/Auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ token, newPassword, confirmPassword }),
        credentials: 'include',
      });

      console.log('Reset password response status:', response.status);
      console.log('Reset password response headers:', Object.fromEntries([...response.headers.entries()]));

      if (!response.ok) {
        const contentType = response.headers.get('Content-Type');
        let errorMessage = `Failed to reset password (Status: ${response.status})`;
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } else {
          const errorText = await response.text();
          console.error('Non-JSON response:', errorText);
          errorMessage += `. Non-JSON response: ${errorText}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setMessage(data.message || 'Password reset successfully. Redirecting to login...');
      setTimeout(() => router.push('/login'), 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect to the server.';
      setError(errorMessage);
      console.error('Reset password error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (error) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Card className="px-6 pb-5">
          <CardBody>
            <Typography color="red" className="mb-4 text-center">
              {error}
            </Typography>
            <Typography className="text-center">
              <a href="/Pages/UserPages/forgot-password" className="font-medium text-blue-500 transition-colors hover:text-blue-700">
                Request a new reset link
              </a>
            </Typography>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid min-h-screen place-items-center">
      <section className="container mx-auto px-4 sm:px-10">
        <div className="grid place-items-center pb-10 text-center">
          <Typography variant="h2" color="blue-gray" className="text-3xl md:text-4xl">
            Reset Password
          </Typography>
          <Typography variant="lead" className="mt-2 !text-gray-500 lg:w-5/12 text-sm md:text-base">
            Enter your new password to reset your account.
          </Typography>
        </div>

        <Card className="px-6 pb-5">
          <CardBody>
            {message && (
              <Typography color="green" className="mb-4 text-center">
                {message}
              </Typography>
            )}
            {error && (
              <Typography color="red" className="mb-4 text-center">
                {error}
              </Typography>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="New Password"
                    className="peer w-full rounded-[7px] border border-gray-300 bg-transparent px-3 py-2.5 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border focus:border-2 focus:border-blue-500 focus:outline-0"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    autoComplete="new-password"
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

              <div className="mb-6">
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Confirm Password"
                    className="peer w-full rounded-[7px] border border-gray-300 bg-transparent px-3 py-2.5 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border focus:border-2 focus:border-blue-500 focus:outline-0"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <div className="mt-8">
                <button
                  type="submit"
                  className={`w-full rounded-lg bg-blue-600 py-3 px-6 text-center align-middle font-sans text-xs font-bold uppercase text-white shadow-md shadow-blue-500/20 transition-all hover:shadow-lg hover:shadow-blue-500/40 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none ${
                    isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Resetting...' : 'Reset Password'}
                </button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <Typography variant="small" className="font-normal !text-gray-500">
                <a href="/login" className="font-medium text-blue-500 transition-colors hover:text-blue-700">
                  Back to Login
                </a>
              </Typography>
            </div>
          </CardBody>
        </Card>
      </section>
    </div>
  );
}

export default ResetPasswordForm;