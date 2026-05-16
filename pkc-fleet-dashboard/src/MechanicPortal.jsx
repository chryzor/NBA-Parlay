import React, { useState, useEffect, useRef } from 'react';

export default function MechanicPortal({ drivers, onBack }) {
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [messages, setMessages] = useState({});
  const [newMsg, setNewMsg] = useState('');
  const [activeTickets, setActiveTickets] = useState([
    { id: 'TKT-001', driverId: 'DRV-003', issue: 'Engine overheating intermittently', severity: 'high', status: 'active', created: '2:45 PM' },
    { id: 'TKT-002', driverId: 'DRV-008', issue: 'Left brake light out', severity: 'medium', status: 'active', created: '1:20 PM' },
    { id: 'TKT-003', driverId: 'DRV-005', issue: 'Trailer door latch sticking', severity: 'low', status: 'resolved', created: '11:00 AM' },
  ]);
  const chatEndRef = useRef(null);

  // Auto-replies to simulate driver responses
  const DRIVER_REPLIES = [
    "Copy that, I'll check now.",
    "Understood. I'm pulled over at the next rest stop.",
    "Roger. Can you send a mobile unit? I can't move.",
    "Checking... yeah I see what you mean. Sending a photo.",
    "10-4. I'll try that and report back.",
    "It's gotten worse since I last reported. Please advise.",
    "I can limp it to the next truck stop, about 15 miles.",
  ];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedDriver]);

  const sendMessage = () => {
    if (!newMsg.trim() || !selectedDriver) return;
    const driverId = selectedDriver;
    const now = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => ({
      ...prev,
      [driverId]: [...(prev[driverId] || []), { from: 'mechanic', text: newMsg, time: now }]
    }));
    setNewMsg('');

    // Simulate driver reply after 2-4 seconds
    setTimeout(() => {
      const reply = DRIVER_REPLIES[Math.floor(Math.random() * DRIVER_REPLIES.length)];
      const replyTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      setMessages(prev => ({
        ...prev,
        [driverId]: [...(prev[driverId] || []), { from: 'driver', text: reply, time: replyTime }]
      }));
    }, 2000 + Math.random() * 2000);
  };

  const resolveTicket = (ticketId) => {
    setActiveTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: 'resolved' } : t));
  };

  const sel = drivers.find(d => d.id === selectedDriver);
  const driverMessages = messages[selectedDriver] || [];

  return (
    <div className="portal-wrapper">
      <header className="portal-header">
        <div className="portal-header-left">
          <div className="portal-logo-sm">PKC<span> LLC</span></div>
          <div className="portal-header-div" />
          <div className="portal-user-info">
            <div className="portal-user-name">🔧 Mechanic / Roadside Assistance</div>
            <div className="portal-user-id">Communication Hub — Service Department</div>
          </div>
        </div>
        <div className="portal-header-right">
          <button className="portal-back-link" onClick={onBack}>← Dispatch</button>
        </div>
      </header>

      <div className="mech-layout">
        {/* LEFT — Driver list + Tickets */}
        <div className="mech-sidebar">
          <div className="mech-section-title">🚛 Fleet Drivers</div>
          <div className="mech-driver-list">
            {drivers.map(d => (
              <div key={d.id} className={`mech-driver-item ${selectedDriver === d.id ? 'selected' : ''}`} onClick={() => setSelectedDriver(d.id)}>
                <div className="mech-driver-name">{d.name}</div>
                <div className="mech-driver-meta">{d.truckId} · {d.currentCity}</div>
                <div className={`mech-driver-status st-${d.status}`}>{d.status}</div>
                {(messages[d.id] || []).length > 0 && <div className="mech-msg-badge">{messages[d.id].length}</div>}
              </div>
            ))}
          </div>

          <div className="mech-section-title" style={{ marginTop: 16 }}>🎫 Service Tickets</div>
          <div className="mech-ticket-list">
            {activeTickets.map(t => {
              const driver = drivers.find(d => d.id === t.driverId);
              return (
                <div key={t.id} className={`mech-ticket ${t.status === 'resolved' ? 'resolved' : ''} sev-${t.severity}`}>
                  <div className="ticket-header">
                    <span className="ticket-id">{t.id}</span>
                    <span className={`ticket-sev sev-${t.severity}`}>{t.severity}</span>
                  </div>
                  <div className="ticket-driver">{driver?.name || t.driverId} · {driver?.truckId}</div>
                  <div className="ticket-issue">{t.issue}</div>
                  <div className="ticket-footer">
                    <span className="ticket-time">{t.created}</span>
                    {t.status === 'active' && (
                      <button className="ticket-resolve-btn" onClick={() => resolveTicket(t.id)}>✓ Resolve</button>
                    )}
                    {t.status === 'resolved' && <span className="ticket-resolved-badge">✅ Resolved</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT — Chat */}
        <div className="mech-chat">
          {sel ? (
            <>
              <div className="chat-header">
                <div className="chat-driver-info">
                  <div className="chat-driver-name">{sel.name}</div>
                  <div className="chat-driver-meta">{sel.truckId} · {sel.trailerType} · {sel.currentCity} · {sel.phone}</div>
                </div>
                <div className={`chat-status st-${sel.status}`}>{sel.status.toUpperCase()}</div>
              </div>

              <div className="chat-vehicle-strip">
                <span>🚛 Speed: {sel.speed} mph</span>
                <span>⛽ Fuel: {Math.round(sel.fuelLevel)}%</span>
                <span>🛣️ {sel.originCity} → {sel.destCity}</span>
                <span>📍 {Math.round(sel.routeProgress)}% complete</span>
              </div>

              <div className="chat-messages">
                {driverMessages.length === 0 && (
                  <div className="chat-empty">
                    <div className="chat-empty-icon">💬</div>
                    <div>No messages yet. Start a conversation about roadside assistance.</div>
                  </div>
                )}
                {driverMessages.map((msg, i) => (
                  <div key={i} className={`chat-msg ${msg.from}`}>
                    <div className="chat-msg-sender">{msg.from === 'mechanic' ? '🔧 You' : `🚛 ${sel.name}`}</div>
                    <div className="chat-msg-text">{msg.text}</div>
                    <div className="chat-msg-time">{msg.time}</div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              <div className="chat-input-row">
                <input className="chat-input" placeholder="Type a message to the driver..." value={newMsg} onChange={e => setNewMsg(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} />
                <button className="chat-send-btn" onClick={sendMessage}>Send ▶</button>
              </div>

              <div className="chat-quick-msgs">
                {['What is your current location?', 'Can you send a photo of the issue?', 'Mobile unit dispatched to your location.', 'Stay put, help is on the way.', 'Can you drive to the nearest truck stop?'].map((msg, i) => (
                  <button key={i} className="quick-msg-btn" onClick={() => { setNewMsg(msg); }}>{msg}</button>
                ))}
              </div>
            </>
          ) : (
            <div className="chat-empty-full">
              <div className="chat-empty-icon">👈</div>
              <div className="chat-empty-title">Select a Driver</div>
              <div>Choose a driver from the left panel to start a roadside assistance conversation</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
