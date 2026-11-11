/* <prismatic-discs> — escena three.js de discos prismáticos.
   Todo lo editable vive en CONFIG. Requiere THREE global (UMD) cargado antes. */

(function () {
  const CONFIG = {
    // cada disco: r = radio, t = grosor relativo, pos [x,y,z], tilt [x,y,z] en grados,
    // spin = vel. de rotación propia, float = amplitud de flotación, ring = true -> anillo
    discs: [
      { r: 1.55, t: 0.055, pos: [ 0.10,  0.05, -0.6], tilt: [ 72,  14, -16], spin: 0.055, float: 0.16, ring: false, nm: [180, 820] },
      { r: 1.05, t: 0.075, pos: [ 2.95, -0.95, -1.4], tilt: [ 34, -26,  28], spin: -0.08, float: 0.22, ring: false, nm: [140, 640] },
      { r: 0.78, t: 0.10,  pos: [-3.05, -1.05, 0.5],  tilt: [ 26,  38,  14], spin: 0.11,  float: 0.26, ring: false, nm: [220, 900] },
      { r: 1.30, t: 0.05,  pos: [-2.55,  1.55, -2.2], tilt: [ 58, -18, -38], spin: 0.045, float: 0.18, ring: true,  nm: [160, 760] },
      { r: 0.48, t: 0.14,  pos: [ 1.70,  1.75, 0.8],  tilt: [ 18,  22,  44], spin: -0.14, float: 0.32, ring: false, nm: [120, 560] },
      { r: 0.92, t: 0.06,  pos: [ 3.35,  1.35, -2.8], tilt: [ 44,  30, -12], spin: 0.07,  float: 0.20, ring: true,  nm: [200, 880] },
      { r: 0.36, t: 0.18,  pos: [-1.25, -1.85, 1.1],  tilt: [ 30, -34,  24], spin: 0.17,  float: 0.38, ring: false, nm: [150, 700] }
    ],
    base: 0x0a090e,          // color base del metal (casi negro)
    roughness: 0.09,
    iridescence: 1.0,
    iridescenceIOR: 1.55,
    thickness: [140, 780],   // rango de espesor de la capa iridiscente (nm)
    // luces/env: los colores que se ven en los reflejos
    palette: ['#D4559E', '#9B6BD8', '#5E7BF0', '#E7C27D', '#E0473C'],
    speed: 1.0,              // multiplicador global de velocidad
    cursor: 0.20,            // fuerza de la reacción al cursor (rad)
    camera: { z: 9.6, fov: 36 },
    entrance: { duration: 1200, stagger: 120 }
  };

  // una composición distinta por etapa del recorrido (atributo variant="0..4")
  const VARIANTS = [
    { tint: 0x241722, exposure: 1.35, zoom: 0.58, discs: [
      { r: 1.05, t: 0.10,  pos: [-1.10,  0.10, 0.0],  tilt: [ 32,  14, -16], spin: 0.06,  float: 0.20, ring: false, nm: [180, 820] },
      { r: 0.62, t: 0.15,  pos: [ 1.15, -0.85, -0.8], tilt: [ 28,  34,  18], spin: 0.12,  float: 0.28, ring: false, nm: [140, 600] }
    ]},
    { tint: 0x281829, exposure: 1.38, zoom: 0.62, discs: [
      { r: 1.15, t: 0.095, pos: [-1.30,  0.25, 0.2],  tilt: [ 38, -18,  22], spin: -0.07, float: 0.18, ring: false, nm: [200, 880] },
      { r: 0.90, t: 0.055, pos: [ 1.05, -0.45, -1.2], tilt: [ 58,  24, -26], spin: 0.09,  float: 0.24, ring: true,  nm: [160, 720] },
      { r: 0.42, t: 0.16,  pos: [ 0.05,  1.20, 0.6],  tilt: [ 22, -30,  36], spin: 0.15,  float: 0.34, ring: false, nm: [120, 560] }
    ]},
    { tint: 0x1F1830, exposure: 1.40, zoom: 0.66, discs: [
      { r: 1.00, t: 0.085, pos: [-1.35,  0.35, 0.0],  tilt: [ 30,  16, -20], spin: 0.055, float: 0.18, ring: false, nm: [220, 900] },
      { r: 0.78, t: 0.05,  pos: [ 1.25, -0.60, -1.0], tilt: [ 48, -22,  28], spin: -0.09, float: 0.26, ring: true,  nm: [180, 780] },
      { r: 0.58, t: 0.09,  pos: [ 0.30,  1.05, -0.6], tilt: [ 36,  30,  14], spin: 0.11,  float: 0.30, ring: false, nm: [150, 680] },
      { r: 0.40, t: 0.14,  pos: [-0.05, -1.30, 0.9],  tilt: [ 26, -34,  40], spin: 0.16,  float: 0.36, ring: false, nm: [130, 600] }
    ]},
    { tint: 0x191834, exposure: 1.38, zoom: 0.60, discs: [
      { r: 1.20, t: 0.055, pos: [-1.20,  0.05, -0.4], tilt: [ 50, -14, -30], spin: 0.04,  float: 0.16, ring: true,  nm: [160, 760] },
      { r: 0.66, t: 0.11,  pos: [ 0.95,  0.85, -1.4], tilt: [ 34,  26,  20], spin: 0.10,  float: 0.28, ring: false, nm: [200, 860] }
    ]},
    { tint: 0x151C3A, exposure: 1.42, zoom: 0.64, discs: [
      { r: 1.10, t: 0.075, pos: [-1.25,  0.15, 0.0],  tilt: [ 42,  18, -18], spin: 0.05,  float: 0.16, ring: false, nm: [140, 640] },
      { r: 0.85, t: 0.055, pos: [ 0.95, -0.80, -1.2], tilt: [ 38, -24,  30], spin: -0.08, float: 0.24, ring: true,  nm: [180, 800] },
      { r: 0.34, t: 0.18,  pos: [ 0.20,  1.40, 0.7],  tilt: [ 20,  28,  44], spin: 0.18,  float: 0.38, ring: false, nm: [240, 940] }
    ]}
  ];

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);

  function envTexture(THREE, renderer) {
    const c = document.createElement('canvas');
    c.width = 1024; c.height = 512;
    const g = c.getContext('2d');
    g.fillStyle = '#07070a'; g.fillRect(0, 0, 1024, 512);
    // bandas de color suaves -> reflejos prismáticos
    const blobs = [
      [170, 150, 300, CONFIG.palette[0], 0.9],
      [430, 110, 260, CONFIG.palette[1], 0.85],
      [700, 180, 300, CONFIG.palette[2], 0.9],
      [900, 330, 240, CONFIG.palette[3], 0.7],
      [300, 400, 260, CONFIG.palette[4], 0.5],
      [560, 420, 220, CONFIG.palette[1], 0.6]
    ];
    blobs.forEach(([x, y, r, col, a]) => {
      const rg = g.createRadialGradient(x, y, 0, x, y, r);
      rg.addColorStop(0, col); rg.addColorStop(1, 'rgba(7,7,10,0)');
      g.globalAlpha = Math.min(1, a * 1.25); g.fillStyle = rg; g.beginPath(); g.arc(x, y, r, 0, 6.2832); g.fill();
    });
    // destellos especulares blancos: dan el borde brillante de los discos
    g.globalAlpha = 1;
    [[120, 60, 240, 30], [620, 64, 330, 22], [850, 200, 180, 38], [340, 250, 280, 14]].forEach(([x, y, w, h]) => {
      const lg = g.createLinearGradient(x, y, x + w, y + h);
      lg.addColorStop(0, 'rgba(255,255,255,0)');
      lg.addColorStop(0.5, 'rgba(255,255,255,0.72)');
      lg.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = lg; g.fillRect(x, y, w, h);
    });
    const tex = new THREE.CanvasTexture(c);
    tex.mapping = THREE.EquirectangularReflectionMapping;
    const pmrem = new THREE.PMREMGenerator(renderer);
    const rt = pmrem.fromEquirectangular(tex);
    tex.dispose(); pmrem.dispose();
    return rt.texture;
  }

  class PrismaticDiscs extends HTMLElement {
    static get observedAttributes() { return ['variant']; }
    attributeChangedCallback() { if (this._build) this._build(); }
    connectedCallback() {
      if (this._started) return;
      this._started = true;
      this.style.display = 'block';
      this.style.position = this.style.position || 'absolute';
      if (!this.style.width) { this.style.left = '0'; this.style.top = '0'; this.style.width = '100%'; this.style.height = '100%'; }
      this.style.pointerEvents = 'none';
      const wait = () => {
        if (window.THREE) this.init(window.THREE);
        else setTimeout(wait, 60);
      };
      wait();
    }

    init(THREE) {
      const host = this;
      const w = () => host.clientWidth || 800;
      const h = () => host.clientHeight || 600;

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(w(), h());
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.25;
      renderer.outputEncoding = THREE.sRGBEncoding;
      renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;';
      this.appendChild(renderer.domElement);
      this._renderer = renderer;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(CONFIG.camera.fov, w() / h(), 0.1, 100);
      // el encuadre se aleja en formatos angostos (móvil) para que la composición entre entera
      this._zoom = 1;
      const fit = () => {
        const a = w() / h();
        const wide = a > 2.6 ? 0.82 : 1; // bandas anchas y bajas: acercar
        return CONFIG.camera.z * (a < 0.8 ? 1.75 : a < 1.2 ? 1.35 : a < 1.7 ? 1.12 : 1) * wide * this._zoom;
      };
      let camZ = fit();
      camera.position.set(0, 0, camZ);

      const env = envTexture(THREE, renderer);
      scene.environment = env;

      const pal = CONFIG.palette;
      const lights = [
        new THREE.PointLight(pal[0], 26, 30), new THREE.PointLight(pal[2], 22, 30),
        new THREE.PointLight(pal[3], 14, 30)
      ];
      lights[0].position.set(-4.5, 3.2, 4.5);
      lights[1].position.set(4.8, -2.4, 3.2);
      lights[2].position.set(0.5, 4.2, -3.5);
      lights.forEach(l => scene.add(l));
      scene.add(new THREE.AmbientLight(0xffffff, 0.12));

      const group = new THREE.Group();
      scene.add(group);

      const mat = () => new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(CONFIG.base),
        metalness: 1, roughness: CONFIG.roughness,
        iridescence: CONFIG.iridescence,
        iridescenceIOR: CONFIG.iridescenceIOR,
        iridescenceThicknessRange: CONFIG.thickness,
        clearcoat: 1, clearcoatRoughness: 0.08,
        envMapIntensity: 1.7
      });

      const D = Math.PI / 180;
      this._build = () => {
        (this._items || []).forEach(it => { group.remove(it.mesh); it.mesh.geometry.dispose(); it.mesh.material.dispose(); });
        const v = parseInt(this.getAttribute('variant'), 10);
        const preset = (v >= 0 && VARIANTS[v]) ? VARIANTS[v] : null;
        const list = preset ? preset.discs : CONFIG.discs;
        renderer.toneMappingExposure = preset ? preset.exposure : 1.25;
        this._zoom = preset ? (preset.zoom || 0.62) : 1;
        camZ = fit();
        camera.position.z = camZ;
        this._items = list.map((d, i) => {
          const geo = d.ring
            ? new THREE.TorusGeometry(d.r, d.r * d.t * 2.2, 28, 128)
            : new THREE.CylinderGeometry(d.r, d.r, d.r * d.t * 2, 128, 1, false);
          const mm = mat();
          if (d.nm) mm.iridescenceThicknessRange = d.nm;
          if (preset) { mm.color = new THREE.Color(preset.tint); mm.envMapIntensity = 2.4; mm.roughness = 0.07; }
          mm.transparent = true; mm.opacity = 0;
          const m = new THREE.Mesh(geo, mm);
          m.position.set(d.pos[0], d.pos[1], d.pos[2]);
          m.rotation.set(d.tilt[0] * D, d.tilt[1] * D, d.tilt[2] * D);
          group.add(m);
          return { mesh: m, cfg: d, baseY: d.pos[1], phase: i * 1.37, t0: i * CONFIG.entrance.stagger };
        });
        this._start = performance.now();
      };
      this._build();

      const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const target = { x: 0, y: 0 }, cur = { x: 0, y: 0 };

      const onMove = (cx, cy) => {
        const r = host.getBoundingClientRect();
        target.x = clamp((cx - (r.left + r.width / 2)) / (r.width / 2), -1, 1);
        target.y = clamp((cy - (r.top + r.height / 2)) / (r.height / 2), -1, 1);
      };
      this._pm = (e) => onMove(e.clientX, e.clientY);
      this._tm = (e) => { if (e.touches && e.touches[0]) onMove(e.touches[0].clientX, e.touches[0].clientY); };
      const scope = this.parentElement || window;
      scope.addEventListener('mousemove', this._pm, { passive: true });
      scope.addEventListener('touchmove', this._tm, { passive: true });
      this._scope = scope;

      let visible = true;
      if ('IntersectionObserver' in window) {
        this._io = new IntersectionObserver(es => { visible = es[0].isIntersecting; }, { threshold: 0.01 });
        this._io.observe(this);
      }

      const ro = new ResizeObserver(() => {
        renderer.setSize(w(), h());
        camZ = fit();
        camera.aspect = w() / h(); camera.updateProjectionMatrix();
      });
      ro.observe(this);
      this._ro = ro;

      const loop = (now) => {
        this._raf = requestAnimationFrame(loop);
        if (!visible) return;
        camera.position.z = camZ;
        const el = now - this._start;
        const t = el / 1000 * CONFIG.speed;

        this._items.forEach((it, i) => {
          const p = clamp((el - it.t0) / CONFIG.entrance.duration, 0, 1);
          const e = easeOut(p);
          it.mesh.scale.setScalar(0.72 + 0.28 * e);
          it.mesh.material.opacity = e;
          it.mesh.position.z = it.cfg.pos[2] - (1 - e) * 5.5;
          if (reduce) { it.mesh.position.y = it.baseY; return; }
          it.mesh.rotation.z += it.cfg.spin * 0.012 * CONFIG.speed;
          it.mesh.rotation.y += it.cfg.spin * 0.006 * CONFIG.speed;
          it.mesh.position.y = it.baseY + Math.sin(t * 0.55 + it.phase) * it.cfg.float;
          it.mesh.position.x = it.cfg.pos[0] + Math.cos(t * 0.38 + it.phase) * it.cfg.float * 0.45;
        });

        if (!reduce) {
          cur.x += (target.x - cur.x) * 0.05;
          cur.y += (target.y - cur.y) * 0.05;
          group.rotation.y = cur.x * CONFIG.cursor;
          group.rotation.x = cur.y * CONFIG.cursor * 0.7;
          camera.position.x = cur.x * 0.45;
          camera.position.y = -cur.y * 0.35;
          camera.position.z = camZ;
          camera.lookAt(0, 0, 0);
        }
        renderer.render(scene, camera);
      };
      this._raf = requestAnimationFrame(loop);
      this._dispose = () => {
        (this._items || []).forEach(it => { it.mesh.geometry.dispose(); it.mesh.material.dispose(); });
        env.dispose(); renderer.dispose();
      };
    }

    disconnectedCallback() {
      cancelAnimationFrame(this._raf);
      if (this._ro) this._ro.disconnect();
      if (this._io) this._io.disconnect();
      if (this._scope) {
        this._scope.removeEventListener('mousemove', this._pm);
        this._scope.removeEventListener('touchmove', this._tm);
      }
      if (this._dispose) this._dispose();
      this._started = false;
      if (this.firstChild) this.innerHTML = '';
    }
  }

  if (!customElements.get('prismatic-discs')) customElements.define('prismatic-discs', PrismaticDiscs);
})();
