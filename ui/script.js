/* Road network view
   Sample data for now. Later this will come from the C++ engine (e.g. as JSON). */

// ---- Sample road network ----
const nodes = [
  { id: 0, name: "Clock Tower",    x: 400, y: 250 },
  { id: 1, name: "ISBT",           x: 120, y: 120 },
  { id: 2, name: "Rajpur Road",    x: 400, y: 70  },
  { id: 3, name: "Race Course",    x: 250, y: 220 },
  { id: 4, name: "Graphic Era",    x: 120, y: 380 },
  { id: 5, name: "Prem Nagar",     x: 250, y: 430 },
  { id: 6, name: "Ballupur",       x: 560, y: 150 },
  { id: 7, name: "Dilaram Chowk",  x: 580, y: 350 },
  { id: 8, name: "Raipur",         x: 700, y: 90  },
  { id: 9, name: "Mussoorie Road", x: 710, y: 270 }
];

// traffic: "free" | "moderate" | "heavy" | "closed"
const edges = [
  { from: 1, to: 3, km: 3.2, traffic: "free" },
  { from: 1, to: 2, km: 5.0, traffic: "moderate" },
  { from: 2, to: 0, km: 3.5, traffic: "heavy" },
  { from: 2, to: 6, km: 3.0, traffic: "free" },
  { from: 3, to: 0, km: 2.0, traffic: "moderate" },
  { from: 3, to: 4, km: 4.1, traffic: "free" },
  { from: 4, to: 5, km: 2.6, traffic: "free" },
  { from: 5, to: 0, km: 4.4, traffic: "heavy" },
  { from: 5, to: 7, km: 6.0, traffic: "moderate" },
  { from: 0, to: 6, km: 3.3, traffic: "closed" },
  { from: 0, to: 7, km: 3.1, traffic: "free" },
  { from: 6, to: 8, km: 2.4, traffic: "free" },
  { from: 6, to: 9, km: 3.8, traffic: "moderate" },
  { from: 7, to: 9, km: 2.2, traffic: "heavy" },
  { from: 8, to: 9, km: 4.0, traffic: "free" }
];

// ---- State ----
let sourceId = null;
let destinationId = null;
let hoverId = null;

// ---- Elements ----
const canvas = document.getElementById("map");
const ctx = canvas.getContext("2d");
const sourceSelect = document.getElementById("source");
const destSelect = document.getElementById("destination");
const statusEl = document.getElementById("status");
const NODE_RADIUS = 14;

const css = getComputedStyle(document.documentElement);
const color = (name) => css.getPropertyValue(name).trim();

// ---- Setup dropdowns ----
function fillSelect(select) {
  select.innerHTML = '<option value="">Select intersection</option>';
  nodes.forEach((n) => {
    const opt = document.createElement("option");
    opt.value = n.id;
    opt.textContent = n.name;
    select.appendChild(opt);
  });
}
fillSelect(sourceSelect);
fillSelect(destSelect);

// ---- Drawing ----
function drawEdge(edge) {
  const a = nodes[edge.from];
  const b = nodes[edge.to];

  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.lineWidth = 6;
  ctx.lineCap = "round";
  ctx.strokeStyle = color("--" + edge.traffic);
  ctx.setLineDash(edge.traffic === "closed" ? [10, 8] : []);
  ctx.stroke();
  ctx.setLineDash([]);

  // distance label at the middle of the road
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const label = edge.km.toFixed(1) + " km";
  ctx.font = "12px Segoe UI, Arial, sans-serif";
  const w = ctx.measureText(label).width + 8;
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.fillRect(mx - w / 2, my - 9, w, 18);
  ctx.fillStyle = color("--ink");
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, mx, my);
}

function drawNode(node) {
  let fill = "#ffffff";
  let stroke = color("--ink");
  let tag = "";

  if (node.id === sourceId)      { fill = color("--src"); stroke = fill; tag = "S"; }
  if (node.id === destinationId) { fill = color("--dst"); stroke = fill; tag = "D"; }

  ctx.beginPath();
  ctx.arc(node.x, node.y, NODE_RADIUS + (node.id === hoverId ? 3 : 0), 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = stroke;
  ctx.stroke();

  if (tag) {
    ctx.fillStyle = "#fff";
    ctx.font = "bold 13px Segoe UI, Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(tag, node.x, node.y + 1);
  }

  // intersection name
  ctx.fillStyle = color("--ink");
  ctx.font = "600 13px Segoe UI, Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillText(node.name, node.x, node.y - NODE_RADIUS - 8);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  edges.forEach(drawEdge);
  nodes.forEach(drawNode);
}

// ---- Selection logic ----
function updateStatus() {
  if (sourceId === null) {
    statusEl.textContent = "Click an intersection to set the start.";
  } else if (destinationId === null) {
    statusEl.textContent = "Start: " + nodes[sourceId].name + ". Now choose a destination.";
  } else {
    statusEl.textContent =
      nodes[sourceId].name + " to " + nodes[destinationId].name + ". Ready to find a route.";
  }
}

function syncUI() {
  sourceSelect.value = sourceId === null ? "" : sourceId;
  destSelect.value = destinationId === null ? "" : destinationId;
  updateStatus();
  draw();
}

function nodeAt(evt) {
  const rect = canvas.getBoundingClientRect();
  const x = (evt.clientX - rect.left) * (canvas.width / rect.width);
  const y = (evt.clientY - rect.top) * (canvas.height / rect.height);
  return nodes.find((n) => Math.hypot(n.x - x, n.y - y) <= NODE_RADIUS + 6) || null;
}

canvas.addEventListener("click", (evt) => {
  const node = nodeAt(evt);
  if (!node) return;

  if (sourceId === null || (sourceId !== null && destinationId !== null)) {
    sourceId = node.id;          // start a new selection
    destinationId = null;
  } else if (node.id !== sourceId) {
    destinationId = node.id;
  }
  syncUI();
});

canvas.addEventListener("mousemove", (evt) => {
  const node = nodeAt(evt);
  const id = node ? node.id : null;
  if (id !== hoverId) {
    hoverId = id;
    draw();
  }
});

canvas.addEventListener("mouseleave", () => { hoverId = null; draw(); });

sourceSelect.addEventListener("change", () => {
  sourceId = sourceSelect.value === "" ? null : Number(sourceSelect.value);
  if (sourceId === destinationId) destinationId = null;
  syncUI();
});

destSelect.addEventListener("change", () => {
  destinationId = destSelect.value === "" ? null : Number(destSelect.value);
  if (destinationId === sourceId) sourceId = null;
  syncUI();
});

document.getElementById("clearBtn").addEventListener("click", () => {
  sourceId = null;
  destinationId = null;
  syncUI();
});

document.getElementById("findRoute").addEventListener("click", () => {
  if (sourceId === null || destinationId === null) {
    statusEl.textContent = "Select both a start and a destination first.";
    return;
  }
  // TODO (Milestone 6/7): send source and destination to the C++ A* engine,
  // receive the route, and highlight it on the map.
  statusEl.textContent =
    "Route search will connect to the C++ A* engine in the integration milestone.";
});

// ---- First render ----
syncUI();
