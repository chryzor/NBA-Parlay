# PKC Fleet Dashboard & Control Center

A modern, dispatcher-facing fleet management web application and driver ecosystem built as a Single Page Application (SPA) using React, Vite, and Leaflet.js. 

This project was rebuilt from a school GitHub repository as an extended prototype for fleet tracking, routing, and management. It utilizes real APIs and simulated data that is designed to easily plug into a real production backend.

## 🚀 Key Features

*   **Interactive Fleet Map**: Built with Leaflet.js and OpenStreetMap (dark CartoDB tiles). No API keys required. Tracks all active trucks in real-time.
*   **Real Route Planning (OSRM)**: Calculates the shortest or fastest actual driving route between any two US cities using the Open Source Routing Machine (OSRM). Displays distances in miles, drive times, and fuel cost estimates.
*   **10 Simulated CDL Drivers**: A simulated backend engine tracks drivers moving across the US on realistic interstate routes, updating their location, speed, fuel, and Hours of Service (HOS) every few seconds.
*   **Delivery Tracking**: Monitor pickup and dropoff locations, with real-time ETAs and "miles remaining" calculations.
*   **HOS Compliance & Alerts**: Auto-generated alerts for Hours of Service violations (e.g., approaching the 11-hour daily or 60-hour weekly driving limits), low fuel, and home-time scheduling.

## 📱 Portals Included

### 1. Dispatcher Dashboard (Main)
The command center view. Monitors the entire fleet, routes trucks, tracks deliveries, and surfaces active alerts.

### 2. Driver Portal
An individualized dashboard for drivers to:
*   Clock In / Clock Out and change duty status (Driving, On Duty, Break, Sleeper).
*   View a detailed HOS summary (Daily/Weekly/Cycle limits).
*   Access historical Pay Stubs with gross, net, deductions, and mileage calculations.
*   Submit Maintenance Reports directly to the shop.

### 3. Mechanic / Roadside Assistance Portal
A communication hub for the service department:
*   Real-time chat with drivers for roadside assistance.
*   Manage active Service Tickets with severity levels (Low to Critical).
*   Monitor vehicle telemetry (speed, fuel, route) while assisting.

### 4. Driver Insights & Analytics
A management-level analytics view detailing:
*   Driver Performance Scores (Safety, Hard Braking, MPG, Idle Time, On-Time Delivery).
*   Detailed Vehicle Intel (Make, Model, Year, Engine, GVWR, VIN, Next Service Due).
*   Recent Activity History Logs.

## 🛠️ Technology Stack
*   **Frontend**: React 18, Vite
*   **Styling**: Vanilla CSS (Custom dark theme)
*   **Maps & Geocoding**: Leaflet, `react-leaflet`, Nominatim (OpenStreetMap)
*   **Routing**: OSRM (Open Source Routing Machine) API

## 📂 Documentation

See the `pkc-fleet-dashboard/docs/` directory for additional project planning and walkthrough documents:
*   `implementation_plan.md`: The original architecture and technical plan.
*   `walkthrough.md`: A detailed feature walkthrough.

## 🔧 Setup & Installation

1. Clone the repository
2. Navigate to the `pkc-fleet-dashboard` directory: `cd pkc-fleet-dashboard`
3. Install dependencies: `npm install`
4. Start the development server: `npm run dev`
5. Open `http://localhost:5173` in your browser.

## 🔌 Connecting to a Real API

The simulated data engine (`src/driverData.js`) is designed as a drop-in replacement. To use real drivers, swap the `getInitialDrivers()` and `simulateDriverUpdate()` functions with standard `fetch()` or WebSocket calls to your production backend. All components will automatically consume the real data.
