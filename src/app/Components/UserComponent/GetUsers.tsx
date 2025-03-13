'use client'; // Mark this as a Client Component

import { useEffect, useState } from 'react';
import { Typography, Card, CardBody } from '@material-tailwind/react';
import { UserIcon, EnvelopeIcon, DocumentIcon, CalendarIcon } from '@heroicons/react/24/solid';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userToDelete, setUserToDelete] = useState<number | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('http://localhost:5054/api/users');
        if (!response.ok) {
          throw new Error('Échec du chargement des utilisateurs');
        }
        const data = await response.json();

        console.log('Réponse de l’API :', data);

        if (Array.isArray(data)) {
          setUsers(data);
        } else {
          console.error("Données reçues :", data);
          throw new Error("Les données reçues ne sont pas un tableau d'utilisateurs");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const confirmDeleteUser = (userId: number) => {
    setUserToDelete(userId);
  };

  const deleteUser = async () => {
    if (userToDelete === null) return;

    try {
      const response = await fetch(`http://localhost:5054/api/users/delete/${userToDelete}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error("Échec de la suppression de l’utilisateur");
      }

      setUsers(users.filter((user) => user.userId !== userToDelete));
      setUserToDelete(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    }
  };

  if (loading) {
    return <Typography className="text-center text-gray-600">Chargement des utilisateurs...</Typography>;
  }

  if (error) {
    return <Typography className="text-center text-red-500">Erreur : {error}</Typography>;
  }

  return (
    <section className="w-full max-w-4xl mx-auto flex flex-col items-center px-4 py-10">
      <Typography variant="h2" className="text-center mb-2" color="blue-gray">
        Liste des utilisateurs
      </Typography>
      <Typography
        variant="lead"
        className="mb-16 w-full text-center font-normal !text-gray-500 lg:w-10/12"
      >
        Explorez la liste des utilisateurs inscrits sur la plateforme.
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
                        {user.role?.roleName || 'Aucun rôle'}
                      </Typography>
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-5 w-5 text-gray-700" />
                      <Typography className="font-normal !text-gray-500">
                        {user.dateCreation
                          ? new Date(user.dateCreation).toLocaleDateString()
                          : 'Non spécifié'}
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
                          Voir CV
                        </a>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => confirmDeleteUser(user.userId)}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Confirmation Modal */}
      {userToDelete !== null && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg">
            <Typography variant="h5" color="blue-gray" className="mb-4">
              Êtes-vous sûr de vouloir supprimer cet utilisateur ?
            </Typography>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setUserToDelete(null)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Annuler
              </button>
              <button
                onClick={deleteUser}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default GetUsers;
