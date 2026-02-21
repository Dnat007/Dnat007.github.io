# 3D Portfolio Website (Static)

This repository is now a **pure static website** (no Flask/backend required).

## Structure

```text
.
├── index.html
├── project.html
├── secondpage.html
├── form.html
├── result.html
├── brainprediction.html
├── assets
│   ├── css/main.css
│   └── js/main.js
└── static/images
```

## Run locally

Use any static server:

```bash
python -m http.server 8080
```

Open `http://localhost:8080`.

## 3D features

- WebGL starfield + multiple rotating 3D meshes (Three.js)
- Mouse-reactive camera/object motion
- Card tilt/parallax interactions across sections
- Glassmorphism + animated motion-rich UI
