import React, { useState, useEffect } from 'react';

const PAY_STUBS = [
  { id: 'PS-2026-019', period: 'May 4 – May 10, 2026', gross: 2847.50, miles: 2890, rate: 0.62, bonus: 255, deductions: 612.30, net: 2235.20, status: 'paid', paidDate: '05/14/2026' },
  { id: 'PS-2026-018', period: 'Apr 27 – May 3, 2026', gross: 3102.00, miles: 3150, rate: 0.62, bonus: 148, deductions: 667.10, net: 2434.90, status: 'paid', paidDate: '05/07/2026' },
  { id: 'PS-2026-017', period: 'Apr 20 – Apr 26, 2026', gross: 2564.80, miles: 2610, rate: 0.62, bonus: 0, deductions: 551.40, net: 2013.40, status: 'paid', paidDate: '04/30/2026' },
  { id: 'PS-2026-016', period: 'Apr 13 – Apr 19, 2026', gross: 2980.40, miles: 3020, rate: 0.62, bonus: 107, deductions: 641.20, net: 2339.20, status: 'paid', paidDate: '04/23/2026' },
  { id: 'PS-2026-015', period: 'Apr 6 – Apr 12, 2026', gross: 3250.60, miles: 3310, rate: 0.62, bonus: 198, deductions: 699.10, net: 2551.50, status: 'paid', paidDate: '04/16/2026' },
];

const MAINT_CATEGORIES = ['Engine', 'Brakes', 'Tires', 'Electrical', 'Transmission', 'HVAC', 'Exhaust', 'Lights', 'Suspension', 'Other'];

export default function DriverPortal({ drivers, onBack }) {
  const [loggedIn, setLoggedIn] = useState(false);
  const [loginId, setLoginId] = useState('');
  const [loginPin, setLoginPin] = useState('');
  const [loginError, setLoginError] = useState('');
  const [currentDriver, setCurrentDriver] = useState(null);
  const [activeTab, setActiveTab] = useState('clock');
  const [clockedIn, setClockedIn] = useState(false);
  const [dutyStatus, setDutyStatus] = useState('off');
  const [clockLog, setClockLog] = useState([]);
  const [maintReports, setMaintReports] = useState([]);
  const [maintForm, setMaintForm] = useState({ category: 'Engine', severity: 'medium', description: '', location: '' });
  const [showMaintForm, setShowMaintForm] = useState(false);
  const [selectedStub, setSelectedStub] = useState(null);
  const now = new Date();

  const handleLogin = () => {
    const driver = drivers.find(d => d.id.toLowerCase() === loginId.toLowerCase() || d.truckId.toLowerCase() === loginId.toLowerCase());
    if (driver) {
      setCurrentDriver(driver);
      setLoggedIn(true);
      setLoginError('');
      setClockedIn(driver.status === 'driving' || driver.status === 'delivery');
      setDutyStatus(driver.status);
      setClockLog([
        { time: '06:00 AM', action: 'Clocked In', status: 'On Duty' },
        { time: '06:30 AM', action: 'Status Change', status: 'Driving' },
        { time: '10:15 AM', action: 'Break Start', status: 'On Break' },
        { time: '10:45 AM', action: 'Break End', status: 'Driving' },
      ]);
    } else {
      setLoginError('Driver ID or Truck ID not found. Try: DRV-001 or TRK-4482');
    }
  };

  const toggleClock = () => {
    const action = clockedIn ? 'Clocked Out' : 'Clocked In';
    const status = clockedIn ? 'Off Duty' : 'On Duty';
    setClockedIn(!clockedIn);
    setDutyStatus(clockedIn ? 'off' : 'driving');
    setClockLog(prev => [{ time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }), action, status }, ...prev]);
  };

  const changeDuty = (s) => {
    setDutyStatus(s);
    const labels = { driving: 'Driving', break: 'On Break', off: 'Off Duty', delivery: 'At Delivery', sleeper: 'Sleeper Berth', onduty: 'On Duty (Not Driving)' };
    setClockLog(prev => [{ time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }), action: 'Status Change', status: labels[s] || s }, ...prev]);
  };

  const submitMaint = () => {
    if (!maintForm.description) return;
    setMaintReports(prev => [{
      id: `MR-${Date.now().toString(36).toUpperCase()}`,
      ...maintForm,
      timestamp: now.toLocaleString(),
      driver: currentDriver.name,
      truckId: currentDriver.truckId,
      status: 'submitted',
    }, ...prev]);
    setMaintForm({ category: 'Engine', severity: 'medium', description: '', location: '' });
    setShowMaintForm(false);
  };

  // LOGIN SCREEN
  if (!loggedIn) {
    return (
      <div className="portal-wrapper">
        <div className="portal-login">
          <div className="portal-login-card">
            <div className="portal-logo">PKC<span> LLC</span></div>
            <div className="portal-login-title">Driver Portal</div>
            <div className="portal-login-sub">Enter your Driver ID or Truck ID</div>
            <input className="portal-input" placeholder="Driver ID (e.g. DRV-001)" value={loginId} onChange={e => setLoginId(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
            <input className="portal-input" type="password" placeholder="PIN (any 4 digits for demo)" value={loginPin} onChange={e => setLoginPin(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
            {loginError && <div className="portal-error">{loginError}</div>}
            <button className="portal-login-btn" onClick={handleLogin}>🔐 Sign In</button>
            <button className="portal-back-btn" onClick={onBack}>← Back to Dispatch</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="portal-wrapper">
      {/* HEADER */}
      <header className="portal-header">
        <div className="portal-header-left">
          <div className="portal-logo-sm">PKC<span> LLC</span></div>
          <div className="portal-header-div" />
          <div className="portal-user-info">
            <div className="portal-user-name">{currentDriver.name}</div>
            <div className="portal-user-id">{currentDriver.truckId} · {currentDriver.id} · {currentDriver.trailerType}</div>
          </div>
        </div>
        <div className="portal-header-right">
          <div className={`portal-clock-badge ${clockedIn ? 'clocked-in' : 'clocked-out'}`}>
            {clockedIn ? '🟢 ON DUTY' : '🔴 OFF DUTY'}
          </div>
          <button className="portal-logout-btn" onClick={() => { setLoggedIn(false); setCurrentDriver(null); }}>Logout</button>
          <button className="portal-back-link" onClick={onBack}>← Dispatch</button>
        </div>
      </header>

      {/* TABS */}
      <div className="portal-tabs">
        {[['clock', '⏰ Time Clock'], ['pay', '💰 Pay Stubs'], ['maintenance', '🔧 Maintenance'], ['profile', '👤 Profile']].map(([key, label]) => (
          <button key={key} className={`portal-tab ${activeTab === key ? 'active' : ''}`} onClick={() => setActiveTab(key)}>{label}</button>
        ))}
      </div>

      {/* CONTENT */}
      <div className="portal-content">
        {/* ── TIME CLOCK ── */}
        {activeTab === 'clock' && (
          <div className="portal-clock-page">
            <div className="clock-hero">
              <div className="clock-time">{now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}</div>
              <div className="clock-date">{now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
              <button className={`clock-toggle-btn ${clockedIn ? 'on' : 'off'}`} onClick={toggleClock}>
                {clockedIn ? '🛑 CLOCK OUT' : '▶️ CLOCK IN'}
              </button>
            </div>

            <div className="duty-selector">
              <div className="portal-section-title">Duty Status</div>
              <div className="duty-buttons">
                {[['driving', '🚛', 'Driving'], ['onduty', '🏗️', 'On Duty'], ['break', '☕', 'Break'], ['sleeper', '💤', 'Sleeper'], ['off', '🏠', 'Off Duty']].map(([key, icon, label]) => (
                  <button key={key} className={`duty-btn ${dutyStatus === key ? 'active' : ''}`} onClick={() => changeDuty(key)} disabled={!clockedIn && key !== 'off'}>
                    <span className="duty-btn-icon">{icon}</span>
                    <span className="duty-btn-label">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="portal-section-title">Today's Log</div>
            <div className="clock-log">
              {clockLog.map((entry, i) => (
                <div key={i} className="clock-log-entry">
                  <div className="log-time">{entry.time}</div>
                  <div className="log-action">{entry.action}</div>
                  <div className="log-status">{entry.status}</div>
                </div>
              ))}
            </div>

            <div className="hos-summary">
              <div className="portal-section-title">HOS Summary</div>
              <div className="hos-grid">
                <div className="hos-card"><div className="hos-card-label">Drive Today</div><div className="hos-card-val">{currentDriver.hoursWorkedToday.toFixed(1)}h</div><div className="hos-card-limit">/ 11h limit</div><div className="hos-bar"><div className="hos-fill green" style={{ width: `${(currentDriver.hoursWorkedToday / 11) * 100}%` }}></div></div></div>
                <div className="hos-card"><div className="hos-card-label">On Duty Today</div><div className="hos-card-val">9.2h</div><div className="hos-card-limit">/ 14h limit</div><div className="hos-bar"><div className="hos-fill amber" style={{ width: '66%' }}></div></div></div>
                <div className="hos-card"><div className="hos-card-label">Week Total</div><div className="hos-card-val">{currentDriver.hoursWorkedWeek.toFixed(0)}h</div><div className="hos-card-limit">/ 60h limit</div><div className="hos-bar"><div className="hos-fill" style={{ width: `${(currentDriver.hoursWorkedWeek / 60) * 100}%`, background: currentDriver.hoursWorkedWeek > 55 ? 'var(--red)' : 'var(--teal)' }}></div></div></div>
                <div className="hos-card"><div className="hos-card-label">Cycle</div><div className="hos-card-val">52h</div><div className="hos-card-limit">/ 70h / 8 days</div><div className="hos-bar"><div className="hos-fill amber" style={{ width: '74%' }}></div></div></div>
              </div>
            </div>
          </div>
        )}

        {/* ── PAY STUBS ── */}
        {activeTab === 'pay' && (
          <div className="portal-pay-page">
            <div className="pay-summary-row">
              <div className="pay-summary-card"><div className="pay-sum-label">YTD Gross</div><div className="pay-sum-val">$48,291.40</div></div>
              <div className="pay-summary-card"><div className="pay-sum-label">YTD Net</div><div className="pay-sum-val highlight">$37,882.60</div></div>
              <div className="pay-summary-card"><div className="pay-sum-label">YTD Miles</div><div className="pay-sum-val">49,120</div></div>
              <div className="pay-summary-card"><div className="pay-sum-label">Rate/Mile</div><div className="pay-sum-val">$0.62</div></div>
            </div>

            <div className="portal-section-title">Pay History</div>
            {PAY_STUBS.map(stub => (
              <div key={stub.id} className="pay-stub-card" onClick={() => setSelectedStub(selectedStub === stub.id ? null : stub.id)}>
                <div className="pay-stub-header">
                  <div className="pay-stub-id">{stub.id}</div>
                  <div className="pay-stub-period">{stub.period}</div>
                  <div className="pay-stub-net">${stub.net.toFixed(2)}</div>
                  <div className="pay-stub-status">{stub.status === 'paid' ? '✅ Paid' : '⏳ Pending'}</div>
                </div>
                {selectedStub === stub.id && (
                  <div className="pay-stub-detail">
                    <div className="pay-detail-row"><span>Miles Driven</span><span>{stub.miles.toLocaleString()}</span></div>
                    <div className="pay-detail-row"><span>Rate Per Mile</span><span>${stub.rate.toFixed(2)}</span></div>
                    <div className="pay-detail-row"><span>Mileage Pay</span><span>${(stub.miles * stub.rate).toFixed(2)}</span></div>
                    <div className="pay-detail-row"><span>Bonus / Accessorial</span><span>${stub.bonus.toFixed(2)}</span></div>
                    <div className="pay-detail-row total"><span>Gross Pay</span><span>${stub.gross.toFixed(2)}</span></div>
                    <div className="pay-detail-row deduction"><span>Deductions (Tax/Insurance)</span><span>-${stub.deductions.toFixed(2)}</span></div>
                    <div className="pay-detail-row net"><span>Net Pay</span><span>${stub.net.toFixed(2)}</span></div>
                    <div className="pay-detail-row"><span>Paid On</span><span>{stub.paidDate}</span></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── MAINTENANCE ── */}
        {activeTab === 'maintenance' && (
          <div className="portal-maint-page">
            <div className="maint-header-row">
              <div className="portal-section-title" style={{ margin: 0 }}>Maintenance Reports</div>
              <button className="portal-action-btn" onClick={() => setShowMaintForm(!showMaintForm)}>
                {showMaintForm ? '✕ Cancel' : '+ New Report'}
              </button>
            </div>

            {showMaintForm && (
              <div className="maint-form">
                <div className="maint-form-title">📋 Report a Maintenance Issue</div>
                <div className="maint-form-grid">
                  <div className="maint-field">
                    <label>Category</label>
                    <select className="portal-select" value={maintForm.category} onChange={e => setMaintForm(p => ({ ...p, category: e.target.value }))}>
                      {MAINT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="maint-field">
                    <label>Severity</label>
                    <select className="portal-select" value={maintForm.severity} onChange={e => setMaintForm(p => ({ ...p, severity: e.target.value }))}>
                      <option value="low">Low — Can Wait</option>
                      <option value="medium">Medium — Next Stop</option>
                      <option value="high">High — Needs Attention</option>
                      <option value="critical">Critical — Cannot Drive</option>
                    </select>
                  </div>
                  <div className="maint-field full">
                    <label>Current Location</label>
                    <input className="portal-input" placeholder="e.g. I-70 Exit 42, near Indianapolis" value={maintForm.location} onChange={e => setMaintForm(p => ({ ...p, location: e.target.value }))} />
                  </div>
                  <div className="maint-field full">
                    <label>Description</label>
                    <textarea className="portal-textarea" rows={4} placeholder="Describe the issue in detail..." value={maintForm.description} onChange={e => setMaintForm(p => ({ ...p, description: e.target.value }))} />
                  </div>
                </div>
                <button className="portal-submit-btn" onClick={submitMaint}>🔧 Submit Report</button>
              </div>
            )}

            {maintReports.length > 0 && maintReports.map(r => (
              <div key={r.id} className={`maint-report-card severity-${r.severity}`}>
                <div className="maint-report-header">
                  <div className="maint-report-id">{r.id}</div>
                  <div className={`maint-severity-badge sev-${r.severity}`}>{r.severity.toUpperCase()}</div>
                </div>
                <div className="maint-report-cat">🔧 {r.category}</div>
                <div className="maint-report-desc">{r.description}</div>
                <div className="maint-report-meta">📍 {r.location || 'Not specified'} · {r.timestamp}</div>
              </div>
            ))}

            {maintReports.length === 0 && !showMaintForm && (
              <div className="empty-state">
                <div className="empty-icon">🔧</div>
                <div className="empty-text">No maintenance reports filed</div>
                <div className="empty-sub">Use the "+ New Report" button to report vehicle issues</div>
              </div>
            )}
          </div>
        )}

        {/* ── PROFILE ── */}
        {activeTab === 'profile' && (
          <div className="portal-profile-page">
            <div className="profile-card-main">
              <div className="profile-avatar">🧑‍✈️</div>
              <div className="profile-info">
                <div className="profile-name">{currentDriver.name}</div>
                <div className="profile-cdl">CDL: {currentDriver.cdl}</div>
                <div className="profile-meta">{currentDriver.truckId} · {currentDriver.trailerType} · {currentDriver.id}</div>
              </div>
            </div>
            <div className="profile-grid">
              <div className="profile-stat-card"><div className="profile-stat-label">Phone</div><div className="profile-stat-val">{currentDriver.phone}</div></div>
              <div className="profile-stat-card"><div className="profile-stat-label">Fuel Level</div><div className="profile-stat-val">{Math.round(currentDriver.fuelLevel)}%</div></div>
              <div className="profile-stat-card"><div className="profile-stat-label">Current Route</div><div className="profile-stat-val">{currentDriver.originCity} → {currentDriver.destCity}</div></div>
              <div className="profile-stat-card"><div className="profile-stat-label">Route Progress</div><div className="profile-stat-val">{Math.round(currentDriver.routeProgress)}%</div></div>
              <div className="profile-stat-card"><div className="profile-stat-label">Weeks Out</div><div className="profile-stat-val">{currentDriver.weeksOut} / {currentDriver.weeksWillingOut}</div></div>
              <div className="profile-stat-card"><div className="profile-stat-label">Speed</div><div className="profile-stat-val">{currentDriver.speed} mph</div></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
