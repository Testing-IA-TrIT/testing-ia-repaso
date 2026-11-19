// Datos y comportamiento de la página de skills.
// Cada pipeline tiene una lista de pasos. Un paso es una skill primitiva o una pausa humana (gate).

const PIPELINES = [
  {
    id: "spec-builder",
    family: "spec",
    role: "Construye",
    summary: "De una petición a una spec aprobada, y de la spec al código.",
    start: "Una petición: «Quiero programar lanzamientos de cohetes»",
    end: "La funcionalidad implementada según la spec",
    steps: [
      {
        name: "define-spec",
        out: "spec.md",
        input: "La petición del usuario: objetivo y límites.",
        task: "Escribe la spec: problema, historias US1…US3, reglas y requisitos R1…R9 en EARS.",
        result: "specs/S1-schedule-launch/spec.md",
      },
      {
        gate: true,
        name: "Aprobar la spec",
        out: "tu decisión",
        input: "La spec del agente.",
        task: "Comprueba que cada requisito es concreto y verificable. Revisa qué queda fuera.",
        result: "Si apruebas, el pipeline sigue. Si no, el agente corrige la spec.",
      },
      {
        name: "implement-spec",
        out: "código",
        input: "La spec aprobada.",
        task: "Implementa la spec en la aplicación.",
        result: "Los cambios de código de la funcionalidad.",
      },
    ],
  },
  {
    id: "test-builder",
    family: "test",
    role: "Prueba",
    summary: "De los requisitos de una spec, o los pasos de un journey, a pruebas de Playwright.",
    start: "El código de una spec (S1) o de un journey (J1)",
    end: "Una prueba por escenario",
    steps: [
      {
        name: "define-test",
        out: ".feature",
        input: "La spec y sus requisitos. Con un código J, el journey y sus specs.",
        task: "Escribe un .feature por historia y un escenario por requisito. El título cita el requisito: [R1].",
        result: "specs/S1-schedule-launch/US1-<slug>.feature",
      },
      {
        gate: true,
        name: "Aprobar los escenarios",
        out: "tu decisión",
        input: "Los escenarios Given / When / Then.",
        task: "Comprueba que cada requisito tiene escenario. Comprueba que cada Then dice lo que pide el requisito.",
        result: "Si apruebas, el agente escribe las pruebas. Si no, corrige los escenarios.",
      },
      {
        name: "implement-test",
        out: ".test.ts",
        input: "Los escenarios aprobados.",
        task: "Escribe las pruebas: localizadores, aserciones, Page Objects y datos separados.",
        result: "e2e/tests/S1-<slug>/US1-<slug>.test.ts",
      },
      {
        name: "fix-test",
        out: "tabla de cambios",
        input: "Las pruebas nuevas.",
        task: "Corrige lo que incumple las reglas E1–E8. Ajusta cada esperado a su requisito. Añade las pruebas que faltan. No debilita aserciones.",
        result: "Pruebas corregidas y una tabla con cada cambio.",
      },
    ],
  },
  {
    id: "bugs-hunter",
    family: "bugs",
    role: "Juzga",
    summary: "Ejecuta la suite, decide el origen de cada fallo y lo corrige en una pasada.",
    start: "Una spec y toda la suite de pruebas",
    end: "Una ejecución nueva que dice qué queda",
    steps: [
      {
        name: "detect-bugs",
        out: "e2e-report.md",
        input: "La spec y toda la suite.",
        task: "Ejecuta las pruebas. Recoge cada fallo y sus evidencias, también las regresiones.",
        result: "e2e-report.md y la carpeta e2e-evidence/",
      },
      {
        name: "triage-bugs",
        out: "veredicto",
        input: "El informe e2e-report.md y sus evidencias.",
        task: "Compara hipótesis para cada fallo. Decide el origen: aplicación, prueba o entorno. Cita la evidencia.",
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
        task: "Aplica la corrección. Si algo sale de fix.spec.md, para y pregunta.",
        result: "Un diff con la corrección, listo para revisar.",
      },
      {
        name: "detect-bugs",
        out: "informe nuevo",
        input: "La suite con la corrección.",
        task: "Ejecuta toda la suite una vez más. No repite el ciclo.",
        result: "Un e2e-report.md nuevo. Si hay fallos nuevos, los lista y para.",
      },
    ],
  },
];

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const STEP_MS = reduceMotion ? 150 : 1100;
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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

// Hilo de artefactos: una fila por archivo, en el carril del pipeline que lo escribe.
// "sep" marca el paso a otro pipeline: una conversación nueva que solo lee archivos.
const FLOW = [
  { lane: "spec", name: "petición", plain: true, by: "tú",
    what: "Lo que quieres conseguir, escrito en el chat.", to: ["define-spec"] },
  { lane: "spec", name: "spec.md", path: "specs/S1-<slug>/spec.md", by: "define-spec",
    what: "Qué debe hacer la aplicación: historias, reglas y requisitos EARS.",
    gate: "Apruebas la spec", to: ["implement-spec", "define-test", "detect-bugs", "triage-bugs"] },
  { lane: "spec", name: "código", by: "implement-spec",
    what: "Los cambios en la aplicación.", to: ["detect-bugs"] },
  { sep: "test", reads: "spec.md y el código" },
  { lane: "test", name: ".feature", path: "specs/S1-<slug>/US1-<slug>.feature", by: "define-test",
    what: "Un escenario Given / When / Then por requisito.",
    gate: "Apruebas los escenarios", to: ["implement-test"] },
  { lane: "test", name: ".test.ts", path: "e2e/tests/S1-<slug>/US1-<slug>.test.ts", by: "implement-test · fix-test",
    what: "Las pruebas de Playwright. fix-test las corrige y deja una tabla de cambios.", to: ["detect-bugs"] },
  { sep: "bugs", reads: "spec.md y toda la suite" },
  { lane: "bugs", name: "e2e-report.md", path: "+ carpeta e2e-evidence/", by: "detect-bugs",
    what: "Cada fallo con sus evidencias, también las regresiones.", to: ["triage-bugs"] },
  { lane: "bugs", name: "fix.spec.md", by: "triage-bugs",
    what: "La causa y la corrección de cada fallo.",
    gate: "Antes, apruebas el veredicto", to: ["fix-bugs"] },
  { lane: "bugs", name: "diff", by: "fix-bugs",
    what: "La corrección, lista para revisar.", to: ["detect-bugs"] },
  { lane: "bugs", name: "informe nuevo", path: "e2e-report.md", by: "detect-bugs",
    what: "Una ejecución más de toda la suite. Dice qué queda.", to: ["tú"] },
];

const LANES = PIPELINES.map((p) => ({ id: p.family, name: p.id, role: p.role }));
const familyOf = Object.fromEntries(PIPELINES.flatMap((p) => p.steps.filter((s) => !s.gate).map((s) => [s.name, p.family])));

function renderFlow() {
  const root = document.getElementById("flow");
  root.append(el("div", { class: "flow-row flow-head" }, [
    el("span"),
    ...LANES.map((l) => el("span", { class: l.id }, [l.name, el("small", { text: l.role })])),
  ]));
  let n = 0;
  for (const item of FLOW) {
    if (item.sep) {
      const lane = LANES.find((l) => l.id === item.sep);
      root.append(el("div", { class: `flow-sep ${item.sep}` }, [
        el("span", { text: `↻ Conversación nueva · ${lane.name} lee ${item.reads}` }),
      ]));
      continue;
    }
    n++;
    const card = el("article", { class: `fa ${item.plain ? "plain" : item.lane}` }, [
      el("div", { class: "fa-head" }, [
        el("code", { class: "fa-name", text: item.name }),
        el("span", { class: "fa-by", text: item.by }),
      ]),
      item.path ? el("div", { class: "fa-path", text: item.path }) : null,
      el("p", { class: "fa-what", text: item.what }),
      item.gate ? el("p", { class: "fa-gate", text: `🧑 ${item.gate}` }) : null,
      el("div", { class: "fa-to" }, [
        el("small", { text: "Lo usa →" }),
        ...item.to.map((name) => el("span", { class: `fa-chip ${familyOf[name] || "you"}`, text: name })),
      ]),
    ]);
    root.append(el("div", { class: `flow-row ${item.lane}` }, [
      el("span", { class: "flow-n", text: String(n) }),
      ...LANES.map((l) => (l.id === item.lane ? card : el("span", { class: "lane" }))),
    ]));
  }
}

renderFlow();

// Animación de entrada al hacer scroll (assets/site.js)
revealOnScroll(0.12);
