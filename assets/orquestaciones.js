// Datos y comportamiento de la página de orquestaciones.
// Cada pipeline tiene una lista de pasos. Un paso es una skill primitiva o una pausa humana (gate).

const PIPELINES = [
  {
    id: "spec-builder",
    family: "spec",
    role: "Construye",
    summary: "Convierte una petición en una spec aprobada y después en código que la cumple.",
    start: "Una petición: «Quiero programar lanzamientos de cohetes»",
    end: "La funcionalidad implementada según la spec",
    steps: [
      {
        name: "define-spec",
        out: "spec.md",
        input: "La petición del usuario, con su objetivo y sus límites.",
        task: "Escribe la spec: el problema, las historias US1…US3, las reglas y los requisitos R1…R9 en formato EARS.",
        result: "specs/S1-schedule-launch/spec.md",
      },
      {
        gate: true,
        name: "Aprobar la spec",
        out: "tu decisión",
        input: "La spec que ha escrito el agente.",
        task: "Comprueba que cada requisito es concreto y se puede verificar. Comprueba qué queda fuera de alcance.",
        result: "Si apruebas, el pipeline sigue. Si no, pides cambios y el agente corrige la spec.",
      },
      {
        name: "implement-spec",
        out: "código",
        input: "La spec aprobada.",
        task: "Implementa en la aplicación lo que pide la spec.",
        result: "Los cambios de código de la funcionalidad.",
      },
    ],
  },
  {
    id: "test-builder",
    family: "test",
    role: "Prueba",
    summary: "Convierte los requisitos de una spec, o los pasos de un journey, en pruebas de Playwright.",
    start: "El código de una spec (S1) o de un journey (J1)",
    end: "Una prueba para cada escenario",
    steps: [
      {
        name: "define-test",
        out: ".feature",
        input: "La spec y sus requisitos. Con un código J, el journey y las specs que atraviesa.",
        task: "Escribe un archivo .feature por historia, con un escenario por requisito. El título del escenario cita su requisito: [R1].",
        result: "specs/S1-schedule-launch/US1-<slug>.feature",
      },
      {
        gate: true,
        name: "Aprobar los escenarios",
        out: "tu decisión",
        input: "Los escenarios Given / When / Then.",
        task: "Comprueba que cada requisito tiene su escenario y que cada Then dice lo que pide su requisito.",
        result: "Si apruebas, el agente escribe las pruebas. Si no, corrige los escenarios.",
      },
      {
        name: "implement-test",
        out: ".test.ts",
        input: "Los escenarios aprobados.",
        task: "Escribe las pruebas con localizadores, aserciones, Page Objects y datos de prueba separados.",
        result: "e2e/tests/S1-<slug>/US1-<slug>.test.ts",
      },
      {
        name: "fix-test",
        out: "tabla de cambios",
        input: "Las pruebas nuevas.",
        task: "Corrige las pruebas que no cumplen las reglas e2e E1–E8. Ajusta cada esperado a su requisito. Añade la prueba que falte. No debilita aserciones.",
        result: "Pruebas corregidas y una tabla con cada cambio.",
      },
    ],
  },
  {
    id: "bugs-hunter",
    family: "bugs",
    role: "Juzga",
    summary: "Ejecuta la suite, decide dónde está cada fallo y lo corrige en una sola pasada.",
    start: "Una spec y toda la suite de pruebas",
    end: "Una ejecución nueva que dice qué queda",
    steps: [
      {
        name: "detect-bugs",
        out: "e2e-report.md",
        input: "La spec y toda la suite.",
        task: "Ejecuta las pruebas. Recoge cada fallo, también las regresiones de otras specs, con sus evidencias.",
        result: "e2e-report.md y la carpeta e2e-evidence/",
      },
      {
        name: "triage-bugs",
        out: "veredicto",
        input: "El informe e2e-report.md y sus evidencias.",
        task: "Compara hipótesis para cada fallo. Decide su origen: la aplicación, la prueba o el entorno. Cita la evidencia de cada decisión.",
        result: "Un veredicto por fallo. Si lo apruebas, la spec de corrección fix.spec.md.",
      },
      {
        gate: true,
        name: "Aprobar el veredicto",
        out: "tu decisión",
        input: "El veredicto y las citas de evidencia.",
        task: "Comprueba que cada cita dice lo que el agente afirma.",
        result: "Si apruebas, el agente escribe fix.spec.md y el pipeline sigue.",
      },
      {
        name: "fix-bugs",
        out: "diff",
        input: "La spec de corrección fix.spec.md.",
        task: "Aplica la corrección. Si un cambio sale del alcance de fix.spec.md, para y pregunta.",
        result: "Un diff con la corrección, listo para revisar.",
      },
      {
        name: "detect-bugs",
        out: "informe nuevo",
        input: "La suite con la corrección.",
        task: "Ejecuta otra vez toda la suite, una sola vez. No repite el ciclo.",
        result: "Un e2e-report.md nuevo. Si hay fallos nuevos, los informa y para.",
      },
    ],
  },
];

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const STEP_MS = reduceMotion ? 150 : 1100;
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (key === "class") node.className = value;
    else if (key === "text") node.textContent = value;
    else node.setAttribute(key, value);
  }
  for (const child of [].concat(children)) node.append(child);
  return node;
}

function renderDetail(panel, step) {
  panel.classList.toggle("is-gate", Boolean(step.gate));
  const labels = step.gate
    ? ["Qué ves", "Qué compruebas", "Qué pasa después"]
    : ["Entrada", "Tarea", "Resultado"];
  panel.replaceChildren(
    el("h4", { text: step.gate ? `🧑 ${step.name}` : step.name }),
    el("div", { class: "cols" }, [
      el("div", { class: "col" }, [el("small", { text: labels[0] }), el("p", { text: step.input })]),
      el("div", { class: "col" }, [el("small", { text: labels[1] }), el("p", { text: step.task })]),
      el("div", { class: "col out" }, [el("small", { text: labels[2] }), el("p", { text: step.result })]),
    ]),
  );
}

function renderPipeline(pipeline) {
  const nodes = [];
  const links = [];
  const track = el("div", { class: "track", role: "list" });

  pipeline.steps.forEach((step, index) => {
    if (index > 0) {
      const link = el("span", { class: "link", "aria-hidden": "true" });
      links.push(link);
      track.append(link);
    }
    const content = step.gate
      ? [el("span", { class: "node-icon", text: "🧑" }), el("span", { class: "node-name", text: "Pausa" }), el("span", { class: "node-out", text: step.name.replace("Aprobar ", "aprobar ") })]
      : [el("span", { class: "node-name", text: step.name }), el("span", { class: "node-out", text: step.out })];
    const node = el("button", { class: step.gate ? "node gate" : "node", type: "button", role: "listitem", "aria-label": step.name }, content);
    node.addEventListener("click", () => select(index));
    nodes.push(node);
    track.append(node);
  });

  const panel = el("div", { class: "detail", "aria-live": "polite" });
  const runBtn = el("button", { class: "btn", type: "button", text: "▶ Ver el recorrido" });
  const approveBtn = el("button", { class: "btn approve", type: "button", text: "✓ Aprobar y seguir" });
  approveBtn.hidden = true;
  const status = el("span", { class: "status" });

  function select(index) {
    nodes.forEach((node, i) => node.classList.toggle("selected", i === index));
    renderDetail(panel, pipeline.steps[index]);
  }

  function reset() {
    nodes.forEach((node) => node.classList.remove("active", "done", "waiting"));
    links.forEach((link) => link.classList.remove("done"));
  }

  function waitForApproval() {
    return new Promise((resolve) => {
      approveBtn.hidden = false;
      approveBtn.focus({ preventScroll: true });
      approveBtn.addEventListener("click", () => {
        approveBtn.hidden = true;
        resolve();
      }, { once: true });
    });
  }

  async function run() {
    runBtn.disabled = true;
    reset();
    for (let i = 0; i < nodes.length; i++) {
      const step = pipeline.steps[i];
      if (i > 0) {
        links[i - 1].classList.add("done");
        await wait(STEP_MS / 2);
      }
      select(i);
      if (step.gate) {
        nodes[i].classList.add("waiting");
        status.textContent = "El pipeline para. Revisa el resultado y decide.";
        await waitForApproval();
        nodes[i].classList.remove("waiting");
      } else {
        nodes[i].classList.add("active");
        status.textContent = `El agente ejecuta ${step.name}…`;
        await wait(STEP_MS);
        nodes[i].classList.remove("active");
      }
      nodes[i].classList.add("done");
    }
    status.textContent = `Terminado: ${pipeline.end.toLowerCase()}.`;
    runBtn.textContent = "↺ Repetir";
    runBtn.disabled = false;
  }

  runBtn.addEventListener("click", run);
  select(0);

  return el("article", { class: `card pipeline reveal ${pipeline.family}`, id: pipeline.id }, [
    el("div", { class: "pipe-head" }, [
      el("h3", {}, [pipeline.id, el("span", { class: "role", text: pipeline.role })]),
      el("div", { class: "controls" }, [runBtn, approveBtn]),
    ]),
    el("p", { class: "pipe-summary", text: pipeline.summary }),
    el("div", { class: "ends" }, [
      el("span", {}, ["Entra: ", el("b", { text: pipeline.start })]),
      el("span", {}, ["Sale: ", el("b", { text: pipeline.end })]),
    ]),
    track,
    status,
    panel,
  ]);
}

document.getElementById("pipelines").append(...PIPELINES.map(renderPipeline));

// Animación de entrada al hacer scroll
const observer = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  }
}, { threshold: 0.12 });
document.querySelectorAll(".reveal").forEach((node) => observer.observe(node));
