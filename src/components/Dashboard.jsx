import React from 'react';

export default function Dashboard({ dockets, departments, categories, onViewDocket, onNavigate }) {
  const total = dockets.length;
  const submitted = dockets.filter(d => d.status === 'Submitted').length;
  const issued = dockets.filter(d => d.status === 'Issued').length;
  const rectified = dockets.filter(d => d.status === 'Rectified').length;
  const closed = dockets.filter(d => d.status === 'Closed').length;

  // Department breakdown
  const deptBreakdown = departments.map(dept => {
    const count = dockets.filter(d => d.department === dept.name).length;
    const percentage = total > 0 ? (count / total) * 100 : 0;
    return { ...dept, count, percentage };
  }).sort((a, b) => b.count - a.count).slice(0, 6); // Top 6

  // Category breakdown
  const catBreakdown = categories.map(cat => {
    const count = dockets.filter(d => d.category === cat.name).length;
    const percentage = total > 0 ? (count / total) * 100 : 0;
    return { ...cat, count, percentage };
  }).sort((a, b) => b.count - a.count).slice(0, 6); // Top 6

  const recentDockets = dockets.slice(0, 4);

  return (
    <div className="dashboard-container">
      {/* Metrics Grid */}
      <div className="metrics-grid">
        <div className="metric-card submitted">
          <div className="metric-info">
            <span className="metric-title">Pending Receive</span>
            <span className="metric-value">{submitted}</span>
          </div>
          <div className="metric-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="32" height="32">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>
        </div>

        <div className="metric-card issued">
          <div className="metric-info">
            <span className="metric-title">Issued / In Progress</span>
            <span className="metric-value">{issued}</span>
          </div>
          <div className="metric-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="32" height="32">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
        </div>

        <div className="metric-card rectified">
          <div className="metric-info">
            <span className="metric-title">Rectified (Pending Close)</span>
            <span className="metric-value">{rectified}</span>
          </div>
          <div className="metric-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="32" height="32">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
        </div>

        <div className="metric-card closed">
          <div className="metric-info">
            <span className="metric-title">Closed & Archived</span>
            <span className="metric-value">{closed}</span>
          </div>
          <div className="metric-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="32" height="32">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
          </div>
        </div>
      </div>

      {/* Analytics Breakdown */}
      <div className="analytics-section">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
                <path d="M18 20V10" />
                <path d="M12 20V4" />
                <path d="M6 20v-6" />
              </svg>
              Department Fault Breakdown
            </h2>
          </div>
          <div className="bar-chart-container">
            {deptBreakdown.map(dept => (
              <div key={dept.id} className="bar-item">
                <div className="bar-header">
                  <span>{dept.name} ({dept.code})</span>
                  <span className="bar-count">{dept.count} dockets</span>
                </div>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${Math.max(dept.percentage, 2)}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
                <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
                <path d="M22 12A10 10 0 0 0 12 2v10z" />
              </svg>
              Top Categories
            </h2>
          </div>
          <div className="bar-chart-container">
            {catBreakdown.map(cat => (
              <div key={cat.id} className="bar-item">
                <div className="bar-header">
                  <span>{cat.name}</span>
                  <span className="bar-count">{cat.count}</span>
                </div>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${Math.max(cat.percentage, 2)}%`, background: 'linear-gradient(90deg, var(--accent-blue), var(--primary-blue))' }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Dockets Section */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            Recent Fault-Dockets
          </h2>
          <button className="btn-secondary" onClick={() => onNavigate('dockets')}>
            View All Dockets
          </button>
        </div>

        <div className="docket-grid">
          {recentDockets.map(docket => (
            <div key={docket.id} className="docket-card" onClick={() => onViewDocket(docket)}>
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
      </div>
    </div>
  );
}
