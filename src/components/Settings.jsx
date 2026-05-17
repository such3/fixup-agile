import React, { useState } from 'react';

export default function Settings({ collegeSettings, departments, categories, technicians, onUpdateSettings, onAddDept, onDeleteDept, onAddCat, onDeleteCat, onAddTech, onDeleteTech }) {
  // Settings form state
  const [settingsForm, setSettingsForm] = useState({
    collegeName: collegeSettings?.collegeName || '',
    subtitle: collegeSettings?.subtitle || ''
  });

  // New Department state
  const [newDept, setNewDept] = useState({ name: '', code: '', head: '' });
  
  // New Category state
  const [newCat, setNewCat] = useState({ name: '', description: '' });

  // New Technician state
  const [newTech, setNewTech] = useState({ name: '', specialization: '' });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSaveSettings = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await onUpdateSettings(settingsForm);
      setMessage('College branding updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      alert('Error updating settings: ' + err.message);
    }
    setLoading(false);
  };

  const handleCreateDept = async e => {
    e.preventDefault();
    if (!newDept.name.trim()) return;
    setLoading(true);
    try {
      await onAddDept(newDept);
      setNewDept({ name: '', code: '', head: '' });
    } catch (err) {
      alert('Error adding department: ' + err.message);
    }
    setLoading(false);
  };

  const handleCreateCat = async e => {
    e.preventDefault();
    if (!newCat.name.trim()) return;
    setLoading(true);
    try {
      await onAddCat(newCat);
      setNewCat({ name: '', description: '' });
    } catch (err) {
      alert('Error adding category: ' + err.message);
    }
    setLoading(false);
  };

  const handleCreateTech = async e => {
    e.preventDefault();
    if (!newTech.name.trim()) return;
    setLoading(true);
    try {
      await onAddTech(newTech);
      setNewTech({ name: '', specialization: '' });
    } catch (err) {
      alert('Error adding technician: ' + err.message);
    }
    setLoading(false);
  };

  return (
    <div className="settings-container" style={{ maxWidth: 1200, margin: '0 auto' }}>
      {message && (
        <div style={{ background: 'var(--status-rectified-bg)', color: 'var(--status-rectified-text)', padding: '16px 20px', borderRadius: 'var(--radius-md)', marginBottom: 28, fontWeight: 600, border: '1px solid var(--status-rectified-text)' }}>
          {message}
        </div>
      )}

      {/* 1. College Branding */}
      <div className="settings-section">
        <div style={{ marginBottom: 28, borderBottom: '1px solid var(--border-color)', paddingBottom: 16 }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--deep-navy)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24" style={{ color: 'var(--primary-blue)' }}>
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            College Branding & System Setup
          </h2>
          <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>
            Update the official college name and subtitle displayed across the portal and on printed physical dockets.
          </p>
        </div>

        <form onSubmit={handleSaveSettings} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Official College Name</label>
            <input 
              type="text" 
              className="form-input" 
              value={settingsForm.collegeName} 
              onChange={e => setSettingsForm({ ...settingsForm, collegeName: e.target.value })} 
              required
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Portal Subtitle</label>
            <input 
              type="text" 
              className="form-input" 
              value={settingsForm.subtitle} 
              onChange={e => setSettingsForm({ ...settingsForm, subtitle: e.target.value })} 
              required
            />
          </div>

          <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save College Branding'}
            </button>
          </div>
        </form>
      </div>

      {/* 2. Department Management */}
      <div className="settings-section">
        <div style={{ marginBottom: 28, borderBottom: '1px solid var(--border-color)', paddingBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--deep-navy)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24" style={{ color: 'var(--primary-blue)' }}>
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              Departments & Hostels Management
            </h2>
            <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>
              Add new academic departments, hostel blocks, or maintenance offices to the issue tracking system.
            </p>
          </div>
        </div>

        {/* Add Department Form */}
        <form onSubmit={handleCreateDept} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: 16, marginBottom: 32, background: 'var(--bg-main)', padding: 24, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '0.85rem' }}>Department / Hostel Name *</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g., AI & Data Science" 
              value={newDept.name}
              onChange={e => setNewDept({ ...newDept, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '0.85rem' }}>Dept Code</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g., AIDS" 
              value={newDept.code}
              onChange={e => setNewDept({ ...newDept, code: e.target.value })}
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '0.85rem' }}>HOD / Warden</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g., Dr. Ramesh" 
              value={newDept.head}
              onChange={e => setNewDept({ ...newDept, head: e.target.value })}
            />
          </div>

          <button type="submit" className="btn-primary" style={{ height: 50 }} disabled={loading}>
            Add Dept
          </button>
        </form>

        {/* Departments List */}
        <div className="settings-list">
          {departments.map(dept => (
            <div key={dept.id} className="settings-list-item">
              <div className="item-info">
                <span className="item-title">{dept.name} <span style={{ color: 'var(--primary-blue)', fontSize: '0.85rem', background: 'var(--primary-blue-light)', padding: '2px 8px', borderRadius: 12, marginLeft: 8 }}>{dept.code}</span></span>
                <span className="item-subtitle">HOD / Coordinator: {dept.head}</span>
              </div>
              <button className="btn-danger" onClick={() => onDeleteDept(dept.id)} disabled={loading}>
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Category Management */}
      <div className="settings-section">
        <div style={{ marginBottom: 28, borderBottom: '1px solid var(--border-color)', paddingBottom: 16 }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--deep-navy)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24" style={{ color: 'var(--primary-blue)' }}>
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            Fault Categories & Classification
          </h2>
          <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>
            Create and manage maintenance fault categories to classify incoming dockets accurately.
          </p>
        </div>

        {/* Add Category Form */}
        <form onSubmit={handleCreateCat} style={{ display: 'grid', gridTemplateColumns: '1.5fr 2fr auto', gap: 16, marginBottom: 32, background: 'var(--bg-main)', padding: 24, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '0.85rem' }}>Category Name *</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g., Projector & AV Systems" 
              value={newCat.name}
              onChange={e => setNewCat({ ...newCat, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '0.85rem' }}>Description</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g., Smart boards, audio amplifiers, ceiling projectors" 
              value={newCat.description}
              onChange={e => setNewCat({ ...newCat, description: e.target.value })}
            />
          </div>

          <button type="submit" className="btn-primary" style={{ height: 50 }} disabled={loading}>
            Add Category
          </button>
        </form>

        {/* Categories List */}
        <div className="settings-list">
          {categories.map(cat => (
            <div key={cat.id} className="settings-list-item">
              <div className="item-info">
                <span className="item-title">{cat.name}</span>
                <span className="item-subtitle">{cat.description}</span>
              </div>
              <button className="btn-danger" onClick={() => onDeleteCat(cat.id)} disabled={loading}>
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Technician Management */}
      <div className="settings-section">
        <div style={{ marginBottom: 28, borderBottom: '1px solid var(--border-color)', paddingBottom: 16 }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--deep-navy)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24" style={{ color: 'var(--primary-blue)' }}>
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.77 3.77z" />
            </svg>
            Maintenance Technicians & Staff
          </h2>
          <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>
            Manage the list of maintenance staff and site technicians available for docket assignment.
          </p>
        </div>

        {/* Add Technician Form */}
        <form onSubmit={handleCreateTech} style={{ display: 'grid', gridTemplateColumns: '1.5fr 2fr auto', gap: 16, marginBottom: 32, background: 'var(--bg-main)', padding: 24, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '0.85rem' }}>Technician Name *</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g., Basavaraj M." 
              value={newTech.name}
              onChange={e => setNewTech({ ...newTech, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '0.85rem' }}>Specialization Area</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g., HVAC & Air Conditioning" 
              value={newTech.specialization}
              onChange={e => setNewTech({ ...newTech, specialization: e.target.value })}
            />
          </div>

          <button type="submit" className="btn-primary" style={{ height: 50 }} disabled={loading}>
            Add Technician
          </button>
        </form>

        {/* Technicians List */}
        <div className="settings-list">
          {technicians.map(tech => (
            <div key={tech.id} className="settings-list-item">
              <div className="item-info">
                <span className="item-title">{tech.name}</span>
                <span className="item-subtitle">Specialization: {tech.specialization}</span>
              </div>
              <button className="btn-danger" onClick={() => onDeleteTech(tech.id)} disabled={loading}>
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
