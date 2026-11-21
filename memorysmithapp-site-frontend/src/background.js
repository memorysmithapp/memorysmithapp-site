/* 3D background: the brand symbol in particles, taken from its own file,
   over a faint dust for depth. With less motion asked for, it is drawn still.
   Brand colors in the book's proportion: blue leads, orange signals, green connects. */
(function () {
  var canvas = document.getElementById('bg');
  if (!window.THREE || !canvas) return;
  var renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true }); } catch (e) { return; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);

  var motion = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  var reduce = !!(motion && motion.matches);
  var rand = (function (s) { return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; })(11);

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(50, 1, 0.1, 300);
  camera.position.set(0, 0, 24);

  function softDot() {
    var c = document.createElement('canvas'); c.width = c.height = 64;
    var g = c.getContext('2d'), r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.25, 'rgba(255,255,255,.9)'); r.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = r; g.fillRect(0, 0, 64, 64);
    var t = new THREE.Texture(c); t.needsUpdate = true; return t;
  }
  var dot = softDot();

  /* ---------- dust far behind, for depth ---------- */
  var D = 400, dp = new Float32Array(D * 3);
  for (var d = 0; d < D; d++) dp.set([(rand() - 0.5) * 70, (rand() - 0.5) * 50, -10 - rand() * 30], d * 3);
  var dg = new THREE.BufferGeometry(); dg.setAttribute('position', new THREE.BufferAttribute(dp, 3));
  var dust = new THREE.Points(dg, new THREE.PointsMaterial({ size: 0.09, map: dot, color: 0x4c8dff, transparent: true, opacity: 0.5, depthWrite: false, blending: THREE.AdditiveBlending }));
  scene.add(dust);

  /* ---------- LOGO: the brand symbol, sampled from its own file, in particles ---------- */
  var logo = new THREE.Group(); scene.add(logo);
  var lmat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uTime: { value: 0 }, uDisperse: { value: 0 }, uPix: { value: renderer.getPixelRatio() }, uSize: { value: 1 }, uAlpha: { value: 1 } },
    vertexShader: [
      'attribute vec3 scatter; attribute vec3 color; attribute float seed; uniform float uTime, uDisperse, uPix, uSize; varying vec3 vC; varying float vA;',
      'void main(){',
      '  float t = uTime * (0.5 + seed * 0.6) + seed * 6.2831;',
      '  vec3 drift = vec3(sin(t), cos(t * 1.3), sin(t * 0.7)) * (0.006 + uDisperse * 0.05);',
      '  vec3 p = mix(position, scatter, uDisperse) + drift;',
      '  vec4 mv = modelViewMatrix * vec4(p, 1.0);',
      '  gl_PointSize = uSize * uPix * (2.0 + seed * 1.6) * (24.0 / -mv.z);',
      '  gl_Position = projectionMatrix * mv; vC = color; vA = 0.7 + seed * 0.3;',
      '}'].join('\n'),
    fragmentShader: [
      'uniform float uAlpha; varying vec3 vC; varying float vA;',
      'void main(){ float a = smoothstep(0.5, 0.3, length(gl_PointCoord - 0.5)); gl_FragColor = vec4(vC, a * vA * uAlpha); }'].join('\n')
  });
  var logoReady = false;
  (function buildLogo() {
    var img = new Image();
    img.onload = function () {
      var W = 420, H = Math.round(W * img.height / img.width);
      var c = document.createElement('canvas'); c.width = W; c.height = H;
      var g = c.getContext('2d'); g.drawImage(img, 0, 0, W, H);
      var data = g.getImageData(0, 0, W, H).data, step = 3;
      var P = [], C = [], S = [], E = [];
      for (var y = 0; y < H; y += step) for (var x = 0; x < W; x += step) {
        var jx = Math.min(W - 1, x + Math.floor(rand() * step)), jy = Math.min(H - 1, y + Math.floor(rand() * step));
        var o = (jy * W + jx) * 4;
        if (data[o + 3] < 140) continue;
        var nx = (jx / W - 0.5) * 2, ny = -(jy / H - 0.5) * 2 * (H / W);
        P.push(nx, ny, (rand() - 0.5) * 0.12);
        C.push(data[o] / 255, data[o + 1] / 255, data[o + 2] / 255);
        var u = rand() * 2 - 1, th = rand() * 6.2831, rad = 1.6 + rand() * 2.4, s = Math.sqrt(1 - u * u);
        S.push(Math.cos(th) * s * rad * 1.6, u * rad, Math.sin(th) * s * rad);
        E.push(rand());
      }
      var lg2 = new THREE.BufferGeometry();
      lg2.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
      lg2.setAttribute('color', new THREE.Float32BufferAttribute(C, 3));
      lg2.setAttribute('scatter', new THREE.Float32BufferAttribute(S, 3));
      lg2.setAttribute('seed', new THREE.Float32BufferAttribute(E, 1));
      logo.add(new THREE.Points(lg2, lmat));
      logoReady = true; fit();
      if (reduce) frame(performance.now());
    };
    img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjcyIiB2aWV3Qm94PSIwIDAgMTAwIDcyIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8ZyBpZD0iMDMgJiMyMjY7JiMxMjg7JiMxNDg7IFZhcmlhJiMxOTU7JiMxNjc7JiMxOTU7JiMxODE7ZXMgZG8gcyYjMTk1OyYjMTczO21ib2xvIj4KPGcgaWQ9IlRpbGUgJiMxOTQ7JiMxODM7IENvciBlc2N1cm8iPgo8ZyBpZD0iUyYjMTk1OyYjMTczO21ib2xvIC8gQ29yIGVzY3VybyI+CjxnIGlkPSJDJiMxOTU7JiMxNjk7cmVicm8iPgo8ZyBpZD0iR3JvdXAiPgo8cGF0aCBpZD0iVmVjdG9yIiBkPSJNNDkuOTU1MiAyOC4wNDdDNTAuMDA2MiAyNi42MjM4IDUwLjA3MTMgMjYuNDM1OCA1MC4zMzE1IDI1LjExODlDNTAuNjM1NyAyMy41NzMxIDUyLjQ2OTcgMjAuODE2OSA1Mi4wMTYxIDE5LjY1MTFDNTAuODg3MiAxOC43IDQ4LjU1MDYgMTguODY2MiA0Ny4wNjcgMTguNTQxOUMzOS4wOTk0IDE2LjgwMDcgNDAuMiA1LjExMjQyIDQ4LjE1ODMgNC41MjU1OEM1MS42MDI5IDQuMjQwNDcgNTMuOTE4OCA2LjM3ODgyIDU1LjgyNjYgOC45MzA4MkM1Ny4wNTIzIDEwLjU2OTcgNTkuMDQ5OSA5LjI0Nzc3IDU5LjkzNDMgOC4wMjgxQzYyLjg2NTYgMy45ODk0NiA2OS4yODU3IDQuODUwODUgNjkuODc0OCAxMC4yMjVDNzAuMDI0MiAxMS42NzQ0IDY5LjU3OTMgMTMuMTIyMiA2OC42NDU2IDE0LjI0MDNDNjcuNzMxMiAxNS4zMzcgNjYuNDE1OSAxNi4wMjM4IDY0Ljk5MzMgMTYuMTQ4M0M2MC41NzI3IDE2LjU0NTEgNTkuNzg2NiAxMi4wNTM5IDU3LjU4NSAxMS43MjMxQzU3LjA2MSAxMS44MTQgNTYuNTcyMiAxMi4wNjM5IDU2LjMyOTUgMTIuNTMwNEM1NS41Mjk1IDE0LjA2OTcgNTMuNzc5OCAxNi45OTYxIDUzLjY0MDkgMTguNjEwMkM1My45ODIxIDE5LjU1NiA1NS4yNDYzIDE5LjI4MjEgNTYuMTYwNyAxOS4yOTJDNTguMTY1NCAxOS4zMTM0IDYwLjA3NjggMTkuMzk4MSA2MS44Mjk5IDIwLjUxMDRDNjQuMzU1IDIxLjc1MDcgNjYuMjEwMSAyNi4yODMyIDY0Ljk3OTMgMjguOTAxNkM2MS44MDM1IDM1LjY1NzEgNjEuNDQ0OCA0MC40MzY0IDY0LjY1NCA0Ny4zMjE3QzY3LjIwMzcgNTIuNzkzOCA3Mi45OTc3IDUzLjI0MjcgNzMuNzg1NCA1OS4yNDYxQzczLjg4OTMgNjAuMDM1MyA3My43MzggNjEuMDMzOCA3My41MDk0IDYxLjc3NDdDNzIuODgxNyA2My44MzQzIDcxLjQ2MDkgNjUuNTU5NyA2OS41NiA2Ni41NzA5QzY3LjcyMDYgNjcuNTQ3MSA2NS41NTc4IDY3LjcxODQgNjMuNTg2NiA2Ny4wNDQxQzU3LjEyMDggNjQuODk4IDYwLjM1NDYgNTguMzk4NiA1NC40NDggNTUuODY1M0M0OS40Mjc2IDUzLjcxMjggNDQuMjczIDYwLjE1NTkgNDEuMjkzOSA1My45MjgzQzQwLjc1MDkgNTIuODAxOCA0MC42OTE4IDUxLjUwMjUgNDEuMTMwNiA1MC4zMzE2QzQyLjA2ODUgNDcuODA3IDQ0LjgzODUgNDYuNDMwNSA0Ny4zOTc4IDQ3LjM3MTlDNDkuNTA1MSA0OC4xNzE0IDUwLjI3NyA1MC40MzU4IDUxLjU5NDEgNTIuMDMzOUM1My42MDkyIDU0LjQ3NzMgNTYuNzQ4MSA1Ni4wMDI2IDU5Ljg1NTIgNTQuNzIzMUM2MS4yNjAxIDU0LjI1NjggNjEuODU5OCA1Mi40ODI1IDYyLjAzNzQgNTEuMDg2OUM2Mi41Mzg1IDQ3LjEyMjggNjIuMDM5MiA0Mi45OTkxIDYwLjUzOTIgMzkuMjg0M0M1OS4yNjYyIDM2LjEzNDQgNTcuMjYxNSAzNC43MjA4IDU0LjA1NDEgMzMuOTYzNEM1MS4zMzkxIDMyLjAwOCA1MC45MzI5IDMxLjA5MzkgNDkuOTU1MiAyOC4wNDdaIiBmaWxsPSIjNEM4REZGIi8+CjxwYXRoIGlkPSJWZWN0b3JfMiIgZD0iTTgyLjIzNDcgMTUuNDkzMUM4NC42NDkxIDE1LjM5ODUgODcuMDA1MyAxNi41MjA5IDg3LjgxNDIgMTguOTU0OEM4OC43MTk0IDIxLjY4MDUgODcuMTU4MyAyMy4zODYzIDg1LjkxODYgMjUuNjQ3NUM4NC43NTggMjcuMzU3NyA4NS44ODM0IDMwLjY2OTcgODcuNzIxIDMxLjYxNTVDOTIuMzk4MSAzNC4wMjI4IDk1LjY5NDEgMzYuNTM2OCA5My4xODU5IDQyLjMxOEM5Mi40NTEzIDQ0LjAxMjQgOTAuNzM2OCA0NC45NzY1IDg4Ljg5MDggNDUuNTYwN0M4Ny4xODk5IDQ1LjgxNDQgODUuNzA3NiA0NS42Mzg1IDg0LjE4NjUgNDQuNzg5OUM4Mi42ODQ4IDQzLjk2IDgxLjU3ODggNDIuNTY0NyA4MS4xMTI4IDQwLjkxNDdDODAuMDgyNCAzNy4yNTE1IDgyLjAyOSAzNS4zNjkyIDgzLjg3MTggMzIuNjY3NkM4NC40MDQ2IDMxLjg4NjUgODQuNTYxMSAzMC42MDggODQuNDcxNCAyOS42NTQzQzg0LjA0MjMgMjUuMTYzNSA3OS4xNjYyIDI1LjgxNCA3OC4wNjIgMjEuOTQ1NEM3Ny43MDY3IDIwLjcwMjUgNzcuOTI2NSAxOS4xMzM2IDc4LjU5ODMgMTguMDQxN0M3OS41ODY1IDE2LjQzOCA4MC41MDQ0IDE1LjkzNzUgODIuMjM0NyAxNS40OTMxWiIgZmlsbD0iIzRDOERGRiIvPgo8cGF0aCBpZD0iVmVjdG9yXzMiIGQ9Ik02OC45OTkgMzIuODkyOEM3MC4wMTg5IDMyLjc5NTQgNzAuOTQzOCAzMi44MjQ4IDcxLjkzNTYgMzMuMTA3NkM3Ny40MzYgMzQuNjc3MyA3My41NDgxIDQwLjI5MjEgNzQuNTgwMyA0MS45MjJDNzUuMzY2MyA0My4xNjQxIDc3LjcxNzQgNDIuOTg1NCA3OS4wMTY4IDQzLjM0OTZDODAuMDM4NSA0My42MzY1IDgwLjk5ODYgNDQuMTg5NCA4MS40OTYyIDQ1LjE2ODJDODIuMDA5NyA0Ni4xNzkyIDgyLjEzMjggNDcuNzgyNCA4MS43ODEgNDguODU3QzgxLjMyOTIgNTAuMjMzMyA4MC4yMTYxIDUwLjk3MzQgNzguOTc0NiA1MS41Njk4QzczLjUyNTIgNTIuNzc5MSA3My4yODQzIDQ4LjM1NDMgNzMuMzMxOCA0NC42MTQxQzczLjM0NTkgNDMuNTg2MyA3Mi4yOTQ0IDQyLjc4NDEgNzEuMzA5NiA0Mi42NzU4QzY2Ljg4NTQgNDIuMTg5MiA2NC4xOTUgNDAuMTY3NiA2NS45MzI0IDM1LjQxODZDNjYuNDQwNSAzNC4wMjk4IDY3LjczMTIgMzMuMzc0OSA2OC45OTkgMzIuODkyOFoiIGZpbGw9IiM0QzhERkYiLz4KPHBhdGggaWQ9IlZlY3Rvcl80IiBkPSJNNzEuMDg2MSAxOS4wODI5QzczLjg0MzMgMTguNjQ2NyA3Ni40MzM1IDIwLjUxODEgNzYuODgzNyAyMy4yNzFDNzcuMzM1NiAyNi4wMjM4IDc1LjQ3NyAyOC42MjM1IDcyLjcyNSAyOS4wODlDNjkuOTUzNyAyOS41NTc5IDY3LjMzMDEgMjcuNjgzIDY2Ljg3NDcgMjQuOTA5NUM2Ni40MjEgMjIuMTM2MSA2OC4zMDk1IDE5LjUyMjQgNzEuMDg2MSAxOS4wODI5WiIgZmlsbD0iIzM0Qzk3QSIvPgo8cGF0aCBpZD0iVmVjdG9yXzUiIGQ9Ik03NC42MzQ3IDkuNzc2OUM3Ni4yMTczIDkuNDIxNDUgNzcuNzk2NCAxMC4zOTY5IDc4LjE4NSAxMS45NzI0Qzc4LjU3MzYgMTMuNTQ4IDc3LjYzMjggMTUuMTQ1NCA3Ni4wNjQzIDE1LjU2OEM3NS4wMjE2IDE1Ljg0OTIgNzMuOTA2NyAxNS41NDQyIDczLjE1MDYgMTQuNzcwMkM3Mi4zOTYyIDEzLjk5NjQgNzIuMTIwMSAxMi44NzQ4IDcyLjQyNzggMTEuODM4N0M3Mi43MzU2IDEwLjgwMjQgNzMuNTc5NiAxMC4wMTM2IDc0LjYzNDcgOS43NzY5WiIgZmlsbD0iIzM0Qzk3QSIvPgo8cGF0aCBpZD0iVmVjdG9yXzYiIGQ9Ik03OC41MDUgMjguMzYwMkM4MC4xMTQgMjguMDczNSA4MS42NTI2IDI5LjEzODYgODEuOTQ5OCAzMC43NDQ4QzgyLjI0NyAzMi4zNTEgODEuMTkxOSAzMy44OTU5IDc5LjU4NjUgMzQuMjAzMkM3Ny45NjY5IDM0LjUxMzUgNzYuNDA1NCAzMy40NDY1IDc2LjEwNDggMzEuODI1NkM3NS44MDQxIDMwLjIwNDggNzYuODgxOSAyOC42NDk3IDc4LjUwNSAyOC4zNjAyWiIgZmlsbD0iIzM0Qzk3QSIvPgo8cGF0aCBpZD0iVmVjdG9yXzciIGQ9Ik01NC4wNTQxIDMzLjk2MzRDNDkuMjEzNiAzMy43OTI1IDQyLjg0NDQgMzYuNTg3IDM5Ljc3MTIgNDAuMjM0NkMzNi44OTQ1IDQzLjY0ODggMzguODgxMyA0Ny40MDUgMzQuMTEwNyA1MC4wNzg0QzMyLjM0ODUgNTEuMDYzMiAzMC4yNjQ0IDUxLjI5ODggMjguMzI2OSA1MC43MzI0QzIzLjEwMDQgNDkuMjAxMyAyMS4zNDk1IDQzLjAyODEgMjQuMzU4MSAzOC43NjlDMjUuMDE4NSAzNy44MzM4IDI2LjM4MjIgMzYuMjM0NCAyNi42MTAxIDM1LjE3ODFDMjcuOTI0MSAyOS4wODg1IDIwLjA2OTQgMzAuNDEyNyAxNy41NzYgMjUuNDk1QzE2LjYxOTQgMjMuNjIxOSAxNi40NTk5IDIxLjQ0MjMgMTcuMTMzNyAxOS40NUMyMC41NTM3IDkuNDA2MzIgMzYuMzQyOCAxNS42Mjk1IDMwLjk4MyAyNS41Nzc2QzMwLjAyNzYgMjcuNDEyIDI3LjExMyAzMC41MjUyIDI4LjUxNDUgMzIuNjg5N0MzMy41NzQzIDQwLjUwNDUgNDcuNDQzOCAzNS44NDIgNDkuOTU1MiAyOC4wNDdDNTAuOTMyOCAzMS4wOTM5IDUxLjMzOTEgMzIuMDA4IDU0LjA1NDEgMzMuOTYzNFoiIGZpbGw9IiNGRjlBNDUiLz4KPHBhdGggaWQ9IlZlY3Rvcl84IiBkPSJNMzguOTMwMiAyMS4xNTA2QzQyLjE0MTMgMjAuNjI3MSA0NS4xNzIzIDIyLjc5NSA0NS43MTM0IDI2LjAwMjNDNDYuMjU0NSAyOS4yMDk2IDQ0LjEwMjUgMzIuMjUxNSA0MC44OTczIDMyLjgwOThDMzcuNjY3MSAzMy4zNzI1IDM0LjU5NTkgMzEuMjAwOCAzNC4wNTA2IDI3Ljk2ODdDMzMuNTA1MyAyNC43MzY2IDM1LjY5NDQgMjEuNjc4IDM4LjkzMDIgMjEuMTUwNloiIGZpbGw9IiNGRjlBNDUiLz4KPHBhdGggaWQ9IlZlY3Rvcl85IiBkPSJNNTEuODYzMSAzNi4xNDExQzU0LjQxNDYgMzUuNzE4NSA1Ni44MjU0IDM3LjQ0NTQgNTcuMjQ0IDM5Ljk5NjhDNTcuNjY0MiA0Mi41NDggNTUuOTMzOSA0NC45NTU3IDUzLjM4MjQgNDUuMzcyM0M1MC44MzI2IDQ1Ljc4ODIgNDguNDI5OCA0NC4wNjE5IDQ4LjAxMDcgNDEuNTE0OEM0Ny41OTE3IDM4Ljk2NzggNDkuMzE1NyAzNi41NjMgNTEuODYzMSAzNi4xNDExWiIgZmlsbD0iI0ZGOUE0NSIvPgo8cGF0aCBpZD0iVmVjdG9yXzEwIiBkPSJNMTcuNDA3IDMxLjIxNDdDMTguODE4NCAzMC44NDkyIDIwLjMxNzMgMzEuMjc0OCAyMS4zMjU2IDMyLjMyNzhDMjIuMzMzOCAzMy4zODA2IDIyLjY5NCAzNC44OTYxIDIyLjI2NyAzNi4yODk4QzIxLjg0MDMgMzcuNjgzNSAyMC42OTMxIDM4LjczNzcgMTkuMjY4IDM5LjA0NTlDMTcuMTI1NSAzOS41MDg5IDE1LjAwNjEgMzguMTczOCAxNC40OTk1IDM2LjA0MThDMTMuOTkyOSAzMy45MDk3IDE1LjI4NTIgMzEuNzY0NCAxNy40MDcgMzEuMjE0N1oiIGZpbGw9IiNGRjlBNDUiLz4KPHBhdGggaWQ9IlZlY3Rvcl8xMSIgZD0iTTkuMjc0MzYgMjQuNzAxN0MxMC42OTYxIDI0LjQzNTMgMTIuMTUxMiAyNC45NTQyIDEzLjA4MzEgMjYuMDYwMUMxNC4wMTUxIDI3LjE2NTkgMTQuMjc5NyAyOC42ODc1IDEzLjc3NTkgMzAuMDQzQzEzLjI3MiAzMS4zOTg0IDEyLjA3NzUgMzIuMzc3OSAxMC42NDkzIDMyLjYwNjhDOC40ODExMyAzMi45NTQzIDYuNDM2MDggMzEuNDk1NCA2LjA1OTk1IDI5LjMzMjZDNS42ODM4MiAyNy4xNjk3IDcuMTE2MDcgMjUuMTA2MyA5LjI3NDM2IDI0LjcwMTdaIiBmaWxsPSIjRkY5QTQ1Ii8+CjxwYXRoIGlkPSJWZWN0b3JfMTIiIGQ9Ik0xMi43OTY1IDQzLjY2NjFDMTQuOTM5NSA0My4xNDgzIDE3LjA5NzMgNDQuNDYzIDE3LjYxOTQgNDYuNjA0NEMxOC4xNDE0IDQ4Ljc0NTkgMTYuODMwNyA1MC45MDU1IDE0LjY4OTYgNTEuNDMxN0MxMi41NDI2IDUxLjk1OTQgMTAuMzc1IDUwLjY0NDQgOS44NTE0OSA0OC40OTcyQzkuMzI3ODMgNDYuMzQ5NyAxMC42NDc0IDQ0LjE4NTIgMTIuNzk2NSA0My42NjYxWiIgZmlsbD0iI0ZGOUE0NSIvPgo8cGF0aCBpZD0iVmVjdG9yXzEzIiBkPSJNMzYuMDMyMiAxMi45MjAxQzM3LjY4MjMgMTIuNjcyNCAzOS4yMjU5IDEzLjc5NDkgMzkuNDk4IDE1LjQ0MDlDMzkuNzcgMTcuMDg2OCAzOC42Njk3IDE4LjY0NjIgMzcuMDI3NSAxOC45NDIzQzM1Ljk0MzQgMTkuMTM3OCAzNC44MzgzIDE4LjczNDQgMzQuMTM1MyAxNy44ODY3QzMzLjQzMjIgMTcuMDM4OSAzMy4yNDA0IDE1Ljg3ODQgMzMuNjMzMiAxNC44NDk3QzM0LjAyNjIgMTMuODIxIDM0Ljk0MjkgMTMuMDgzNSAzNi4wMzIyIDEyLjkyMDFaIiBmaWxsPSIjRkY5QTQ1Ii8+CjxwYXRoIGlkPSJWZWN0b3JfMTQiIGQ9Ik04LjYyNTYxIDM2LjI5NDdDOS41MDU4OSAzNi4wMTQ2IDEwLjQ2OSAzNi4yMjkyIDExLjE0NjkgMzYuODU2NkMxMS44MjQ5IDM3LjQ4MzkgMTIuMTEzMyAzOC40MjczIDExLjkwMTcgMzkuMzI2M0MxMS42OTA0IDQwLjIyNTQgMTEuMDExNiA0MC45NDE0IDEwLjEyNSA0MS4yMDA5QzguNzc2MzEgNDEuNTk1NyA3LjM2MDc4IDQwLjgzMjQgNi45NTAwMSAzOS40ODg2QzYuNTM5NDIgMzguMTQ0OSA3LjI4NjQgMzYuNzIxIDguNjI1NjEgMzYuMjk0N1oiIGZpbGw9IiNGRjlBNDUiLz4KPC9nPgo8L2c+CjwvZz4KPC9nPgo8L2c+Cjwvc3ZnPgo=';
  })();
  function updateLogo(t) {
    // Whole at the top of the page, it breaks into a cloud while you read,
    // and gathers back into the symbol at the closing call.
    var max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    var p = window.scrollY / max;
    var d = Math.min(1, window.scrollY / (window.innerHeight * 1.2)) * (1 - Math.max(0, (p - 0.82) / 0.18));
    d = d * d * (3 - 2 * d) * 0.85;
    lmat.uniforms.uDisperse.value += (d - lmat.uniforms.uDisperse.value) * 0.06;
    lmat.uniforms.uTime.value = reduce ? 1 : t;
    logo.rotation.y = mx * 0.45 + Math.sin(t * 0.2) * 0.12;
    logo.rotation.x = my * 0.25;
  }

  /* ---------- shared ---------- */
  /* Additive blending adds light, so the particles glow over the dark page. */
  [lmat, dust.material].forEach(function (m) { m.blending = THREE.AdditiveBlending; m.needsUpdate = true; });
  dust.material.opacity = 0.5;
  if (motion && motion.addEventListener) motion.addEventListener('change', function () {
    reduce = motion.matches;
    if (reduce) frame(performance.now()); else { last = performance.now(); loop(); }
  });

  function fit() {
    var w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    var visH = 2 * Math.tan((camera.fov * Math.PI) / 360) * camera.position.z, visW = visH * camera.aspect;
    // The symbol sits behind the headline, a little above center.
    // On a phone the symbol sits behind the headline, smaller, clear of the text below it.
    var phone = w < 720;
    logo.scale.setScalar(phone ? Math.min(visW * 0.42, visH * 0.2) : Math.min(visW * 0.34, visH * 0.42));
    logo.position.y = phone ? visH * 0.27 : visH * 0.06;
    lmat.uniforms.uSize.value = w < 640 ? 1.3 : 1;
    lmat.uniforms.uAlpha.value = phone ? 0.75 : 1.5;
  }
  fit();
  window.addEventListener('resize', fit);

  var mx = 0, my = 0, sy = 0, sEase = 0, lastS = 0;
  window.addEventListener('pointermove', function (ev) { mx = ev.clientX / window.innerWidth - 0.5; my = ev.clientY / window.innerHeight - 0.5; }, { passive: true });
  window.addEventListener('scroll', function () { sy = window.scrollY / window.innerHeight; if (reduce) frame(performance.now()); }, { passive: true });

  var last = performance.now(), t0 = last, running = false;
  function frame(now) {
    var dt = Math.min(0.05, (now - last) / 1000); last = now;
    var t = (now - t0) / 1000;
    sEase += (sy - sEase) * 0.06;
    dust.rotation.y = t * 0.01 + sEase * 0.08;
    updateLogo(t);
    renderer.render(scene, camera);
  }
  function loop() {
    if (running) return; running = true;
    (function tick(now) {
      if (document.hidden || reduce) { running = false; return; }
      frame(now); requestAnimationFrame(tick);
    })(performance.now());
  }
  document.addEventListener('visibilitychange', function () { if (!document.hidden && !reduce) { last = performance.now(); loop(); } });
  if (reduce) frame(performance.now()); else loop();
})();
