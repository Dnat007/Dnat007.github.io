/* ─── Three.js 3D Scene ─────────────────────────────────────────────────── */
const canvas = document.getElementById('scene-canvas');
if (canvas && window.THREE) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 200);
  camera.position.set(0, 0, 10);

  /* ── Lights ── */
  scene.add(new THREE.AmbientLight(0x4455ff, 0.5));
  const sun = new THREE.DirectionalLight(0xffffff, 1.4);
  sun.position.set(8, 6, 8);
  scene.add(sun);
  const accent1 = new THREE.PointLight(0x7c5cff, 3, 30); accent1.position.set(-5, 3, 4); scene.add(accent1);
  const accent2 = new THREE.PointLight(0x00d4ff, 3, 30); accent2.position.set(5, -3, 4);  scene.add(accent2);
  const accent3 = new THREE.PointLight(0xff4fd8, 2, 25); accent3.position.set(0, 5, -4);  scene.add(accent3);

  /* ── Mouse light that follows cursor ── */
  const mouseLamp = new THREE.PointLight(0xffffff, 1.8, 20);
  scene.add(mouseLamp);

  /* ── Hero geometry group ── */
  const heroGroup = new THREE.Group();
  scene.add(heroGroup);

  const geoConfigs = [
    { geo: new THREE.IcosahedronGeometry(1.3, 4),        color: 0x7c5cff, metal: 0.9, rough: 0.1, wire: false, x: -2.8 },
    { geo: new THREE.TorusKnotGeometry(0.85, 0.22, 180, 20), color: 0x00d4ff, metal: 0.7, rough: 0.15, wire: true,  x:  0   },
    { geo: new THREE.OctahedronGeometry(1.0, 2),         color: 0xff4fd8, metal: 0.85, rough: 0.12, wire: false, x:  2.8 },
  ];

  geoConfigs.forEach(({ geo, color, metal, rough, wire, x }) => {
    const mat = new THREE.MeshStandardMaterial({ color, metalness: metal, roughness: rough, wireframe: wire });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.x = x;
    heroGroup.add(mesh);
  });

  /* ── Outer orbiting rings ── */
  const ringGroup = new THREE.Group();
  scene.add(ringGroup);
  [[3.5, 0.06, 0x7c5cff, 0], [4.5, 0.05, 0x00d4ff, Math.PI / 3], [5.5, 0.04, 0xff4fd8, Math.PI / 1.5]].forEach(
    ([r, t, color, tilt]) => {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(r, t, 16, 120),
        new THREE.MeshStandardMaterial({ color, metalness: 1, roughness: 0.1, transparent: true, opacity: 0.55 })
      );
      ring.rotation.x = Math.PI / 2 + tilt;
      ringGroup.add(ring);
    }
  );

  /* ── Galaxy particle system ── */
  const isMobile = /Mobi|Android/i.test(navigator.userAgent) || innerWidth < 768;
  const PARTICLE_COUNT = isMobile ? 900 : 2800;
  const galaxyBuf = new THREE.BufferGeometry();
  const gPos   = new Float32Array(PARTICLE_COUNT * 3);
  const gColor = new Float32Array(PARTICLE_COUNT * 3);
  const palette = [[0.48, 0.36, 1.0], [0.0, 0.83, 1.0], [1.0, 0.31, 0.85], [1.0, 1.0, 1.0]];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const arm   = (i % 3) * ((2 * Math.PI) / 3);
    const dist  = 4 + Math.random() * 22;
    const spin  = dist * 0.4;
    const angle = arm + spin;
    const spread = (Math.random() - 0.5) * (dist * 0.28);
    gPos[i * 3]     = Math.cos(angle) * dist + spread;
    gPos[i * 3 + 1] = (Math.random() - 0.5) * 3.5;
    gPos[i * 3 + 2] = Math.sin(angle) * dist + spread;
    const c = palette[Math.floor(Math.random() * palette.length)];
    gColor[i * 3]     = c[0]; gColor[i * 3 + 1] = c[1]; gColor[i * 3 + 2] = c[2];
  }
  galaxyBuf.setAttribute('position', new THREE.BufferAttribute(gPos, 3));
  galaxyBuf.setAttribute('color',    new THREE.BufferAttribute(gColor, 3));
  const galaxyMat = new THREE.PointsMaterial({ size: 0.055, vertexColors: true, transparent: true, opacity: 0.82, sizeAttenuation: true });
  const galaxy = new THREE.Points(galaxyBuf, galaxyMat);
  scene.add(galaxy);

  /* ── Foreground sparkle particles ── */
  const SPARK_COUNT = 350;
  const sparkBuf = new THREE.BufferGeometry();
  const sPos = new Float32Array(SPARK_COUNT * 3);
  for (let i = 0; i < SPARK_COUNT * 3; i++) sPos[i] = (Math.random() - 0.5) * 14;
  sparkBuf.setAttribute('position', new THREE.BufferAttribute(sPos, 3));
  const sparks = new THREE.Points(sparkBuf, new THREE.PointsMaterial({ color: 0xffffff, size: 0.045, transparent: true, opacity: 0.75 }));
  scene.add(sparks);

  /* ── Floating mini-gems scattered around ── */
  const gemGroup = new THREE.Group();
  scene.add(gemGroup);
  const gemGeos = [new THREE.TetrahedronGeometry(0.18), new THREE.OctahedronGeometry(0.18), new THREE.IcosahedronGeometry(0.14, 0)];
  const gemColors = [0x7c5cff, 0x00d4ff, 0xff4fd8, 0xffd700, 0x00ff99];
  for (let i = 0; i < 28; i++) {
    const geo = gemGeos[i % gemGeos.length];
    const mat = new THREE.MeshStandardMaterial({ color: gemColors[i % gemColors.length], metalness: 0.9, roughness: 0.05, transparent: true, opacity: 0.85 });
    const gem = new THREE.Mesh(geo, mat);
    gem.position.set((Math.random() - 0.5) * 16, (Math.random() - 0.5) * 10, (Math.random() - 0.5) * 6 - 3);
    gem.userData.floatOffset = Math.random() * Math.PI * 2;
    gem.userData.floatSpeed  = 0.4 + Math.random() * 0.6;
    gemGroup.add(gem);
  }

  /* ── Mouse tracking ── */
  let mx = 0, my = 0, targetMx = 0, targetMy = 0;
  addEventListener('mousemove', (e) => {
    targetMx = (e.clientX / innerWidth  - 0.5) * 2.2;
    targetMy = (e.clientY / innerHeight - 0.5) * 2.2;
    const ndcX = (e.clientX / innerWidth)  * 2 - 1;
    const ndcY = -(e.clientY / innerHeight) * 2 + 1;
    mouseLamp.position.set(ndcX * 7, ndcY * 5, 5);
  });

  /* ── Animation loop ── */
  let clock = 0;
  function animate() {
    requestAnimationFrame(animate);
    clock += 0.01;
    mx += (targetMx - mx) * 0.05;
    my += (targetMy - my) * 0.05;

    heroGroup.children.forEach((mesh, i) => {
      mesh.rotation.x += 0.004 + i * 0.0015;
      mesh.rotation.y += 0.005 + i * 0.002;
      mesh.position.y  = Math.sin(clock * (0.5 + i * 0.2) + i) * 0.25;
    });
    heroGroup.rotation.y += (mx - heroGroup.rotation.y) * 0.04;
    heroGroup.rotation.x += (my - heroGroup.rotation.x) * 0.04;

    ringGroup.rotation.y  = clock * 0.18;
    ringGroup.rotation.x  = clock * 0.09;
    ringGroup.rotation.y += (mx * 0.4 - ringGroup.rotation.y) * 0.01;

    galaxy.rotation.y += 0.0006;
    sparks.rotation.y  += 0.0015;
    sparks.rotation.x  += 0.0008;

    gemGroup.children.forEach((gem, i) => {
      gem.rotation.x += 0.012 + i * 0.001;
      gem.rotation.y += 0.014 + i * 0.001;
      gem.position.y += Math.sin(clock * gem.userData.floatSpeed + gem.userData.floatOffset) * 0.003;
    });

    /* Pulse accent lights */
    accent1.intensity = 2.5 + Math.sin(clock * 1.1) * 1.2;
    accent2.intensity = 2.5 + Math.sin(clock * 0.9 + 1) * 1.2;
    accent3.intensity = 1.8 + Math.sin(clock * 1.3 + 2) * 0.9;

    renderer.render(scene, camera);
  }
  animate();

  addEventListener('resize', () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  });
}

/* ─── CSS 3D tilt on hover ───────────────────────────────────────────────── */
document.querySelectorAll('.tilt').forEach((el) => {
  el.addEventListener('mousemove', (e) => {
    const r = el.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width  - 0.5) * 18;
    const y = ((e.clientY - r.top)  / r.height - 0.5) * -18;
    el.style.transform = `perspective(900px) rotateX(${y}deg) rotateY(${x}deg) translateZ(12px) scale(1.03)`;
  });
  el.addEventListener('mouseleave', () => {
    el.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) translateZ(0px) scale(1)';
  });
});

/* ─── Scroll entrance animations ────────────────────────────────────────── */
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

/* ─── Animated counter for stat numbers ─────────────────────────────────── */
document.querySelectorAll('[data-count]').forEach((el) => {
  const target = parseFloat(el.dataset.count);
  const suffix = el.dataset.suffix || '';
  const finalText = (target % 1 === 0 ? target : target.toFixed(1)) + suffix;
  el.setAttribute('aria-label', finalText);
  const duration = 1800;
  let start = null;
  const step = (ts) => {
    if (!start) start = ts;
    const progress = Math.min((ts - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = (target % 1 === 0 ? Math.floor(eased * target) : (eased * target).toFixed(1)) + suffix;
    if (progress < 1) requestAnimationFrame(step);
    else el.setAttribute('aria-label', finalText);
  };
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { requestAnimationFrame(step); io.unobserve(e.target); } });
  }, { threshold: 0.5 });
  io.observe(el);
});
