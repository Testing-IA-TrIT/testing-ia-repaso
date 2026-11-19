// Datos y comportamiento del glosario.
// Cada término tiene un grupo, una definición y términos relacionados (por id).

const GROUPS = {
  analisis: { name: "Análisis", color: "var(--spec)" },
  escenarios: { name: "Escenarios", color: "#f472b6" },
  pruebas: { name: "Pruebas", color: "var(--test)" },
  agentes: { name: "Agentes", color: "var(--ok)" },
  diagnostico: { name: "Diagnóstico", color: "var(--bugs)" },
};

// Página de cada término: texto del enlace y destino.
const PAGES = {
  skills: { label: "skills", href: "skills.html" },
  specs: { label: "specs", href: "specs.html" },
  journeys: { label: "specs · journeys", href: "specs.html#journeys" },
};

const TERMS = [
  // Análisis
  { id: "spec", group: "analisis", term: "Spec", en: "Specification", code: "S1 · spec.md", page: "specs",
    def: "Documento que describe una funcionalidad. Dice qué hace la aplicación, no cómo se prueba. Tiene un id y un slug. Incluye el problema, las historias, las reglas, la solución, los requisitos y lo que queda fuera.",
    not: "El sufijo .spec.ts de Playwright. En el curso, las pruebas usan .test.ts.",
    rel: ["story", "req", "trace"] },
  { id: "story", group: "analisis", term: "Historia de usuario", en: "User story", code: "US1", page: "specs",
    def: "Necesidad de un usuario: «Como operador, quiero… para…». Una spec tiene de 1 a 3 historias. Cada historia tiene un archivo .feature.",
    rel: ["spec", "req", "feature"] },
  { id: "req", group: "analisis", term: "Requisito", en: "Requirement", code: "R1 (US1) · S1-R1", page: "specs",
    def: "Criterio verificable, escrito con EARS. Pertenece a una historia: R1 (US1). Una spec tiene de 1 a 9 requisitos. Fuera de su spec, lleva el id delante: S1-R1.",
    not: "Una regla de negocio. La regla da contexto. Solo se prueba si un requisito la recoge.",
    rel: ["ears", "scenario", "tag", "rule"] },
  { id: "ears", group: "analisis", term: "EARS", en: "Easy Approach to Requirements Syntax", code: "Cuando…, el sistema debe…",
    def: "Plantilla para escribir requisitos verificables: una condición y la respuesta del sistema. Ejemplo: «Si la fecha está en el pasado, el sistema debe rechazar el lanzamiento».",
    rel: ["req"] },
  { id: "rule", group: "analisis", term: "Regla", en: "Business rule", code: "sin código",
    def: "Restricción del negocio. Ejemplo: «un cohete no puede tener dos lanzamientos a la vez». No tiene código ni prueba. Para probarla, escríbela también como requisito.",
    rel: ["req", "spec"] },
  { id: "journey", group: "analisis", term: "Journey", en: "User journey", code: "J1", page: "journeys",
    def: "Objetivo completo de un usuario, a través de varias specs. No añade reglas: cada paso cita un criterio que ya existe. Tiene un .feature y no tiene spec.md. Empieza sin sesión y usa solo la UI.",
    rel: ["step", "spec", "session"] },

  // Escenarios
  { id: "gherkin", group: "escenarios", term: "Gherkin", en: "Gherkin", code: "Feature · Scenario",
    def: "Lenguaje para escribir ejemplos de comportamiento. Usa palabras clave en inglés: Feature, Scenario, Given, When, Then. Lo leen personas y agentes.",
    rel: ["feature", "gwt"] },
  { id: "feature", group: "escenarios", term: "Feature", en: "Feature file", code: "US1-<slug>.feature", page: "specs",
    def: "Archivo Gherkin de una historia. Tiene un escenario por requisito. Está en la carpeta de la spec.",
    not: "Un nivel más del análisis. En el curso, un Feature es una historia.",
    rel: ["story", "scenario", "gherkin"] },
  { id: "scenario", group: "escenarios", term: "Escenario", en: "Scenario", code: "Scenario: [R1] …", page: "specs",
    def: "Ejemplo concreto de un requisito. Hay un escenario por requisito. Su título cita el código: [R1].",
    rel: ["req", "test", "outline", "gwt"] },
  { id: "outline", group: "escenarios", term: "Scenario Outline", en: "Scenario Outline", code: "Examples",
    def: "Escenario con una tabla Examples. Sirve cuando un requisito necesita varios ejemplos. Cada fila genera un test con la misma etiqueta.",
    rel: ["scenario", "test", "tag"] },
  { id: "gwt", group: "escenarios", term: "Given / When / Then", en: "Steps", code: "Given · When · Then",
    def: "Los pasos de un escenario: estado inicial, acción y resultado esperado. En la prueba son los datos, las acciones y el expect.",
    rel: ["scenario", "assertion", "data"] },

  // Pruebas
  { id: "e2e", group: "pruebas", term: "Prueba e2e", en: "End-to-end test", code: "e2e/tests/",
    def: "Prueba que usa la aplicación como un usuario: en el navegador, de principio a fin. La web es una caja negra. La prueba ve la interfaz, no el código.",
    rel: ["test", "locator", "suite"] },
  { id: "test", group: "pruebas", term: "Test", en: "Test", code: "test('[R1] …')", page: "specs",
    def: "Código de Playwright que comprueba un escenario. Su título empieza por el código del requisito y lleva su etiqueta. Hay un archivo .test.ts por historia.",
    rel: ["scenario", "describe", "tag", "assertion"] },
  { id: "describe", group: "pruebas", term: "test.describe", en: "Test group", code: "test.describe('[US1] …')",
    def: "Grupo con los tests de una historia. Lleva las etiquetas de la spec y de la historia: @S1 y @S1-US1. Sus tests las heredan.",
    rel: ["test", "story", "tag"] },
  { id: "step", group: "pruebas", term: "test.step", en: "Test step", code: "test.step('[S3-R1] …')", page: "journeys",
    def: "Paso con nombre dentro de un test. En un journey, cada paso es un test.step. Su título cita el criterio. Termina con un expect.",
    rel: ["journey", "test", "assertion"] },
  { id: "tag", group: "pruebas", term: "Etiqueta", en: "Tag", code: "@S1-R1", page: "specs",
    def: "Marca para elegir qué tests ejecutar: --grep '@S1-R1'. Siempre lleva delante el id de la spec, porque US1 y R1 se repiten en todas.",
    rel: ["test", "suite", "trace"] },
  { id: "suite", group: "pruebas", term: "Suite", en: "Test suite", code: "npm run test:e2e",
    def: "Todas las pruebas e2e del proyecto. Ejecútala después de cada cambio: así encuentras regresiones en otras specs.",
    rel: ["test", "tag", "regression"] },
  { id: "locator", group: "pruebas", term: "Localizador", en: "Locator", code: "getByRole(…)",
    def: "Forma de encontrar un elemento como lo ve el usuario: por rol, etiqueta o texto. Es más estable que un selector CSS.",
    rel: ["po", "assertion", "e2e"] },
  { id: "assertion", group: "pruebas", term: "Aserción", en: "Assertion", code: "expect(…)",
    def: "Comprueba el resultado esperado. Aquí la prueba pasa o falla. Es el Then del escenario.",
    rel: ["gwt", "locator", "test"] },
  { id: "po", group: "pruebas", term: "Page Object", en: "Page Object", code: "RocketsPage",
    def: "Clase con los localizadores y las acciones de una página. Las pruebas la reutilizan. Así no repiten detalles de la interfaz.",
    rel: ["locator", "test"] },
  { id: "data", group: "pruebas", term: "Datos de prueba", en: "Test data", code: "semilla · datos únicos",
    def: "Entradas y resultados esperados, fuera del código de la prueba. La semilla da un estado conocido. Los datos únicos evitan que una prueba dependa de otra.",
    rel: ["gwt", "test"] },
  { id: "session", group: "pruebas", term: "Sesión guardada", en: "storageState", code: "storageState",
    def: "Cookies y localStorage que Playwright guarda después de entrar una vez. Las pruebas de spec la reutilizan. Un journey empieza sin ella.",
    rel: ["journey", "test"] },

  // Agentes
  { id: "skill", group: "agentes", term: "Skill primitiva", en: "Skill", code: "define-test", page: "skills",
    def: "Carpeta con un SKILL.md. Hace una sola tarea y entrega un resultado que puedes revisar. Nombre: verbo-objeto.",
    rel: ["pipeline", "gate"] },
  { id: "pipeline", group: "agentes", term: "Pipeline", en: "Pipeline", code: "test-builder", page: "skills",
    def: "Skill que llama a skills primitivas en orden. Para cuando necesita tu aprobación. Nombre: objeto-rol. Empieza en una conversación nueva.",
    rel: ["skill", "gate"] },
  { id: "gate", group: "agentes", term: "Pausa humana", en: "Human approval", code: "🧑", page: "skills",
    def: "Punto donde el pipeline para y espera tu decisión: aprobar la spec, los escenarios o el veredicto. Si no apruebas, pides cambios.",
    rel: ["pipeline", "triage"] },

  // Diagnóstico
  { id: "report", group: "diagnostico", term: "Informe", en: "Report", code: "e2e-report.md",
    def: "Resultado de ejecutar las pruebas de una spec o de un journey. Lista cada fallo, también las regresiones. Las evidencias están en e2e-evidence/.",
    rel: ["triage", "regression", "suite"] },
  { id: "regression", group: "diagnostico", term: "Regresión", en: "Regression", code: "Regressions",
    def: "Prueba que pasaba y falla después de un cambio, a menudo de otra spec. El informe la lista en Regressions.",
    rel: ["suite", "report"] },
  { id: "triage", group: "diagnostico", term: "Triage", en: "Triage", code: "triage-bugs",
    def: "Decide el origen de cada fallo: la aplicación, la prueba o el entorno. Compara hipótesis. Cita la evidencia de cada decisión.",
    rel: ["report", "fix", "gate"] },
  { id: "fix", group: "diagnostico", term: "Spec de corrección", en: "Fix spec", code: "fix.spec.md",
    def: "Documento con la causa y la corrección de los fallos. Se escribe después de aprobar el veredicto del triage. La skill fix-bugs lo aplica.",
    rel: ["triage", "spec"] },
  { id: "trace", group: "diagnostico", term: "Trazabilidad", en: "Traceability", code: "R1 → [R1] → @S1-R1", page: "specs",
    def: "Ir de un requisito a su prueba, y de un fallo a su requisito. Funciona porque todos los niveles usan el mismo código.",
    rel: ["req", "tag", "scenario"] },
];

const byId = Object.fromEntries(TERMS.map((t) => [t.id, t]));
const grid = document.getElementById("terms");
const search = document.getElementById("search");
const filters = document.getElementById("filters");
const count = document.getElementById("count");
let group = "all";

function renderFilters() {
  const make = (id, name, color) => {
    const b = el("button", { class: "filter", type: "button", "aria-pressed": String(group === id), style: color ? `--c:${color}` : "" }, name);
    b.addEventListener("click", () => { group = id; renderFilters(); apply(); });
    return b;
  };
  filters.replaceChildren(make("all", "Todos"), ...Object.entries(GROUPS).map(([id, g]) => make(id, g.name, g.color)));
}

function renderTerms() {
  for (const t of TERMS) {
    const g = GROUPS[t.group];
    const rel = el("div", { class: "rel" }, [el("small", { text: "Relacionados" }),
      ...t.rel.map((id) => {
        const b = el("button", { class: "rel-chip", type: "button", style: `--c:${GROUPS[byId[id].group].color}` }, byId[id].term);
        b.addEventListener("click", () => jump(id));
        return b;
      })]);
    const card = el("article", { class: "term", id: t.id, style: `--c:${g.color}`, "data-group": t.group }, [
      el("div", { class: "term-head" }, [
        el("h3", { text: t.term }),
        el("span", { class: "grp", text: g.name }),
      ]),
      t.en !== t.term ? el("p", { class: "en", text: t.en }) : null,
      el("code", { class: "term-code", text: t.code }),
      el("p", { class: "def", text: t.def }),
      t.not ? el("p", { class: "not" }, [el("b", { text: "No confundir con: " }), t.not]) : null,
      rel,
      t.page ? el("a", { class: "go", href: PAGES[t.page].href, text: `Ver en ${PAGES[t.page].label} →` }) : null,
    ]);
    t.node = card;
    t.text = `${t.term} ${t.en} ${t.code} ${t.def}`.toLowerCase();
    grid.append(card);
  }
}

function apply() {
  const q = search.value.trim().toLowerCase();
  let shown = 0;
  for (const t of TERMS) {
    const ok = (group === "all" || t.group === group) && (!q || t.text.includes(q));
    t.node.hidden = !ok;
    if (ok) shown++;
  }
  count.textContent = `${shown} de ${TERMS.length} términos`;
}

function jump(id) {
  const t = byId[id];
  if (!t) return;
  if (t.node.hidden) { search.value = ""; group = "all"; renderFilters(); apply(); }
  t.node.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center" });
  t.node.classList.remove("flash");
  void t.node.offsetWidth; // reinicia la animación
  t.node.classList.add("flash");
  history.replaceState(null, "", `#${id}`);
}

renderFilters();
renderTerms();
apply();
search.addEventListener("input", apply);
document.querySelectorAll("[data-jump]").forEach((b) => b.addEventListener("click", () => jump(b.dataset.jump)));
if (location.hash) setTimeout(() => jump(location.hash.slice(1)), 100);
