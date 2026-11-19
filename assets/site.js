/* Material de repaso · Testing Inteligente
   Código común para todas las páginas:
   - <site-header> y <site-footer>: barra superior y pie compartidos.
   - el(): crea nodos DOM de forma compacta.
   - revealOnScroll(): animación de entrada de los elementos .reveal.

   Se carga como <script> clásico (no módulo) en el <head>,
   para que funcione también abriendo los HTML con doble clic (file://). */

const SITE_MENU = [
  { href: "glosario.html", label: "glosario", mono: true },
  { href: "playwright.html", label: "playwright", mono: true },
  { href: "skills.html", label: "skills", mono: true },
  { href: "specs.html", label: "specs", mono: true },
];

/** Nombre del archivo HTML actual; la raíz del sitio cuenta como index.html. */
function currentPage() {
  const last = location.pathname.split("/").pop();
  return last || "index.html";
}

function currentAttr(href) {
  return href === currentPage() ? ' aria-current="page"' : "";
}

class SiteHeader extends HTMLElement {
  connectedCallback() {
    const links = SITE_MENU.map(
      (item) => `<a href="${item.href}"${item.mono ? ' class="mono"' : ""}${currentAttr(item.href)}>${item.label}</a>`
    ).join("");
    this.innerHTML = `
      <nav class="topbar">
        <a class="brand" href="index.html"${currentAttr("index.html")}>Testing Inteligente · Repaso</a>
        <span class="menu">${links}</span>
      </nav>`;
  }
}

class SiteFooter extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <footer class="site-footer">
        <p class="f-note">Material de repaso del curso <b>Testing Inteligente</b>.</p>
        <div class="f-links">
          <a class="f-link f-course" href="https://www.trainingit.es/producto/testing-ia/" target="_blank" rel="noopener">
            <span class="f-kind">El curso</span>
            <span class="f-title">Testing Inteligente en TrainingIT</span>
            <span class="f-url">trainingit.es/producto/testing-ia →</span>
          </a>
          <a class="f-link f-author" href="https://albertobasalo.dev" target="_blank" rel="noopener">
            <span class="f-kind">El autor</span>
            <span class="f-title">Alberto Basalo</span>
            <span class="f-url">albertobasalo.dev →</span>
          </a>
        </div>
      </footer>`;
  }
}

customElements.define("site-header", SiteHeader);
customElements.define("site-footer", SiteFooter);

/**
 * Crea un elemento DOM.
 * attrs admite: class, text, html, style (cssText), data (objeto para dataset)
 * y cualquier otro atributo. Los hijos null/undefined se ignoran.
 */
function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (key === "class") node.className = value;
    else if (key === "text") node.textContent = value;
    else if (key === "html") node.innerHTML = value;
    else if (key === "style") node.style.cssText = value;
    else if (key === "data") Object.assign(node.dataset, value);
    else node.setAttribute(key, value);
  }
  for (const child of [].concat(children)) if (child != null) node.append(child);
  return node;
}

/** Animación de entrada al hacer scroll. Llamar después de crear los nodos .reveal. */
function revealOnScroll(threshold = 0.08) {
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    }
  }, { threshold });
  document.querySelectorAll(".reveal").forEach((node) => observer.observe(node));
}
