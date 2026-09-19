import { useState, useEffect } from 'react';
import api from '../api';

export default function Settings() {
  const [settings, setSettings] = useState([]);
  const [key, setKey] = useState('');
  const [value, setValue] = useState('');

  useEffect(() => { api.get('/admin/settings').then(res => setSettings(res.data)); }, []);

  const updateSetting = async (e) => {
    e.preventDefault();
    await api.put('/admin/settings', { key, value });
    setKey(''); setValue('');
    const res = await api.get('/admin/settings');
    setSettings(res.data);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">System Settings & Monitoring</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="font-bold mb-4">Add/Update Setting</h3>
          <form onSubmit={updateSetting} className="space-y-3">
            <input placeholder="Key (e.g. referral_points)" value={key} onChange={e => setKey(e.target.value)} className="w-full p-2 border rounded" required />
            <input placeholder="Value" value={value} onChange={e => setValue(e.target.value)} className="w-full p-2 border rounded" required />
            <button type="submit" className="w-full bg-[#FF6B35] text-white py-2 rounded">Update</button>
          </form>
        </div>
        <div className="md:col-span-2 bg-white p-4 rounded-xl shadow">
          <h3 className="font-bold mb-4">Current Settings</h3>
          <ul className="space-y-2">
            {settings.map(s => (
              <li key={s.id} className="flex justify-between border-b pb-1">
                <span className="font-mono text-gray-600">{s.setting_key}:</span>
                <span className="font-bold">{s.setting_value}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}