import React, { useState, useEffect } from 'react';

export default function DocketForm({ currentUser, departments, categories, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    complaintGivenBy: currentUser ? `${currentUser.name} (${currentUser.title || currentUser.role})` : '',
    department: currentUser?.department || (departments.length > 0 ? departments[0].name : ''),
    category: categories.length > 0 ? categories[0].name : '',
    location: '',
    priority: 'Medium',
    description: '',
    imageUrl: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        complaintGivenBy: `${currentUser.name} (${currentUser.title || currentUser.role})`,
        department: currentUser.department || prev.department
      }));
    }
  }, [currentUser]);

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageFileChange = e => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image file size must be less than 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, imageUrl: reader.result }));
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!formData.complaintGivenBy.trim()) {
      setError('Please enter the name of the complainant.');
      return;
    }
    if (!formData.description.trim()) {
      setError('Please provide a description of the fault.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await onSubmit(formData);
    } catch (err) {
      setError(err.message || 'Failed to submit fault docket.');
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <div className="card" style={{ padding: '48px 56px' }}>
        <div style={{ marginBottom: 36, borderBottom: '1px solid var(--border-color)', paddingBottom: 24 }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--deep-navy)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="28" height="28" style={{ color: 'var(--primary-blue)' }}>
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            File New Fault-Docket
          </h2>
          <p style={{ color: 'var(--text-muted)' }}>
            Complete the digital docket form below to report a maintenance fault or campus issue. You can also attach an image of the fault for better clarity.
          </p>
        </div>

        {error && (
          <div style={{ background: 'hsl(349, 89%, 95%)', color: 'var(--priority-urgent)', padding: '16px 20px', borderRadius: 'var(--radius-md)', marginBottom: 28, fontWeight: 600, border: '1px solid hsl(349, 89%, 85%)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="form-grid">
          <div className="form-group">
            <label className="form-label">
              Complaint Given By *
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>(Name & Designation)</span>
            </label>
            <input 
              type="text" 
              name="complaintGivenBy" 
              className="form-input" 
              placeholder="e.g., Sunita (Professor EEE)" 
              value={formData.complaintGivenBy} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Specific Location / Room No</label>
            <input 
              type="text" 
              name="location" 
              className="form-input" 
              placeholder="e.g., Lab 3, 2nd Floor / Staff Room 102" 
              value={formData.location} 
              onChange={handleChange} 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Department / Hostel</label>
            <select 
              name="department" 
              className="form-select" 
              value={formData.department} 
              onChange={handleChange}
            >
              {departments.map(d => (
                <option key={d.id} value={d.name}>{d.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Nature of Fault (Category)</label>
            <select 
              name="category" 
              className="form-select" 
              value={formData.category} 
              onChange={handleChange}
            >
              {categories.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group full-width">
            <label className="form-label">Priority Level</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginTop: 8 }}>
              {['Low', 'Medium', 'High', 'Urgent'].map(p => (
                <label 
                  key={p} 
                  style={{ 
                    padding: '14px', 
                    border: '1px solid var(--border-color)', 
                    borderRadius: 'var(--radius-md)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    gap: 10,
                    cursor: 'pointer',
                    background: formData.priority === p ? 'var(--bg-subtle)' : 'var(--bg-card)',
                    borderColor: formData.priority === p ? 'var(--primary-blue)' : 'var(--border-color)',
                    fontWeight: formData.priority === p ? 700 : 500,
                    color: formData.priority === p ? 'var(--primary-blue)' : 'var(--text-main)',
                    boxShadow: formData.priority === p ? 'var(--shadow-sm)' : 'none',
                    transition: 'var(--transition)'
                  }}
                >
                  <input 
                    type="radio" 
                    name="priority" 
                    value={p} 
                    checked={formData.priority === p} 
                    onChange={handleChange} 
                    style={{ display: 'none' }} 
                  />
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: p === 'Low' ? 'var(--priority-low)' : p === 'Medium' ? 'var(--priority-medium)' : p === 'High' ? 'var(--priority-high)' : 'var(--priority-urgent)' }}></span>
                  {p}
                </label>
              ))}
            </div>
          </div>

          {/* Image Attachment Section */}
          <div className="form-group full-width" style={{ background: 'var(--bg-main)', padding: 24, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <label className="form-label" style={{ marginBottom: 12 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20" style={{ color: 'var(--primary-blue)' }}>
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                Attach Fault Image (Optional)
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Upload file or paste URL</span>
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Upload Image File</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="form-input" 
                  style={{ background: 'var(--bg-card)', padding: '10px 14px', fontSize: '0.9rem' }}
                  onChange={handleImageFileChange}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Or Paste Image URL</label>
                <input 
                  type="url" 
                  name="imageUrl" 
                  className="form-input" 
                  style={{ background: 'var(--bg-card)', padding: '10px 14px', fontSize: '0.9rem' }}
                  placeholder="https://example.com/image.jpg" 
                  value={formData.imageUrl} 
                  onChange={e => { handleChange(e); setImagePreview(e.target.value); }} 
                />
              </div>
            </div>

            {imagePreview && (
              <div className="image-preview-box">
                <img src={imagePreview} alt="Fault Preview" onError={() => setImagePreview('')} />
              </div>
            )}
          </div>

          <div className="form-group full-width">
            <label className="form-label">Detailed Fault Description *</label>
            <textarea 
              name="description" 
              className="form-textarea" 
              placeholder="Describe the exact issue, symptoms, and any potential risks or immediate impact..." 
              value={formData.description} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="form-actions full-width">
            <button type="button" className="btn-secondary" onClick={onCancel} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Submitting Docket...' : 'Submit Fault-Docket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
