const canvas = document.getElementById('scene-canvas');
if (canvas && window.THREE) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 100);
  camera.position.set(0, 0, 8);
  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));

  const group = new THREE.Group();
  scene.add(group);

  const geo = [
    new THREE.IcosahedronGeometry(1.2, 1),
    new THREE.TorusKnotGeometry(0.8, 0.2, 120, 16),
    new THREE.OctahedronGeometry(0.9),
  ];

  geo.forEach((g, i) => {
    const m = new THREE.MeshStandardMaterial({ color: [0x7c5cff, 0x00d4ff, 0xff4fd8][i], metalness: 0.65, roughness: 0.2, wireframe: i === 1 });
    const mesh = new THREE.Mesh(g, m);
    mesh.position.x = (i - 1) * 2.8;
    group.add(mesh);
  });

  const stars = new THREE.BufferGeometry();
  const starCount = 900;
  const pos = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount * 3; i++) pos[i] = (Math.random() - 0.5) * 50;
  stars.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const starField = new THREE.Points(stars, new THREE.PointsMaterial({ color: 0xffffff, size: 0.03 }));
  scene.add(starField);

  scene.add(new THREE.AmbientLight(0x6677ff, 0.6));
  const p1 = new THREE.PointLight(0xffffff, 1.2); p1.position.set(6, 4, 6); scene.add(p1);
  const p2 = new THREE.PointLight(0x7c5cff, 1.4); p2.position.set(-6, -2, 2); scene.add(p2);

  let mx = 0, my = 0;
  addEventListener('mousemove', (e) => {
    mx = (e.clientX / innerWidth - 0.5) * 1.8;
    my = (e.clientY / innerHeight - 0.5) * 1.8;
  });

  function animate() {
    requestAnimationFrame(animate);
    group.children.forEach((mesh, i) => {
      mesh.rotation.x += 0.005 + i * 0.002;
      mesh.rotation.y += 0.006 + i * 0.002;
    });
    group.rotation.y += (mx - group.rotation.y) * 0.03;
    group.rotation.x += (my - group.rotation.x) * 0.03;
    starField.rotation.y += 0.0008;
    renderer.render(scene, camera);
  }
  animate();

  addEventListener('resize', () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  });
}

document.querySelectorAll('.tilt').forEach((el) => {
  el.addEventListener('mousemove', (e) => {
    const r = el.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width - 0.5) * 10;
    const y = ((e.clientY - r.top) / r.height - 0.5) * -10;
    el.style.transform = `perspective(800px) rotateX(${y}deg) rotateY(${x}deg) translateY(-4px)`;
  });
  el.addEventListener('mouseleave', () => {
    el.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg)';
  });
});
