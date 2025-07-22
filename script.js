// === Basic Scene Setup ===
// Create the 3D scene where everything will be rendered
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000); // Set default background to black (space-like)

// Set up the camera: perspective view, with a good distance
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
camera.position.set(0, 150, 400); // A good height and distance for viewing the whole system

// Initialize the WebGL renderer and attach it to the page
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// OrbitControls allow mouse interactions (pan, zoom, rotate)
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Adds some smoothing to the camera movement

// === Lighting ===
// Ambient light gives base brightness to everything
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);

// Point light simulates the sun's light source
const pointLight = new THREE.PointLight(0xffffff, 2);
scene.add(ambientLight, pointLight);

// === Load Planet and Ring Textures ===
const loader = new THREE.TextureLoader();
const textures = {
  sun: loader.load('assets/textures/sun.jpg'),
  mercury: loader.load('assets/textures/mercury.jpg'),
  venus: loader.load('assets/textures/venus.jpg'),
  earth: loader.load('assets/textures/earth.jpg'),
  mars: loader.load('assets/textures/mars.jpg'),
  jupiter: loader.load('assets/textures/jupiter.jpg'),
  saturn: loader.load('assets/textures/saturn.jpg'),
  uranus: loader.load('assets/textures/uranus.jpg'),
  neptune: loader.load('assets/textures/neptune.jpg'),
  saturnRing: loader.load('assets/textures/saturnring.png')
};

// === Create the Sun ===
const sun = new THREE.Mesh(
  new THREE.SphereGeometry(20, 64, 64),
  new THREE.MeshBasicMaterial({ map: textures.sun }) // Sun emits its own light, so basic material is enough
);
scene.add(sun);

// Add a glowing sprite to simulate sun flare
const spriteMaterial = new THREE.SpriteMaterial({
  map: loader.load('https://threejs.org/examples/textures/lensflare/lensflare0.png'),
  color: 0xffff00,
  transparent: true,
  blending: THREE.AdditiveBlending
});
const sprite = new THREE.Sprite(spriteMaterial);
sprite.scale.set(100, 100, 1); // Make it large enough to be visible around the sun
sun.add(sprite);

// === Add Background Stars ===
// Just some randomly scattered white dots to give the scene depth
const stars = new THREE.Points(
  new THREE.BufferGeometry().setAttribute(
    'position',
    new THREE.Float32BufferAttribute(
      Array.from({ length: 3000 * 3 }, () => (Math.random() - 0.5) * 2000),
      3
    )
  ),
  new THREE.PointsMaterial({ color: 0xffffff })
);
scene.add(stars);

// === UI Element References ===
const tooltip = document.getElementById("tooltip");
const infoPanel = document.getElementById("infoPanel");
const planetNameEl = document.getElementById("planetName");
const planetInfoEl = document.getElementById("planetInfo");
const controlsDiv = document.getElementById("speedControls");

// === Planet Data ===
// Each object defines a planet's physical properties and some info text
const planetData = [
  { name: "Mercury", radius: 3, distance: 35, speed: 0.04, texture: textures.mercury, info: "Smallest planet" },
  { name: "Venus", radius: 4, distance: 50, speed: 0.015, texture: textures.venus, info: "Second planet" },
  { name: "Earth", radius: 5, distance: 70, speed: 0.01, texture: textures.earth, info: "Home planet" },
  { name: "Mars", radius: 4, distance: 90, speed: 0.008, texture: textures.mars, info: "Red planet" },
  { name: "Jupiter", radius: 10, distance: 120, speed: 0.005, texture: textures.jupiter, info: "Largest planet" },
  { name: "Saturn", radius: 9, distance: 150, speed: 0.004, texture: textures.saturn, info: "Has rings" },
  { name: "Uranus", radius: 7, distance: 180, speed: 0.002, texture: textures.uranus, info: "Tilted axis" },
  { name: "Neptune", radius: 7, distance: 210, speed: 0.001, texture: textures.neptune, info: "Farthest planet" }
];

const planets = [];
const planetLabels = [];
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// === Create and Place Each Planet ===
planetData.forEach(data => {
  // Planet geometry and texture
  const planet = new THREE.Mesh(
    new THREE.SphereGeometry(data.radius, 32, 32),
    new THREE.MeshStandardMaterial({ map: data.texture })
  );

  // Random initial orbit angle
  planet.userData = { ...data, angle: Math.random() * Math.PI * 2 };
  scene.add(planet);
  planets.push(planet);

  // Draw a faint ring to represent the orbit path
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(data.distance - 0.2, data.distance + 0.2, 64),
    new THREE.MeshBasicMaterial({ color: 0x888888, side: THREE.DoubleSide })
  );
  ring.rotation.x = Math.PI / 2;
  scene.add(ring);

  // If it's Saturn, add a rotating ring around the planet
  if (data.name === "Saturn") {
    const satRing = new THREE.Mesh(
      new THREE.RingGeometry(data.radius + 2, data.radius + 5, 64),
      new THREE.MeshBasicMaterial({
        map: textures.saturnRing,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.7,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      })
    );
    satRing.rotation.x = Math.PI / 2;
    planet.add(satRing);
    planet.userData.saturnRing = satRing; // Save ref for later rotation
  }

  // Floating text label for each planet
  const labelDiv = document.createElement("div");
  labelDiv.className = "label3d";
  labelDiv.textContent = data.name;
  labelDiv.style.position = "absolute";
  document.body.appendChild(labelDiv);
  planetLabels.push({ mesh: planet, label: labelDiv });

  // Add speed control sliders to UI
  const label = document.createElement("label");
  label.textContent = data.name;
  const slider = document.createElement("input");
  slider.type = "range";
  slider.min = 0;
  slider.max = 0.1;
  slider.step = 0.001;
  slider.value = data.speed;
  slider.addEventListener("input", () => {
    planet.userData.speed = parseFloat(slider.value);
  });
  controlsDiv.appendChild(label);
  controlsDiv.appendChild(slider);
});

// === UI Button Logic ===
let isPaused = false;
document.getElementById("toggleAnimation").onclick = () => {
  isPaused = !isPaused;
  document.getElementById("toggleAnimation").textContent = isPaused ? "▶ Resume" : "⏸ Pause";
};

// Toggle between dark and light themes
let dark = true;
document.getElementById("toggleTheme").onclick = () => {
  dark = !dark;
  scene.background.set(dark ? 0x000000 : 0xffffff);
  document.body.style.backgroundColor = dark ? "#000" : "#fff";
  document.body.style.color = dark ? "#fff" : "#000";
};

// Collapse the side panel for better viewing on mobile
document.getElementById("togglePanel").onclick = () => {
  document.getElementById("controls").classList.toggle("hidden");
};

// === Animation Loop ===
// Called ~60 times per second
function animate() {
  requestAnimationFrame(animate);
  controls.update(); // Required for smooth OrbitControls

  if (!isPaused) {
    // Update planet position in orbit
    planets.forEach(p => {
      p.userData.angle += p.userData.speed;
      p.position.x = Math.cos(p.userData.angle) * p.userData.distance;
      p.position.z = Math.sin(p.userData.angle) * p.userData.distance;
      p.rotation.y += 0.01; // spin the planet itself

      // Slight ring rotation for Saturn
      if (p.userData.name === "Saturn" && p.userData.saturnRing) {
        p.userData.saturnRing.rotation.z += 0.002;
      }
    });
  }

  // Reposition labels above each planet
  planetLabels.forEach(({ mesh, label }) => {
    const pos = mesh.position.clone();
    pos.project(camera); // convert 3D to screen space
    const x = (pos.x * 0.5 + 0.5) * window.innerWidth;
    const y = (-pos.y * 0.5 + 0.5) * window.innerHeight;
    label.style.left = `${x}px`;
    label.style.top = `${y}px`;
  });

  renderer.render(scene, camera);
}
animate();

// === Hover Tooltip ===
window.addEventListener("mousemove", (e) => {
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const hits = raycaster.intersectObjects([sun, ...planets]);
  if (hits.length > 0) {
    const obj = hits[0].object;
    tooltip.style.display = "block";
    tooltip.style.left = `${e.clientX + 10}px`;
    tooltip.style.top = `${e.clientY + 10}px`;
    tooltip.textContent = obj.userData?.name || "Sun";
  } else {
    tooltip.style.display = "none";
  }
});

// === Click to Zoom on Planet ===
window.addEventListener("click", () => {
  raycaster.setFromCamera(mouse, camera);
  const hits = raycaster.intersectObjects([sun, ...planets]);
  if (hits.length > 0) {
    const obj = hits[0].object;
    const isSun = obj === sun;

    planetNameEl.textContent = isSun ? "Sun" : obj.userData.name;
    planetInfoEl.textContent = isSun
      ? "The Sun is the star at the center of our solar system."
      : obj.userData.info;

    const target = isSun ? sun.position : obj.getWorldPosition(new THREE.Vector3());

    // Smooth camera movement using GSAP
    gsap.to(camera.position, {
      duration: 2,
      x: target.x + 50,
      y: target.y + 30,
      z: target.z + 50
    });
    gsap.to(controls.target, {
      duration: 2,
      x: target.x,
      y: target.y,
      z: target.z
    });
  }
});

// === Handle Window Resize ===
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
