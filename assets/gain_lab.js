/* Unit-step response of y''' + 2y'' + Kp y' + Ki y = Ki.
   Zero initial state gives y''(0+) = Kp. */
(() => {
  const lab = document.querySelector('#gain-lab');
  const kp = lab.querySelector('#kp');
  const ratio = lab.querySelector('#ratio');
  const canvas = lab.querySelector('canvas');
  const context = canvas.getContext('2d');
  const baseline = { kp: 2.0248861318247524, ki: 0.06465479767351344 };
  const duration = 30;
  const dt = 0.01;
  const steps = duration / dt;
  let pending;

  function response(p, i) {
    let y = 0;
    let v = 0;
    let a = p;
    const values = [y];
    const jerk = (x, dx, ddx) => i * (1 - x) - p * dx - 2 * ddx;
    for (let step = 0; step < steps; step++) {
      const j1 = jerk(y, v, a);
      const v2 = v + dt / 2 * a;
      const a2 = a + dt / 2 * j1;
      const j2 = jerk(y + dt / 2 * v, v2, a2);
      const v3 = v + dt / 2 * a2;
      const a3 = a + dt / 2 * j2;
      const j3 = jerk(y + dt / 2 * v2, v3, a3);
      const v4 = v + dt * a3;
      const a4 = a + dt * j3;
      const j4 = jerk(y + dt * v3, v4, a4);
      y += dt / 6 * (v + 2 * v2 + 2 * v3 + v4);
      v += dt / 6 * (a + 2 * a2 + 2 * a3 + a4);
      a += dt / 6 * (j1 + 2 * j2 + 2 * j3 + j4);
      values.push(y);
    }
    return values;
  }

  const reference = response(baseline.kp, baseline.ki);
  ratio.value = baseline.ki / (2 * baseline.kp);

  function draw() {
    const p = kp.valueAsNumber;
    const fraction = ratio.valueAsNumber;
    const i = 2 * p * fraction;
    const values = response(p, i);
    lab.querySelector('#kp-value').value = p.toFixed(3);
    lab.querySelector('#ratio-value').value = fraction.toFixed(3);
    const state = fraction < 1 ? 'Stable' : fraction === 1 ? 'Marginal' : 'Unstable';
    lab.querySelector('#lab-result').textContent =
      `Kp = ${p.toFixed(3)} · Ki = ${i.toFixed(3)} · ${state} · 30 s range ${Math.min(...values).toFixed(2)} to ${Math.max(...values).toFixed(2)}`;

    const size = canvas.getBoundingClientRect();
    const scale = devicePixelRatio || 1;
    canvas.width = Math.round(size.width * scale);
    canvas.height = Math.round(size.height * scale);
    context.scale(scale, scale);
    const w = size.width;
    const h = size.height;
    const dark = document.documentElement.dataset.theme === 'dark';
    const ink = dark ? '#f2edf8' : '#282239';
    const grid = dark ? '#534762' : '#ccc1d9';
    const current = dark ? '#f5cb83' : '#653aa0';
    const original = dark ? '#91d8cb' : '#08736b';
    const left = 56;
    const right = w - 16;
    const top = 24;
    const bottom = h - 43;
    const low = Math.min(0, ...values);
    const high = Math.max(1.1, ...reference, ...values);
    const x = t => left + t / duration * (right - left);
    const y = v => bottom - (v - low) / (high - low) * (bottom - top);
    context.font = '12px system-ui';
    context.fillStyle = ink;
    for (let tick = 0; tick <= 5; tick++) {
      const v = low + tick / 5 * (high - low);
      context.strokeStyle = grid;
      context.beginPath();
      context.moveTo(left, y(v));
      context.lineTo(right, y(v));
      context.stroke();
      context.fillText(v.toFixed(2), 3, y(v) + 4);
      context.fillText(String(tick * 6), x(tick * 6) - 5, bottom + 17);
    }
    context.fillText('Output', 4, 13);
    context.fillText('Time (s)', (left + right) / 2 - 20, h - 4);

    function line(series, color, dash = []) {
      context.strokeStyle = color;
      context.lineWidth = 2;
      context.setLineDash(dash);
      context.beginPath();
      series.forEach((v, j) => {
        if (j === 0) context.moveTo(x(0), y(v));
        else context.lineTo(x(j * dt), y(v));
      });
      context.stroke();
      context.setLineDash([]);
    }
    line([1, ...Array(steps).fill(1)], ink, [3, 4]);
    line(reference, original, [8, 4]);
    line(values, current);
  }

  function schedule() {
    cancelAnimationFrame(pending);
    pending = requestAnimationFrame(draw);
  }
  kp.addEventListener('input', schedule);
  ratio.addEventListener('input', schedule);
  lab.querySelector('#boundary').addEventListener('click', () => { ratio.value = 1; schedule(); });
  lab.querySelector('#reset-gains').addEventListener('click', () => {
    kp.value = baseline.kp;
    ratio.value = baseline.ki / (2 * baseline.kp);
    schedule();
  });
  new ResizeObserver(schedule).observe(canvas);
  new MutationObserver(schedule).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  schedule();
})();
