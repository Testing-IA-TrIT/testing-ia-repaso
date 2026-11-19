// Datos y comportamiento de la página de journeys.
// El journey J1 atraviesa cuatro specs. Cada paso apunta a un criterio que ya existe.

const SPECS = {
  S2: { name: "Acceso", color: "var(--s-access)" },
  S3: { name: "Cohetes", color: "var(--s-rockets)" },
  S1: { name: "Lanzamientos", color: "var(--s-launches)" },
  S4: { name: "Lista de lanzamientos", color: "var(--s-list)" },
};

const STEPS = [
  {
    spec: "S2", req: "R7",
    title: "Entrar",
    action: "El operador entra con su cuenta, por el formulario.",
    check: "El menú muestra el rol «operador».",
    why: "El journey empieza sin sesión. Entrar es un paso del usuario, no una preparación.",
  },
  {
    spec: "S3", req: "R1",
    title: "Añadir un cohete",
    action: "Añade el cohete «Halcón-7f3a», con un nombre único.",
    check: "El cohete nuevo aparece en la flota.",
    why: "El usuario crea sus datos. El journey no usa el cohete de la semilla.",
  },
  {
    spec: "S1", req: "R1",
    title: "Programar un lanzamiento",
    action: "Programa un lanzamiento con ese cohete, para dentro de 30 días.",
    check: "El lanzamiento se guarda con ese cohete.",
    why: "El paso usa el resultado del paso anterior: el cohete que acaba de crear.",
  },
  {
    spec: "S4", req: "R1",
    title: "Ver el lanzamiento",
    action: "Abre la lista de lanzamientos.",
    check: "El lanzamiento aparece con el estado «programado».",
    why: "El último paso comprueba el objetivo: los pasajeros ya pueden reservar plaza.",
  },
];

const FAIL_AT = 2; // el paso [S1-R1]

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const STEP_MS = reduceMotion ? 150 : 1000;
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const metro = document.getElementById("metro");
const panel = document.getElementById("j-panel");
const board = document.getElementById("board");
const runBtn = document.getElementById("run-btn");
const bugBtn = document.getElementById("bug-btn");
const status = document.getElementById("status");

let bug = false;
let running = false;
const stations = [];
const segs = [];

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (key === "class") node.className = value;
    else if (key === "text") node.textContent = value;
    else if (key === "style") node.style.cssText = value;
    else node.setAttribute(key, value);
  }
  for (const child of [].concat(children)) if (child != null) node.append(child);
  return node;
}

const codeOf = (s) => `${s.spec}-${s.req}`;

function renderMetro() {
  STEPS.forEach((step, i) => {
    if (i > 0) {
      const seg = el("span", { class: "seg", "aria-hidden": "true", style: `--from:${SPECS[STEPS[i - 1].spec].color};--to:${SPECS[step.spec].color}` });
      segs.push(seg);
      metro.append(seg);
    }
    const station = el("button", { class: "station", type: "button", style: `--accent:${SPECS[step.spec].color}`, "aria-label": `Paso ${i + 1}: ${step.title}, criterio ${codeOf(step)}` }, [
      el("span", { class: "act" }, [el("span", { class: "bubble" }, [el("small", { text: `Paso ${i + 1} · acción` }), step.action])]),
      el("span", { class: "hub" }, [
        el("span", { class: "stop" }, [el("span", { text: String(i + 1) })]),
        el("span", { class: "code-tag", text: `[${codeOf(step)}]` }),
      ]),
      el("span", { class: "chk" }, [el("span", { class: "expect" }, [step.check]), el("small", { text: "comprobación" })]),
    ]);
    const pick = () => select(i);
    station.addEventListener("click", pick);
    station.addEventListener("focus", pick);
    station.addEventListener("mouseenter", () => { if (!running) pick(); });
    stations.push(station);
    metro.append(station);
  });
}

function renderBoard(journey = "idle") {
  const specChips = Object.entries(SPECS).map(([code, s]) =>
    el("span", { class: "chip green" }, [code, el("span", { class: "lbl", text: s.name })]));
  const labels = { idle: "sin ejecutar", green: "en verde", red: "falla" };
  const jChip = el("span", { class: `chip ${journey}` }, ["J1", el("span", { class: "lbl", text: `journey · ${labels[journey]}` })]);
  board.replaceChildren(...specChips, jChip);
}

function select(i) {
  stations.forEach((s, k) => s.classList.toggle("selected", k === i));
  const step = STEPS[i];
  const failed = stations[i].classList.contains("failed");
  if (failed) return renderFailure();
  panel.classList.remove("bad");
  panel.style.setProperty("--accent", SPECS[step.spec].color);
  panel.replaceChildren(
    el("h4", {}, [`Paso ${i + 1} · ${step.title} `, el("code", { text: `[${codeOf(step)}]` })]),
    el("p", { text: step.why }),
    el("div", { class: "cols" }, [
      el("div", { class: "col" }, [el("small", { text: "Acción del usuario" }), el("p", { text: step.action })]),
      el("div", { class: "col" }, [el("small", { text: "Criterio que ya existe" }), el("p", { text: `${codeOf(step)}, en la spec ${step.spec} · ${SPECS[step.spec].name}. El journey no añade reglas.` })]),
      el("div", { class: "col expect" }, [el("small", { text: "Comprobación al final del paso" }), el("p", { text: `${step.check} Solo el resultado que ve el usuario.` })]),
    ]),
    el("span", { class: "line", text: `test.step('[${codeOf(step)}] ${step.title}', async () => { … expect … })` }),
  );
}

function renderFailure() {
  const step = STEPS[FAIL_AT];
  const prev = STEPS[FAIL_AT - 1];
  panel.classList.add("bad");
  panel.style.removeProperty("--accent");
  panel.replaceChildren(
    el("h4", {}, ["✗ Falla el paso 3 ", el("code", { text: `[${codeOf(step)}]` })]),
    el("p", { text: "El cohete nuevo no está en el selector del lanzamiento." }),
    el("ol", {}, [
      el("li", { text: "Todas las specs pasan. Sus pruebas usan el cohete de la semilla y no crean uno nuevo antes." }),
      el("li", {}, ["El paso que falla cita ", el("code", { text: step.spec }), ", pero ", el("code", { text: step.spec }), " no tiene la culpa. El código del paso es una pista, no el culpable."]),
      el("li", {}, ["El triage busca el origen en el código: la página de lanzamientos usa una copia antigua de la flota. El fallo está entre ", el("code", { text: prev.spec }), " y ", el("code", { text: step.spec }), "."]),
      el("li", { text: "fix-bugs aplica la corrección. Una ejecución nueva deja la suite en verde." }),
    ]),
    el("span", { class: "line", text: "specs/J1-<slug>/e2e-report.md · ID del fallo: J1-1" }),
  );
}

function reset() {
  stations.forEach((s) => s.classList.remove("active", "done", "failed"));
  segs.forEach((s) => s.classList.remove("done"));
  renderBoard("idle");
}

async function run() {
  running = true;
  runBtn.disabled = true;
  bugBtn.disabled = true;
  reset();
  status.textContent = "Las specs ya están en verde. Ahora se ejecuta el journey.";
  for (let i = 0; i < STEPS.length; i++) {
    if (i > 0) {
      segs[i - 1].classList.add("done");
      await wait(STEP_MS / 2);
    }
    select(i);
    stations[i].classList.add("active");
    status.textContent = `Paso ${i + 1}: ${STEPS[i].title.toLowerCase()}…`;
    await wait(STEP_MS);
    stations[i].classList.remove("active");
    if (bug && i === FAIL_AT) {
      stations[i].classList.add("failed");
      renderBoard("red");
      renderFailure();
      status.textContent = "El journey para en el paso 3. Las specs siguen en verde.";
      return finish();
    }
    stations[i].classList.add("done");
  }
  renderBoard("green");
  status.textContent = "Objetivo conseguido: los pasajeros pueden reservar en ese lanzamiento.";
  finish();
}

function finish() {
  running = false;
  runBtn.disabled = false;
  bugBtn.disabled = false;
  runBtn.textContent = "↺ Repetir el recorrido";
}

runBtn.addEventListener("click", run);
bugBtn.addEventListener("click", () => {
  bug = !bug;
  bugBtn.setAttribute("aria-pressed", String(bug));
  bugBtn.textContent = bug ? "✓ Quitar el cambio" : "✗ Aplicar el cambio del compañero";
  reset();
  status.textContent = bug
    ? "Un compañero cambia la página de lanzamientos: ahora reutiliza la flota que guardó la página de cohetes."
    : "Cambio retirado.";
  select(0);
});

renderMetro();
renderBoard();
select(0);

// Animación de entrada al hacer scroll
const observer = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  }
}, { threshold: 0.08 });
document.querySelectorAll(".reveal").forEach((node) => observer.observe(node));
