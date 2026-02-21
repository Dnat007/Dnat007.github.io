const canvas = document.getElementById('scene-canvas');

if (canvas && window.THREE) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 120);
  camera.position.set(0, 0.8, 10);

  const root = new THREE.Group();
  scene.add(root);

  const objects = [];
  const makeMesh = (geometry, color, x, y, z, wireframe = false) => {
    const mat = new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.08,
      roughness: 0.2,
      metalness: 0.65,
      wireframe,
    });
    const mesh = new THREE.Mesh(geometry, mat);
    mesh.position.set(x, y, z);
    root.add(mesh);
    objects.push(mesh);
  };

  makeMesh(new THREE.TorusKnotGeometry(1, 0.27, 180, 18), 0x8b5cf6, -3.5, 1.3, -1, false);
  makeMesh(new THREE.IcosahedronGeometry(1.25, 1), 0x22d3ee, 0, -0.2, 0, false);
  makeMesh(new THREE.OctahedronGeometry(1), 0x60a5fa, 3.2, 1.1, -1.2, false);
  makeMesh(new THREE.SphereGeometry(0.65, 24, 24), 0xf472b6, -1.2, -1.7, 1.5, true);
  makeMesh(new THREE.TorusGeometry(1.3, 0.12, 12, 80), 0x34d399, 2.5, -1.9, 1.6, true);

  const starsGeometry = new THREE.BufferGeometry();
  const starCount = 1800;
  const positions = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 100;
    positions[i + 1] = (Math.random() - 0.5) * 80;
    positions[i + 2] = (Math.random() - 0.5) * 100;
  }
  starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const stars = new THREE.Points(starsGeometry, new THREE.PointsMaterial({ color: 0xffffff, size: 0.045 }));
  scene.add(stars);

  scene.add(new THREE.AmbientLight(0x8aa2ff, 0.6));
  const key = new THREE.PointLight(0xffffff, 1.1);
  key.position.set(6, 7, 7);
  const fill = new THREE.PointLight(0x22d3ee, 1.4);
  fill.position.set(-8, -3, 5);
  const rim = new THREE.PointLight(0x8b5cf6, 1.3);
  rim.position.set(0, 3, -7);
  scene.add(key, fill, rim);

  let mouseX = 0;
  let mouseY = 0;
  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 1.8;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 1.8;
  });

  window.addEventListener('scroll', () => {
    const scroll = window.scrollY || 0;
    camera.position.y = 0.8 - scroll * 0.0012;
    root.rotation.z = scroll * 0.0005;
  });

  const clock = new THREE.Clock();
  function render() {
    const t = clock.getElapsedTime();
    requestAnimationFrame(render);

    objects.forEach((m, idx) => {
      m.rotation.x += 0.003 + idx * 0.0007;
      m.rotation.y += 0.004 + idx * 0.0008;
      m.position.y += Math.sin(t * 0.8 + idx) * 0.0018;
    });

    root.rotation.y += (mouseX - root.rotation.y) * 0.04;
    root.rotation.x += (mouseY * 0.4 - root.rotation.x) * 0.04;
    stars.rotation.y += 0.00045;
    stars.rotation.x = Math.sin(t * 0.15) * 0.05;

    renderer.render(scene, camera);
  }
  render();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

// 3D tilt for UI cards
for (const card of document.querySelectorAll('.tilt')) {
  card.addEventListener('mousemove', (e) => {
    const r = card.getBoundingClientRect();
    const rx = ((e.clientY - r.top) / r.height - 0.5) * -13;
    const ry = ((e.clientX - r.left) / r.width - 0.5) * 13;
    card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-6px)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0)';
  });
}
