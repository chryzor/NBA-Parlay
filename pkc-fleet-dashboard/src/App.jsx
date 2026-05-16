import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getInitialDrivers, simulateDriverUpdate, US_CITIES } from './driverData';
import { calculateRouteByCity, calculateRoute } from './routeService';
import DriverPortal from './DriverPortal';
import MechanicPortal from './MechanicPortal';
import DriverInsights from './DriverInsights';

/* ── Leaflet icon fix ── */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const STATUS_COLORS = { driving:'#00C896', break:'#FFD600', off:'#FF2D3A', delivery:'#3B8BFF' };
const STATUS_LABELS = { driving:'Driving', break:'On Break', off:'Off Duty', delivery:'At Delivery' };

function makeTruckIcon(status) {
  const color = STATUS_COLORS[status] || '#FF8F00';
  return L.divIcon({
    className:'truck-marker',
    html:`<div class="truck-icon-wrapper ${status}" style="border-color:${color}">🚛</div>`,
    iconSize:[32,32], iconAnchor:[16,16], popupAnchor:[0,-18],
  });
}

function makeDestIcon() {
  return L.divIcon({
    className:'truck-marker',
    html:`<div style="width:24px;height:24px;display:flex;align-items:center;justify-content:center;border-radius:50%;background:rgba(255,143,0,0.25);border:2px solid #FF8F00;font-size:12px;">📍</div>`,
    iconSize:[24,24], iconAnchor:[12,12],
  });
}

/* ── Map controller ── */
function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => { if (center) map.flyTo(center, zoom || 6, { duration: 1 }); }, [center, zoom]);
  return null;
}

/* ── Clock ── */
function useClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);
  return now;
}

/* ══════════════════════════════════════════
   MAIN APP
   ══════════════════════════════════════════ */
export default function App() {
  const [currentPortal, setCurrentPortal] = useState('dispatch');
  const [loading, setLoading] = useState(true);
  const [drivers, setDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [driverRoute, setDriverRoute] = useState(null);
  const [rightTab, setRightTab] = useState('routes');
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [mapCenter, setMapCenter] = useState([39.5, -98.35]);
  const [mapZoom, setMapZoom] = useState(5);
  const [routeOrigin, setRouteOrigin] = useState('');
  const [routeDest, setRouteDest] = useState('');
  const [routeResult, setRouteResult] = useState(null);
  const [routeGeometry, setRouteGeometry] = useState(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const now = useClock();

  // Init drivers
  useEffect(() => {
    const d = getInitialDrivers();
    setDrivers(d);
    setTimeout(() => setLoading(false), 2200);
  }, []);

  // Simulate real-time updates every 3s
  useEffect(() => {
    const t = setInterval(() => {
      setDrivers(prev => prev.map(simulateDriverUpdate));
    }, 3000);
    return () => clearInterval(t);
  }, []);

  // Select driver & fetch route
  const selectDriver = useCallback(async (driver) => {
    setSelectedDriver(driver.id);
    setMapCenter([driver.position.lat, driver.position.lng]);
    setMapZoom(7);
    setRightTab('driver');
    setShowRightPanel(true);
    try {
      const route = await calculateRoute(driver.origin, driver.destination);
      setDriverRoute(route ? route.geometry : null);
    } catch { setDriverRoute(null); }
  }, []);

  // Route planner
  const planRoute = async () => {
    if (!routeOrigin || !routeDest) return;
    setRouteLoading(true);
    setRouteResult(null);
    setRouteGeometry(null);
    try {
      const result = await calculateRouteByCity(routeOrigin, routeDest);
      if (result && !result.error) {
        setRouteResult(result);
        setRouteGeometry(result.geometry);
        setMapCenter([
          (result.origin.lat + result.destination.lat) / 2,
          (result.origin.lng + result.destination.lng) / 2
        ]);
        setMapZoom(5);
      } else {
        setRouteResult({ error: result?.error || 'Route not found' });
      }
    } catch { setRouteResult({ error: 'Network error' }); }
    setRouteLoading(false);
  };

  // Filtered drivers
  const filtered = drivers.filter(d => {
    if (statusFilter !== 'all' && d.status !== statusFilter) return false;
    if (searchFilter && !d.name.toLowerCase().includes(searchFilter.toLowerCase()) && !d.truckId.toLowerCase().includes(searchFilter.toLowerCase())) return false;
    return true;
  });

  const sel = drivers.find(d => d.id === selectedDriver);
  const activeCount = drivers.filter(d => d.status === 'driving').length;
  const breakCount = drivers.filter(d => d.status === 'break').length;
  const offCount = drivers.filter(d => d.status === 'off').length;
  const delCount = drivers.filter(d => d.status === 'delivery').length;

  const timeStr = now.toLocaleTimeString('en-US', { hour12: false, hour:'2-digit', minute:'2-digit', second:'2-digit' });
  const dateStr = now.toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric' });

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="loading-logo">PKC<span> LLC</span></div>
        <div className="loading-bar-track"><div className="loading-bar-fill"></div></div>
        <div className="loading-text">Initializing Fleet Control Center...</div>
      </div>
    );
  }

  // Portal routing
  if (currentPortal === 'driver') return <DriverPortal drivers={drivers} onBack={() => setCurrentPortal('dispatch')} />;
  if (currentPortal === 'mechanic') return <MechanicPortal drivers={drivers} onBack={() => setCurrentPortal('dispatch')} />;
  if (currentPortal === 'insights') return <DriverInsights drivers={drivers} onBack={() => setCurrentPortal('dispatch')} />;

  return (
    <div className={`app-layout ${!showRightPanel ? 'route-panel-closed' : ''}`}>
      {/* ═══ TOP BAR ═══ */}
      <header className="topbar">
        <div className="topbar-brand">
          <div className="topbar-logo">PKC<span> LLC</span></div>
          <div className="topbar-sub">Fleet Control Center</div>
        </div>
        <div className="topbar-div" />
        <div className="topbar-stats">
          <div className="topbar-stat">
            <div className="topbar-stat-label">Active</div>
            <div className="topbar-stat-val green">{activeCount}</div>
          </div>
          <div className="topbar-stat">
            <div className="topbar-stat-label">Break</div>
            <div className="topbar-stat-val amber">{breakCount}</div>
          </div>
          <div className="topbar-stat">
            <div className="topbar-stat-label">Off Duty</div>
            <div className="topbar-stat-val red">{offCount}</div>
          </div>
          <div className="topbar-stat">
            <div className="topbar-stat-label">Delivering</div>
            <div className="topbar-stat-val" style={{color:'#3B8BFF',textShadow:'0 0 8px rgba(59,139,255,0.18)'}}>{delCount}</div>
          </div>
          <div className="topbar-stat">
            <div className="topbar-stat-label">Total Fleet</div>
            <div className="topbar-stat-val" style={{color:'#F0F4F8'}}>{drivers.length}</div>
          </div>
        </div>
        <div className="topbar-div" />
        <div className="topbar-portals">
          <button className="portal-nav-btn" onClick={() => setCurrentPortal('driver')}>🧑‍✈️ Driver</button>
          <button className="portal-nav-btn" onClick={() => setCurrentPortal('mechanic')}>🔧 Mechanic</button>
          <button className="portal-nav-btn" onClick={() => setCurrentPortal('insights')}>📊 Insights</button>
        </div>
        <div className="topbar-clock">{timeStr}</div>
        <div className="topbar-date">{dateStr}</div>
      </header>

      {/* ═══ LEFT SIDEBAR — FLEET ═══ */}
      <aside className="fleet-sidebar">
        <div className="sidebar-header">
          <div className="sidebar-title">🚛 Fleet Drivers</div>
          <input className="sidebar-search" placeholder="Search driver or truck..." value={searchFilter} onChange={e => setSearchFilter(e.target.value)} />
          <div className="sidebar-filters">
            {['all','driving','break','off','delivery'].map(s => (
              <button key={s} className={`filter-btn ${statusFilter===s?'active':''}`} onClick={() => setStatusFilter(s)}>
                {s === 'all' ? 'All' : STATUS_LABELS[s]}
              </button>
            ))}
          </div>
        </div>
        <div className="driver-list">
          {filtered.map(driver => (
            <div key={driver.id} className={`driver-card status-${driver.status} ${selectedDriver===driver.id?'selected':''}`} onClick={() => selectDriver(driver)}>
              <div className="driver-header">
                <div>
                  <div className="driver-name">{driver.name}</div>
                  <div className="driver-id">{driver.truckId} · {driver.id}</div>
                </div>
                <div className={`driver-status-badge badge-${driver.status}`}>{STATUS_LABELS[driver.status]}</div>
              </div>
              <div className="driver-meta">
                <div className="driver-meta-item"><span className="dm-label">HOS Today</span><span className={`dm-value ${driver.hoursWorkedToday>10?'crit':driver.hoursWorkedToday>8?'warn':''}`}>{driver.hoursWorkedToday.toFixed(1)}h</span></div>
                <div className="driver-meta-item"><span className="dm-label">Week</span><span className={`dm-value ${driver.hoursWorkedWeek>55?'crit':driver.hoursWorkedWeek>45?'warn':''}`}>{driver.hoursWorkedWeek.toFixed(0)}h</span></div>
                <div className="driver-meta-item"><span className="dm-label">Weeks Out</span><span className={`dm-value ${driver.weeksOut>=driver.weeksWillingOut?'crit':''}`}>{driver.weeksOut}/{driver.weeksWillingOut}</span></div>
                <div className="driver-meta-item"><span className="dm-label">Fuel</span><span className={`dm-value ${driver.fuelLevel<25?'crit':driver.fuelLevel<40?'warn':''}`}>{Math.round(driver.fuelLevel)}%</span></div>
              </div>
              <div className="driver-progress">
                <div className="progress-header">
                  <div className="progress-route">{driver.originCity} → {driver.destCity}</div>
                  <div className="progress-pct">{Math.round(driver.routeProgress)}%</div>
                </div>
                <div className="progress-bar"><div className="progress-fill" style={{width:`${driver.routeProgress}%`}}></div></div>
                <div className="progress-eta">ETA: {driver.eta} · {driver.milesRemaining} mi left · {driver.speed} mph</div>
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* ═══ CENTER — MAP ═══ */}
      <div className="map-area">
        <MapContainer center={mapCenter} zoom={mapZoom} className="map-container" zoomControl={false} attributionControl={false}>
          <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
          <MapController center={mapCenter} zoom={mapZoom} />

          {drivers.map(driver => (
            <Marker key={driver.id} position={[driver.position.lat, driver.position.lng]} icon={makeTruckIcon(driver.status)}
              eventHandlers={{ click: () => selectDriver(driver) }}>
              <Popup>
                <div className="popup-name">{driver.name}</div>
                <div className="popup-info">
                  {driver.truckId} · {driver.trailerType}<br/>
                  Status: {STATUS_LABELS[driver.status]}<br/>
                  Speed: {driver.speed} mph<br/>
                  {driver.originCity} → {driver.destCity}<br/>
                  Progress: {Math.round(driver.routeProgress)}% · ETA: {driver.eta}<br/>
                  HOS: {driver.hoursWorkedToday.toFixed(1)}h today · {driver.driveTimeRemaining.toFixed(1)}h left<br/>
                  Weeks: {driver.weeksOut}/{driver.weeksWillingOut} · Fuel: {Math.round(driver.fuelLevel)}%
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Destination markers for selected driver */}
          {sel && (
            <>
              <Marker position={[sel.destination.lat, sel.destination.lng]} icon={makeDestIcon()}>
                <Popup><div className="popup-name">📍 {sel.destCity}</div><div className="popup-info">Destination</div></Popup>
              </Marker>
              <Marker position={[sel.origin.lat, sel.origin.lng]} icon={makeDestIcon()}>
                <Popup><div className="popup-name">🏁 {sel.originCity}</div><div className="popup-info">Origin</div></Popup>
              </Marker>
            </>
          )}

          {/* Driver route line */}
          {driverRoute && <Polyline positions={driverRoute} pathOptions={{ color:'#FF8F00', weight:3, opacity:0.7, dashArray:'8 6' }} />}
          {/* Planned route line */}
          {routeGeometry && <Polyline positions={routeGeometry} pathOptions={{ color:'#3B8BFF', weight:4, opacity:0.85 }} />}
        </MapContainer>

        <button className="route-toggle-btn" onClick={() => setShowRightPanel(p => !p)}>
          {showRightPanel ? '▶ Hide Panel' : '◀ Route Planner'}
        </button>

        <div className="map-overlay-stats">
          <div className="map-stat-chip"><div className="dot dot-green"></div><span className="chip-label">Active</span><span className="chip-val">{activeCount}</span></div>
          <div className="map-stat-chip"><div className="dot dot-yellow"></div><span className="chip-label">Break</span><span className="chip-val">{breakCount}</span></div>
          <div className="map-stat-chip"><div className="dot dot-red"></div><span className="chip-label">Off</span><span className="chip-val">{offCount}</span></div>
          <div className="map-stat-chip"><div className="dot dot-blue"></div><span className="chip-label">Delivery</span><span className="chip-val">{delCount}</span></div>
        </div>
      </div>

      {/* ═══ RIGHT PANEL ═══ */}
      {showRightPanel && (
        <aside className="right-panel">
          <div className="panel-tabs">
            <button className={`panel-tab ${rightTab==='routes'?'active':''}`} onClick={() => setRightTab('routes')}>🛣️ Routes</button>
            <button className={`panel-tab ${rightTab==='deliveries'?'active':''}`} onClick={() => setRightTab('deliveries')}>📦 Deliveries</button>
            <button className={`panel-tab ${rightTab==='driver'?'active':''}`} onClick={() => setRightTab('driver')}>👤 Driver</button>
            <button className={`panel-tab ${rightTab==='alerts'?'active':''}`} onClick={() => setRightTab('alerts')}>⚠️ Alerts</button>
          </div>

          {/* ROUTES TAB */}
          {rightTab === 'routes' && (
            <div className="panel-section" style={{flex:1}}>
              <div className="panel-title">Route Planner</div>
              <div className="route-input-group">
                <input className="route-input" placeholder="Origin city (e.g. Dallas, TX)" value={routeOrigin} onChange={e => setRouteOrigin(e.target.value)} />
                <input className="route-input" placeholder="Destination (e.g. Chicago, IL)" value={routeDest} onChange={e => setRouteDest(e.target.value)} onKeyDown={e => e.key==='Enter' && planRoute()} />
                <button className="route-btn" onClick={planRoute} disabled={routeLoading || !routeOrigin || !routeDest}>
                  {routeLoading ? '⏳ Calculating...' : '🛣️ Calculate Route'}
                </button>
              </div>
              {routeResult && !routeResult.error && (
                <div className="route-result">
                  <div className="route-result-row"><span className="rr-label">Distance</span><span className="rr-value highlight">{routeResult.distance} mi</span></div>
                  <div className="route-result-row"><span className="rr-label">Drive Time</span><span className="rr-value">{routeResult.durationFormatted}</span></div>
                  <div className="route-result-row"><span className="rr-label">Est. Fuel</span><span className="rr-value">{routeResult.fuelEstimate} gal</span></div>
                  <div className="route-result-row"><span className="rr-label">Fuel Cost</span><span className="rr-value highlight">${routeResult.fuelCost}</span></div>
                  <div className="route-result-row"><span className="rr-label">HOS Stops</span><span className="rr-value">{Math.ceil(routeResult.duration / 11)}</span></div>
                </div>
              )}
              {routeResult?.error && <div style={{color:'#FF2D3A',fontFamily:'var(--f-mono)',fontSize:12,marginTop:8}}>{routeResult.error}</div>}

              <div className="panel-title" style={{marginTop:20}}>Quick Routes</div>
              {[
                ['Dallas, TX','Chicago, IL'], ['Los Angeles, CA','New York, NY'],
                ['Miami, FL','Seattle, WA'], ['Houston, TX','Denver, CO'],
                ['Atlanta, GA','Boston, MA'], ['Phoenix, AZ','Minneapolis, MN'],
              ].map(([o,d],i) => (
                <div key={i} className="delivery-item status-transit" style={{cursor:'pointer'}} onClick={() => { setRouteOrigin(o); setRouteDest(d); }}>
                  <div className="delivery-route">{o} → {d}</div>
                  <div className="delivery-detail">Click to calculate</div>
                </div>
              ))}
            </div>
          )}

          {/* DELIVERIES TAB */}
          {rightTab === 'deliveries' && (
            <div className="panel-section" style={{flex:1}}>
              <div className="panel-title">Active Deliveries</div>
              {drivers.map(d => d.deliveries.map(del => (
                <div key={del.id} className={`delivery-item status-${del.status}`}>
                  <div className="delivery-header">
                    <div className="delivery-id">{del.id}</div>
                    <div className={`delivery-status del-${del.status}`}>{del.status}</div>
                  </div>
                  <div className="delivery-route">{del.pickup} → {del.dropoff}</div>
                  <div className="delivery-detail">Driver: {d.name} · {d.truckId} · {del.milesRemaining} mi left</div>
                </div>
              )))}
            </div>
          )}

          {/* DRIVER DETAIL TAB */}
          {rightTab === 'driver' && sel && (
            <div className="driver-detail">
              <div className="detail-name">{sel.name}</div>
              <div className="detail-truck">{sel.truckId} · {sel.trailerType} · {sel.cdl}</div>
              <div className={`driver-status-badge badge-${sel.status}`} style={{marginBottom:14,display:'inline-block'}}>{STATUS_LABELS[sel.status]}</div>
              <div className="detail-grid">
                <div className="detail-stat"><div className="detail-stat-label">Speed</div><div className="detail-stat-val">{sel.speed} mph</div></div>
                <div className="detail-stat"><div className="detail-stat-label">Fuel</div><div className="detail-stat-val" style={{color:sel.fuelLevel<25?'#FF2D3A':sel.fuelLevel<40?'#FFD600':'#00C896'}}>{Math.round(sel.fuelLevel)}%</div></div>
                <div className="detail-stat"><div className="detail-stat-label">HOS Today</div><div className="detail-stat-val">{sel.hoursWorkedToday.toFixed(1)}h</div></div>
                <div className="detail-stat"><div className="detail-stat-label">HOS Week</div><div className="detail-stat-val">{sel.hoursWorkedWeek.toFixed(0)}h</div></div>
                <div className="detail-stat"><div className="detail-stat-label">Drive Left</div><div className="detail-stat-val" style={{color:sel.driveTimeRemaining<2?'#FF2D3A':'#00C896'}}>{sel.driveTimeRemaining.toFixed(1)}h</div></div>
                <div className="detail-stat"><div className="detail-stat-label">Weeks Out</div><div className="detail-stat-val" style={{color:sel.weeksOut>=sel.weeksWillingOut?'#FF2D3A':'#F0F4F8'}}>{sel.weeksOut} / {sel.weeksWillingOut}</div></div>
                <div className="detail-stat"><div className="detail-stat-label">Miles Driven</div><div className="detail-stat-val">{sel.milesDriven}</div></div>
                <div className="detail-stat"><div className="detail-stat-label">Miles Left</div><div className="detail-stat-val">{sel.milesRemaining}</div></div>
              </div>
              <div className="panel-title">Route</div>
              <div className="delivery-item status-transit">
                <div className="delivery-route">{sel.originCity} → {sel.destCity}</div>
                <div className="delivery-detail">Progress: {Math.round(sel.routeProgress)}% · ETA: {sel.eta} · {sel.milesTotal} total mi</div>
                <div className="progress-bar" style={{marginTop:8}}><div className="progress-fill" style={{width:`${sel.routeProgress}%`}}></div></div>
              </div>
              <div className="panel-title" style={{marginTop:14}}>Contact</div>
              <div className="delivery-item"><div className="delivery-detail">📱 {sel.phone}</div></div>
              <div className="panel-title" style={{marginTop:14}}>Location</div>
              <div className="delivery-item"><div className="delivery-detail">📍 {sel.currentCity}<br/>Lat: {sel.position.lat.toFixed(4)} · Lng: {sel.position.lng.toFixed(4)}</div></div>
            </div>
          )}
          {rightTab === 'driver' && !sel && (
            <div className="panel-section" style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center'}}>
              <div style={{textAlign:'center',color:'rgba(255,255,255,0.3)',fontFamily:'var(--f-ui)',fontSize:14}}>Select a driver from the fleet panel<br/>to view details</div>
            </div>
          )}

          {/* ALERTS TAB */}
          {rightTab === 'alerts' && (
            <div className="panel-section" style={{flex:1}}>
              <div className="panel-title">Active Alerts</div>
              {drivers.filter(d => d.hoursWorkedToday > 9).map(d => (
                <div key={`hos-${d.id}`} className="alert-item warning">
                  <div className="alert-icon">⚠️</div>
                  <div className="alert-content">
                    <div className="alert-title">HOS Warning — {d.name}</div>
                    <div className="alert-msg">{d.hoursWorkedToday.toFixed(1)}h worked today. Approaching 11h limit. Drive time remaining: {d.driveTimeRemaining.toFixed(1)}h</div>
                    <div className="alert-time">{d.truckId}</div>
                  </div>
                </div>
              ))}
              {drivers.filter(d => d.fuelLevel < 30).map(d => (
                <div key={`fuel-${d.id}`} className="alert-item">
                  <div className="alert-icon">⛽</div>
                  <div className="alert-content">
                    <div className="alert-title">Low Fuel — {d.name}</div>
                    <div className="alert-msg">Fuel level at {Math.round(d.fuelLevel)}%. Recommend refueling at next available stop.</div>
                    <div className="alert-time">{d.truckId}</div>
                  </div>
                </div>
              ))}
              {drivers.filter(d => d.weeksOut >= d.weeksWillingOut).map(d => (
                <div key={`wk-${d.id}`} className="alert-item warning">
                  <div className="alert-icon">🏠</div>
                  <div className="alert-content">
                    <div className="alert-title">Home Time Due — {d.name}</div>
                    <div className="alert-msg">Driver has been out {d.weeksOut} weeks (max preference: {d.weeksWillingOut} weeks). Schedule home time.</div>
                    <div className="alert-time">{d.truckId}</div>
                  </div>
                </div>
              ))}
              {drivers.filter(d => d.hoursWorkedWeek > 50).map(d => (
                <div key={`wkh-${d.id}`} className="alert-item info">
                  <div className="alert-icon">📋</div>
                  <div className="alert-content">
                    <div className="alert-title">Weekly HOS — {d.name}</div>
                    <div className="alert-msg">Weekly hours at {d.hoursWorkedWeek.toFixed(0)}h. Limit: 60h/7 days or 70h/8 days.</div>
                    <div className="alert-time">{d.truckId}</div>
                  </div>
                </div>
              ))}
              {drivers.every(d => d.hoursWorkedToday <= 9 && d.fuelLevel >= 30 && d.weeksOut < d.weeksWillingOut && d.hoursWorkedWeek <= 50) && (
                <div className="alert-item info">
                  <div className="alert-icon">✅</div>
                  <div className="alert-content">
                    <div className="alert-title">All Clear</div>
                    <div className="alert-msg">No active alerts. All drivers are within compliance limits.</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </aside>
      )}
    </div>
  );
}
