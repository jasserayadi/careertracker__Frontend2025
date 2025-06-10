'use client'; // Mark this as a Client Component

import { useEffect, useState } from 'react';
import { Typography, Card, CardBody, Input, Button } from '@material-tailwind/react';
import { UserIcon, EnvelopeIcon, DocumentIcon, CalendarIcon } from '@heroicons/react/24/solid';
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
  job?: {
    jobId: number;
    jobName: string;
  };
}

const GetUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
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
  const router = useRouter();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('http://localhost:5054/api/users');
        if (!response.ok) {
          throw new Error('Failed to load users');
        }
        const data = await response.json();

        console.log('API Response:', data);

        if (Array.isArray(data)) {
          setUsers(data);
        } else {
          console.error("Received data:", data);
          throw new Error("Received data is not an array of users");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

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
    setUpdateForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCvFile(e.target.files[0]);
    }
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
        formData.append('password', updateForm.password);
        formData.append('confirmPassword', updateForm.confirmPassword);
      }

      if (cvFile) {
        formData.append('cvFile', cvFile);
      }

      const response = await fetch(
        `http://localhost:5054/api/users/update/${userToUpdate.userId}`,
        {
          method: 'PUT',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update user');
      }

      const updatedUser = await response.json();

      setUsers((users) =>
        users.map((user) =>
          user.userId === updatedUser.userId ? updatedUser : user
        )
      );

      setUserToUpdate(null);
      setCvFile(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const deleteUser = async () => {
    if (userToDelete === null) return;

    try {
      const response = await fetch(
        `http://localhost:5054/api/users/delete/${userToDelete}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      setUsers((users) => users.filter((user) => user.userId !== userToDelete));
      setUserToDelete(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const viewProfile = (userId: number) => {
    router.push(`/Pages/UserPages/Profile/${userId}`);
  };

  if (loading) {
    return (
      <Typography className="text-center text-gray-600">
        Loading users...
      </Typography>
    );
  }

  if (error) {
    return (
      <Typography className="text-center text-red-500">Error: {error}</Typography>
    );
  }

  return (
    <section className="w-full max-w-4xl mx-auto flex flex-col items-center px-4 py-10">
      <Typography variant="h2" className="text-center mb-2" color="blue-gray">
        User List
      </Typography>
      <Typography
        variant="lead"
        className="mb-16 w-full text-center font-normal !text-gray-500 lg:w-10/12"
      >
        Explore the list of users registered on the platform.
      </Typography>
      <div className="grid grid-cols-1 gap-6 w-full">
        {users.map((user) => (
          <Card key={user.userId} className="w-full">
            <CardBody>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex items-center justify-center md:justify-start">
                  <UserIcon className="h-12 w-12 text-blue-gray-900" />
                </div>
                <div className="flex-1">
                  <Typography variant="h5" color="blue-gray" className="mb-2">
                    {user.firstname} {user.lastname}
                  </Typography>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <EnvelopeIcon className="h-5 w-5 text-gray-700" />
                      <Typography className="font-normal !text-gray-500">
                        {user.email}
                      </Typography>
                    </div>
                    <div className="flex items-center gap-2">
                      <DocumentIcon className="h-5 w-5 text-gray-700" />
                      <Typography className="font-normal !text-gray-500">
                        {user.role?.roleName || 'No role'}
                      </Typography>
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-5 w-5 text-gray-700" />
                      <Typography className="font-normal !text-gray-500">
                        {user.dateCreation
                          ? new Date(user.dateCreation).toLocaleDateString()
                          : 'Not specified'}
                      </Typography>
                    </div>
                    {user.cv?.cvFile && (
                      <div className="flex items-center gap-2">
                        <a
                          href={`http://localhost:5054/uploads/${user.cv.cvFile}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline"
                        >
                          View CV
                        </a>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => viewProfile(user.userId)}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                      >
                        See Profile
                      </button>
                      <button
                        onClick={() => prepareUpdateUser(user)}
                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                      >
                        Update
                      </button>
                      <button
                        onClick={() => confirmDeleteUser(user.userId)}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {userToDelete !== null && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg">
            <Typography variant="h5" color="blue-gray" className="mb-4">
              Are you sure you want to delete this user?
            </Typography>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setUserToDelete(null)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={deleteUser}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update User Modal */}
      {userToUpdate !== null && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <Typography variant="h5" color="blue-gray" className="mb-4">
              Update User: {userToUpdate.firstname} {userToUpdate.lastname}
            </Typography>

            <div className="space-y-4">
              <Input
                label="Username"
                name="username"
                value={updateForm.username}
                onChange={handleUpdateFormChange}
              />
              <Input
                label="First Name"
                name="firstname"
                value={updateForm.firstname}
                onChange={handleUpdateFormChange}
              />
              <Input
                label="Last Name"
                name="lastname"
                value={updateForm.lastname}
                onChange={handleUpdateFormChange}
              />
              <Input
                label="Email"
                name="email"
                type="email"
                value={updateForm.email}
                onChange={handleUpdateFormChange}
              />
              <Input
                label="Password (leave blank to keep current)"
                name="password"
                type="password"
                value={updateForm.password}
                onChange={handleUpdateFormChange}
              />
              {updateForm.password && (
                <Input
                  label="Confirm Password"
                  name="confirmPassword"
                  type="password"
                  value={updateForm.confirmPassword}
                  onChange={handleUpdateFormChange}
                />
              )}

              <div>
                <Typography variant="small" className="mb-2">
                  Update CV:
                </Typography>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => {
                  setUserToUpdate(null);
                  setCvFile(null);
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={updateUser}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default GetUsers;