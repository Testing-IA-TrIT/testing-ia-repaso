// Datos y comportamiento de la página de specs.
// Una spec de ejemplo con dos historias y cinco requisitos. Los códigos son genéricos.

const SPEC = {
  id: "S1",
  slug: "schedule-launch",
  title: "Programar lanzamientos",
  stories: [
    {
      code: "US1",
      slug: "schedule-a-launch",
      title: "Programar un lanzamiento",
      story: "Como operador, quiero programar el lanzamiento de un cohete para ofrecer plazas a los pasajeros.",
      reqs: [
        {
          code: "R1",
          ears: "Cuando el operador programa un lanzamiento con una fecha futura, el sistema debe guardarlo con el estado «programado».",
          scenario: "Programar un lanzamiento con fecha futura",
          given: "un cohete disponible",
          when: "el operador programa un lanzamiento para dentro de 30 días",
          then: "el lanzamiento aparece con el estado «programado»",
          tests: ["programa un lanzamiento con fecha futura"],
        },
        {
          code: "R2",
          ears: "Si la fecha del lanzamiento está en el pasado, entonces el sistema debe rechazarlo con un mensaje de error.",
          scenario: "Rechazar una fecha pasada",
          given: "un cohete disponible",
          when: "el operador programa un lanzamiento para ayer",
          then: "el sistema muestra «La fecha debe ser futura»",
          tests: ["rechaza una fecha pasada"],
        },
        {
          code: "R3",
          ears: "Si el cohete ya tiene un lanzamiento en esa fecha, entonces el sistema debe rechazar el lanzamiento nuevo.",
          scenario: "Rechazar dos lanzamientos a la vez",
          given: "un cohete con un lanzamiento el día 10",
          when: "el operador programa otro lanzamiento el día 10",
          then: "el sistema rechaza el lanzamiento nuevo",
          tests: ["rechaza dos lanzamientos a la vez"],
        },
      ],
    },
    {
      code: "US2",
      slug: "cancel-a-launch",
      title: "Cancelar un lanzamiento",
      story: "Como operador, quiero cancelar un lanzamiento programado para avisar a tiempo a los pasajeros.",
      reqs: [
        {
          code: "R4",
          ears: "Cuando el operador cancela un lanzamiento programado, el sistema debe cambiar su estado a «cancelado».",
          scenario: "Cancelar un lanzamiento programado",
          given: "un lanzamiento programado",
          when: "el operador lo cancela",
          then: "el lanzamiento aparece con el estado «cancelado»",
          tests: ["cancela un lanzamiento programado"],
        },
        {
          code: "R5",
          ears: "Si el lanzamiento no está programado, entonces el sistema debe rechazar la cancelación.",
          scenario: "Rechazar la cancelación de un lanzamiento no programado",
          outline: true,
          given: "un lanzamiento con el estado <estado>",
          when: "el operador intenta cancelarlo",
          then: "el sistema rechaza la cancelación",
          examples: ["«lanzado»", "«cancelado»"],
          tests: ["rechaza la cancelación · lanzado", "rechaza la cancelación · cancelado"],
        },
      ],
    },
  ],
};

const FAILING_REQ = "R2";

const map = document.getElementById("map");
const panel = document.getElementById("trace-panel");
const failBtn = document.getElementById("fail-btn");
const allBtn = document.getElementById("all-btn");
const svgNS = "http://www.w3.org/2000/svg";

const allReqs = SPEC.stories.flatMap((s) => s.reqs.map((r) => ({ ...r, story: s.code })));
const testCount = (reqs) => reqs.reduce((n, r) => n + r.tests.length, 0);

let failing = false;
let current = null;

// Un elemento que se puede seleccionar. `trace` dice a qué nivel y código pertenece.
function tr(trace, children, extra = "") {
  const node = el("button", { type: "button", class: `tr ${extra}`.trim(), data: trace }, children);
  const pick = () => select(trace);
  node.addEventListener("mouseenter", pick);
  node.addEventListener("focus", pick);
  node.addEventListener("click", pick);
  return node;
}

function code(text) { return el("span", { class: "code", text }); }
function txt(text) { return el("span", { class: "txt", text }); }
function sub(text) { return el("span", { class: "sub", text }); }

function render() {
  const wires = document.createElementNS(svgNS, "svg");
  wires.setAttribute("class", "wires");
  wires.setAttribute("aria-hidden", "true");

  // Columna 1: spec.md
  const colSpec = el("div", { class: "col lvl-spec" }, [
    el("p", { class: "col-head" }, ["Análisis · ", el("code", { text: "spec.md" })]),
  ]);
  const specFile = el("div", { class: "file" }, [
    el("div", { class: "file-name", text: `specs/${SPEC.id}-${SPEC.slug}/spec.md` }),
    tr({ level: "spec" }, [code(SPEC.id), txt(SPEC.title)], "head"),
  ]);
  for (const s of SPEC.stories) {
    specFile.append(tr({ level: "story", story: s.code }, [code(s.code), txt(s.title), sub(s.story)]));
    for (const r of s.reqs) {
      specFile.append(tr({ level: "req", story: s.code, req: r.code, side: "spec" }, [code(`${r.code} (${s.code})`), sub(r.ears)]));
    }
  }
  colSpec.append(specFile);

  // Columna 2: archivos .feature
  const colFeat = el("div", { class: "col lvl-spec" }, [
    el("p", { class: "col-head" }, ["Escenarios · ", el("code", { text: ".feature" })]),
  ]);
  for (const s of SPEC.stories) {
    const file = el("div", { class: "file" }, [
      el("div", { class: "file-name", text: `specs/${SPEC.id}-${SPEC.slug}/${s.code}-${s.slug}.feature` }),
      tr({ level: "story", story: s.code }, [txt(`Feature: [${s.code}] ${s.title}`)], "head"),
    ]);
    for (const r of s.reqs) {
      const keyword = r.outline ? "Scenario Outline" : "Scenario";
      const steps = el("span", { class: "gwt" }, [
        el("span", {}, [el("b", { text: "Given" }), r.given]),
        el("span", {}, [el("b", { text: "When" }), r.when]),
        el("span", {}, [el("b", { text: "Then" }), r.then]),
      ]);
      const examples = r.examples
        ? el("span", { class: "examples" }, ["Examples: ", ...r.examples.map((e) => el("span", { text: e }))])
        : null;
      file.append(tr({ level: "req", story: s.code, req: r.code, side: "feature" }, [
        el("span", { class: "sub", text: keyword }), code(`[${r.code}]`), txt(r.scenario), steps, examples,
      ]));
    }
    colFeat.append(file);
  }

  // Columna 3: archivos .test.ts
  const colTest = el("div", { class: "col lvl-test" }, [
    el("p", { class: "col-head" }, ["Pruebas · ", el("code", { text: ".test.ts" })]),
  ]);
  for (const s of SPEC.stories) {
    const file = el("div", { class: "file" }, [
      el("div", { class: "file-name", text: `e2e/tests/${SPEC.id}-${SPEC.slug}/${s.code}-${s.slug}.test.ts` }),
      tr({ level: "story", story: s.code }, [
        txt(`test.describe('[${s.code}] ${s.title}')`),
        el("span", { class: "sub" }, [el("span", { class: "tag", text: `@${SPEC.id} · @${SPEC.id}-${s.code}` })]),
      ], "head"),
    ]);
    for (const r of s.reqs) {
      r.tests.forEach((title, i) => {
        file.append(tr({ level: "req", story: s.code, req: r.code, side: "test", idx: String(i) }, [
          code(`[${r.code}]`), txt(`test('${title}')`),
          el("span", { class: "sub" }, [el("span", { class: "tag", text: `@${SPEC.id}-${r.code}` })]),
        ], "is-test"));
      });
    }
    colTest.append(file);
  }

  map.replaceChildren(wires, colSpec, colFeat, colTest);
}

// Líneas entre columnas: requisito → escenario → cada prueba.
function drawWires() {
  const wires = map.querySelector("svg.wires");
  if (!wires || getComputedStyle(wires).display === "none") return;
  const box = map.getBoundingClientRect();
  wires.setAttribute("viewBox", `0 0 ${box.width} ${box.height}`);
  wires.replaceChildren();

  const anchor = (node, side) => {
    const r = node.getBoundingClientRect();
    return { x: (side === "right" ? r.right : r.left) - box.left, y: r.top + Math.min(r.height / 2, 20) - box.top };
  };
  const curve = (a, b, req) => {
    const dx = (b.x - a.x) / 2;
    const path = document.createElementNS(svgNS, "path");
    path.setAttribute("d", `M${a.x},${a.y} C${a.x + dx},${a.y} ${b.x - dx},${b.y} ${b.x},${b.y}`);
    path.setAttribute("class", "wire");
    path.dataset.req = req;
    wires.append(path);
  };

  for (const r of allReqs) {
    const specEl = map.querySelector(`.tr[data-req="${r.code}"][data-side="spec"]`);
    const featEl = map.querySelector(`.tr[data-req="${r.code}"][data-side="feature"]`);
    curve(anchor(specEl, "right"), anchor(featEl, "left"), r.code);
    map.querySelectorAll(`.tr[data-req="${r.code}"][data-side="test"]`).forEach((testEl) => {
      curve(anchor(featEl, "right"), anchor(testEl, "left"), r.code);
    });
  }
  paint();
}

function matches(node, trace) {
  if (!trace) return false;
  if (trace.level === "spec") return true;
  if (trace.level === "story") return node.dataset.story === trace.story || node.dataset.level === "spec";
  // Requisito: su historia, su escenario, sus pruebas y la cabecera de la spec.
  return node.dataset.req === trace.req
    || (node.dataset.level === "story" && node.dataset.story === trace.story)
    || node.dataset.level === "spec";
}

function paint() {
  const bad = failing && current?.level === "req" && current.req === FAILING_REQ;
  map.classList.toggle("focus", Boolean(current));
  map.classList.toggle("bad", bad);
  map.querySelectorAll(".tr").forEach((node) => node.classList.toggle("on", matches(node, current)));
  map.querySelectorAll(".wire").forEach((wire) => {
    const req = allReqs.find((r) => r.code === wire.dataset.req);
    const on = current && (current.level === "spec"
      || (current.level === "story" && req.story === current.story)
      || (current.level === "req" && req.code === current.req));
    wire.classList.toggle("on", Boolean(on) && !bad);
    wire.classList.toggle("bad", Boolean(on) && bad);
  });
  map.querySelectorAll(`.tr.is-test[data-req="${FAILING_REQ}"]`).forEach((node) => node.classList.toggle("failed", failing));
}

function cmd(tag) { return el("span", { class: "cmd", text: `npx playwright test --grep '${tag}'` }); }

function renderPanel() {
  panel.classList.remove("bad");
  if (!current) return;

  if (current.level === "spec") {
    panel.replaceChildren(
      el("h4", { text: `Spec ${SPEC.id} · ${SPEC.slug}` }),
      el("p", { text: `${SPEC.stories.length} historias, ${allReqs.length} requisitos y ${testCount(allReqs)} pruebas. La carpeta ${SPEC.id}-${SPEC.slug}/ se llama igual en specs/ y en e2e/tests/.` }),
      cmd(`@${SPEC.id}`),
    );
    return;
  }

  if (current.level === "story") {
    const s = SPEC.stories.find((x) => x.code === current.story);
    panel.replaceChildren(
      el("h4", { text: `Historia ${s.code} · ${s.title}` }),
      el("p", { text: `Un .feature y un .test.ts con el mismo nombre: ${s.code}-${s.slug}. Dentro, un test.describe('[${s.code}] …'). ${s.reqs.length} requisitos y ${testCount(s.reqs)} pruebas.` }),
      cmd(`@${SPEC.id}-${s.code}`),
    );
    return;
  }

  const r = allReqs.find((x) => x.code === current.req);
  if (failing && r.code === FAILING_REQ) {
    panel.classList.add("bad");
    panel.replaceChildren(
      el("h4", { text: `✗ Falla la prueba @${SPEC.id}-${r.code}` }),
      el("p", { text: "Sigue la traza al revés, de la prueba al requisito:" }),
      el("ol", {}, [
        el("li", {}, ["Lee la etiqueta del test en el informe: ", el("code", { text: `@${SPEC.id}-${r.code}` }), "."]),
        el("li", {}, ["Busca ", el("code", { text: r.code }), " en spec.md. El criterio dice su historia: ", el("code", { text: `${r.code} (${r.story})` }), "."]),
        el("li", {}, ["Compara el resultado de la prueba con el criterio: «", r.ears, "»"]),
        el("li", {}, ["Decide si falla la aplicación, la prueba o el entorno. Esa decisión es el triage."]),
      ]),
      cmd(`@${SPEC.id}-${r.code}`),
    );
    return;
  }

  const n = r.tests.length;
  panel.replaceChildren(
    el("h4", { text: `Requisito ${r.code} (${r.story})` }),
    el("p", { text: r.ears }),
    el("div", { class: "cols" }, [
      el("div", { class: "col" }, [el("small", { text: `Given ${r.given}` }), el("p", { text: "Estado inicial y datos. El test prepara el sistema." })]),
      el("div", { class: "col" }, [el("small", { text: `When ${r.when}` }), el("p", { text: "Acciones del usuario, con localizadores: getByRole, getByLabel…" })]),
      el("div", { class: "col expect" }, [el("small", { text: `Then ${r.then}` }), el("p", { text: "El expect: comprueba lo que pide el requisito." })]),
    ]),
    el("p", { text: n > 1
      ? `Scenario Outline: ${n} pruebas, una por fila de Examples, con la misma etiqueta.`
      : "Un escenario, una prueba. Requisito, escenario y test comparten el código." }),
    cmd(`@${SPEC.id}-${r.code}`),
  );
}

function select(trace) {
  current = trace;
  paint();
  renderPanel();
}

failBtn.addEventListener("click", () => {
  failing = !failing;
  failBtn.setAttribute("aria-pressed", String(failing));
  failBtn.textContent = failing ? "✓ Quitar el fallo" : "✗ Simular un fallo";
  select(failing ? { level: "req", story: "US1", req: FAILING_REQ } : current);
});
allBtn.addEventListener("click", () => select({ level: "spec" }));

render();
select({ level: "req", story: "US2", req: "R5" });
new ResizeObserver(drawWires).observe(map);
window.addEventListener("load", drawWires);

// ===== Journey J1 (sección #journeys, antes journeys.html) =====
// El journey J1 cruza cuatro specs. Cada paso apunta a un criterio que ya existe.
// Va dentro de una función para no chocar con las variables de la página (panel, select…).
(function journeyDemo() {
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
      why: "El journey empieza sin sesión. Entrar es un paso, no una preparación.",
    },
    {
      spec: "S3", req: "R1",
      title: "Añadir un cohete",
      action: "Añade el cohete «Halcón-7f3a» (nombre único).",
      check: "El cohete nuevo aparece en la flota.",
      why: "El usuario crea sus datos. No usa el cohete de la semilla.",
    },
    {
      spec: "S1", req: "R1",
      title: "Programar un lanzamiento",
      action: "Programa un lanzamiento con ese cohete, para dentro de 30 días.",
      check: "El lanzamiento se guarda con ese cohete.",
      why: "Usa el resultado del paso anterior: el cohete recién creado.",
    },
    {
      spec: "S4", req: "R1",
      title: "Ver el lanzamiento",
      action: "Abre la lista de lanzamientos.",
      check: "El lanzamiento aparece con el estado «programado».",
      why: "El último paso comprueba el objetivo: los pasajeros ya pueden reservar.",
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
        el("div", { class: "col" }, [el("small", { text: "Criterio que ya existe" }), el("p", { text: `${codeOf(step)}, de la spec ${step.spec} · ${SPECS[step.spec].name}.` })]),
        el("div", { class: "col expect" }, [el("small", { text: "Comprobación al final del paso" }), el("p", { text: `${step.check}` })]),
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
        el("li", { text: "Todas las specs pasan. Sus pruebas usan el cohete de la semilla, no uno nuevo." }),
        el("li", {}, ["El paso que falla cita ", el("code", { text: step.spec }), ", pero ", el("code", { text: step.spec }), " no tiene la culpa. El código del paso es una pista, no un culpable."]),
        el("li", {}, ["El triage encuentra el origen: la página de lanzamientos usa una copia antigua de la flota. El fallo está entre ", el("code", { text: prev.spec }), " y ", el("code", { text: step.spec }), "."]),
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
    status.textContent = "Objetivo cumplido: los pasajeros pueden reservar.";
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
      ? "Un compañero cambia la página de lanzamientos: ahora reutiliza la flota guardada por la página de cohetes."
      : "Cambio retirado.";
    select(0);
  });

  renderMetro();
  renderBoard();
  select(0);
})();

// Animación de entrada al hacer scroll (assets/site.js)
revealOnScroll();
