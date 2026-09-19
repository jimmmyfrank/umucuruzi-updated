import { useState, useEffect } from 'react';
import api from '../api';

export default function Users() {
  const [users, setUsers] = useState([]);
  useEffect(() => { api.get('/admin/users').then(res => setUsers(res.data)); }, []);

  const toggleStatus = async (id) => {
    await api.put(`/admin/users/${id}/toggle`);
    setUsers(users.map(u => u.id === id ? { ...u, is_active: !u.is_active } : u));
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">User Management</h2>
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-100">
            <tr><th className="p-4">Name</th><th>Username</th><th>Role</th><th>Phone</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-b">
                <td className="p-4">{u.full_name}</td>
                <td>{u.username}</td>
                <td><span className="capitalize bg-blue-100 text-blue-800 px-2 py-1 rounded">{u.role}</span></td>
                <td>{u.phone}</td>
                <td>
                  <span className={`px-2 py-1 rounded ${u.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {u.is_active ? 'Active' : 'Banned'}
                  </span>
                </td>
                <td>
                  <button onClick={() => toggleStatus(u.id)} className="text-sm bg-gray-200 px-3 py-1 rounded hover:bg-gray-300">
                    {u.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}