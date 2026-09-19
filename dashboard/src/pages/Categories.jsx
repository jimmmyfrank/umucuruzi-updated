import { useState, useEffect } from 'react';
import api from '../api';

export default function Categories() {
  const [cats, setCats] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/admin/categories');
      setCats(res.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/categories', { name, description, icon: 'default' });
      setName('');
      setDescription('');
      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to add category');
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Product Categories</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow">
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="text"
              placeholder="Category Name (e.g. Electronics)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
            <textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border rounded"
            />
            <button type="submit" className="w-full bg-[#FF6B35] text-white py-2 rounded">
              Add Category
            </button>
          </form>
        </div>
        <div className="md:col-span-2 bg-white p-4 rounded-xl shadow">
          <ul className="list-disc pl-4">
            {cats.map((c) => (
              <li key={c.id} className="py-1">
                <strong>{c.name}</strong> – {c.description}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}