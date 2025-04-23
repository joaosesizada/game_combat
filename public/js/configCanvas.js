const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const LOGIC_W = 1200,
  LOGIC_H = 800;

export function setupCanvas() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = LOGIC_W * dpr;
  canvas.height = LOGIC_H * dpr;
  ctx.scale(dpr, dpr);

  const scaleX = window.innerWidth / LOGIC_W;
  const scaleY = window.innerHeight / LOGIC_H;
  const scale = Math.min(scaleX, scaleY);

  canvas.style.width = `${LOGIC_W * scale}px`;
  canvas.style.height = `${LOGIC_H * scale}px`;

  // centralização opcional
  canvas.style.marginLeft = `${(window.innerWidth - LOGIC_W * scale) / 2}px`;
  canvas.style.marginTop = `${(window.innerHeight - LOGIC_H * scale) / 2}px`;
}

window.addEventListener("resize", setupCanvas);

