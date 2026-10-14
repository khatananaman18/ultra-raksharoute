# RakshaRoute (रक्षा रूट) 🚑
### India's Intelligent Ambulance Aggregation & Real-Time Emergency Response Platform

> *"When every second matters, RakshaRoute helps you find the right ambulance faster."*

---

## 🌟 Executive Summary

**RakshaRoute** is an intelligent ambulance aggregation and emergency logistics platform designed to solve the life-or-death crisis of fragmented emergency response in India.

**RakshaRoute does not own the ambulances.** Instead, it aggregates fleets operated by:
- Government Apex Referral Hospitals (e.g., AIIMS, Safdarjung)
- Private Super-Speciality Hospital Networks (e.g., Max, Apollo, Fortis, Medanta)
- Independent Emergency Medical Service (EMS) fleets
- Verified Private Ambulance Operators

When a medical crisis strikes, patients and their families typically waste 15–30 critical minutes manually calling multiple hospitals, often without knowing if an ambulance has a working ventilator or if the hospital's ICU is full.

RakshaRoute replaces this chaos with a **1-Tap Emergency SOS action**, instantly detecting GPS location, executing dynamic progressive radius scans, scoring ambulances based on **medical suitability rather than just raw distance**, and providing live turn-by-turn tracking.

---

## ⚡ Core Innovations & Features

### 1. 🚨 Minimum Actions During Emergency (1-Tap SOS)
- **Zero friction**: Patients can dispatch help without tedious registration forms.
- **Accurate Geolocation**: Automatic device GPS coordinate detection with instant fallback to metropolitan presets (Delhi NCR Connaught Place, AIIMS, Saket, Cyber City Gurugram, Noida).

### 2. 🧠 Intelligent Medical Matching Engine
Most ride apps match solely on distance. In medicine, sending a basic transport van to a severe cardiac arrest is fatal.
Our matching formula scores:
$$\text{Match Score} = \text{Medical Suitability (40)} + \text{Distance (30)} + \text{ETA (20)} + \text{Hospital/Reputation (10)}$$
- **Strict Clinical Prioritization**: Critical ICU cases are matched with certified Mobile ICUs equipped with transport ventilators, biphasic defibrillators, and multipara monitors, preventing basic units from outranking specialized ones simply because they are physically closer.

### 3. 📡 Dynamic Progressive Search Radius
- **5 km Initial Perimeter**: Instant scan of active units nearby.
- **10 km Expansion**: Automatically widens if no suitable clinical match is found.
- **20 km & 30 km Regional Grid**: Progressively expands coverage until a certified unit is locked.
- Transparent real-time audit logs for dispatchers and users.

### 4. 🗺️ Live Real-Time Interactive Telemetry Map
- Interactive map powered by Leaflet & CartoDB tiles (with optional Google Maps API configuration via `GOOGLE_MAPS_API_KEY`).
- Pulsing emergency beacon at patient pickup.
- Moving ambulance with live GPS coordinate interpolation.
- Turn-by-turn route polyline to destination hospital.
- Dynamic minute-by-minute countdown ETA and remaining distance.

### 5. 🏥 Real-Time Hospital Emergency Capacity Tracking
- Partner hospitals broadcast:
  - Emergency Department status (`Open 24/7`, `Diverting Non-Critical`, `Trauma Critical Only`)
  - Live ICU Bed availability (e.g., `14 / 60 Available`)
  - Stationed ambulance counts
  - Oxygen bank and blood bank reserves
  - "Last Updated" timestamp for public accountability

### 6. 💥 Mass Emergency / Disaster Response Mode
- Designed for large-scale catastrophes: earthquakes, bridge/building collapses, multi-vehicle highway collisions.
- Authorizes incident commanders to request multiple ambulances simultaneously (e.g., 2 ICU units + 3 BLS units).
- Displays live aggregate fulfillment tracking: `Requested: 5 | Confirmed: 4 | Searching: 1`.

### 7. 🩺 Automated Post-Trip Health Follow-Up
- Configurable scheduling based on clinical severity:
  - **Basic / Non-Critical**: Follow-up survey in 12 hours.
  - **Moderate Emergency**: Follow-up survey in 24 hours.
  - **ICU / Critical Care**: Follow-up survey in 48–72 hours.
- Automated condition check: *"How is the patient doing now?"* (`Stable & Recovering`, `Needs Further Assistance`, `Urgent Emergency Required Now`).

---

## 👥 Supported Roles & Demo Personas

The platform includes 1-Click Instant Persona Switching in the top navigation bar:

| Role | Persona Name | Organization | Focus |
|---|---|---|---|
| **Patient / User** | Rahul Sharma | Individual User | 1-Tap SOS, dynamic ambulance ranking, live telemetry tracking, post-trip review |
| **Ambulance Pilot** | Rajesh Kumar | LifeRescue Alpha-1 (ICU) | Available/Busy/Offline toggle, dispatch alert audio cue, step-by-step navigation, live GPS broadcast |
| **Hospital Admin** | Dr. Priya Nair | AIIMS Apex Trauma Center | ICU bed capacity updater, emergency dept status, fleet manager, inbound trauma alerts |
| **Central Admin** | Vikramaditya Verma | RakshaRoute Command | National fleet utilization, response time KPIs, demand heatmaps, simulation controls |

---

## 🏗️ Architecture & Technology Stack

```
[ Frontend: React 18 + Vite + Tailwind CSS + Lucide Icons + Leaflet ]
                               │
               REST APIs + WebSockets (Socket.IO)
                               │
[ Backend Server: Node.js (v24) + Express + Socket.IO (Port 5050) ]
        ├── Auth Service (JWT + Demo Personas)
        ├── Intelligent Matching Engine (Clinical Scoring Algorithm)
        ├── Dynamic Radius Search (5km -> 10km -> 20km -> 30km)
        ├── Simulation Engine (Real-time GPS Waypoint Interpolator)
        ├── Notification & Post-Trip Follow-up Service
        └── Geospatial In-Memory Store with Seed Data
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### Installation
From the project root:
```bash
# 1. Install dependencies for both server and client
npm run install:all
```

### Running the Application
```bash
# 2. Launch both Backend Server and Frontend concurrently
node start-dev.js
```
- **Frontend App**: `http://localhost:3000`
- **Backend API & WebSockets**: `http://localhost:5050`

---

## 🛡️ Statutory Compliance Disclaimer

RakshaRoute operates strictly as an emergency logistics aggregator connecting patients with certified medical transport providers. Availability and in-transit clinical procedures are administered by verified partner hospitals and licensed private EMS fleets. For immediate life-threatening trauma across India, citizens are always advised to dial **112 / 108**.
# ultra-raksharoute
