'use client';

import React, { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardBody, Button, Typography, Spinner } from '@material-tailwind/react';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

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
    <main className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 text-white">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <Typography variant="h1" className="text-4xl md:text-5xl font-extrabold text-blue-300 mb-4">
            Create Your Account
          </Typography>
          <Typography className="text-xl text-gray-400 max-w-3xl mx-auto">
            Join our platform to access exclusive features and resources
          </Typography>
        </div>

        <Card className="bg-gray-800 border-2 border-blue-700 hover:border-blue-500 transition-all duration-300">
          <CardBody>
            {error && (
              <div className="bg-red-900 bg-opacity-50 border-l-4 border-red-500 p-4 rounded mb-6">
                <Typography variant="small" color="red" className="flex items-center gap-2">
                  <XMarkIcon className="h-5 w-5" />
                  {error}
                </Typography>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Username */}
                <div>
                  <Typography variant="h5" className="mb-2 text-blue-300">
                    Username
                  </Typography>
                  <input
                    type="text"
                    placeholder="Enter your username"
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <Typography variant="h5" className="mb-2 text-blue-300">
                    Email
                  </Typography>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                {/* First Name */}
                <div>
                  <Typography variant="h5" className="mb-2 text-blue-300">
                    First Name
                  </Typography>
                  <input
                    type="text"
                    placeholder="Enter your first name"
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400"
                    value={firstname}
                    onChange={(e) => setFirstname(e.target.value)}
                    required
                  />
                </div>

                {/* Last Name */}
                <div>
                  <Typography variant="h5" className="mb-2 text-blue-300">
                    Last Name
                  </Typography>
                  <input
                    type="text"
                    placeholder="Enter your last name"
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400"
                    value={lastname}
                    onChange={(e) => setLastname(e.target.value)}
                    required
                  />
                </div>

                {/* Password */}
                <div>
                  <Typography variant="h5" className="mb-2 text-blue-300">
                    Password
                  </Typography>
                  <input
                    type="password"
                    placeholder="Create a password"
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                {/* Confirm Password */}
                <div>
                  <Typography variant="h5" className="mb-2 text-blue-300">
                    Confirm Password
                  </Typography>
                  <input
                    type="password"
                    placeholder="Confirm your password"
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Password Requirements */}
              <div>
                <Typography variant="h5" className="mb-3 text-blue-300">
                  Password Requirements
                </Typography>
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  {REQUIREMENTS.map((req, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckIcon className={`h-5 w-5 ${validatePassword(password) ? 'text-green-500' : 'text-gray-500'}`} />
                      <Typography variant="small" className="text-gray-300">
                        {req}
                      </Typography>
                    </div>
                  ))}
                </div>
              </div>

              {/* CV Upload */}
              <div>
                <Typography variant="h5" className="mb-2 text-blue-300">
                  Upload Your CV
                </Typography>
                <div className="flex items-center gap-4">
                  <label className="block">
                    <span className="sr-only">Choose CV file</span>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                      onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                      className="block w-full text-sm text-gray-400
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-lg file:border-0
                        file:text-sm file:font-semibold
                        file:bg-blue-600 file:text-white
                        hover:file:bg-blue-500"
                      required
                    />
                  </label>
                  {cvFile && (
                    <Typography variant="small" className="text-gray-300">
                      {cvFile.name}
                    </Typography>
                  )}
                </div>
                <Typography variant="small" className="mt-1 text-gray-400">
                  Accepted formats: PDF, DOC, DOCX, JPG, JPEG, PNG, GIF
                </Typography>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-6 bg-blue-600 hover:bg-blue-500"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <Spinner className="h-5 w-5" />
                    Creating Account...
                  </div>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>

            {/* Login Link */}
            <Typography variant="small" className="mt-6 text-center text-gray-400">
              Already have an account?{' '}
              <a href="/login" className="font-medium text-blue-400 hover:text-blue-300 transition-colors">
                Sign in
              </a>
            </Typography>
          </CardBody>
        </Card>
      </div>
    </main>
  );
}

export default RegisterForm;