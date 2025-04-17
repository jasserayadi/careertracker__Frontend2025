'use client';

import React, { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardBody, Button, Typography } from '@material-tailwind/react';
import { CheckIcon } from '@heroicons/react/24/outline';

export function RegisterForm() {
  const [username, setUsername] = useState('');
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const validatePassword = (pass: string) => {
    const regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/;
    return regex.test(pass);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    if (!username || !firstname || !lastname || !password || !confirmPassword || !email || !cvFile) {
      setError('All fields are required.');
      setIsSubmitting(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Password and confirmation password do not match.');
      setIsSubmitting(false);
      return;
    }

    if (!validatePassword(password)) {
      setError('Password must have at least 8 characters, including 1 digit, 1 lowercase, 1 uppercase, and 1 special character.');
      setIsSubmitting(false);
      return;
    }

    const formData = new FormData();
    formData.append('username', username);
    formData.append('firstname', firstname);
    formData.append('lastname', lastname);
    formData.append('password', password);
    formData.append('confirmPassword', confirmPassword);
    formData.append('email', email);
    formData.append('cvFile', cvFile);

    try {
      const response = await fetch('http://localhost:5054/api/users/register', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        router.push('/login');
      } else {
        const data = await response.json();
        setError(data.message || 'Registration failed.');
      }
    } catch (err) {
      setError('Error connecting to the server. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const REQUIREMENTS = [
    'At least 8 characters',
    '1 digit (0-9)',
    '1 lowercase letter',
    '1 uppercase letter',
    '1 special character'
  ];

  return (
    <div className="grid min-h-screen place-items-center">
      <section className="container mx-auto px-4 sm:px-10">
        <div className="grid place-items-center pb-10 text-center">
          <Typography variant="h2" color="blue-gray" className="text-3xl md:text-4xl">
            Create Your Account
          </Typography>
          <Typography variant="lead" className="mt-2 !text-gray-500 lg:w-5/12 text-sm md:text-base">
            Join our platform to access exclusive features and resources.
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
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Username */}
                <div>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Username"
                      className="peer w-full rounded-[7px] border border-gray-300 bg-transparent px-3 py-2.5 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border focus:border-2 focus:border-blue-500 focus:outline-0"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <div className="relative">
                    <input
                      type="email"
                      placeholder="Email"
                      className="peer w-full rounded-[7px] border border-gray-300 bg-transparent px-3 py-2.5 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border focus:border-2 focus:border-blue-500 focus:outline-0"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* First Name */}
                <div>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="First Name"
                      className="peer w-full rounded-[7px] border border-gray-300 bg-transparent px-3 py-2.5 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border focus:border-2 focus:border-blue-500 focus:outline-0"
                      value={firstname}
                      onChange={(e) => setFirstname(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Last Name */}
                <div>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Last Name"
                      className="peer w-full rounded-[7px] border border-gray-300 bg-transparent px-3 py-2.5 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border focus:border-2 focus:border-blue-500 focus:outline-0"
                      value={lastname}
                      onChange={(e) => setLastname(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div className="relative">
                    <input
                      type="password"
                      placeholder="Password"
                      className="peer w-full rounded-[7px] border border-gray-300 bg-transparent px-3 py-2.5 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border focus:border-2 focus:border-blue-500 focus:outline-0"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <div className="relative">
                    <input
                      type="password"
                      placeholder="Confirm Password"
                      className="peer w-full rounded-[7px] border border-gray-300 bg-transparent px-3 py-2.5 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border focus:border-2 focus:border-blue-500 focus:outline-0"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Password Requirements */}
              <div className="mt-8">
                <Typography variant="h6" color="blue-gray" className="mb-4">
                  Password Requirements
                </Typography>
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  {REQUIREMENTS.map((req, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckIcon className="h-4 w-4 text-gray-900" strokeWidth={3} />
                      <Typography variant="small" className="font-normal !text-gray-500">
                        {req}
                      </Typography>
                    </div>
                  ))}
                </div>
              </div>

              {/* CV Upload */}
              <div className="mt-6">
                <Typography variant="h6" color="blue-gray" className="mb-2">
                  Upload Your CV
                </Typography>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                  required
                />
                <Typography variant="small" className="mt-1 font-normal !text-gray-500">
                  Accepted formats: PDF, DOC, DOCX
                </Typography>
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
                  {isSubmitting ? 'Creating Account...' : 'Create Account'}
                </button>
              </div>
            </form>

            {/* Login Link */}
            <Typography variant="small" className="mt-4 text-center font-normal !text-gray-500">
              Already have an account?{' '}
              <a href="/login" className="font-medium text-blue-500 transition-colors hover:text-blue-700">
                Sign in
              </a>
            </Typography>
          </CardBody>
        </Card>
      </section>
    </div>
  );
}

export default RegisterForm;