/**
 * सागरदृष्टि (SAGAR-3D) - Interactive 3D Ocean Intelligence & Visualization Platform
 * Problem Statement ID: 26047 / 26067
 * MoES / INCOIS Ocean Valley
 */

// Global State
const state = {
  currentVar: 'sst',
  depth: 0,
  verticalExaggeration: 4.0,
  palette: 'thermal',
  isPlaying: false,
  playbackSpeed: 1,
  timeStepIndex: 12, // 0 to 24
  layers: {
    argo: true,
    gliders: true,
    moorings: true,
    streamlines: true,
    isosurface: true,
    pfz: true,
    highWave: false,
    cyclone: false,
    sar: false
  },
  selectedInstrument: null
};

// Color palettes definitions
const COLOR_PALETTES = {
  thermal: ['#000033', '#0000ff', '#00ffff', '#00ff00', '#ffff00', '#ff0000', '#ffffff'],
  turbo: ['#30123b', '#4686fb', '#1ae4b6', '#a2fc3c', '#fbb938', '#e4460a', '#7a0403'],
  viridis: ['#440154', '#482878', '#3e4989', '#31688e', '#26828e', '#1f9e89', '#35b779', '#6ece58', '#b5de2b', '#fde725'],
  haline: ['#28192f', '#44225d', '#61298a', '#7b2e9d', '#992fa6', '#bb2ea3', '#de3494', '#f7547b', '#fe8267', '#fec382'],
  magma: ['#000004', '#180f3d', '#440f76', '#721f81', '#9e2f7f', '#cd4071', '#f1605d', '#fd9668', '#feca8d', '#fcfdbf']
};

const VARIABLE_CONFIGS = {
  sst: { name: 'Sea Surface Temp', unit: '°C', min: 18.0, mid: 26.0, max: 32.5, palette: 'thermal' },
  sss: { name: 'Sea Surface Salinity', unit: 'PSU', min: 31.0, mid: 34.5, max: 37.0, palette: 'haline' },
  currents: { name: 'Current Velocity', unit: 'm/s', min: 0.05, mid: 0.65, max: 1.80, palette: 'turbo' },
  chla: { name: 'Chlorophyll-a', unit: 'mg/m³', min: 0.02, mid: 1.20, max: 8.50, palette: 'viridis' },
  doxy: { name: 'Dissolved O₂', unit: 'ml/L', min: 0.20, mid: 2.50, max: 5.80, palette: 'magma' },
  thermocline: { name: 'Thermocline (D20)', unit: 'm', min: 40, mid: 95, max: 160, palette: 'turbo' }
};

// Realistic In-Situ Instruments in Indian Ocean / EEZ
const IN_SITU_INSTRUMENTS = [
  { id: 'INCOIS-ARGO-2902143', type: 'argo', name: 'Argo Float #2902143', lat: 14.85, lon: 69.21, region: 'Central Arabian Sea', depth: 2000, cycle: 184, sst: 28.6, sss: 36.4, bgc: true },
  { id: 'INCOIS-ARGO-2902201', type: 'argo', name: 'Argo Float #2902201', lat: 11.20, lon: 74.50, region: 'Lakshadweep Sea', depth: 2000, cycle: 92, sst: 29.1, sss: 35.8, bgc: false },
  { id: 'INCOIS-ARGO-2902340', type: 'argo', name: 'Argo Float #2902340', lat: 13.50, lon: 85.20, region: 'Bay of Bengal (Central)', depth: 2000, cycle: 142, sst: 29.8, sss: 32.8, bgc: true },
  { id: 'INCOIS-ARGO-2902410', type: 'argo', name: 'Argo Float #2902410', lat: 17.10, lon: 88.30, region: 'Northern Bay of Bengal', depth: 1800, cycle: 76, sst: 30.2, sss: 31.4, bgc: true },
  { id: 'INCOIS-ARGO-2902115', type: 'argo', name: 'Argo Float #2902115', lat: 4.50, lon: 78.90, region: 'Equatorial Indian Ocean', depth: 2000, cycle: 210, sst: 29.5, sss: 34.6, bgc: true },
  { id: 'INCOIS-ARGO-2902502', type: 'argo', name: 'Argo Float #2902502', lat: 20.30, lon: 66.80, region: 'North-East Arabian Sea', depth: 1500, cycle: 118, sst: 27.2, sss: 36.8, bgc: false },
  
  // Autonomous Gliders
  { id: 'GLIDER-IND-04', type: 'glider', name: 'Deep Glider Sagar-04', lat: 15.60, lon: 72.80, region: 'Konkan Shelf Upwelling Transect', depth: 1000, cycle: 42, sst: 27.8, sss: 36.1, mission: 'Monsoon Process Study' },
  { id: 'GLIDER-IND-07', type: 'glider', name: 'Slocum Glider Dhrut-07', lat: 12.00, lon: 82.50, region: 'Coromandel Coastal Boundary', depth: 800, cycle: 65, sst: 29.4, sss: 33.2, mission: 'Eddy Pumping Survey' },
  { id: 'GLIDER-IND-09', type: 'glider', name: 'WaveGlider OceanEye-9', lat: 9.30, lon: 92.80, region: 'Andaman Basin Transect', depth: 1000, cycle: 31, sst: 29.7, sss: 32.9, mission: 'Internal Waves Profiling' },
  
  // CTD Moorings / OMNI Buoys
  { id: 'OMNI-AD02', type: 'mooring', name: 'INCOIS OMNI Buoy AD02', lat: 15.00, lon: 69.00, region: 'Arabian Sea Met-Ocean Station', depth: 3200, cycle: 'Continuous', sst: 28.5, sss: 36.3, sensors: 'Aanderaa CTD, ADCP, Met' },
  { id: 'OMNI-BD08', type: 'mooring', name: 'INCOIS OMNI Buoy BD08', lat: 18.20, lon: 89.70, region: 'Bay of Bengal Deep Mooring', depth: 2200, cycle: 'Continuous', sst: 30.1, sss: 31.8, sensors: 'BGC Oxygen, CTD, Fluorometer' },
  { id: 'OMNI-AD04', type: 'mooring', name: 'INCOIS OMNI Buoy AD04', lat: 8.30, lon: 73.20, region: 'Mini-Coy Lakshadweep Sea', depth: 2800, cycle: 'Continuous', sst: 29.3, sss: 35.5, sensors: 'Surface Flux, Ocean Current Chain' }
];

// Three.js variables
let scene, camera, renderer, controls;
let earthMesh, atmosphereMesh, oceanVolMesh;
let particlesMesh, instrumentMarkersGroup, advisoryGroup;
let raycaster, mouse;
let profileChart = null;

// Convert Lat/Lon to 3D Cartesian coordinates on sphere of radius R
function latLonToVector3(lat, lon, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

// Generate realistic dynamic canvas texture for Earth with Indian Ocean detail
function createEarthOceanTexture(variable, depth, paletteName) {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  // Deep ocean background
  const oceanGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  if (variable === 'sst') {
    oceanGrad.addColorStop(0, '#001a33');
    oceanGrad.addColorStop(0.35, '#05445e');
    oceanGrad.addColorStop(0.55, '#189ab4');
    oceanGrad.addColorStop(0.7, '#05445e');
    oceanGrad.addColorStop(1, '#001a33');
  } else if (variable === 'sss') {
    oceanGrad.addColorStop(0, '#1a052e');
    oceanGrad.addColorStop(0.5, '#44146f');
    oceanGrad.addColorStop(1, '#1a052e');
  } else if (variable === 'chla') {
    oceanGrad.addColorStop(0, '#032015');
    oceanGrad.addColorStop(0.5, '#0a422a');
    oceanGrad.addColorStop(1, '#032015');
  } else {
    oceanGrad.addColorStop(0, '#040d1a');
    oceanGrad.addColorStop(0.5, '#092540');
    oceanGrad.addColorStop(1, '#040d1a');
  }
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw oceanic warm pool in Arabian Sea & Bay of Bengal
  const cx = ( (77 + 180) / 360 ) * canvas.width;
  const cy = ( (90 - 12) / 180 ) * canvas.height;

  // Warm Pool / Current dynamics blob
  const radial = ctx.createRadialGradient(cx, cy, 30, cx, cy, 420);
  if (variable === 'sst') {
    radial.addColorStop(0, 'rgba(255, 60, 0, 0.45)');
    radial.addColorStop(0.4, 'rgba(255, 170, 0, 0.35)');
    radial.addColorStop(0.8, 'rgba(0, 240, 255, 0.15)');
    radial.addColorStop(1, 'rgba(0, 0, 0, 0)');
  } else if (variable === 'sss') {
    // High salinity Arabian sea vs freshwater Bay of Bengal
    radial.addColorStop(0, 'rgba(180, 50, 240, 0.4)');
    radial.addColorStop(1, 'rgba(0, 0, 0, 0)');
  } else {
    radial.addColorStop(0, 'rgba(0, 242, 254, 0.3)');
    radial.addColorStop(1, 'rgba(0, 0, 0, 0)');
  }
  ctx.fillStyle = radial;
  ctx.beginPath();
  ctx.arc(cx, cy, 420, 0, Math.PI * 2);
  ctx.fill();

  // Draw Continents approximation (India, Africa, Eurasia, Australia)
  ctx.fillStyle = '#0f172a';
  ctx.strokeStyle = '#00f2fe';
  ctx.lineWidth = 1.8;

  function toCanvasCoords(lat, lon) {
    return {
      x: ((lon + 180) / 360) * canvas.width,
      y: ((90 - lat) / 180) * canvas.height
    };
  }

  // Draw Indian Subcontinent Peninsula
  const indiaPath = [
    [32, 75], [28, 70], [24, 68], [22, 69], [20, 72.8], [15, 73.8], [10, 76.0], [8.0, 77.5], // Kanyakumari
    [10, 79.8], [13, 80.3], [16, 82.2], [19, 85.0], [21.5, 87.0], [22.5, 89.0], [25, 90], [28, 88], [32, 78], [32, 75]
  ];

  ctx.beginPath();
  indiaPath.forEach(([lat, lon], idx) => {
    const p = toCanvasCoords(lat, lon);
    if (idx === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  });
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // EEZ boundary outline (Exclusive Economic Zone of India)
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
  ctx.lineWidth = 1.2;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  const eezPath = [
    [23.5, 67.5], [20.0, 65.0], [15.0, 68.0], [10.0, 71.0], [6.0, 75.0], [5.0, 78.0],
    [6.0, 81.0], [10.0, 84.0], [15.0, 87.0], [19.0, 89.0], [21.0, 89.5]
  ];
  eezPath.forEach(([lat, lon], idx) => {
    const p = toCanvasCoords(lat, lon);
    if (idx === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  });
  ctx.stroke();
  ctx.setLineDash([]); // reset

  // Lat/Lon graticules
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.lineWidth = 0.8;
  for (let lat = -80; lat <= 80; lat += 20) {
    const y = ((90 - lat) / 180) * canvas.height;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
  for (let lon = -180; lon <= 180; lon += 30) {
    const x = ((lon + 180) / 360) * canvas.width;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

// Initialize Three.js 3D Environment
function initThreeScene() {
  const container = document.getElementById('threeCanvas');
  const width = container.clientWidth || window.innerWidth;
  const height = container.clientHeight || window.innerHeight;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x050b14);

  camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
  camera.position.set(0, 15, 38);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  container.appendChild(renderer.domElement);

  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.minDistance = 15;
  controls.maxDistance = 80;
  controls.rotateSpeed = 0.8;
  controls.zoomSpeed = 1.0;

  // Set initial focus toward Indian Ocean / India
  controls.target.set(3, 4, 0);

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
  scene.add(ambientLight);

  const sunLight = new THREE.DirectionalLight(0x00f2fe, 1.2);
  sunLight.position.set(40, 25, 30);
  scene.add(sunLight);

  const backLight = new THREE.DirectionalLight(0x38bdf8, 0.4);
  backLight.position.set(-30, -10, -30);
  scene.add(backLight);

  // Earth Globe Geometry
  const globeRadius = 12;
  const globeGeo = new THREE.SphereGeometry(globeRadius, 64, 64);
  const globeTex = createEarthOceanTexture(state.currentVar, state.depth, state.palette);
  const globeMat = new THREE.MeshStandardMaterial({
    map: globeTex,
    roughness: 0.6,
    metalness: 0.15
  });
  earthMesh = new THREE.Mesh(globeGeo, globeMat);
  // Orient India toward front view
  earthMesh.rotation.y = -Math.PI * 0.42;
  earthMesh.rotation.x = 0.15;
  scene.add(earthMesh);

  // Outer Atmosphere Glow
  const atmosGeo = new THREE.SphereGeometry(globeRadius * 1.025, 64, 64);
  const atmosMat = new THREE.ShaderMaterial({
    vertexShader: `
      varying vec3 vNormal;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec3 vNormal;
      void main() {
        float intensity = pow(0.65 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.2);
        gl_FragColor = vec4(0.0, 0.95, 1.0, 1.0) * intensity * 0.8;
      }
    `,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
    transparent: true
  });
  atmosphereMesh = new THREE.Mesh(atmosGeo, atmosMat);
  earthMesh.add(atmosphereMesh);

  // Depth-Resolved Ocean Volumetric Shell
  const depthShellGeo = new THREE.SphereGeometry(globeRadius * 0.985, 48, 48);
  const depthShellMat = new THREE.MeshBasicMaterial({
    color: 0x0284c7,
    wireframe: true,
    transparent: true,
    opacity: 0.35
  });
  oceanVolMesh = new THREE.Mesh(depthShellGeo, depthShellMat);
  earthMesh.add(oceanVolMesh);

  // Setup In-Situ Markers
  instrumentMarkersGroup = new THREE.Group();
  earthMesh.add(instrumentMarkersGroup);
  renderInstrumentMarkers();

  // Setup Animated 3D Ocean Current Particles
  initCurrentStreamlines(globeRadius);

  // Setup Advisory Features (PFZ, SAR)
  advisoryGroup = new THREE.Group();
  earthMesh.add(advisoryGroup);
  updateAdvisories();

  // Raycaster for click interaction
  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  window.addEventListener('resize', onWindowResize);
  container.addEventListener('pointerdown', onPointerClick);
  container.addEventListener('pointermove', onPointerMove);

  animate();
}

// 3D Animated Ocean Current Particles
function initCurrentStreamlines(radius) {
  const particleCount = 2400;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const velocities = [];
  const colors = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i++) {
    // Concentrate around Indian Ocean, Arabian Sea, Bay of Bengal (-10°S to 25°N, 50°E to 100°E)
    const lat = (Math.random() * 35) - 10;
    const lon = (Math.random() * 55) + 48;
    const pos = latLonToVector3(lat, lon, radius * 1.012);

    positions[i * 3] = pos.x;
    positions[i * 3 + 1] = pos.y;
    positions[i * 3 + 2] = pos.z;

    // Circulation velocity direction
    velocities.push({
      lat: lat,
      lon: lon,
      speed: 0.05 + Math.random() * 0.08,
      deltaLat: (Math.sin(lon * 0.1) * 0.04),
      deltaLon: 0.08 + Math.cos(lat * 0.1) * 0.05
    });

    // Azure-cyan vector color
    colors[i * 3] = 0.0;
    colors[i * 3 + 1] = 0.85 + Math.random() * 0.15;
    colors[i * 3 + 2] = 0.95 + Math.random() * 0.05;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.22,
    vertexColors: true,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending
  });

  particlesMesh = new THREE.Points(geometry, material);
  particlesMesh.userData = { velocities, radius: radius * 1.012 };
  earthMesh.add(particlesMesh);
}

// Render In-Situ Markers (Argo, Gliders, Moorings)
function renderInstrumentMarkers() {
  while (instrumentMarkersGroup.children.length > 0) {
    instrumentMarkersGroup.remove(instrumentMarkersGroup.children[0]);
  }

  const radius = 12 * 1.015;

  IN_SITU_INSTRUMENTS.forEach(inst => {
    // Check layer visibility
    if (inst.type === 'argo' && !state.layers.argo) return;
    if (inst.type === 'glider' && !state.layers.gliders) return;
    if (inst.type === 'mooring' && !state.layers.moorings) return;

    const pos = latLonToVector3(inst.lat, inst.lon, radius);

    let color = 0x38bdf8; // Argo cyan
    let markerSize = 0.35;
    if (inst.type === 'glider') {
      color = 0x10b981; // emerald
      markerSize = 0.3;
    } else if (inst.type === 'mooring') {
      color = 0xf59e0b; // amber
      markerSize = 0.42;
    }

    // Marker Mesh
    const markerGeo = new THREE.SphereGeometry(markerSize, 16, 16);
    const markerMat = new THREE.MeshStandardMaterial({
      color: color,
      emissive: color,
      emissiveIntensity: 0.8,
      roughness: 0.2
    });
    const markerMesh = new THREE.Mesh(markerGeo, markerMat);
    markerMesh.position.copy(pos);
    markerMesh.userData = { isInstrument: true, data: inst };

    // Pulsing Beacon Halo ring
    const ringGeo = new THREE.RingGeometry(markerSize * 1.3, markerSize * 1.8, 16);
    const ringMat = new THREE.MeshBasicMaterial({
      color: color,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.7
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.lookAt(pos.clone().multiplyScalar(2));
    markerMesh.add(ringMesh);

    instrumentMarkersGroup.add(markerMesh);
  });
}

// Update Advisory Overlays (PFZ, SAR Drift, Cyclone)
function updateAdvisories() {
  while (advisoryGroup.children.length > 0) {
    advisoryGroup.remove(advisoryGroup.children[0]);
  }

  const r = 12 * 1.018;

  // Potential Fishing Zones (PFZ) polygon rings off Gujarat, Kerala, Odisha
  if (state.layers.pfz) {
    const pfzLocations = [
      { lat: 10.5, lon: 75.2, label: 'Kerala Coast Upwelling PFZ' },
      { lat: 21.0, lon: 69.2, label: 'Saurashtra Thermal Front PFZ' },
      { lat: 17.5, lon: 84.0, label: 'Visakhapatnam Shelf PFZ' }
    ];

    pfzLocations.forEach(loc => {
      const pos = latLonToVector3(loc.lat, loc.lon, r);
      const pfzGeo = new THREE.RingGeometry(0.8, 1.2, 24);
      const pfzMat = new THREE.MeshBasicMaterial({
        color: 0x34d399,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.65
      });
      const mesh = new THREE.Mesh(pfzGeo, pfzMat);
      mesh.position.copy(pos);
      mesh.lookAt(pos.clone().multiplyScalar(2));
      advisoryGroup.add(mesh);
    });
  }

  // Cyclone Storm Surge Cone (Bay of Bengal)
  if (state.layers.cyclone) {
    const coneCenter = latLonToVector3(15.5, 87.0, r);
    const coneGeo = new THREE.RingGeometry(0.5, 2.8, 32);
    const coneMat = new THREE.MeshBasicMaterial({
      color: 0xf43f5e,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.75
    });
    const coneMesh = new THREE.Mesh(coneGeo, coneMat);
    coneMesh.position.copy(coneCenter);
    coneMesh.lookAt(coneCenter.clone().multiplyScalar(2));
    advisoryGroup.add(coneMesh);
  }
}

// Window Resize Handler
function onWindowResize() {
  const container = document.getElementById('threeCanvas');
  const width = container.clientWidth;
  const height = container.clientHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}

// Pointer Move - Probe point update
function onPointerMove(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects([earthMesh, ...instrumentMarkersGroup.children], true);

  if (intersects.length > 0) {
    const hit = intersects[0];
    if (hit.object.userData && hit.object.userData.isInstrument) {
      document.body.style.cursor = 'pointer';
    } else {
      document.body.style.cursor = 'default';
      // Calculate approximate lat/lon under cursor
      const localPoint = hit.point.clone().applyMatrix4(earthMesh.matrixWorld.clone().invert()).normalize();
      const lat = 90 - (Math.acos(localPoint.y) * 180 / Math.PI);
      const lon = ((Math.atan2(localPoint.z, -localPoint.x) * 180 / Math.PI) - 180 + 360) % 360 - 180;
      updateProbeHud(lat, lon);
    }
  }
}

// Pointer Click - Select instrument and display profile
function onPointerClick(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(instrumentMarkersGroup.children, true);

  if (intersects.length > 0) {
    let target = intersects[0].object;
    while (target && !target.userData.isInstrument && target.parent) {
      target = target.parent;
    }
    if (target && target.userData.isInstrument) {
      openInstrumentDrawer(target.userData.data);
    }
  }
}

// Update Dynamic Probe HUD with coordinates and values
function updateProbeHud(lat, lon) {
  const hudCoords = document.getElementById('hudCoords');
  const probeCoord = document.getElementById('probeCoord');
  const probeRegion = document.getElementById('probeRegion');
  const probeSST = document.getElementById('probeSST');
  const probeSal = document.getElementById('probeSal');
  const probeVel = document.getElementById('probeVel');
  const probeThermo = document.getElementById('probeThermo');

  const latStr = `${Math.abs(lat).toFixed(2)}° ${lat >= 0 ? 'N' : 'S'}`;
  const lonStr = `${Math.abs(lon).toFixed(2)}° ${lon >= 0 ? 'E' : 'W'}`;

  hudCoords.textContent = `${latStr}, ${lonStr}`;
  probeCoord.textContent = `${latStr}, ${lonStr}`;

  // Estimate regional values
  let regionName = 'Indian Ocean (Open Basin)';
  let sst = 28.2;
  let sal = 35.1;
  let vel = 0.38;
  let d20 = 90;

  if (lat > 8 && lat < 25 && lon > 58 && lon < 77) {
    regionName = 'Arabian Sea';
    sst = 28.6 - (lat * 0.05);
    sal = 36.4 + (lat * 0.03);
    vel = 0.52;
    d20 = 75;
  } else if (lat > 8 && lat < 24 && lon >= 77 && lon < 96) {
    regionName = 'Bay of Bengal';
    sst = 29.8 - (lat * 0.03);
    sal = 32.2 - (lat * 0.06);
    vel = 0.44;
    d20 = 105;
  } else if (lat >= -5 && lat <= 8) {
    regionName = 'Equatorial Indian Ocean';
    sst = 29.6;
    sal = 34.8;
    vel = 0.85;
    d20 = 120;
  }

  probeRegion.textContent = regionName;
  probeSST.textContent = `${sst.toFixed(1)} °C`;
  probeSal.textContent = `${sal.toFixed(1)} PSU`;
  probeVel.textContent = `${vel.toFixed(2)} m/s`;
  probeThermo.textContent = `${Math.round(d20)} m`;
}

// Open and render Instrument Drawer with Chart.js
function openInstrumentDrawer(inst) {
  state.selectedInstrument = inst;
  const drawer = document.getElementById('profileDrawer');
  drawer.classList.add('open');

  document.getElementById('drawerInstrumentName').textContent = inst.name;
  document.getElementById('drawerSubtitle').textContent = `${inst.region} • ${inst.type.toUpperCase()} Network`;
  document.getElementById('statLat').textContent = `${inst.lat.toFixed(3)}° N`;
  document.getElementById('statLon').textContent = `${inst.lon.toFixed(3)}° E`;
  document.getElementById('statCycle').textContent = `#${inst.cycle}`;
  document.getElementById('statMaxDepth').textContent = `${inst.depth} m`;

  renderProfileChart('temp');
}

// Render CTD / BGC Profile Chart with depth on Y axis (inverted)
function renderProfileChart(varType) {
  const ctx = document.getElementById('profileChart').getContext('2d');
  const inst = state.selectedInstrument || IN_SITU_INSTRUMENTS[0];

  // Synthesize realistic Ocean CTD Profile
  const depths = [0, 10, 25, 50, 75, 100, 150, 200, 300, 500, 750, 1000, 1500, 2000];
  let values = [];
  let label = 'Temperature (°C)';
  let borderColor = '#00f2fe';
  let unit = '°C';

  if (varType === 'temp') {
    const sst = inst.sst || 28.5;
    values = depths.map(d => {
      if (d <= 50) return sst - (d * 0.01); // Mixed layer
      if (d <= 200) return sst - 0.5 - ((d - 50) * 0.11); // Thermocline drop
      if (d <= 1000) return 12.0 - ((d - 200) * 0.009); // Intermediate
      return 4.8 - ((d - 1000) * 0.002); // Deep water
    });
    label = 'Temperature (°C)';
    borderColor = '#ff7b00';
  } else if (varType === 'salinity') {
    const sss = inst.sss || 35.5;
    values = depths.map(d => {
      if (d <= 50) return sss;
      if (d <= 250) return sss + (sss < 34 ? 2.5 : 0.8) * Math.sin((d / 250) * Math.PI); // Subsurface Salinity Max
      return 34.8;
    });
    label = 'Salinity (PSU)';
    borderColor = '#a855f7';
    unit = 'PSU';
  } else if (varType === 'density') {
    values = depths.map(d => 22.0 + (d * 0.0035) + (d > 100 ? 1.5 : 0.2));
    label = 'Potential Density σ-θ (kg/m³)';
    borderColor = '#10b981';
    unit = 'kg/m³';
  }

  if (profileChart) {
    profileChart.destroy();
  }

  profileChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: depths,
      datasets: [{
        label: label,
        data: values,
        borderColor: borderColor,
        backgroundColor: 'rgba(0, 242, 254, 0.08)',
        borderWidth: 2.2,
        tension: 0.35,
        fill: true,
        pointRadius: 2.5,
        pointHoverRadius: 5
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { intersect: false, mode: 'index' },
      scales: {
        x: {
          title: { display: true, text: 'Depth (meters)', color: '#94a3b8', font: { size: 10 } },
          ticks: { color: '#64748b', font: { size: 9 } },
          grid: { color: 'rgba(255, 255, 255, 0.05)' }
        },
        y: {
          title: { display: true, text: label, color: '#94a3b8', font: { size: 10 } },
          ticks: { color: '#64748b', font: { size: 9 } },
          grid: { color: 'rgba(255, 255, 255, 0.05)' }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => `Depth: ${ctx.label}m | ${ctx.parsed.y.toFixed(2)} ${unit}`
          }
        }
      }
    }
  });
}

// Animation Loop
function animate() {
  requestAnimationFrame(animate);

  // Rotate streamlines & particles
  if (particlesMesh && particlesMesh.userData && state.layers.streamlines) {
    const positions = particlesMesh.geometry.attributes.position.array;
    const vels = particlesMesh.userData.velocities;
    const r = particlesMesh.userData.radius;

    for (let i = 0; i < vels.length; i++) {
      const v = vels[i];
      v.lon += v.deltaLon * 0.15 * state.playbackSpeed;
      if (v.lon > 105) v.lon = 50;

      const newPos = latLonToVector3(v.lat, v.lon, r);
      positions[i * 3] = newPos.x;
      positions[i * 3 + 1] = newPos.y;
      positions[i * 3 + 2] = newPos.z;
    }
    particlesMesh.geometry.attributes.position.needsUpdate = true;
  }

  // Subtle globe rotation if idle
  if (!controls.state || controls.state === -1) {
    // idle
  }

  controls.update();
  renderer.render(scene, camera);
}

// UI Event Listeners and Setup
function setupUIEventListeners() {
  // Variable Buttons
  document.querySelectorAll('.var-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.var-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const v = btn.dataset.var;
      state.currentVar = v;
      updateVariableDisplay(v);
    });
  });

  // Depth Slider
  const depthSlider = document.getElementById('depthSlider');
  const depthBadge = document.getElementById('depthValueBadge');
  depthSlider.addEventListener('input', (e) => {
    const d = parseInt(e.target.value);
    state.depth = d;
    depthBadge.textContent = d === 0 ? '0 m (Surface)' : `${d} m Depth`;
    // Update ocean volumetric shell radius & opacity
    if (oceanVolMesh) {
      const scale = 1.0 - (d / 2000) * 0.08 * (state.verticalExaggeration / 4);
      oceanVolMesh.scale.set(scale, scale, scale);
      oceanVolMesh.material.opacity = 0.2 + (d / 2000) * 0.4;
    }
  });

  // Vertical Exaggeration Slider
  const exaggSlider = document.getElementById('exaggerationSlider');
  const exaggValue = document.getElementById('exaggerationValue');
  exaggSlider.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    state.verticalExaggeration = val;
    exaggValue.textContent = `${val.toFixed(1)}x`;
  });

  // Layer Checkboxes
  document.getElementById('toggleArgo').addEventListener('change', (e) => {
    state.layers.argo = e.target.checked;
    renderInstrumentMarkers();
  });
  document.getElementById('toggleGliders').addEventListener('change', (e) => {
    state.layers.gliders = e.target.checked;
    renderInstrumentMarkers();
  });
  document.getElementById('toggleMoorings').addEventListener('change', (e) => {
    state.layers.moorings = e.target.checked;
    renderInstrumentMarkers();
  });
  document.getElementById('toggleStreamlines').addEventListener('change', (e) => {
    state.layers.streamlines = e.target.checked;
    particlesMesh.visible = e.target.checked;
  });
  document.getElementById('toggleIsosurface').addEventListener('change', (e) => {
    state.layers.isosurface = e.target.checked;
    oceanVolMesh.visible = e.target.checked;
  });

  // Advisory Chips
  document.getElementById('chipPFZ').addEventListener('click', function() {
    this.classList.toggle('active');
    state.layers.pfz = this.classList.contains('active');
    updateAdvisories();
  });
  document.getElementById('chipHighWave').addEventListener('click', function() {
    this.classList.toggle('active');
    state.layers.highWave = this.classList.contains('active');
    updateAdvisories();
  });
  document.getElementById('chipCyclone').addEventListener('click', function() {
    this.classList.toggle('active');
    state.layers.cyclone = this.classList.contains('active');
    updateAdvisories();
  });
  document.getElementById('chipSAR').addEventListener('click', function() {
    this.classList.toggle('active');
    state.layers.sar = this.classList.contains('active');
    updateAdvisories();
  });

  // Color Palette Selector
  document.getElementById('colorPaletteSelect').addEventListener('change', (e) => {
    state.palette = e.target.value;
    updateColorbar();
    refreshGlobeTexture();
  });

  // Preset Region Buttons
  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      flyToPreset(btn.dataset.preset);
    });
  });

  // Timeline & Playback
  const btnPlay = document.getElementById('btnPlayPause');
  const playIcon = document.getElementById('playIcon');
  let playInterval = null;

  btnPlay.addEventListener('click', () => {
    state.isPlaying = !state.isPlaying;
    if (state.isPlaying) {
      playIcon.setAttribute('data-lucide', 'pause');
      lucide.createIcons();
      playInterval = setInterval(advanceTimeStep, 1000 / state.playbackSpeed);
    } else {
      playIcon.setAttribute('data-lucide', 'play');
      lucide.createIcons();
      clearInterval(playInterval);
    }
  });

  document.getElementById('btnStepForward').addEventListener('click', advanceTimeStep);
  document.getElementById('btnStepBack').addEventListener('click', () => {
    const slider = document.getElementById('timelineSlider');
    slider.value = Math.max(0, parseInt(slider.value) - 1);
    updateTimelineLabel(slider.value);
  });

  document.getElementById('timelineSlider').addEventListener('input', (e) => {
    updateTimelineLabel(e.target.value);
  });

  // Speed buttons
  document.querySelectorAll('.speed-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.playbackSpeed = parseFloat(btn.dataset.speed);
      if (state.isPlaying) {
        clearInterval(playInterval);
        playInterval = setInterval(advanceTimeStep, 1000 / state.playbackSpeed);
      }
    });
  });

  // Profile Drawer close & chart tabs
  document.getElementById('closeDrawerBtn').addEventListener('click', () => {
    document.getElementById('profileDrawer').classList.remove('open');
  });

  document.querySelectorAll('.chart-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.chart-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderProfileChart(tab.dataset.chartVar);
    });
  });

  // Download Profile Data button (simulates NetCDF/CSV export)
  document.getElementById('btnDownloadProfile').addEventListener('click', () => {
    const inst = state.selectedInstrument || IN_SITU_INSTRUMENTS[0];
    const csvContent = `data:text/csv;charset=utf-8,Depth_m,Temperature_C,Salinity_PSU,QC_Flag\n0,${inst.sst},${inst.sss},1\n50,${(inst.sst-0.2).toFixed(2)},${inst.sss},1\n100,24.1,35.2,1\n500,10.2,34.9,1\n1000,6.1,34.8,1\n2000,3.2,34.7,1`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${inst.id}_profile_data.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });

  // Fullscreen button
  document.getElementById('btnToggleFullscreen').addEventListener('click', () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  });

  // Science Tour Modal
  const scienceModal = document.getElementById('scienceModal');
  document.getElementById('btnScienceTour').addEventListener('click', () => {
    scienceModal.classList.add('open');
  });
  document.getElementById('btnCloseScience').addEventListener('click', () => {
    scienceModal.classList.remove('open');
  });

  // Science Story Launchers
  document.querySelectorAll('.story-card').forEach(card => {
    card.addEventListener('click', () => {
      scienceModal.classList.remove('open');
      const story = card.dataset.story;
      launchScienceStory(story);
    });
  });

  // Realtime Clocks
  setInterval(updateClocks, 1000);
  updateClocks();
}

function updateVariableDisplay(vKey) {
  const cfg = VARIABLE_CONFIGS[vKey];
  document.getElementById('colorbarTitle').textContent = `${cfg.name} (${cfg.unit})`;
  document.getElementById('colorMin').textContent = `${cfg.min} ${cfg.unit}`;
  document.getElementById('colorMid').textContent = `${cfg.mid} ${cfg.unit}`;
  document.getElementById('colorMax').textContent = `${cfg.max} ${cfg.unit}`;
  refreshGlobeTexture();
}

function updateColorbar() {
  const palette = COLOR_PALETTES[state.palette] || COLOR_PALETTES.thermal;
  const gradient = `linear-gradient(to right, ${palette.join(', ')})`;
  document.getElementById('colorbarGradient').style.background = gradient;
}

function refreshGlobeTexture() {
  if (earthMesh) {
    earthMesh.material.map = createEarthOceanTexture(state.currentVar, state.depth, state.palette);
    earthMesh.material.needsUpdate = true;
  }
}

function advanceTimeStep() {
  const slider = document.getElementById('timelineSlider');
  let nextVal = parseInt(slider.value) + 1;
  if (nextVal > 24) nextVal = 0;
  slider.value = nextVal;
  updateTimelineLabel(nextVal);
}

function updateTimelineLabel(stepIndex) {
  const hoursFromNow = (stepIndex - 12) * 6;
  const sign = hoursFromNow >= 0 ? '+' : '';
  const now = new Date('2026-09-30T18:00:00Z');
  now.setHours(now.getHours() + hoursFromNow);

  const dateStr = now.toISOString().replace('T', ' ').substring(0, 16);
  document.getElementById('timeStepLabel').textContent = `${dateStr} UTC (T${sign}${hoursFromNow}h)`;
  document.getElementById('hudTime').textContent = `${dateStr} UTC`;
}

function updateClocks() {
  const now = new Date();
  const utcStr = `UTC ${now.toISOString().substring(11, 19)}`;
  const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
  const istStr = `IST ${istTime.toISOString().substring(11, 19)}`;
  
  document.getElementById('utcClock').textContent = utcStr;
  document.getElementById('istClock').textContent = istStr;
}

function flyToPreset(preset) {
  if (preset === 'arabian') {
    camera.position.set(-6, 12, 30);
    controls.target.set(-2, 3, 0);
  } else if (preset === 'bob') {
    camera.position.set(12, 12, 28);
    controls.target.set(5, 3, 0);
  } else if (preset === 'eez') {
    camera.position.set(2, 10, 24);
    controls.target.set(2, 3, 0);
  } else if (preset === 'equatorial') {
    camera.position.set(4, 0, 32);
    controls.target.set(3, -1, 0);
  } else {
    // All Indian Ocean
    camera.position.set(0, 15, 38);
    controls.target.set(3, 4, 0);
  }
  controls.update();
}

function launchScienceStory(story) {
  if (story === 'monsoon') {
    flyToPreset('arabian');
    document.querySelector('[data-var="currents"]').click();
  } else if (story === 'bob_freshening') {
    flyToPreset('bob');
    document.querySelector('[data-var="sss"]').click();
  } else if (story === 'argo_network') {
    flyToPreset('eez');
    openInstrumentDrawer(IN_SITU_INSTRUMENTS[0]);
  }
}

// App Initialization
window.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();
  initThreeScene();
  setupUIEventListeners();
  updateColorbar();
  updateVariableDisplay('sst');
});
