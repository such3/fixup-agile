import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

export default function DocketDetailModal({ currentUser, docket, technicians, onClose, onUpdate, collegeSettings }) {
  const [activeMode, setActiveMode] = useState('workflow'); // 'workflow' or 'print'
  
  // Workflow form states
  const [receiveData, setReceiveData] = useState({
    receivedBy: docket.receivedBy || (technicians.length > 0 ? technicians[0].name : ''),
    issuedTo: docket.issuedTo || (technicians.length > 0 ? technicians[0].name : '')
  });

  const [rectifyData, setRectifyData] = useState({
    rectifiedBy: docket.rectifiedBy || currentUser?.name || (technicians.length > 0 ? technicians[0].name : ''),
    rectificationDetails: docket.rectificationDetails || ''
  });

  const [closeData, setCloseData] = useState({
    userRemarks: docket.userRemarks || '',
    userName: docket.userName || currentUser?.name || docket.complaintGivenBy.split('(')[0].trim(),
    siteEngineer: docket.siteEngineer || 'CME Approved - Patil'
  });

  const [loading, setLoading] = useState(false);

  const handleReceiveIssue = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await onUpdate(docket.id, {
        status: 'Issued',
        receivedBy: receiveData.receivedBy,
        receivedAt: new Date().toISOString(),
        issuedTo: receiveData.issuedTo,
        issuedAt: new Date().toISOString()
      });
    } catch (err) {
      alert('Error updating docket: ' + err.message);
    }
    setLoading(false);
  };

  const handleRectify = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await onUpdate(docket.id, {
        status: 'Rectified',
        rectifiedBy: rectifyData.rectifiedBy,
        rectifiedAt: new Date().toISOString(),
        rectificationDetails: rectifyData.rectificationDetails
      });
    } catch (err) {
      alert('Error updating docket: ' + err.message);
    }
    setLoading(false);
  };

  const handleClose = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await onUpdate(docket.id, {
        status: 'Closed',
        userRemarks: closeData.userRemarks,
        userName: closeData.userName,
        siteEngineer: closeData.siteEngineer,
        closedAt: new Date().toISOString()
      });
    } catch (err) {
      alert('Error updating docket: ' + err.message);
    }
    setLoading(false);
  };

  const handlePrint = () => {
    const originalTitle = document.title;
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, '-').replace('T', '_').slice(0, 19);
    const safeCategory = (docket.category || 'Fault-Docket').replace(/[^a-zA-Z0-9]/g, '_');
    const safeId = docket.id.replace(/\//g, '-');
    
    document.title = `Docket_${safeId}_${safeCategory}_${timestamp}`;
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 2000);
  };

  // RBAC checks
  const isAdmin = currentUser?.role === 'Admin';
  const isTechnician = currentUser?.role === 'Technician';
  const isComplainant = currentUser?.role === 'Complainant';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-box">
            <span className="docket-id" style={{ fontSize: '1.25rem' }}>{docket.id}</span>
            <span className={`badge badge-status ${docket.status.toLowerCase()}`}>
              {docket.status}
            </span>
            <span className={`badge badge-priority ${docket.priority.toLowerCase()}`}>
              {docket.priority} Priority
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Mode Switcher */}
            <div style={{ background: 'var(--bg-card)', padding: 4, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', gap: 4 }}>
              <button 
                className={`status-tab ${activeMode === 'workflow' ? 'active' : ''}`}
                style={{ padding: '8px 16px', margin: 0, fontSize: '0.85rem' }}
                onClick={() => setActiveMode('workflow')}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }}>
                  <polyline points="9 11 12 14 22 4" />
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                </svg>
                Workflow Timeline
              </button>
              <button 
                className={`status-tab ${activeMode === 'print' ? 'active' : ''}`}
                style={{ padding: '8px 16px', margin: 0, fontSize: '0.85rem' }}
                onClick={() => setActiveMode('print')}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }}>
                  <polyline points="6 9 6 2 18 2 18 9" />
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                  <rect x="6" y="14" width="12" height="8" />
                </svg>
                Physical Docket Replica
              </button>
            </div>

            <button className="modal-close" onClick={onClose}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {activeMode === 'workflow' ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }}>
              {/* Left Column: Complaint Details */}
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--deep-navy)', marginBottom: 24, borderBottom: '1px solid var(--border-color)', paddingBottom: 12 }}>
                  Fault Complaint Details
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Complaint Given By</span>
                    <p style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--deep-navy)', marginTop: 4 }}>{docket.complaintGivenBy}</p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                    <div>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Department / Hostel</span>
                      <p style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--deep-navy)', marginTop: 4 }}>{docket.department}</p>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Nature of Fault</span>
                      <p style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--deep-navy)', marginTop: 4 }}>{docket.category}</p>
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Specific Location</span>
                    <p style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--deep-navy)', marginTop: 4 }}>{docket.location || 'N/A'}</p>
                  </div>

                  {docket.imageUrl && (
                    <div>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Attached Fault Image</span>
                      <div className="image-preview-box" style={{ marginTop: 8 }}>
                        <img src={docket.imageUrl} alt="Fault Attachment" />
                      </div>
                    </div>
                  )}

                  <div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Detailed Description</span>
                    <div style={{ background: 'var(--bg-main)', padding: 20, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginTop: 8, fontSize: '0.95rem', lineHeight: 1.6 }}>
                      {docket.description}
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Timestamp Log</span>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <div>• Created At: {new Date(docket.createdAt).toLocaleString()}</div>
                      {docket.receivedAt && <div>• Received & Issued At: {new Date(docket.receivedAt).toLocaleString()}</div>}
                      {docket.rectifiedAt && <div>• Rectified At: {new Date(docket.rectifiedAt).toLocaleString()}</div>}
                      {docket.closedAt && <div>• Closed At: {new Date(docket.closedAt).toLocaleString()}</div>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Workflow Timeline & Actions */}
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--deep-navy)', marginBottom: 24, borderBottom: '1px solid var(--border-color)', paddingBottom: 12 }}>
                  Docket Workflow Progression
                </h3>

                <div className="workflow-timeline">
                  {/* Step 1: Receive & Issue */}
                  <div className={`workflow-step ${docket.status !== 'Submitted' ? 'completed' : 'active'}`}>
                    <div className="workflow-step-bullet">1</div>
                    <div className="workflow-step-title">
                      <span>Receive & Issue Docket</span>
                      <span className="badge badge-status submitted" style={{ fontSize: '0.7rem' }}>Step 1</span>
                    </div>

                    {docket.status === 'Submitted' ? (
                      isAdmin ? (
                        <form onSubmit={handleReceiveIssue} style={{ marginTop: 16 }}>
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 16 }}>
                            Acknowledge receipt of this complaint and issue it to a specialized maintenance technician.
                          </p>

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                            <div>
                              <label className="form-label" style={{ fontSize: '0.85rem' }}>Received By (Staff)</label>
                              <select 
                                className="form-select" 
                                style={{ padding: '10px 14px', fontSize: '0.9rem' }}
                                value={receiveData.receivedBy}
                                onChange={e => setReceiveData({ ...receiveData, receivedBy: e.target.value })}
                              >
                                {technicians.map(t => (
                                  <option key={t.id} value={t.name}>{t.name} ({t.specialization})</option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="form-label" style={{ fontSize: '0.85rem' }}>Docket Issued To</label>
                              <select 
                                className="form-select" 
                                style={{ padding: '10px 14px', fontSize: '0.9rem' }}
                                value={receiveData.issuedTo}
                                onChange={e => setReceiveData({ ...receiveData, issuedTo: e.target.value })}
                              >
                                {technicians.map(t => (
                                  <option key={t.id} value={t.name}>{t.name} ({t.specialization})</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
                            {loading ? 'Processing...' : 'Confirm Receipt & Issue Docket'}
                          </button>
                        </form>
                      ) : (
                        <div className="restricted-notice" style={{ marginTop: 16 }}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24" style={{ color: 'var(--priority-medium)' }}>
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                            <line x1="12" y1="9" x2="12" y2="13" />
                            <line x1="12" y1="17" x2="12.01" y2="17" />
                          </svg>
                          <span>Only <strong>Admin / CME</strong> can receive and issue dockets. Switch role at the top bar to test.</span>
                        </div>
                      )
                    ) : (
                      <div style={{ marginTop: 12, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        <div style={{ marginBottom: 6 }}><strong>Received By:</strong> {docket.receivedBy}</div>
                        <div><strong>Issued To:</strong> {docket.issuedTo}</div>
                      </div>
                    )}
                  </div>

                  {/* Step 2: Rectification */}
                  <div className={`workflow-step ${docket.status === 'Rectified' || docket.status === 'Closed' ? 'completed' : docket.status === 'Issued' ? 'active' : ''}`}>
                    <div className="workflow-step-bullet">2</div>
                    <div className="workflow-step-title">
                      <span>Fault Rectification</span>
                      <span className="badge badge-status issued" style={{ fontSize: '0.7rem' }}>Step 2</span>
                    </div>

                    {docket.status === 'Issued' ? (
                      isAdmin || isTechnician ? (
                        <form onSubmit={handleRectify} style={{ marginTop: 16 }}>
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 16 }}>
                            Log the maintenance work performed by the technician to resolve the fault.
                          </p>

                          <div style={{ marginBottom: 16 }}>
                            <label className="form-label" style={{ fontSize: '0.85rem' }}>Fault Rectified By</label>
                            <select 
                              className="form-select" 
                              style={{ padding: '10px 14px', fontSize: '0.9rem' }}
                              value={rectifyData.rectifiedBy}
                              onChange={e => setRectifyData({ ...rectifyData, rectifiedBy: e.target.value })}
                            >
                              {technicians.map(t => (
                                <option key={t.id} value={t.name}>{t.name} ({t.specialization})</option>
                              ))}
                            </select>
                          </div>

                          <div style={{ marginBottom: 16 }}>
                            <label className="form-label" style={{ fontSize: '0.85rem' }}>Rectification Details / Work Done *</label>
                            <textarea 
                              className="form-textarea" 
                              style={{ minHeight: 80, padding: '10px 14px', fontSize: '0.9rem' }}
                              placeholder="e.g., Replaced 32A MCB and tightened busbar wiring..."
                              value={rectifyData.rectificationDetails}
                              onChange={e => setRectifyData({ ...rectifyData, rectificationDetails: e.target.value })}
                              required
                            />
                          </div>

                          <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
                            {loading ? 'Processing...' : 'Mark as Rectified'}
                          </button>
                        </form>
                      ) : (
                        <div className="restricted-notice" style={{ marginTop: 16 }}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24" style={{ color: 'var(--priority-medium)' }}>
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                            <line x1="12" y1="9" x2="12" y2="13" />
                            <line x1="12" y1="17" x2="12.01" y2="17" />
                          </svg>
                          <span>Only <strong>Admin</strong> or assigned <strong>Technicians</strong> can log rectification details.</span>
                        </div>
                      )
                    ) : docket.status === 'Rectified' || docket.status === 'Closed' ? (
                      <div style={{ marginTop: 12, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        <div style={{ marginBottom: 6 }}><strong>Rectified By:</strong> {docket.rectifiedBy}</div>
                        <div style={{ background: 'var(--bg-main)', padding: 12, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', marginTop: 8 }}>
                          <strong>Work Details:</strong> {docket.rectificationDetails}
                        </div>
                      </div>
                    ) : (
                      <p style={{ marginTop: 12, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        Complete Step 1 (Receive & Issue) to unlock rectification logging.
                      </p>
                    )}
                  </div>

                  {/* Step 3: User Verification & CME Closure */}
                  <div className={`workflow-step ${docket.status === 'Closed' ? 'completed' : docket.status === 'Rectified' ? 'active' : ''}`}>
                    <div className="workflow-step-bullet">3</div>
                    <div className="workflow-step-title">
                      <span>User Verification & Closure</span>
                      <span className="badge badge-status closed" style={{ fontSize: '0.7rem' }}>Step 3</span>
                    </div>

                    {docket.status === 'Rectified' ? (
                      isAdmin || isComplainant ? (
                        <form onSubmit={handleClose} style={{ marginTop: 16 }}>
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 16 }}>
                            Capture final remarks from the complainant and secure Site Engineer (CME) approval to close the docket.
                          </p>

                          <div style={{ marginBottom: 16 }}>
                            <label className="form-label" style={{ fontSize: '0.85rem' }}>User Remarks (Complainant Feedback)</label>
                            <textarea 
                              className="form-textarea" 
                              style={{ minHeight: 80, padding: '10px 14px', fontSize: '0.9rem' }}
                              placeholder="e.g., Work completed satisfactorily. Equipment is fully functional."
                              value={closeData.userRemarks}
                              onChange={e => setCloseData({ ...closeData, userRemarks: e.target.value })}
                            />
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                            <div>
                              <label className="form-label" style={{ fontSize: '0.85rem' }}>Verified User Name</label>
                              <input 
                                type="text"
                                className="form-input" 
                                style={{ padding: '10px 14px', fontSize: '0.9rem' }}
                                value={closeData.userName}
                                onChange={e => setCloseData({ ...closeData, userName: e.target.value })}
                                required
                              />
                            </div>

                            <div>
                              <label className="form-label" style={{ fontSize: '0.85rem' }}>Site Engineer (CME)</label>
                              <input 
                                type="text"
                                className="form-input" 
                                style={{ padding: '10px 14px', fontSize: '0.9rem' }}
                                value={closeData.siteEngineer}
                                onChange={e => setCloseData({ ...closeData, siteEngineer: e.target.value })}
                                required
                              />
                            </div>
                          </div>

                          <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', background: 'var(--status-rectified-text)' }} disabled={loading}>
                            {loading ? 'Processing...' : 'Verify & Close Fault-Docket'}
                          </button>
                        </form>
                      ) : (
                        <div className="restricted-notice" style={{ marginTop: 16 }}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24" style={{ color: 'var(--priority-medium)' }}>
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                            <line x1="12" y1="9" x2="12" y2="13" />
                            <line x1="12" y1="17" x2="12.01" y2="17" />
                          </svg>
                          <span>Only <strong>Admin</strong> or the <strong>Complainant</strong> can verify and close dockets.</span>
                        </div>
                      )
                    ) : docket.status === 'Closed' ? (
                      <div style={{ marginTop: 12, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        <div style={{ marginBottom: 6 }}><strong>Verified By (User Name):</strong> {docket.userName}</div>
                        <div style={{ marginBottom: 6 }}><strong>Site Engineer (CME):</strong> {docket.siteEngineer}</div>
                        {docket.userRemarks && (
                          <div style={{ background: 'var(--bg-main)', padding: 12, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', marginTop: 8 }}>
                            <strong>User Remarks:</strong> {docket.userRemarks}
                          </div>
                        )}
                      </div>
                    ) : (
                      <p style={{ marginTop: 12, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        Complete Step 2 (Rectification) to unlock user verification and closure.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Printable Physical Docket Replica */
            <div className="physical-docket-paper">
              <div className="docket-header-print">
                <h2>{collegeSettings?.collegeName || 'SDM COLLEGE OF ENGINEERING & TECHNOLOGY, DHARWAD'}</h2>
                <h3>OFFICIAL FAULT-DOCKET</h3>
              </div>

              <div className="print-meta-grid">
                <div className="print-meta-item">
                  <span className="print-label">DOCKET NO:</span>
                  <span className="print-value" style={{ fontSize: '1.15rem', textDecoration: 'underline' }}>{docket.id}</span>
                </div>
                <div className="print-meta-item">
                  <span className="print-label">DATE LOGGED:</span>
                  <span className="print-value">{new Date(docket.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="print-meta-item">
                  <span className="print-label">COMPLAINANT:</span>
                  <span className="print-value">{docket.complaintGivenBy}</span>
                </div>
                <div className="print-meta-item">
                  <span className="print-label">DEPARTMENT / HOSTEL:</span>
                  <span className="print-value">{docket.department}</span>
                </div>
              </div>

              <div className="print-box">
                <div className="print-box-title">Nature of Fault & Description</div>
                <div style={{ fontWeight: 'bold', fontSize: '1.05rem', color: '#0f172a', marginBottom: 6 }}>{docket.category}</div>
                <div className="print-box-content">{docket.description}</div>
                {docket.location && (
                  <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid #cbd5e1', fontSize: '1rem' }}>
                    <span className="print-label">Specific Location:</span> <span className="print-value">{docket.location}</span>
                  </div>
                )}
              </div>

              {/* Compact Workflow Summary Table */}
              <div style={{ marginBottom: 28 }}>
                <div className="print-box-title" style={{ borderBottom: 'none', marginBottom: 8 }}>Workflow Progression Summary</div>
                <table className="print-workflow-table">
                  <thead>
                    <tr>
                      <th>Workflow Stage</th>
                      <th>Assigned Staff / User</th>
                      <th>Action Status & Timestamp</th>
                      <th>Digital Signature</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>1. Receipt & Issue</strong></td>
                      <td>{docket.receivedBy || 'Pending Assignment'}</td>
                      <td>{docket.status !== 'Submitted' ? `Issued (${new Date(docket.receivedAt || docket.createdAt).toLocaleDateString()})` : 'Pending'}</td>
                      <td><span className="print-sig-val">{docket.receivedBy ? docket.receivedBy.split(' ')[0] : ''}</span></td>
                    </tr>
                    <tr>
                      <td><strong>2. Fault Rectification</strong></td>
                      <td>{docket.rectifiedBy || 'Pending Rectification'}</td>
                      <td>{docket.status === 'Rectified' || docket.status === 'Closed' ? `Rectified (${new Date(docket.rectifiedAt || Date.now()).toLocaleDateString()})` : 'Pending'}</td>
                      <td><span className="print-sig-val">{docket.rectifiedBy ? docket.rectifiedBy.split(' ')[0] : ''}</span></td>
                    </tr>
                    <tr>
                      <td><strong>3. User Verification</strong></td>
                      <td>{docket.userName || docket.complaintGivenBy.split('(')[0].trim()}</td>
                      <td>{docket.status === 'Closed' ? `Verified (${new Date(docket.closedAt || Date.now()).toLocaleDateString()})` : 'Pending'}</td>
                      <td><span className="print-sig-val">{docket.status === 'Closed' ? (docket.userName ? docket.userName.split(' ')[0] : 'Verified') : ''}</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Work Performed & User Remarks */}
              <div className="print-grid-2">
                <div className="print-box" style={{ margin: 0 }}>
                  <div className="print-box-title" style={{ fontSize: '0.95rem' }}>Rectification Work Performed</div>
                  <div className="print-box-content" style={{ fontSize: '0.95rem', minHeight: 40 }}>
                    {docket.rectificationDetails || 'Work pending / Not logged yet.'}
                  </div>
                </div>
                <div className="print-box" style={{ margin: 0 }}>
                  <div className="print-box-title" style={{ fontSize: '0.95rem' }}>Complainant Verification Remarks</div>
                  <div className="print-box-content" style={{ fontSize: '0.95rem', minHeight: 40 }}>
                    {docket.userRemarks || 'Verification pending / No remarks provided.'}
                  </div>
                </div>
              </div>

              {/* QR Code & Approval Block */}
              <div className="print-footer-block">
                <div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>
                    Site Engineer Approval:{' '}
                    <span style={{ color: '#2563eb', textDecoration: 'underline' }}>{docket.siteEngineer || 'Pending Approval'}</span> (CME)
                  </div>
                  <div style={{ fontSize: '0.95rem', color: '#334155', marginTop: 16 }}>
                    <strong>Official Remarks / Stamp:</strong> _____________________________________
                  </div>
                </div>

                <div className="print-qr-box">
                  {/* High-fidelity SVG QR Code */}
                  <QRCodeSVG 
                    value={`${window.location.origin}/docket/${docket.id}`} 
                    size={84} 
                    level="H" 
                    includeMargin={true} 
                    style={{ flexShrink: 0, border: '1px solid #cbd5e1', borderRadius: 6, background: '#fff' }} 
                  />
                  <div className="print-qr-text">
                    <strong>Scan QR Code</strong> with your mobile device for live docket status tracking, full audit trail, and high-resolution attachment verification.
                  </div>
                </div>
              </div>

              {/* Print Action Button */}
              <div className="no-print" style={{ display: 'flex', justifyContent: 'center', marginTop: 40 }}>
                <button 
                  className="btn-primary" 
                  onClick={handlePrint}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                    <polyline points="6 9 6 2 18 2 18 9" />
                    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                    <rect x="6" y="14" width="12" height="8" />
                  </svg>
                  Print Official Docket
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
