# 3D Solar System Simulation – Frontend Developer Assignment

This project is an interactive 3D simulation of the solar system built using Three.js. It showcases realistic planetary orbits, lighting, and responsive user controls. The project was developed using pure JavaScript without any CSS animations and is fully responsive across modern browsers and devices.

---

## Deployed Project

Demo_video:https://drive.google.com/file/d/1L-pBW1d3CvRcOQAub9YTs5RRCLWI2wJ_/view?usp=drive_link

Live Website: [https://solar-system-rakshitha.netlify.app](https://solar-system-rakshitha.netlify.app)

---

## Project Structure

```
solar-system/
├── index.html
├── style.css
├── script.js
├── README.md
├── assets/
│   ├── sun.jpg
│   ├── mercury.jpg
│   ├── venus.jpg
│   ├── earth.jpg
│   ├── mars.jpg
│   ├── jupiter.jpg
│   ├── saturn.jpg
│   ├── uranus.jpg
│   ├── neptune.jpg
│   └── stars-bg.jpg
```

---

## How to Run the Project

1. Download or clone the repository and ensure the following files are in the same folder:
   - `index.html`
   - `style.css`
   - `script.js`
   - `assets/` folder (containing all planet textures and star background)

2. Open the project:
   - Simply double-click `index.html` to launch in any modern browser (Chrome, Edge, Firefox, etc.)

3. Optional (recommended for consistent asset loading):
   - Run a local server in the folder using:

     ```
     npx http-server .
     ```

   - Visit `http://localhost:8080` in your browser

---

## Control Panel Features

- Speed sliders to control orbital speed of each planet in real time
- Pause and resume button for toggling animation
- Light and dark theme toggle
- Camera zoom and focus on planet click
- Mobile-responsive user interface

---

## Technical Details

- The scene is created and rendered using Three.js, leveraging `Scene`, `PerspectiveCamera`, `WebGLRenderer`, and `PointLight`.
- Each planet is represented by a textured `SphereGeometry` with accurate orbital and axial rotation logic.
- A `THREE.Clock` instance is used to calculate delta time for smooth animation control.
- Orbital animation is achieved via custom JavaScript functions tied into the `requestAnimationFrame` loop.
- UI controls are built using HTML + plain JavaScript, with updates bound directly to the animation logic.
- Camera interactivity allows users to explore the system through orbit and zoom, with auto-focus on click.

---

## Developed By

Rakshitha  
Frontend Developer Enthusiast  
GitHub: [https://github.com/rakshishetty-2004](https://github.com/rakshishetty-2004)
