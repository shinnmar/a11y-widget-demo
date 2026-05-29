// ── 1. CREAR EL WIDGET ──
const widget = document.createElement("div");
widget.id = "a11y-widget";
widget.innerHTML = `
  <div id="a11y-panel">
    <div class="a11y-header">
      <h3>♿ Accesibilidad</h3>
      <span>Beta ✨</span>
    </div>
    <div class="a11y-section">
      <label>Texto</label>
      <div class="a11y-controls">
        <button class="a11y-btn" id="btn-font-down">A−</button>
        <button class="a11y-btn" id="btn-font-up">A+</button>
      </div>
    </div>
    <div class="a11y-section">
      <label>Visual</label>
      <div class="a11y-controls">
        <button class="a11y-btn" id="btn-contrast">Alto contraste</button>
        <button class="a11y-btn" id="btn-readable">Modo lectura</button>
      </div>
    </div>
    <div class="a11y-section">
      <label>✨ Inteligencia Artificial</label>
      <button class="a11y-ai-btn" id="btn-analyze">
        🔍 Analizar página con IA
      </button>
      <div id="a11y-results"></div>
    </div>
  </div>
  <button id="a11y-toggle">♿</button>
`;

// ── 2. INSERTAR EN EL DOM ──
document.body.appendChild(widget);

// ── 3. TOGGLE ──
const toggle = document.getElementById("a11y-toggle");
const panel = document.getElementById("a11y-panel");

toggle.addEventListener("click", () => {
  panel.classList.toggle("open");
});

// ── 4. TAMAÑO DE FUENTE ──
let fontScale = 1;
const TEXT_SELECTORS =
  "p, h1, h2, h3, h4, h5, h6, a, span, li, label, button, td, th";

function applyFontScale() {
  document.querySelectorAll(TEXT_SELECTORS).forEach((el) => {
    // No tocar el widget de accesibilidad
    if (el.closest("#a11y-widget")) return;

    // Guardar el tamaño base la primera vez
    if (!el.dataset.baseFontSize) {
      el.dataset.baseFontSize = parseFloat(getComputedStyle(el).fontSize);
    }

    el.style.fontSize = parseFloat(el.dataset.baseFontSize) * fontScale + "px";
  });
}

document.getElementById("btn-font-up").addEventListener("click", () => {
  fontScale = Math.min(fontScale + 0.1, 1.5);
  applyFontScale();
});

document.getElementById("btn-font-down").addEventListener("click", () => {
  fontScale = Math.max(fontScale - 0.1, 0.8);
  applyFontScale();
});

// ── 5. ALTO CONTRASTE ──
document.getElementById("btn-contrast").addEventListener("click", function () {
  document.body.classList.toggle("high-contrast");
  this.classList.toggle("active");
});

// ── 6. MODO LECTURA ──
document.getElementById("btn-readable").addEventListener("click", function () {
  document.body.classList.toggle("readable-mode");
  this.classList.toggle("active");
});

// ── 7. CAPTURAR CONTENIDO ──
function getPageContent() {
  const text = document.body.innerText.slice(0, 2000);

  const imgsSinAlt = [...document.querySelectorAll("img")]
    .filter((img) => !img.alt || img.alt.trim() === "")
    .map((img) => img.src)
    .slice(0, 5);

  const btnsSinLabel = [...document.querySelectorAll("button, a")].filter(
    (el) => !el.textContent.trim() || el.textContent.trim().length < 2,
  ).length;

  return { text, imgsSinAlt, btnsSinLabel };
}

// ── 8. ANALIZAR CON IA ──
async function analyzeWithAI() {
  const btn = document.getElementById("btn-analyze");
  const results = document.getElementById("a11y-results");

  btn.disabled = true;
  btn.textContent = "⏳ Analyzing...";
  results.classList.add("visible");
  results.innerHTML = "AI is reviewing your page...";

  const { text, imgsSinAlt, btnsSinLabel } = getPageContent();

  const prompt = `
    You are an expert in web accessibility (WCAG 2.1).
    Analyze this information and respond in English.
    Visible text: "${text}"
    Images without alt text: ${imgsSinAlt.length}
    Buttons without labels: ${btnsSinLabel}
    
    List ONLY the real issues found (max 5, min 1).
    If no issues are found, say "✅ No critical issues detected."
    Use exactly this format for each issue:
    ⚠️ [short issue]
    → Fix: [one-line solution]
    No introductions or conclusions.
  `;

  try {
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    const data = await response.json();
    results.innerHTML = data.answer.replace(/\n/g, "<br>");
    btn.textContent = "✅ Análisis listo";
  } catch (error) {
    results.innerHTML = "❌ Connection error.";
    btn.textContent = "🔍 Analyze page with AI";
    btn.disabled = false;
  }
}

// ── 9. CONECTAR BOTÓN IA ──
document.getElementById("btn-analyze").addEventListener("click", analyzeWithAI);
