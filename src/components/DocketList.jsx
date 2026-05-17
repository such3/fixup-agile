import React, { useState, useEffect } from 'react';

export default function DocketList({ currentUser, dockets, departments, categories, onViewDocket, onNavigate }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedCat, setSelectedCat] = useState('ALL');
  const [selectedPriority, setSelectedPriority] = useState('ALL');
  const [activeTab, setActiveTab] = useState('ALL');

  // If currentUser is a Complainant, they might want to see their department by default
  useEffect(() => {
    if (currentUser?.role === 'Complainant' && currentUser.department) {
      // Keep ALL by default but allow easy filtering
    }
  }, [currentUser]);

  // Filter dockets
  const filteredDockets = dockets.filter(docket => {
    // Search filter
    const matchesSearch = 
      docket.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      docket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      docket.complaintGivenBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      docket.location.toLowerCase().includes(searchTerm.toLowerCase());

    // Department filter
    const matchesDept = selectedDept === 'ALL' || docket.department === selectedDept;

    // Category filter
    const matchesCat = selectedCat === 'ALL' || docket.category === selectedCat;

    // Priority filter
    const matchesPriority = selectedPriority === 'ALL' || docket.priority === selectedPriority;

    // Status tab filter
    const matchesTab = activeTab === 'ALL' || docket.status === activeTab;

    return matchesSearch && matchesDept && matchesCat && matchesPriority && matchesTab;
  });

  return (
    <div className="docket-list-container">
      {/* Top filter bar */}
      <div className="filter-bar">
        <div className="search-input-container">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input 
            type="text" 
            className="search-input" 
            placeholder="Search Docket NO, description, complainant, location..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-selects">
          <select 
            className="select-input"
            value={selectedDept}
            onChange={e => setSelectedDept(e.target.value)}
          >
            <option value="ALL">All Departments / Hostels</option>
            {departments.map(d => (
              <option key={d.id} value={d.name}>{d.name}</option>
            ))}
          </select>

          <select 
            className="select-input"
            value={selectedCat}
            onChange={e => setSelectedCat(e.target.value)}
          >
            <option value="ALL">All Categories / Faults</option>
            {categories.map(c => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>

          <select 
            className="select-input"
            value={selectedPriority}
            onChange={e => setSelectedPriority(e.target.value)}
          >
            <option value="ALL">All Priorities</option>
            <option value="Low">Low Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="High">High Priority</option>
            <option value="Urgent">Urgent Priority</option>
          </select>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="status-tabs">
        {['ALL', 'Submitted', 'Issued', 'Rectified', 'Closed'].map(tab => (
          <button 
            key={tab}
            className={`status-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'ALL' ? 'All Dockets' : tab}
            <span style={{ marginLeft: 8, background: activeTab === tab ? 'var(--primary-blue-light)' : 'transparent', padding: '2px 8px', borderRadius: 12, fontSize: '0.8rem' }}>
              {tab === 'ALL' ? dockets.length : dockets.filter(d => d.status === tab).length}
            </span>
          </button>
        ))}
      </div>

      {/* Dockets Grid */}
      {filteredDockets.length === 0 ? (
        <div className="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <h3>No Fault-Dockets Found</h3>
          <p>Try adjusting your search query, department, category, or status filter.</p>
          <button className="btn-primary" onClick={() => onNavigate('new')}>
            Create New Fault-Docket
          </button>
        </div>
      ) : (
        <div className="docket-grid">
          {filteredDockets.map(docket => (
            <div key={docket.id} className="docket-card" onClick={() => onViewDocket(docket)}>
              {docket.imageUrl && (
                <div className="docket-img-badge">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                  Image Attached
                </div>
              )}

              <div>
                <div className="docket-card-header">
                  <span className="docket-id">{docket.id}</span>
                  <span className={`badge badge-status ${docket.status.toLowerCase()}`}>
                    {docket.status}
                  </span>
                </div>

                <div className="docket-dept-cat">
                  <span>{docket.department}</span>
                  <span>{docket.category}</span>
                </div>

                <p className="docket-desc">{docket.description}</p>
                
                {docket.location && (
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    {docket.location}
                  </div>
                )}
              </div>

              <div className="docket-footer">
                <span className="docket-complainant">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  {docket.complaintGivenBy}
                </span>
                <span className={`badge badge-priority ${docket.priority.toLowerCase()}`}>
                  {docket.priority}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
