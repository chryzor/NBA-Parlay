# PKC LLC Fleet Control Center — Walkthrough

## What Was Built

A **full-featured fleet dispatcher dashboard** for PKC LLC, running at `http://localhost:5173/` in a new directory at `pkc-fleet-dashboard/`.

![PKC LLC Fleet Dashboard](C:\Users\chryz\.gemini\antigravity\brain\7a328391-007f-4fcd-b5da-1f58aac2fee7\pkc_fleet_dashboard_1778915589741.png)

![Dashboard Demo Recording](C:\Users\chryz\.gemini\antigravity\brain\7a328391-007f-4fcd-b5da-1f58aac2fee7\fleet_dashboard_verify_1778915541222.webp)

## Features

### 🗺️ Interactive Fleet Map
- **Real OpenStreetMap** tiles (CartoDB Dark Matter theme)
- **10 truck markers** with color-coded status rings (green=driving, yellow=break, red=off, blue=delivery)
- Click any truck to see its route on the map
- Popup info with full driver details

### 👤 Fleet Sidebar (Left)
Each driver card shows in real-time:
- **Name, truck ID, CDL number**
- **Status badge** (Driving / On Break / Off Duty / At Delivery)
- **HOS Today/Week** — hours worked with color warnings at limits
- **Weeks Out** — current vs. willing (e.g., 2/4 weeks)
- **Fuel level** — with low-fuel warnings
- **Route progress bar** — origin → destination with % complete
- **ETA, miles remaining, current speed**
- **Search and filter** by status

### 🛣️ Route Planner (Right Panel)
- Type any two US cities → **real OSRM road routing**
- Returns: **actual road distance (miles)**, **drive time**, **fuel estimate**, **fuel cost**, **HOS stops needed**
- Route drawn as a polyline on the map
- 6 **Quick Routes** pre-loaded for common corridors

### 📦 Delivery Tracker
- All active deliveries with status (Pending / In Transit / Delivered)
- Driver assignment, miles remaining

### ⚠️ Alerts Panel
- Auto-generated alerts for:
  - **HOS violations** (approaching 11h daily / 60-70h weekly)
  - **Low fuel** warnings
  - **Home time due** (weeks out ≥ weeks willing)

### 📊 Top Bar HUD
- Real-time fleet counts: Active, Break, Off Duty, Delivering
- Live clock with date

## Swap-Ready Architecture

> [!IMPORTANT]
> To swap to real drivers in production, edit **one function** in [driverData.js](file:///c:/Users/chryz/Downloads/nba-odds-app/pkc-fleet-dashboard/src/driverData.js):

```diff
// In driverData.js, replace getInitialDrivers():
-export function getInitialDrivers() {
-  return INITIAL_DRIVERS.map(buildDriverState);
-}
+export async function getInitialDrivers() {
+  const res = await fetch('https://your-api.pkc-llc.com/api/drivers');
+  const data = await res.json();
+  return data.map(buildDriverState);
+}
```

The driver schema is fully documented at the top of `driverData.js`.

## Files Created

| File | Purpose |
|------|---------|
| [index.html](file:///c:/Users/chryz/Downloads/nba-odds-app/pkc-fleet-dashboard/index.html) | Entry HTML with Leaflet CSS, Google Fonts |
| [src/index.css](file:///c:/Users/chryz/Downloads/nba-odds-app/pkc-fleet-dashboard/src/index.css) | Dark command-center theme (~400 lines) |
| [src/driverData.js](file:///c:/Users/chryz/Downloads/nba-odds-app/pkc-fleet-dashboard/src/driverData.js) | 10 simulated CDL drivers + real-time simulation |
| [src/routeService.js](file:///c:/Users/chryz/Downloads/nba-odds-app/pkc-fleet-dashboard/src/routeService.js) | OSRM routing + Nominatim geocoding APIs |
| [src/App.jsx](file:///c:/Users/chryz/Downloads/nba-odds-app/pkc-fleet-dashboard/src/App.jsx) | Main dashboard React component |

## APIs Used (All Free)

| API | Purpose | Cost |
|-----|---------|------|
| **OpenStreetMap / CartoDB** | Map tiles | Free |
| **OSRM** | Real road routing + distances | Free |
| **Nominatim** | City geocoding | Free |

## Verification
- ✅ App builds and runs without errors
- ✅ Map renders with all 10 driver markers
- ✅ Driver cards show real-time updating data
- ✅ Route planner connected to OSRM API
- ✅ Status filters and search working
- ✅ Alerts auto-generated from driver data
