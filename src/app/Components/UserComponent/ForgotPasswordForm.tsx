'use client';
import React, { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardBody, Typography } from '@material-tailwind/react';

function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5054';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');
    setError('');

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
      setIsSubmitting(false);
      return;
    }

    try {
      console.log('Sending request to API URL:', apiUrl);
      const response = await fetch(`${apiUrl}/api/Auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email }),
        credentials: 'include', // Ensure credentials are sent
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries([...response.headers.entries()])); // Convert headers to object

      if (!response.ok) {
        const contentType = response.headers.get('Content-Type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Failed to send reset email (Status: ${response.status}).`);
        } else {
          const errorText = await response.text();
          console.error('Non-JSON response:', errorText);
          throw new Error(`Failed to send reset email (Status: ${response.status}). Non-JSON response: ${errorText}`);
        }
      }

      const data = await response.json();
      setMessage(data.message || 'If an account exists, a reset link has been sent to your email.');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect to the server. Please check your network or server status.';
      setError(errorMessage);
      console.error('Forgot password error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center">
      <section className="container mx-auto px-4 sm:px-10">
        <div className="grid place-items-center pb-10 text-center">
          <Typography variant="h2" color="blue-gray" className="text-3xl md:text-4xl">
            Forgot Password
          </Typography>
          <Typography variant="lead" className="mt-2 !text-gray-500 lg:w-5/12 text-sm md:text-base">
            Enter your email to receive a password reset link.
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
                    type="email"
                    placeholder="Email"
                    className="peer w-full rounded-[7px] border border-gray-300 bg-transparent px-3 py-2.5 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border focus:border-2 focus:border-blue-500 focus:outline-0"
                    value={email}
                    onChange={(e) => setEmail(e.target.value.trim())}
                    required
                    autoComplete="email"
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
                  {isSubmitting ? 'Sending...' : 'Send Reset Link'}
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

export default ForgotPasswordForm;