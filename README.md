# सागरदृष्टि (SAGAR-3D)
### Interactive 3D Ocean Intelligence & Visualization Platform
**Problem Statement ID:** 26047 / 26067  
**Organization:** Ministry of Earth Sciences (MoES)  
**Department:** Indian National Centre for Ocean Information Services (INCOIS), Ocean Valley  
**Theme:** Disaster Management & Marine Intelligence  

---

## 🌐 Live Deployments
- **GitHub Repository:** [https://github.com/Flixxy-TheHealer/sagardrishti](https://github.com/Flixxy-TheHealer/sagardrishti)
- **Live Vercel Application:** [https://sagardrishti.vercel.app](https://sagardrishti.vercel.app)

---

## 📌 Executive Summary & Background
India's vast **Exclusive Economic Zone (EEZ)** and lengthy coastline require continuous, high-resolution monitoring of ocean state variables. INCOIS routinely generates and archives large volumes of ocean numerical model outputs (temperature, salinity, ocean currents, chlorophyll-a) and collects real-time/delayed-mode in-situ observations from autonomous instruments such as **Argo profiling floats, underwater gliders, CTD moorings, and OMNI buoys**.

**SAGAR-3D (सागरदृष्टि)** solves the key operational gap by providing an integrated, browser-native 3D visualization and intelligence platform that co-visualizes complex numerical ocean models alongside observational data in a single interactive environment.

---

## 🚀 Key Functional Capabilities

1. **Interactive 3D Volumetric Ocean Rendering (WebGL / Three.js)**:
   - Full water column visualization across the Indian Ocean, Arabian Sea, and Bay of Bengal.
   - Depth-slice navigation from sea surface ($0\,\text{m}$) down to the abyssal depths ($2000\,\text{m}$).
   - Dynamic vertical exaggeration controls ($1\times - 12\times$) for intuitive depth perception.
   - 3D Isosurface extraction and thermocline depth analysis ($D20$).

2. **In-Situ Instrument Co-Visualization**:
   - Georeferenced 3D beacons for **Argo Profiling Floats**, **Autonomous Gliders**, and **Moored CTD/OMNI Buoys**.
   - Interactive profile drawer powered by Chart.js displaying depth-vs-variable profiles (Temperature vs Depth, Salinity vs Depth, Potential Density $\sigma_\theta$).
   - Export capability for NetCDF CF-1.8 and CSV formats.

3. **3D Ocean Current Vector Dynamics**:
   - High-performance particle streamlines simulating surface and subsurface circulation (Somali Current, East India Coastal Current, West India Coastal Current, Equatorial Jet).
   - Time-step animation controller with play/pause, scrub, and multiple playback speed rates ($1\times, 2\times, 5\times$).

4. **INCOIS Operational & Disaster Management Overlays**:
   - **Potential Fishing Zones (PFZ)** advisory fronts.
   - **High Wave & Swell Surge** alerts.
   - **Cyclone Storm Surge** cone and drift tracking for Bay of Bengal and Arabian Sea.
   - **Search-and-Rescue (SAR)** drift simulation vectors.

5. **Dynamic Colorbar & Variable Palette Editor**:
   - Variable switching across Sea Surface Temperature (SST), Salinity (SSS), Current Velocity, Chlorophyll-a, and Dissolved Oxygen.
   - Perceptually uniform color palettes: **Turbo, Viridis, Thermal, Haline, Magma**.

6. **Public Outreach & Science Communication**:
   - Guided educational walkthroughs for students and policymakers explaining monsoon gyre reversals, riverine freshwater capping, and deep-sea autonomous robotics.

---

## 🛠️ Architecture & Open Standards
- **Frontend Stack:** HTML5, Modern Vanilla ES6 Modules, Three.js (r128), OrbitControls, Chart.js, Lucide Icons, Glassmorphic CSS3.
- **Data Standards:** OGC WMS/WCS compliant, CF-1.8 Conventions for NetCDF, OPeNDAP streaming interfaces.
- **Zero-Dependency Lightweight Client:** Runs directly in any modern desktop or mobile browser with WebGL support without client-side installations.

---

## 💻 Local Development
Simply serve the repository root with any HTTP server:

```bash
# Using Python
python -m http.server 3000

# Or using Node / npx
npx serve .
```

Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## 📜 Problem Statement Reference
- **Ministry of Earth Sciences (MoES)**
- **Indian National Centre for Ocean Information Services (INCOIS)**
- **Theme:** Disaster Management
- **Target Datasets:**
  - INCOIS LAS: [https://las.incois.gov.in/](https://las.incois.gov.in/)
  - Copernicus Marine Service: GLOBAL_MULTIYEAR_PHY_001_030
  - Argo Global Data (GDAC): `ftp://ftp.ifremer.fr/ifremer/argo`
  - Underwater Glider Data: `ftp://ftp.ifremer.fr/ifremer/glider/v2/`
