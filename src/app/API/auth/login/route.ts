// api.ts
const apiFetch = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('authToken');
  const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };

  const response = await fetch(`http://localhost:5054/api${url}`, {
      ...options,
      headers
  });

  if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.Message || 'Request failed');
  }

  return response.json();
};

export default apiFetch;