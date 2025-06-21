
'use client';

import { useEffect, useState, useCallback } from 'react';
import { Typography, Card, CardBody, Input, Button, Select, Option, Spinner } from '@material-tailwind/react';
import { UserIcon, EnvelopeIcon, DocumentIcon, CalendarIcon, MagnifyingGlassIcon, ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';
import { useRouter } from 'next/navigation';

interface User {
  userId: number;
  username: string;
  firstname: string;
  lastname: string;
  email: string;
  dateCreation?: string;
  role?: {
    roleName: string;
  };
  cv?: {
    cvFile: string;
  };
}

const GetUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | ''>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userToDelete, setUserToDelete] = useState<number | null>(null);
  const [userToUpdate, setUserToUpdate] = useState<User | null>(null);
  const [updateForm, setUpdateForm] = useState({
    username: '',
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [moodleUpdating, setMoodleUpdating] = useState(false);
  const router = useRouter();

  const updateMoodleUserIds = useCallback(async () => {
    setMoodleUpdating(true);
    try {
      const response = await fetch('http://localhost:5054/api/Inscription/update-moodle-user-ids', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Uncomment if authentication is required
          // 'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update Moodle user IDs');
      }

      await fetchUsers(); // Refresh user list after successful update
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update Moodle user IDs');
    } finally {
      setMoodleUpdating(false);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:5054/api/users');
      if (!response.ok) throw new Error('Failed to load users');
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setUsers(data);
        setFilteredUsers(data);
      } else {
        throw new Error('Invalid data format received');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    updateMoodleUserIds();
  }, [fetchUsers, updateMoodleUserIds]);

  useEffect(() => {
    setIsTyping(true);
    const timer = setTimeout(() => {
      filterAndSortUsers();
      setIsTyping(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, sortOrder, users]);

  const filterAndSortUsers = () => {
    let results = [...users];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(user => 
        user.username.toLowerCase().includes(query) ||
        user.firstname.toLowerCase().includes(query) ||
        user.lastname.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.role?.roleName.toLowerCase().includes(query)
      );
    }

    if (sortOrder) {
      results.sort((a, b) => {
        const comparison = a.username.localeCompare(b.username);
        return sortOrder === 'asc' ? comparison : -comparison;
      });
    }

    setFilteredUsers(results);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSortChange = (value: string) => {
    setSortOrder(value as 'asc' | 'desc' | '');
  };

  const confirmDeleteUser = (userId: number) => {
    setUserToDelete(userId);
  };

  const prepareUpdateUser = (user: User) => {
    setUserToUpdate(user);
    setUpdateForm({
      username: user.username,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      password: '',
      confirmPassword: '',
    });
  };

  const handleUpdateFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUpdateForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setCvFile(e.target.files[0]);
  };

  const updateUser = async () => {
    if (!userToUpdate) return;

    try {
      const formData = new FormData();
      formData.append('username', updateForm.username);
      formData.append('firstname', updateForm.firstname);
      formData.append('lastname', updateForm.lastname);
      formData.append('email', updateForm.email);
      
      if (updateForm.password) {
        if (updateForm.password !== updateForm.confirmPassword) {
          throw new Error("Passwords don't match");
        }
        formData.append('password', updateForm.password);
      }
      
      if (cvFile) formData.append('cvFile', cvFile);

      const response = await fetch(`http://localhost:5054/api/users/update/${userToUpdate.userId}`, {
        method: 'PUT',
        body: formData,
      });

      if (!response.ok) throw new Error(await response.text());

      const updatedUser = await response.json();
      setUsers(users.map(u => u.userId === updatedUser.userId ? updatedUser : u));
      setUserToUpdate(null);
      setCvFile(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    }
  };

  const deleteUser = async () => {
    if (userToDelete === null) return;

    try {
      const response = await fetch(`http://localhost:5054/api/users/delete/${userToDelete}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Delete failed');

      setUsers(users.filter(u => u.userId !== userToDelete));
      setUserToDelete(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete error');
    }
  };

  const viewProfile = (userId: number) => {
    router.push(`/Pages/UserPages/Profile/${userId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <Spinner className="h-16 w-16 text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-gray-900">
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-red-800">Error</h3>
              <p className="text-red-700">{error}</p>
              <Button 
                onClick={() => { fetchUsers(); updateMoodleUserIds(); }} 
                color="red" 
                variant="text" 
                className="mt-2"
              >
                Retry
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 text-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <Typography variant="h1" className="text-4xl md:text-5xl font-extrabold text-blue-300 mb-4">
            User Management Portal
          </Typography>
          <Typography className="text-xl text-gray-400 max-w-3xl mx-auto">
            Manage all registered users with powerful search, sorting, and editing capabilities
          </Typography>
        </div>

        {moodleUpdating && (
          <div className="flex justify-center mb-6">
            <Spinner className="h-8 w-8 text-blue-400" />
            <Typography className="ml-2 text-gray-300">Updating Moodle user IDs...</Typography>
          </div>
        )}

        <div className="bg-gray-800 p-6 rounded-xl shadow-lg mb-10 border border-blue-700">
          <div className="flex flex-col lg:flex-row gap-6 items-end">
            <div className="w-full lg:w-3/4">
              <Typography variant="h6" className="mb-2 text-blue-400 font-semibold">
                Search Users
              </Typography>
              <div className="relative">
                <Input
                  size="lg"
                  placeholder="Search by name, email, or role..."
                  icon={<MagnifyingGlassIcon className="h-6 w-6 text-blue-400" />}
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="!border-2 !border-blue-700 focus:!border-blue-400 !bg-gray-800 text-white !rounded-xl !py-3 !pl-12"
                  labelProps={{ className: "hidden" }}
                />
                {isTyping && (
                  <div className="absolute right-3 top-3">
                    <Spinner className="h-6 w-6 text-blue-400" />
                  </div>
                )}
              </div>
            </div>
            <div className="w-full lg:w-1/4">
              <Typography variant="h6" className="mb-2 text-blue-400 font-semibold">
                Sort By
              </Typography>
              <Select
                size="lg"
                value={sortOrder}
                onChange={handleSortChange}
                className="!border-2 !border-blue-700 focus:!border-blue-400 !bg-gray-800 text-white !rounded-xl"
                menuProps={{ className: "!border-2 !border-blue-700 !rounded-xl !bg-gray-800 text-white" }}
              >
                <Option value="" className="text-lg flex items-center gap-2 text-white bg-gray-800">
                  <span></span>
                </Option>
                <Option value="asc" className="text-lg flex items-center gap-2 text-white bg-gray-800">
                  <ArrowUpIcon className="h-5 w-5" />
                  <span>A-Z</span>
                </Option>
                <Option value="desc" className="text-lg flex items-center gap-2 text-white bg-gray-800">
                  <ArrowDownIcon className="h-5 w-5" />
                  <span>Z-A</span>
                </Option>
              </Select>
            </div>
          </div>
        </div>

        <div className="mb-6 flex justify-between items-center">
          <Typography variant="h5" className="text-blue-300 font-semibold">
            {filteredUsers.length} {filteredUsers.length === 1 ? 'User' : 'Users'} Found
          </Typography>
          <Button 
            onClick={fetchUsers} 
            color="blue" 
            variant="gradient" 
            className="flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            Refresh
          </Button>
        </div>

        <div className="space-y-4">
          {filteredUsers.map((user) => (
            <Card key={user.userId} className="bg-gray-800 hover:bg-gray-700 transition-all duration-300 border-2 border-blue-700 hover:border-blue-500">
              <CardBody className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-900 rounded-xl">
                      <UserIcon className="h-8 w-8 text-blue-400" />
                    </div>
                    <div>
                      <Typography variant="h3" className="text-xl font-bold text-blue-300">
                        {user.firstname} {user.lastname}
                      </Typography>
                      <Typography className="text-blue-400 font-medium">
                        @{user.username}
                      </Typography>
                      {user.role?.roleName && (
                        <span className="inline-block mt-1 px-2 py-1 text-xs font-semibold rounded-full bg-blue-900 text-blue-300">
                          {user.role.roleName}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={() => viewProfile(user.userId)}
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-4 py-2 text-sm font-semibold rounded-lg transition-all"
                    >
                      <UserIcon className="h-4 w-4" />
                      Profile
                    </Button>
                    <Button
                      onClick={() => prepareUpdateUser(user)}
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-500 px-4 py-2 text-sm font-semibold rounded-lg transition-all"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                      Edit
                    </Button>
                    <Button
                      onClick={() => confirmDeleteUser(user.userId)}
                      className="flex items-center gap-2 bg-red-600 hover:bg-red-500 px-4 py-2 text-sm font-semibold rounded-lg transition-all"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Delete
                    </Button>
                  </div>
                </div>
                <div className="mt-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <EnvelopeIcon className="h-5 w-5 text-blue-400 flex-shrink-0" />
                    <Typography className="text-gray-300 break-all">{user.email}</Typography>
                  </div>
                  <div className="flex items-center gap-3">
                    <CalendarIcon className="h-5 w-5 text-blue-400 flex-shrink-0" />
                    <Typography className="text-gray-300">
                      Joined: {user.dateCreation ? new Date(user.dateCreation).toLocaleDateString('en-US', {
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric'
                      }) : 'N/A'}
                    </Typography>
                  </div>
                  {user.cv?.cvFile && (
                    <div className="flex items-center gap-3">
                      <DocumentIcon className="h-5 w-5 text-blue-400 flex-shrink-0" />
                    <a 
                      href={`http://localhost:5054/uploads/${user.cv.cvFile}`} 
                      className="text-blue-400 hover:underline hover:text-blue-300 transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View CV
                    </a>
                  </div>
                  )}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        {filteredUsers.length === 0 && !isTyping && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <Typography variant="h3" className="mt-2 text-lg font-medium text-gray-300">
              No users found
            </Typography>
            <Typography className="mt-1 text-gray-400">
              Try adjusting your search or filter to find what you're looking for.
            </Typography>
          </div>
        )}

        {userToDelete !== null && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl shadow-2xl p-6 max-w-md w-full">
              <div className="text-center">
                <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <Typography variant="h3" className="text-lg font-medium text-gray-100 mt-3">
                  Delete User?
                </Typography>
                <Typography className="mt-2 text-gray-400">
                  This action cannot be undone. All user data will be permanently removed.
                </Typography>
              </div>
              <div className="mt-6 flex justify-center gap-4">
                <Button
                  onClick={() => setUserToDelete(null)}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-gray-100 rounded-lg font-medium"
                >
                  Cancel
                </Button>
                <Button
                  onClick={deleteUser}
                  className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-lg font-medium"
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}

        {userToUpdate !== null && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <Typography variant="h3" className="text-2xl font-bold text-blue-300">
                  Edit User: {userToUpdate.username}
                </Typography>
                <button
                  onClick={() => setUserToUpdate(null)}
                  className="text-gray-400 hover:text-gray-300"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Typography variant="small" className="text-gray-400 mb-1">
                    Username
                  </Typography>
                  <Input
                    size="lg"
                    name="username"
                    value={updateForm.username}
                    onChange={handleUpdateFormChange}
                    className="!border-2 !border-blue-700 focus:!border-blue-400 !bg-gray-800 text-white"
                  />
                </div>
                <div>
                  <Typography variant="small" className="text-gray-400 mb-1">
                    First Name
                  </Typography>
                  <Input
                    size="lg"
                    name="firstname"
                    value={updateForm.firstname}
                    onChange={handleUpdateFormChange}
                    className="!border-2 !border-blue-700 focus:!border-blue-400 !bg-gray-800 text-white"
                  />
                </div>
                <div>
                  <Typography variant="small" className="text-gray-400 mb-1">
                    Last Name
                  </Typography>
                  <Input
                    size="lg"
                    name="lastname"
                    value={updateForm.lastname}
                    onChange={handleUpdateFormChange}
                    className="!border-2 !border-blue-700 focus:!border-blue-400 !bg-gray-800 text-white"
                  />
                </div>
                <div>
                  <Typography variant="small" className="text-gray-400 mb-1">
                    Email
                  </Typography>
                  <Input
                    size="lg"
                    name="email"
                    type="email"
                    value={updateForm.email}
                    onChange={handleUpdateFormChange}
                    className="!border-2 !border-blue-700 focus:!border-blue-400 !bg-gray-800 text-white"
                  />
                </div>
                <div>
                  <Typography variant="small" className="text-gray-400 mb-1">
                    New Password
                  </Typography>
                  <Input
                    size="lg"
                    name="password"
                    type="password"
                    value={updateForm.password}
                    onChange={handleUpdateFormChange}
                    className="!border-2 !border-blue-700 focus:!border-blue-400 !bg-gray-800 text-white"
                  />
                </div>
                {updateForm.password && (
                  <div>
                    <Typography variant="small" className="text-gray-400 mb-1">
                      Confirm Password
                    </Typography>
                    <Input
                      size="lg"
                      name="confirmPassword"
                      type="password"
                      value={updateForm.confirmPassword}
                      onChange={handleUpdateFormChange}
                      className="!border-2 !border-blue-700 focus:!border-blue-400 !bg-gray-800 text-white"
                    />
                  </div>
                )}
              </div>
              
              <div className="mt-6">
                <Typography variant="h6" className="text-lg font-semibold text-gray-300 mb-3">
                  Update CV
                </Typography>
                <div className="flex items-center gap-4">
                  {userToUpdate.cv?.cvFile && (
                    <a
                      href={`http://localhost:5054/uploads/${userToUpdate.cv.cvFile}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline flex items-center gap-2"
                    >
                      <DocumentIcon className="h-5 w-5" />
                      Current CV
                    </a>
                  )}
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className="block w-full text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-2 file:border-blue-700 file:text-sm file:font-semibold file:bg-blue-900 file:text-blue-300 hover:file:bg-blue-800"
                  />
                </div>
              </div>
              
              <div className="mt-8 flex justify-end gap-4">
                <Button
                  onClick={() => setUserToUpdate(null)}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-gray-100 rounded-lg font-medium"
                >
                  Cancel
                </Button>
                <Button
                  onClick={updateUser}
                  className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium"
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default GetUsers;
