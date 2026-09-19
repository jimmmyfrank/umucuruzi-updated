import { useState, useEffect } from 'react';
import api from '../api';
import { Trash2, Edit, Plus, X, ImageOff } from 'lucide-react';

export default function Markets() {
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMarket, setEditingMarket] = useState(null);
  const [uploading, setUploading] = useState({ logo: false, banner: false });

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const [formData, setFormData] = useState({
    name: '',
    district: '',
    sector: '',
    cell: '',
    village: '',
    coordinates: '',
    description: '',
    days_active: [],
    is_active: true,
    logo_image: '',   // <-- NEW
    banner_image: '', // <-- NEW
  });

  // Helper to construct image URL
  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('/uploads')) return `http://localhost:5002${path}`;
    return path;
  };

  // Ultimate parser for days_active
  const parseDaysActive = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
      let str = value.trim();
      if (str.startsWith('"') && str.endsWith('"')) str = str.slice(1, -1);
      str = str.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
      try {
        const parsed = JSON.parse(str);
        if (Array.isArray(parsed)) return parsed;
      } catch (_) {}
      if (str.startsWith('[') && str.endsWith(']')) str = str.slice(1, -1);
      return str.split(',').map(s => s.trim().replace(/^"|"$/g, '')).filter(s => s.length > 0);
    }
    return [];
  };

  // ----- Image Upload Handler -----
  const handleImageUpload = async (e, targetField) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(prev => ({ ...prev, [targetField === 'banner_image' ? 'banner' : 'logo']: true }));

    const formDataUpload = new FormData();
    formDataUpload.append('image', file);

    try {
      const res = await api.post('/admin/upload', formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData(prev => ({ ...prev, [targetField]: res.data.url }));
    } catch (err) {
      alert('Failed to upload image.');
    } finally {
      setUploading(prev => ({ ...prev, [targetField === 'banner_image' ? 'banner' : 'logo']: false }));
    }
  };

  // ----- Fetch markets -----
  const fetchMarkets = async () => {
    try {
      const res = await api.get('/admin/markets');
      const parsed = res.data.map(m => ({
        ...m,
        days_active: parseDaysActive(m.days_active),
      }));
      setMarkets(parsed);
    } catch (err) {
      console.error('Error fetching markets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMarkets(); }, []);

  // ----- Form handling -----
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleDayToggle = (day) => {
    const current = [...formData.days_active];
    if (current.includes(day)) {
      setFormData({ ...formData, days_active: current.filter(d => d !== day) });
    } else {
      setFormData({ ...formData, days_active: [...current, day] });
    }
  };

  const openEditModal = (market) => {
    setEditingMarket(market);
    setFormData({
      name: market.name || '',
      district: market.district || '',
      sector: market.sector || '',
      cell: market.cell || '',
      village: market.village || '',
      coordinates: market.coordinates || '',
      description: market.description || '',
      days_active: market.days_active || [],
      is_active: market.is_active !== undefined ? market.is_active : true,
      logo_image: market.logo_image || '',
      banner_image: market.banner_image || '',
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingMarket(null);
    setFormData({
      name: '', district: '', sector: '', cell: '', village: '', coordinates: '', description: '', days_active: [], is_active: true, logo_image: '', banner_image: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        days_active: JSON.stringify(formData.days_active),
      };
      if (editingMarket) {
        await api.put(`/admin/markets/${editingMarket.id}`, payload);
      } else {
        await api.post('/admin/markets', payload);
      }
      closeModal();
      fetchMarkets();
    } catch (err) {
      alert(err.response?.data?.error || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this market?')) return;
    try {
      await api.delete(`/admin/markets/${id}`);
      fetchMarkets();
    } catch (err) {
      alert('Failed to delete market');
    }
  };

  // ----- Render -----
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Markets Management</h2>
        <button onClick={() => { setEditingMarket(null); setFormData({ name: '', district: '', sector: '', cell: '', village: '', coordinates: '', description: '', days_active: [], is_active: true, logo_image: '', banner_image: '' }); setModalOpen(true); }} className="flex items-center gap-2 bg-[#FF6B35] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#e55a2a] transition shadow-md">
          <Plus size={18} /> Add Market
        </button>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading markets...</div>
        ) : markets.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No markets created yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-100 text-gray-600 text-sm font-semibold">
                <tr>
                  <th className="p-4">Images</th>
                  <th className="p-4">Name</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Days Active</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {markets.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50 transition">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {/* Banner Thumbnail */}
                        {m.banner_image ? (
                          <img src={getImageUrl(m.banner_image)} alt="Banner" className="w-12 h-8 rounded object-cover border bg-gray-100" />
                        ) : <div className="w-12 h-8 rounded bg-gray-200 flex items-center justify-center"><ImageOff size={14} className="text-gray-400" /></div>}
                        {/* Logo Thumbnail */}
                        {m.logo_image ? (
                          <img src={getImageUrl(m.logo_image)} alt="Logo" className="w-8 h-8 rounded-full object-cover border bg-gray-100" />
                        ) : <div className="w-8 h-8 rounded-full bg-gray-200 border flex items-center justify-center text-[8px] text-gray-400 font-bold">LOGO</div>}
                      </div>
                    </td>
                    <td className="p-4 font-medium">{m.name}</td>
                    <td className="p-4 text-sm text-gray-600">
                      {m.district && <div><span className="font-bold">District:</span> {m.district}</div>}
                      {m.sector && <div><span className="font-bold">Sector:</span> {m.sector}</div>}
                    </td>
                    <td className="p-4 text-sm">
                      {m.days_active && m.days_active.length > 0
                        ? m.days_active.join(', ')
                        : <span className="text-gray-400 italic">No days set</span>}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${m.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {m.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button onClick={() => openEditModal(m)} className="p-1 text-blue-600 hover:bg-blue-50 rounded transition">
                        <Edit size={18} />
                      </button>
                      <button onClick={() => handleDelete(m.id)} className="p-1 text-red-600 hover:bg-red-50 rounded transition">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h3 className="text-xl font-bold text-gray-800">
                {editingMarket ? 'Edit Market' : 'Create New Market'}
              </h3>
              <button onClick={closeModal} className="p-1 hover:bg-gray-100 rounded"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Market Name *</label>
                  <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#FF6B35]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                  <input type="text" name="district" value={formData.district} onChange={handleChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#FF6B35]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sector</label>
                  <input type="text" name="sector" value={formData.sector} onChange={handleChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#FF6B35]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cell</label>
                  <input type="text" name="cell" value={formData.cell} onChange={handleChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#FF6B35]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Village</label>
                  <input type="text" name="village" value={formData.village} onChange={handleChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#FF6B35]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Coordinates (optional)</label>
                  <input type="text" name="coordinates" placeholder="-1.9435, 30.0762" value={formData.coordinates} onChange={handleChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#FF6B35]" />
                </div>
              </div>

              {/* Image Uploads Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Market Logo</label>
                  <div className="flex flex-col gap-2">
                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'logo_image')} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#FF6B35] file:text-white hover:file:bg-[#e55a2a]" />
                    {uploading.logo && <p className="text-xs text-blue-500 animate-pulse">Uploading...</p>}
                    {formData.logo_image && <div className="mt-1 flex items-center gap-2"><img src={getImageUrl(formData.logo_image)} alt="Logo Preview" className="w-10 h-10 rounded-full object-cover border" /><span className="text-xs text-green-600">✅</span></div>}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Market Banner</label>
                  <div className="flex flex-col gap-2">
                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'banner_image')} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#FF6B35] file:text-white hover:file:bg-[#e55a2a]" />
                    {uploading.banner && <p className="text-xs text-blue-500 animate-pulse">Uploading...</p>}
                    {formData.banner_image && <div className="mt-1 flex items-center gap-2"><img src={getImageUrl(formData.banner_image)} alt="Banner Preview" className="w-16 h-10 rounded object-cover border" /><span className="text-xs text-green-600">✅</span></div>}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea name="description" rows="2" value={formData.description} onChange={handleChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#FF6B35]" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Days Active</label>
                <div className="flex flex-wrap gap-2">
                  {daysOfWeek.map(day => (
                    <label key={day} className="flex items-center gap-1 cursor-pointer bg-gray-100 px-3 py-1 rounded-lg hover:bg-gray-200 transition">
                      <input type="checkbox" checked={formData.days_active.includes(day)} onChange={() => handleDayToggle(day)} className="w-4 h-4 text-[#FF6B35] focus:ring-[#FF6B35]" />
                      <span className="text-sm font-medium">{day.slice(0, 3)}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange} className="w-4 h-4 text-[#FF6B35]" />
                  <span className="font-medium text-gray-700">Active</span>
                </label>
              </div>

              <div className="flex justify-end pt-4 border-t gap-3">
                <button type="button" onClick={closeModal} className="px-4 py-2 border rounded-lg hover:bg-gray-100 transition">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-[#FF6B35] text-white rounded-lg font-bold hover:bg-[#e55a2a] transition shadow-md">
                  {editingMarket ? 'Update Market' : 'Create Market'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}