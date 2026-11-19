// Datos y comportamiento de la página de buenas prácticas.

const GROUPS = {
  localizar: { name: "Localizar", color: "var(--spec)" },
  comprobar: { name: "Esperar y comprobar", color: "var(--test)" },
  organizar: { name: "Organizar", color: "#f472b6" },
  datos: { name: "Datos y estado", color: "var(--ok)" },
  ejecutar: { name: "Ejecutar y diagnosticar", color: "var(--bugs)" },
};

const PRACTICES = [
  { id: "locators", group: "localizar", title: "Localiza como el usuario", glossary: "locator",
    why: "El usuario encuentra un botón por su texto y su función, no por su clase CSS. Si la prueba hace lo mismo, resiste los cambios de diseño y comprueba la accesibilidad.",
    rule: "Orden: getByRole → getByLabel → getByText → getByTestId, solo si el atributo ya existe.",
    bad: "// depende de la estructura del HTML\nawait page.locator('form > div:nth-child(3) button.btn-primary').click();",
    good: "// rol y nombre accesible\nawait page.getByRole('button', { name: 'Save' }).click();" },

  { id: "observable", group: "comprobar", title: "Comprueba lo que ve el usuario", glossary: "assertion",
    why: "El requisito describe un resultado visible. Una URL correcta no demuestra que el lanzamiento aparece en la lista.",
    rule: "Comprueba el resultado que pide el requisito. No compruebes solo la URL.",
    bad: "await launches.scheduleLaunch(launch);\nawait expect(page).toHaveURL('/launches');",
    good: "await launches.scheduleLaunch(launch);\nawait expect(launches.rowFor(launch.name))\n  .toContainText('Scheduled');" },

  { id: "web-first", group: "comprobar", title: "Usa aserciones que reintentan", glossary: "assertion",
    why: "Una aserción web-first espera al resultado. Una espera fija sobra o se queda corta.",
    rule: "Usa await expect(locator).toBe…(). No uses waitForTimeout.",
    bad: "await page.waitForTimeout(2000);\nexpect(await page.getByText('Saved').isVisible()).toBe(true);",
    good: "// reintenta hasta que el texto aparece\nawait expect(page.getByText('Saved')).toBeVisible();" },

  { id: "await", group: "comprobar", title: "Pon await en cada acción y cada comprobación",
    why: "Sin await, la prueba no espera a la acción. Puede terminar en verde antes de comprobar nada.",
    rule: "Cada acción y cada expect empiezan con await.",
    bad: "page.getByRole('button', { name: 'Save' }).click();\nexpect(page.getByText('Saved')).toBeVisible();",
    good: "await page.getByRole('button', { name: 'Save' }).click();\nawait expect(page.getByText('Saved')).toBeVisible();" },

  { id: "strong", group: "comprobar", title: "No debilites una aserción para que pase",
    why: "Si la prueba falla, quizá falla la aplicación. Cambiar el esperado oculta el defecto. El esperado sale del requisito, no de la aplicación.",
    rule: "Si una aserción falla, haz triage. No la cambies por una más débil.",
    bad: "// antes: toHaveText('5 seats available')\nawait expect(launches.seats).toBeVisible();",
    good: "// el esperado sale del requisito\nawait expect(launches.seats).toHaveText('5 seats available');" },

  { id: "trace", group: "organizar", title: "Traza cada prueba a su requisito", glossary: "trace",
    why: "Si una prueba falla, llegas a su requisito. Si cambia un requisito, llegas a su prueba. Repetir el código en carpetas, títulos y etiquetas ayuda.",
    rule: "Un archivo por historia, un test.describe por historia y un test por escenario, con sus códigos y etiquetas.",
    bad: "test('schedule launch works', async ({ page }) => { … });",
    good: "test.describe('[US1] Schedule a launch', { tag: ['@S1', '@S1-US1'] }, () => {\n  test('[R1] Schedule a valid launch', { tag: '@S1-R1' }, async ({ page }) => { … });\n});" },

  { id: "page-objects", group: "organizar", title: "Usa Page Objects", glossary: "po",
    why: "Si cambia un campo, lo corriges en un solo sitio. La prueba muestra la acción y el resultado, no la interfaz.",
    rule: "Una clase por página. Métodos con nombre de acción y datos como parámetros. Los expect, en la prueba.",
    bad: "await page.getByLabel('Rocket').selectOption(rocketName);\nawait page.getByLabel('Date').fill(date);\nawait page.getByRole('button', { name: 'Schedule' }).click();",
    good: "await launches.scheduleLaunch({ rocketName, date });\nawait expect(launches.rowFor(rocketName)).toBeVisible();" },

  { id: "steps", group: "organizar", title: "Nombra los pasos de un recorrido largo", glossary: "step",
    why: "En un journey, el informe dice qué paso falla. Su código orienta el triage.",
    rule: "Un test.step por paso. Su título cita el criterio. Termina con un expect.",
    bad: "test('operator journey', async ({ page }) => {\n  // 40 líneas sin pasos\n});",
    good: "await test.step('[S3-R1] Add a rocket', async () => {\n  await rockets.add(rocket);\n  await expect(rockets.rowFor(rocket.name)).toBeVisible();\n});" },

  { id: "data", group: "datos", title: "Separa los datos de prueba", glossary: "data",
    why: "Un valor con nombre explica su función. Una función que crea un objeto nuevo da datos limpios a cada prueba.",
    rule: "Datos en su carpeta. Funciones que devuelven objetos nuevos. Datos previos en la semilla.",
    bad: "await launches.scheduleLaunch({ rocketName: 'Falcon', date: '2027-01-01' });",
    good: "const launch = createLaunchData();\nawait launches.scheduleLaunch(launch);" },

  { id: "independent", group: "datos", title: "Haz pruebas independientes",
    why: "Si depende de otra, falla al cambiar el orden o al ejecutarla sola.",
    rule: "Cada prueba crea sus datos, con valores únicos.",
    bad: "// el email ya existe en la segunda ejecución\nconst email = 'test@example.com';",
    good: "// un valor único en cada ejecución\nconst email = `user-${Date.now()}@example.com`;" },

  { id: "session", group: "datos", title: "Entra una vez y reutiliza la sesión", glossary: "session",
    why: "Hacer login en cada prueba es lento y repetitivo. La sesión guardada tiene las cookies y el localStorage de la web.",
    rule: "Guarda la sesión que crea la web. No la fabriques con el token de la API. Un journey empieza sin sesión.",
    bad: "test.beforeEach(async ({ page }) => {\n  await loginPage.login(operator); // en cada prueba\n});",
    good: "// playwright.config.ts: la sesión que guardó el setup al entrar por la web\nuse: { storageState: '.auth/operator.json' }" },

  { id: "evidence", group: "ejecutar", title: "Guarda evidencias de los fallos", glossary: "report",
    why: "Sin evidencias, el triage adivina. La traza, la captura y el error muestran qué vio el navegador.",
    rule: "Guarda traza y capturas de cada fallo. Léelas antes de cambiar nada.",
    bad: "// sin evidencias: solo el mensaje de error\nuse: { trace: 'off', screenshot: 'off' }",
    good: "use: {\n  trace: 'retain-on-failure',\n  screenshot: 'only-on-failure',\n  video: 'retain-on-failure',\n}\n// npx playwright show-trace <trace.zip>" },

  { id: "run", group: "ejecutar", title: "Ejecuta lo que cambias y después toda la suite", glossary: "suite",
    why: "Un requisito da una respuesta rápida. Toda la suite encuentra regresiones en otras specs.",
    rule: "Primero, --grep con la etiqueta. Antes de aceptar, toda la suite.",
    bad: "# solo la prueba nueva, y se da por terminado\nnpx playwright test --grep '@S1-R1'",
    good: "npx playwright test --grep '@S1-R1'   # rápido\nnpm run test:e2e                       # toda la suite" },
];

// Códigos de las reglas e2e del proyecto (e2e-rules.md). Las prácticas sin código no son reglas e2e.
const CODES = {
  locators: "E2",
  observable: "E3.1 · E3.3",
  "web-first": "E3.2 · E3.4",
  await: "E4",
  strong: "E7.5",
  trace: "E1 · E5",
  "page-objects": "E6",
  steps: "E8.4",
  data: "E7",
  independent: "E7.4 · E7.6",
};

const CHECKLIST = [
  ["E1 · E5", "Cada test cita su requisito en el título y en la etiqueta."],
  ["E2", "Los localizadores usan rol, etiqueta o texto, no clases CSS."],
  ["E4", "Cada acción y cada expect tienen await."],
  ["E3.4", "No hay waitForTimeout ni esperas fijas."],
  ["E3.1 · E3.3", "Cada test comprueba el resultado que pide su requisito, no solo la URL."],
  ["E7.5", "Los esperados salen del requisito. Ninguno se ha debilitado."],
  ["E6", "Las acciones están en Page Objects; los expect, en la prueba."],
  ["E7.4", "Los datos son únicos y no dependen de otra prueba."],
  ["", "La prueba pasa sola y pasa con toda la suite."],
];

// Resaltado mínimo de código
function highlight(code) {
  const esc = code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return esc.replace(/(\/\/.*$|#.*$)|('[^'\n]*'|`[^`\n]*`)|\b(await|async|const|new|test|expect|use)\b/gm,
    (m, comment, str, kw) => comment ? `<span class="c">${m}</span>` : str ? `<span class="s">${m}</span>` : `<span class="k">${m}</span>`);
}

function renderPractices() {
  const root = document.getElementById("practices");
  for (const [gid, g] of Object.entries(GROUPS)) {
    const list = PRACTICES.filter((p) => p.group === gid);
    const grid = el("div", { class: "p-list" });
    for (const p of list) {
      // Si alguna línea es larga, Mal y Bien se apilan a todo el ancho.
      const longest = Math.max(...`${p.bad}\n${p.good}`.split("\n").map((l) => l.length));
      const compare = el("div", { class: `p-compare${longest > 56 ? " stacked" : ""}` },
        [["bad", "✗ Mal"], ["good", "✓ Bien"]].map(([which, label]) =>
          el("figure", { class: `p-ex ${which}` }, [
            el("figcaption", { text: label }),
            el("pre", { class: "p-code", html: highlight(p[which]) }),
          ])));
      grid.append(el("article", { class: "practice", id: p.id, style: `--c:${g.color}` }, [
        el("div", { class: "p-head" }, [el("h4", { text: p.title }), CODES[p.id] ? el("code", { class: "rc", text: CODES[p.id] }) : null]),
        el("div", { class: "p-text" }, [
          el("p", { class: "why", text: p.why }),
          el("p", { class: "rule" }, [el("b", { text: "Regla. " }), p.rule]),
        ]),
        compare,
        p.glossary ? el("a", { class: "gl", href: `glosario.html#${p.glossary}`, text: "Ver en el glosario →" }) : null,
      ]));
    }
    root.append(el("div", { class: "p-group reveal", style: `--c:${g.color}` }, [
      el("h3", { class: "g-title" }, [el("span", { class: "dot" }), g.name, el("small", { text: ` · ${list.length}` })]),
      grid,
    ]));
  }
}

// Prueba anotada: los marcadores llevan a cada práctica y la práctica marca sus líneas.
function wireAnatomy() {
  const lines = document.querySelectorAll(".anatomy [data-p]");
  const flash = (id) => {
    const card = document.getElementById(id);
    if (!card) return;
    card.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center" });
    card.classList.remove("flash");
    void card.offsetWidth;
    card.classList.add("flash");
  };
  document.querySelectorAll(".marker").forEach((m) => {
    m.addEventListener("click", () => flash(m.dataset.go));
    m.addEventListener("mouseenter", () => mark(m.dataset.go));
    m.addEventListener("mouseleave", () => mark(null));
  });
  const legend = document.querySelectorAll(".anatomy-legend button");
  legend.forEach((b) => {
    b.addEventListener("click", () => flash(b.dataset.go));
    b.addEventListener("mouseenter", () => mark(b.dataset.go));
    b.addEventListener("mouseleave", () => mark(null));
  });
  function mark(id) {
    lines.forEach((l) => l.classList.toggle("lit", id !== null && l.dataset.p.split(" ").includes(id)));
    legend.forEach((b) => b.classList.toggle("lit", b.dataset.go === id));
  }
}

function renderChecklist() {
  const list = document.getElementById("checklist");
  const bar = document.getElementById("progress");
  const label = document.getElementById("progress-label");
  const update = () => {
    const done = list.querySelectorAll("input:checked").length;
    bar.style.width = `${(done / CHECKLIST.length) * 100}%`;
    label.textContent = done === CHECKLIST.length
      ? "Todo comprobado. Puedes aceptar la prueba."
      : `${done} de ${CHECKLIST.length} comprobados`;
  };
  CHECKLIST.forEach(([code, text], i) => {
    const input = el("input", { type: "checkbox", id: `chk-${i}` });
    input.addEventListener("change", update);
    list.append(el("li", {}, [input, el("label", { for: `chk-${i}` }, [code ? el("code", { class: "rc", text: code }) : null, text])]));
  });
  document.getElementById("reset-check").addEventListener("click", () => {
    list.querySelectorAll("input").forEach((i) => { i.checked = false; });
    update();
  });
  update();
}

renderPractices();
wireAnatomy();
renderChecklist();

// Animación de entrada al hacer scroll (assets/site.js)
revealOnScroll();

// Enlaces directos (playwright.html#locators): las prácticas se crean con JS, así que el salto se hace aquí.
if (location.hash) {
  const target = document.getElementById(location.hash.slice(1));
  if (target) {
    target.closest(".reveal")?.classList.add("visible");
    setTimeout(() => {
      target.scrollIntoView({ block: "center" });
      target.classList.add("flash");
    }, 100);
  }
}
