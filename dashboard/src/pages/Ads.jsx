import { useState, useEffect } from 'react';
import api from '../api';
import { Plus, X, Trash2, Edit, ImageOff, Upload } from 'lucide-react';

export default function Ads() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAd, setEditingAd] = useState(null);
  
  const [uploading, setUploading] = useState({ logo: false, banner: false });

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    advertiser_image: '',
    image_url: '',
    link_url: '',
    placement: 'homepage',
    is_active: true,
  });

  // Fetch Ads
  const fetchAds = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/ads');
      setAds(res.data);
    } catch (err) {
      console.error('Error fetching ads:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAds(); }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  // Helper to construct the correct image URL (Port 5002)
  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('/uploads')) {
      return `http://localhost:5002${path}`;
    }
    return path;
  };

  // Image Upload Handler
  const handleImageUpload = async (e, targetField) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(prev => ({ ...prev, [targetField === 'image_url' ? 'banner' : 'logo']: true }));

    const formDataUpload = new FormData();
    formDataUpload.append('image', file);

    try {
      const res = await api.post('/admin/upload', formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData(prev => ({ ...prev, [targetField]: res.data.url }));
    } catch (err) {
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(prev => ({ ...prev, [targetField === 'image_url' ? 'banner' : 'logo']: false }));
    }
  };

  const openCreateModal = () => {
    setEditingAd(null);
    setFormData({
      title: '', subtitle: '', description: '', advertiser_image: '', image_url: '', link_url: '', placement: 'homepage', is_active: true
    });
    setModalOpen(true);
  };

  const openEditModal = (ad) => {
    setEditingAd(ad);
    setFormData({
      title: ad.title || '',
      subtitle: ad.subtitle || '',
      description: ad.description || '',
      advertiser_image: ad.advertiser_image || '',
      image_url: ad.image_url || '',
      link_url: ad.link_url || '',
      placement: ad.placement || 'homepage',
      is_active: ad.is_active !== undefined ? ad.is_active : true,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingAd(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAd) {
        await api.put(`/admin/ads/${editingAd.id}`, formData);
      } else {
        await api.post('/admin/ads', formData);
      }
      closeModal();
      fetchAds();
    } catch (err) {
      alert(err.response?.data?.error || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this advertisement?')) return;
    try {
      await api.delete(`/admin/ads/${id}`);
      fetchAds();
    } catch (err) {
      alert('Failed to delete ad');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Advertisements</h2>
          <p className="text-gray-500 text-sm mt-1">Manage sponsored banners and CTAs for your platform.</p>
        </div>
        <button onClick={openCreateModal} className="flex items-center gap-2 bg-[#FF6B35] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#e55a2a] transition shadow-md">
          <Plus size={18} /> New Ad
        </button>
      </div>

      {/* TABLE FORMAT */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading advertisements...</div>
        ) : ads.length === 0 ? (
          <div className="p-12 text-center text-gray-500 border-dashed border-2 border-gray-200">
            <p className="text-lg font-medium">No ads created yet.</p>
            <p className="text-sm">Click "New Ad" to promote a trader.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600 font-semibold border-b">
                <tr>
                  <th className="p-4">Banner & Logo</th>
                  <th className="p-4">Title & Subtitle</th>
                  <th className="p-4">Placement</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">CTA Link</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {ads.map((ad) => (
                  <tr key={ad.id} className="hover:bg-gray-50 transition-colors">
                    {/* Images */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {ad.image_url ? (
                          <img src={getImageUrl(ad.image_url)} alt="Banner" className="w-16 h-10 rounded object-cover border bg-gray-100" />
                        ) : <div className="w-16 h-10 rounded bg-gray-200 flex items-center justify-center"><ImageOff size={16} className="text-gray-400" /></div>}
                        
                        {ad.advertiser_image ? (
                          <img src={getImageUrl(ad.advertiser_image)} alt="Logo" className="w-8 h-8 rounded-full object-cover border" />
                        ) : <div className="w-8 h-8 rounded-full bg-gray-200 border flex items-center justify-center text-[8px] text-gray-400 font-bold">LOGO</div>}
                      </div>
                    </td>

                    {/* Title & Subtitle */}
                    <td className="p-4">
                      <div className="font-semibold text-gray-800">{ad.title}</div>
                      <div className="text-xs text-gray-500 truncate max-w-[150px]">{ad.subtitle || '—'}</div>
                    </td>

                    {/* Placement */}
                    <td className="p-4 capitalize text-gray-600">
                      {ad.placement}
                    </td>

                    {/* Status */}
                    <td className="p-4">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${ad.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {ad.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>

                    {/* CTA Link */}
                    <td className="p-4">
                      {ad.link_url ? (
                        <a href={ad.link_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate max-w-[150px] block">
                          {ad.link_url}
                        </a>
                      ) : <span className="text-gray-400 italic">None</span>}
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right space-x-2">
                      <button onClick={() => openEditModal(ad)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Edit">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDelete(ad.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition" title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ----- CREATE/EDIT MODAL (Unchanged) ----- */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h3 className="text-xl font-bold text-gray-800">
                {editingAd ? 'Edit Advertisement' : 'Create New Advertisement'}
              </h3>
              <button onClick={closeModal} className="p-1 hover:bg-gray-100 rounded-full transition">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Title & Subtitle */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input type="text" name="title" required value={formData.title} onChange={handleChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#FF6B35]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                  <input type="text" name="subtitle" placeholder="e.g. Limited time offer" value={formData.subtitle} onChange={handleChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#FF6B35]" />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
                <textarea name="description" rows="2" placeholder="Describe the offer in 2 lines..." value={formData.description} onChange={handleChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#FF6B35]" />
              </div>

              {/* Image Uploads Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Advertiser Logo</label>
                  <div className="flex flex-col gap-2">
                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'advertiser_image')} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#FF6B35] file:text-white hover:file:bg-[#e55a2a]" />
                    {uploading.logo && <p className="text-xs text-blue-500 animate-pulse">Uploading...</p>}
                    {formData.advertiser_image && <div className="mt-1 flex items-center gap-2"><img src={getImageUrl(formData.advertiser_image)} alt="Logo Preview" className="w-10 h-10 rounded-full object-cover border" /><span className="text-xs text-green-600">✅</span></div>}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Banner Image *</label>
                  <div className="flex flex-col gap-2">
                    <input type="file" accept="image/*" required={!editingAd && !formData.image_url} onChange={(e) => handleImageUpload(e, 'image_url')} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#FF6B35] file:text-white hover:file:bg-[#e55a2a]" />
                    {uploading.banner && <p className="text-xs text-blue-500 animate-pulse">Uploading...</p>}
                    {formData.image_url && <div className="mt-1 flex items-center gap-2"><img src={getImageUrl(formData.image_url)} alt="Banner Preview" className="w-16 h-10 rounded object-cover border" /><span className="text-xs text-green-600">✅</span></div>}
                  </div>
                </div>
              </div>

              {/* CTA Link & Placement */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CTA Link (Trader URL)</label>
                  <input type="text" name="link_url" placeholder="https://.../trader-shop" value={formData.link_url} onChange={handleChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#FF6B35]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Placement</label>
                  <select name="placement" value={formData.placement} onChange={handleChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#FF6B35]">
                    <option value="homepage">Homepage</option>
                    <option value="product_detail">Product Detail</option>
                    <option value="market">Markets</option>
                    <option value="all">All Pages</option>
                  </select>
                </div>
              </div>

              {/* Active Checkbox */}
              <div className="flex items-center gap-3 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange} className="w-5 h-5 text-[#FF6B35] focus:ring-[#FF6B35]" />
                  <span className="font-medium text-gray-700">Active (visible to customers)</span>
                </label>
              </div>

              {/* Actions */}
              <div className="flex justify-end pt-4 border-t gap-3">
                <button type="button" onClick={closeModal} className="px-4 py-2 border rounded-lg hover:bg-gray-100 transition">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-[#FF6B35] text-white rounded-lg font-bold hover:bg-[#e55a2a] transition shadow-md">
                  {editingAd ? 'Update Ad' : 'Publish Ad'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}