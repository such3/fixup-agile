import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import DocketList from './components/DocketList';
import DocketForm from './components/DocketForm';
import DocketDetailModal from './components/DocketDetailModal';
import Settings from './components/Settings';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [collegeSettings, setCollegeSettings] = useState({
    collegeName: 'SDM College of Engineering & Technology, Dharwad',
    subtitle: 'Digital Fault-Docket & Campus Issue Tracking Portal'
  });
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [dockets, setDockets] = useState([]);
  const [selectedDocket, setSelectedDocket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Helper for fetching endpoints with robust error logging
  const fetchEndpoint = async (url) => {
    try {
      const res = await fetch(url);
      if (!res.ok) {
        const errText = await res.text().catch(() => 'No error text');
        console.error(`Failed to load resource: GET ${url} responded with status ${res.status} (${res.statusText}). Details:`, errText);
        throw new Error(`GET ${url} failed with status ${res.status} (${res.statusText})`);
      }
      return await res.json();
    } catch (err) {
      console.error(`Network or parsing error on GET ${url}:`, err);
      throw err;
    }
  };

  // Fetch initial data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [setRes, userRes, deptRes, catRes, techRes, dockRes] = await Promise.all([
        fetchEndpoint('/api/settings'),
        fetchEndpoint('/api/users'),
        fetchEndpoint('/api/departments'),
        fetchEndpoint('/api/categories'),
        fetchEndpoint('/api/technicians'),
        fetchEndpoint('/api/dockets')
      ]);

      if (setRes && !setRes.error) setCollegeSettings(setRes);
      if (userRes && Array.isArray(userRes)) {
        setUsers(userRes);
        if (userRes.length > 0) setCurrentUser(userRes[0]); // Default to Anant (Admin)
      }
      if (deptRes && Array.isArray(deptRes)) setDepartments(deptRes);
      if (catRes && Array.isArray(catRes)) setCategories(catRes);
      if (techRes && Array.isArray(techRes)) setTechnicians(techRes);
      if (dockRes && Array.isArray(dockRes)) setDockets(dockRes);
    } catch (err) {
      console.error('Error fetching campus docket data:', err);
      setError(`Failed to load campus docket data: ${err.message}. Please ensure the Express backend server is running on port 5000 and Vite proxy is configured.`);
    }
    setLoading(false);
  };

  // Handlers for Dockets
  const handleCreateDocket = async formData => {
    try {
      const res = await fetch('/api/dockets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        console.error('Failed to load resource: POST /api/dockets responded with status', res.status, errText);
        throw new Error(`Failed to create docket (Status ${res.status})`);
      }
      const newDocket = await res.json();
      setDockets([newDocket, ...dockets]);
      setActiveTab('dockets');
    } catch (err) {
      console.error('Error in handleCreateDocket:', err);
      alert(err.message);
      throw err;
    }
  };

  const handleUpdateDocket = async (id, updateData) => {
    try {
      const res = await fetch(`/api/dockets/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });
      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        console.error(`Failed to load resource: PUT /api/dockets/${id} responded with status`, res.status, errText);
        throw new Error(`Failed to update docket (Status ${res.status})`);
      }
      const updatedDocket = await res.json();
      setDockets(dockets.map(d => d.id === id ? updatedDocket : d));
      setSelectedDocket(updatedDocket);
    } catch (err) {
      console.error('Error in handleUpdateDocket:', err);
      alert(err.message);
      throw err;
    }
  };

  // Handlers for Settings
  const handleUpdateSettings = async newSettings => {
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings)
      });
      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        console.error('Failed to load resource: PUT /api/settings responded with status', res.status, errText);
        throw new Error(`Failed to update settings (Status ${res.status})`);
      }
      const updated = await res.json();
      setCollegeSettings(updated);
    } catch (err) {
      console.error('Error in handleUpdateSettings:', err);
      alert(err.message);
      throw err;
    }
  };

  const handleAddDept = async deptData => {
    try {
      const res = await fetch('/api/departments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(deptData)
      });
      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        console.error('Failed to load resource: POST /api/departments responded with status', res.status, errText);
        throw new Error(`Failed to add department (Status ${res.status})`);
      }
      const newDept = await res.json();
      setDepartments([...departments, newDept]);
    } catch (err) {
      console.error('Error in handleAddDept:', err);
      alert(err.message);
      throw err;
    }
  };

  const handleDeleteDept = async id => {
    try {
      const res = await fetch(`/api/departments/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        console.error(`Failed to load resource: DELETE /api/departments/${id} responded with status`, res.status, errText);
        throw new Error(`Failed to delete department (Status ${res.status})`);
      }
      setDepartments(departments.filter(d => d.id !== id));
    } catch (err) {
      console.error('Error in handleDeleteDept:', err);
      alert(err.message);
      throw err;
    }
  };

  const handleAddCat = async catData => {
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(catData)
      });
      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        console.error('Failed to load resource: POST /api/categories responded with status', res.status, errText);
        throw new Error(`Failed to add category (Status ${res.status})`);
      }
      const newCat = await res.json();
      setCategories([...categories, newCat]);
    } catch (err) {
      console.error('Error in handleAddCat:', err);
      alert(err.message);
      throw err;
    }
  };

  const handleDeleteCat = async id => {
    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        console.error(`Failed to load resource: DELETE /api/categories/${id} responded with status`, res.status, errText);
        throw new Error(`Failed to delete category (Status ${res.status})`);
      }
      setCategories(categories.filter(c => c.id !== id));
    } catch (err) {
      console.error('Error in handleDeleteCat:', err);
      alert(err.message);
      throw err;
    }
  };

  const handleAddTech = async techData => {
    try {
      const res = await fetch('/api/technicians', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(techData)
      });
      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        console.error('Failed to load resource: POST /api/technicians responded with status', res.status, errText);
        throw new Error(`Failed to add technician (Status ${res.status})`);
      }
      const newTech = await res.json();
      setTechnicians([...technicians, newTech]);
    } catch (err) {
      console.error('Error in handleAddTech:', err);
      alert(err.message);
      throw err;
    }
  };

  const handleDeleteTech = async id => {
    try {
      const res = await fetch(`/api/technicians/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        console.error(`Failed to load resource: DELETE /api/technicians/${id} responded with status`, res.status, errText);
        throw new Error(`Failed to delete technician (Status ${res.status})`);
      }
      setTechnicians(technicians.filter(t => t.id !== id));
    } catch (err) {
      console.error('Error in handleDeleteTech:', err);
      alert(err.message);
      throw err;
    }
  };

  const isAdmin = currentUser?.role === 'Admin';

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <h1>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="28" height="28" style={{ color: 'var(--accent-blue)' }}>
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            CampusDocket
          </h1>
          <div className="sidebar-college">{collegeSettings?.collegeName}</div>
        </div>

        <nav className="sidebar-menu">
          <button 
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
            Dashboard Overview
          </button>

          <button 
            className={`nav-item ${activeTab === 'dockets' ? 'active' : ''}`}
            onClick={() => setActiveTab('dockets')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            Fault-Dockets
          </button>

          <button 
            className={`nav-item ${activeTab === 'new' ? 'active' : ''}`}
            onClick={() => setActiveTab('new')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="16" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
            File New Docket
          </button>

          {isAdmin && (
            <button 
              className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
              System Setup & Depts
            </button>
          )}
        </nav>

        <div className="sidebar-footer">
          <span>CampusDocket v2.5</span>
          <span style={{ color: 'var(--accent-blue)', fontWeight: 600 }}>RBAC Edition</span>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        {/* Top Bar */}
        <header className="top-bar">
          <div className="page-title">
            {activeTab === 'dashboard' && 'Campus Analytics Dashboard'}
            {activeTab === 'dockets' && 'Fault-Docket Management'}
            {activeTab === 'new' && 'File New Fault-Docket'}
            {activeTab === 'settings' && 'System Setup & Administration'}
          </div>

          <div className="top-bar-actions">
            {/* RBAC User Switcher */}
            {currentUser && (
              <div className="role-switcher-container">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18" style={{ color: 'var(--primary-blue)' }}>
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <select 
                  className="role-switcher-select"
                  value={currentUser.id}
                  onChange={e => {
                    const u = users.find(user => user.id === e.target.value);
                    if (u) {
                      setCurrentUser(u);
                      if (u.role !== 'Admin' && activeTab === 'settings') {
                        setActiveTab('dashboard'); // Redirect away from restricted tab
                      }
                    }
                  }}
                >
                  {users.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.role})
                    </option>
                  ))}
                </select>
                <span className={`role-badge ${currentUser.role.toLowerCase()}`}>
                  {currentUser.role}
                </span>
              </div>
            )}

            <button className="btn-primary" onClick={() => setActiveTab('new')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              New Docket
            </button>
          </div>
        </header>

        {/* Content Body */}
        <div className="content-body">
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400, fontSize: '1.2rem', color: 'var(--text-muted)', gap: 12 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="32" height="32" style={{ animation: 'spin 1s linear infinite', color: 'var(--primary-blue)' }}>
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2a10 10 0 0 1 10 10" />
              </svg>
              Loading CampusDocket Database...
            </div>
          ) : error ? (
            <div className="empty-state" style={{ borderColor: 'hsl(349, 89%, 85%)', background: 'hsl(349, 89%, 97%)' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--priority-urgent)' }}>
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <h3 style={{ color: 'var(--priority-urgent)' }}>System Connection Error</h3>
              <p>{error}</p>
              <button className="btn-primary" onClick={fetchData}>Retry Connection</button>
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <Dashboard 
                  dockets={dockets} 
                  departments={departments} 
                  categories={categories} 
                  onViewDocket={setSelectedDocket}
                  onNavigate={setActiveTab}
                />
              )}

              {activeTab === 'dockets' && (
                <DocketList 
                  currentUser={currentUser}
                  dockets={dockets} 
                  departments={departments} 
                  categories={categories} 
                  onViewDocket={setSelectedDocket}
                  onNavigate={setActiveTab}
                />
              )}

              {activeTab === 'new' && (
                <DocketForm 
                  currentUser={currentUser}
                  departments={departments} 
                  categories={categories} 
                  onSubmit={handleCreateDocket}
                  onCancel={() => setActiveTab('dockets')}
                />
              )}

              {activeTab === 'settings' && isAdmin && (
                <Settings 
                  collegeSettings={collegeSettings}
                  departments={departments}
                  categories={categories}
                  technicians={technicians}
                  onUpdateSettings={handleUpdateSettings}
                  onAddDept={handleAddDept}
                  onDeleteDept={handleDeleteDept}
                  onAddCat={handleAddCat}
                  onDeleteCat={handleDeleteCat}
                  onAddTech={handleAddTech}
                  onDeleteTech={handleDeleteTech}
                />
              )}
            </>
          )}
        </div>
      </main>

      {/* Detail & Workflow Modal */}
      {selectedDocket && (
        <DocketDetailModal 
          currentUser={currentUser}
          docket={selectedDocket} 
          technicians={technicians}
          onClose={() => setSelectedDocket(null)}
          onUpdate={handleUpdateDocket}
          collegeSettings={collegeSettings}
        />
      )}
    </div>
  );
}
