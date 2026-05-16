import React, { useState } from 'react';

const VEHICLE_DB = {
  'TRK-4482': { make: 'Kenworth', model: 'T680', year: 2023, engine: 'PACCAR MX-13', hp: 510, torque: '1850 lb-ft', trans: 'Eaton Fuller 18-spd', sleeper: '76" Mid-Roof', wheelbase: '232"', gvwr: '80,000 lbs', vin: '1XKYD49X4PJ123456', lastService: '04/28/2026', nextService: '05/28/2026', mileage: 248412 },
  'TRK-7710': { make: 'Freightliner', model: 'Cascadia', year: 2024, engine: 'Detroit DD15', hp: 505, torque: '1850 lb-ft', trans: 'Detroit DT12', sleeper: '72" Raised Roof', wheelbase: '228"', gvwr: '80,000 lbs', vin: '3AKJHHDR5NSAB7710', lastService: '05/02/2026', nextService: '06/02/2026', mileage: 89234 },
  'TRK-2255': { make: 'Peterbilt', model: '579', year: 2022, engine: 'PACCAR MX-13', hp: 500, torque: '1850 lb-ft', trans: 'Eaton Fuller 13-spd', sleeper: '80" Ultra Loft', wheelbase: '244"', gvwr: '80,000 lbs', vin: '1XPBD49X3ND225500', lastService: '04/15/2026', nextService: '05/15/2026', mileage: 312890 },
  'TRK-9901': { make: 'Volvo', model: 'VNL 860', year: 2023, engine: 'Volvo D13TC', hp: 455, torque: '1750 lb-ft', trans: 'Volvo I-Shift', sleeper: '77" Mid-Roof', wheelbase: '230"', gvwr: '80,000 lbs', vin: '4V4NC9EH1PN990100', lastService: '05/10/2026', nextService: '06/10/2026', mileage: 178550 },
  'TRK-3347': { make: 'International', model: 'LT Series', year: 2024, engine: 'Cummins X15', hp: 565, torque: '2050 lb-ft', trans: 'Eaton Endurant', sleeper: '73" Hi-Rise', wheelbase: '236"', gvwr: '80,000 lbs', vin: '3HSDZAPR4RN334700', lastService: '05/05/2026', nextService: '06/05/2026', mileage: 56780 },
  'TRK-6623': { make: 'Kenworth', model: 'W990', year: 2022, engine: 'PACCAR MX-13', hp: 510, torque: '1850 lb-ft', trans: 'Eaton Fuller 18-spd', sleeper: '76" Studio', wheelbase: '250"', gvwr: '80,000 lbs', vin: '1NKZL40X3NJ662300', lastService: '04/20/2026', nextService: '05/20/2026', mileage: 287340 },
  'TRK-1198': { make: 'Mack', model: 'Anthem', year: 2023, engine: 'Mack MP8HE+', hp: 505, torque: '1860 lb-ft', trans: 'mDRIVE HD', sleeper: '70" Stand-Up', wheelbase: '226"', gvwr: '80,000 lbs', vin: '1M1AN07Y1PM119800', lastService: '05/08/2026', nextService: '06/08/2026', mileage: 145670 },
  'TRK-5540': { make: 'Freightliner', model: 'Cascadia', year: 2023, engine: 'Detroit DD13', hp: 470, torque: '1700 lb-ft', trans: 'Detroit DT12', sleeper: '72" Raised Roof', wheelbase: '228"', gvwr: '80,000 lbs', vin: '3AKJHHDR7NSAB5540', lastService: '04/25/2026', nextService: '05/25/2026', mileage: 198430 },
  'TRK-8874': { make: 'Peterbilt', model: '389', year: 2021, engine: 'PACCAR MX-13', hp: 500, torque: '1850 lb-ft', trans: 'Eaton Fuller 18-spd', sleeper: '70" Flat Top', wheelbase: '270"', gvwr: '80,000 lbs', vin: '1XPBD49X1MD887400', lastService: '05/01/2026', nextService: '06/01/2026', mileage: 389120 },
  'TRK-4419': { make: 'Volvo', model: 'VNR 660', year: 2024, engine: 'Volvo D13', hp: 425, torque: '1750 lb-ft', trans: 'Volvo I-Shift', sleeper: '61" Flat Roof', wheelbase: '220"', gvwr: '80,000 lbs', vin: '4V4NC9TH4RN441900', lastService: '05/12/2026', nextService: '06/12/2026', mileage: 34560 },
};

// Simulated driver behavior/performance scores
function getDriverScores(driver) {
  const seed = driver.id.charCodeAt(4) + driver.id.charCodeAt(5);
  const rand = (min, max) => min + ((seed * 7 + min) % (max - min + 1));
  return {
    safetyScore: rand(72, 98), hardBrakes: rand(0, 8), rapidAccel: rand(1, 6),
    speedEvents: rand(0, 12), idleTime: rand(5, 22), mpg: (5.2 + (seed % 30) / 10).toFixed(1),
    onTimeDelivery: rand(85, 100), customerRating: (3.5 + (seed % 15) / 10).toFixed(1),
    inspectionPass: rand(90, 100), coasting: rand(15, 45),
  };
}

export default function DriverInsights({ drivers, onBack }) {
  const [selectedId, setSelectedId] = useState(drivers[0]?.id || null);
  const [viewTab, setViewTab] = useState('performance');

  const sel = drivers.find(d => d.id === selectedId);
  const vehicle = sel ? VEHICLE_DB[sel.truckId] : null;
  const scores = sel ? getDriverScores(sel) : null;

  return (
    <div className="portal-wrapper">
      <header className="portal-header">
        <div className="portal-header-left">
          <div className="portal-logo-sm">PKC<span> LLC</span></div>
          <div className="portal-header-div" />
          <div className="portal-user-info">
            <div className="portal-user-name">📊 Driver Insights & Vehicle Intel</div>
            <div className="portal-user-id">Management Analytics — Behind the Scenes</div>
          </div>
        </div>
        <div className="portal-header-right">
          <button className="portal-back-link" onClick={onBack}>← Dispatch</button>
        </div>
      </header>

      <div className="insights-layout">
        {/* LEFT — Driver selector */}
        <div className="insights-sidebar">
          <div className="mech-section-title">Select Driver</div>
          {drivers.map(d => (
            <div key={d.id} className={`mech-driver-item ${selectedId === d.id ? 'selected' : ''}`} onClick={() => setSelectedId(d.id)}>
              <div className="mech-driver-name">{d.name}</div>
              <div className="mech-driver-meta">{d.truckId} · {d.trailerType}</div>
              <div className={`mech-driver-status st-${d.status}`}>{d.status}</div>
            </div>
          ))}
        </div>

        {/* RIGHT — Insights */}
        <div className="insights-main">
          {sel && scores && (
            <>
              {/* Driver header */}
              <div className="insight-driver-header">
                <div className="insight-avatar">🧑‍✈️</div>
                <div>
                  <div className="insight-name">{sel.name}</div>
                  <div className="insight-meta">{sel.id} · {sel.cdl} · {sel.truckId} · {sel.trailerType}</div>
                  <div className="insight-route">{sel.originCity} → {sel.destCity} · {Math.round(sel.routeProgress)}% · ETA {sel.eta}</div>
                </div>
                <div className={`insight-status st-${sel.status}`}>{sel.status.toUpperCase()}</div>
              </div>

              {/* Tabs */}
              <div className="portal-tabs" style={{ margin: '0 0 16px' }}>
                {[['performance', '📊 Performance'], ['vehicle', '🚛 Vehicle'], ['history', '📋 History']].map(([k, l]) => (
                  <button key={k} className={`portal-tab ${viewTab === k ? 'active' : ''}`} onClick={() => setViewTab(k)}>{l}</button>
                ))}
              </div>

              {/* PERFORMANCE TAB */}
              {viewTab === 'performance' && (
                <div className="insight-content">
                  <div className="insight-score-hero">
                    <div className="score-circle" style={{ '--score-color': scores.safetyScore >= 90 ? '#00C896' : scores.safetyScore >= 80 ? '#FFD600' : '#FF2D3A' }}>
                      <div className="score-num">{scores.safetyScore}</div>
                      <div className="score-label">Safety Score</div>
                    </div>
                  </div>

                  <div className="insight-grid">
                    <div className="insight-card"><div className="insight-card-icon">🛑</div><div className="insight-card-val" style={{ color: scores.hardBrakes > 5 ? '#FF2D3A' : '#00C896' }}>{scores.hardBrakes}</div><div className="insight-card-label">Hard Brakes (30d)</div></div>
                    <div className="insight-card"><div className="insight-card-icon">⚡</div><div className="insight-card-val" style={{ color: scores.rapidAccel > 4 ? '#FFD600' : '#00C896' }}>{scores.rapidAccel}</div><div className="insight-card-label">Rapid Accel (30d)</div></div>
                    <div className="insight-card"><div className="insight-card-icon">🏎️</div><div className="insight-card-val" style={{ color: scores.speedEvents > 8 ? '#FF2D3A' : '#00C896' }}>{scores.speedEvents}</div><div className="insight-card-label">Speed Events (30d)</div></div>
                    <div className="insight-card"><div className="insight-card-icon">⏸️</div><div className="insight-card-val">{scores.idleTime}%</div><div className="insight-card-label">Idle Time</div></div>
                    <div className="insight-card"><div className="insight-card-icon">⛽</div><div className="insight-card-val" style={{ color: '#FF8F00' }}>{scores.mpg}</div><div className="insight-card-label">Avg MPG</div></div>
                    <div className="insight-card"><div className="insight-card-icon">📦</div><div className="insight-card-val" style={{ color: scores.onTimeDelivery >= 95 ? '#00C896' : '#FFD600' }}>{scores.onTimeDelivery}%</div><div className="insight-card-label">On-Time Delivery</div></div>
                    <div className="insight-card"><div className="insight-card-icon">⭐</div><div className="insight-card-val">{scores.customerRating}/5</div><div className="insight-card-label">Customer Rating</div></div>
                    <div className="insight-card"><div className="insight-card-icon">🔍</div><div className="insight-card-val" style={{ color: '#00C896' }}>{scores.inspectionPass}%</div><div className="insight-card-label">Inspection Pass</div></div>
                  </div>

                  <div className="insight-section-title">Driver Snapshot</div>
                  <div className="insight-detail-grid">
                    <div className="insight-detail-row"><span>Hours Today</span><span style={{ color: sel.hoursWorkedToday > 10 ? '#FF2D3A' : '#F0F4F8' }}>{sel.hoursWorkedToday.toFixed(1)}h / 11h</span></div>
                    <div className="insight-detail-row"><span>Hours This Week</span><span style={{ color: sel.hoursWorkedWeek > 55 ? '#FF2D3A' : '#F0F4F8' }}>{sel.hoursWorkedWeek.toFixed(0)}h / 60h</span></div>
                    <div className="insight-detail-row"><span>Drive Time Remaining</span><span>{sel.driveTimeRemaining.toFixed(1)}h</span></div>
                    <div className="insight-detail-row"><span>Weeks Out</span><span style={{ color: sel.weeksOut >= sel.weeksWillingOut ? '#FF2D3A' : '#F0F4F8' }}>{sel.weeksOut} / {sel.weeksWillingOut} weeks</span></div>
                    <div className="insight-detail-row"><span>Miles Driven (Trip)</span><span>{sel.milesDriven} mi</span></div>
                    <div className="insight-detail-row"><span>Miles Remaining</span><span>{sel.milesRemaining} mi</span></div>
                    <div className="insight-detail-row"><span>Fuel Level</span><span style={{ color: sel.fuelLevel < 25 ? '#FF2D3A' : '#00C896' }}>{Math.round(sel.fuelLevel)}%</span></div>
                    <div className="insight-detail-row"><span>Current Speed</span><span>{sel.speed} mph</span></div>
                  </div>
                </div>
              )}

              {/* VEHICLE TAB */}
              {viewTab === 'vehicle' && vehicle && (
                <div className="insight-content">
                  <div className="vehicle-hero">
                    <div className="vehicle-icon">🚛</div>
                    <div className="vehicle-title">{vehicle.year} {vehicle.make} {vehicle.model}</div>
                    <div className="vehicle-subtitle">{sel.truckId} · {sel.trailerType}</div>
                  </div>

                  <div className="insight-section-title">Specifications</div>
                  <div className="insight-detail-grid">
                    <div className="insight-detail-row"><span>Make</span><span>{vehicle.make}</span></div>
                    <div className="insight-detail-row"><span>Model</span><span>{vehicle.model}</span></div>
                    <div className="insight-detail-row"><span>Year</span><span>{vehicle.year}</span></div>
                    <div className="insight-detail-row"><span>VIN</span><span style={{ fontSize: 11 }}>{vehicle.vin}</span></div>
                    <div className="insight-detail-row"><span>Engine</span><span>{vehicle.engine}</span></div>
                    <div className="insight-detail-row"><span>Horsepower</span><span>{vehicle.hp} HP</span></div>
                    <div className="insight-detail-row"><span>Torque</span><span>{vehicle.torque}</span></div>
                    <div className="insight-detail-row"><span>Transmission</span><span>{vehicle.trans}</span></div>
                    <div className="insight-detail-row"><span>Sleeper</span><span>{vehicle.sleeper}</span></div>
                    <div className="insight-detail-row"><span>Wheelbase</span><span>{vehicle.wheelbase}</span></div>
                    <div className="insight-detail-row"><span>GVWR</span><span>{vehicle.gvwr}</span></div>
                  </div>

                  <div className="insight-section-title">Service</div>
                  <div className="insight-detail-grid">
                    <div className="insight-detail-row"><span>Odometer</span><span>{vehicle.mileage.toLocaleString()} mi</span></div>
                    <div className="insight-detail-row"><span>Last Service</span><span>{vehicle.lastService}</span></div>
                    <div className="insight-detail-row"><span>Next Service Due</span><span style={{ color: '#FFD600' }}>{vehicle.nextService}</span></div>
                    <div className="insight-detail-row"><span>Fuel Level</span><span>{Math.round(sel.fuelLevel)}%</span></div>
                    <div className="insight-detail-row"><span>Avg MPG</span><span>{scores.mpg}</span></div>
                  </div>
                </div>
              )}

              {/* HISTORY TAB */}
              {viewTab === 'history' && (
                <div className="insight-content">
                  <div className="insight-section-title">Recent Activity Log</div>
                  {[
                    { time: 'Today 2:30 PM', event: 'Route progress updated', detail: `${Math.round(sel.routeProgress)}% of ${sel.originCity} → ${sel.destCity}` },
                    { time: 'Today 10:15 AM', event: 'Break taken', detail: '30-minute DOT break at rest area' },
                    { time: 'Today 6:00 AM', event: 'Clocked in', detail: 'Started shift, pre-trip inspection complete' },
                    { time: 'Yesterday 8:00 PM', event: 'Clocked out', detail: 'End of shift, sleeper berth' },
                    { time: 'Yesterday 2:00 PM', event: 'Fuel stop', detail: 'Filled 120 gal at Pilot Travel Center' },
                    { time: 'Yesterday 9:00 AM', event: 'Delivery completed', detail: 'Load #87241 delivered at dock 7' },
                    { time: '2 days ago', event: 'Inspection', detail: 'Level 2 DOT inspection — passed, no violations' },
                    { time: '3 days ago', event: 'Maintenance report', detail: 'Reported tire pressure issue on drive axle' },
                  ].map((entry, i) => (
                    <div key={i} className="history-entry">
                      <div className="history-time">{entry.time}</div>
                      <div className="history-event">{entry.event}</div>
                      <div className="history-detail">{entry.detail}</div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
