// chatbot.js (RAÍZ DEL PROYECTO)
// Carga KBs JSON desde la raíz y responde offline (GitHub Pages friendly)

document.addEventListener("DOMContentLoaded", async () => {
  const log = document.getElementById("chatLog");
  const input = document.getElementById("chatInput");
  const send = document.getElementById("chatSend");
  const chips = document.querySelectorAll(".chip");

  if (!log || !input || !send) return;

  // =============================
  // SETTINGS (persistentes)
  // =============================
  const STORE_KEY = "si_bot_settings_v1";
  const DEFAULTS = {
    mode: "profe", // profe | corto
    level: 2, // 1 básico | 2 normal | 3 pro
    steps: true, // pasos on/off
  };

  let SETTINGS = loadSettings();

  function loadSettings() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (!raw) return { ...DEFAULTS };
      const parsed = JSON.parse(raw);
      return { ...DEFAULTS, ...parsed };
    } catch {
      return { ...DEFAULTS };
    }
  }

  function saveSettings() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(SETTINGS));
    } catch {
      // ignore
    }
  }

  // =============================
  // CARGA KBs (desde /pag/ subimos a raíz con ../)
  // =============================
  /** @type {Array<{id:string,tags?:string[],patterns?:string[],short?:string,answer?:string}>} */
  let KB = [];

  async function loadJson(path) {
    const r = await fetch(path);
    if (!r.ok) throw new Error(`No se pudo cargar ${path}`);
    return r.json();
  }

  async function loadAllKB() {
    try {
      // chatbot.html está en /pag/, así que ../ apunta a raíz
      const [so, wl, net, bat] = await Promise.all([
        loadJson("../kb-so.json"),
        loadJson("../kb-winlinux.json"),
        loadJson("../kb-redes.json"),
        loadJson("../kb-bat.json"),
      ]);

      KB = [...so, ...wl, ...net, ...bat].filter(Boolean);
    } catch (e) {
      KB = [];
      console.error("Error cargando KB JSON:", e);
    }
  }

  await loadAllKB();

  // =============================
  // UI + FORMATEO
  // =============================
  function escHtml(s) {
    return String(s)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function format(s) {
    return String(s)
      .replace(/```([\s\S]*?)```/g, (m, code) => {
        return `<pre><code>${escHtml(code)}</code></pre>`;
      })
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\n/g, "<br>");
  }

  function addMessage(text, who = "bot") {
    const msg = document.createElement("div");
    msg.className = `chat-msg ${who}`;

    const avatar = document.createElement("div");
    avatar.className = "chat-avatar";
    avatar.textContent = who === "user" ? "TÚ" : "AI";

    const bubble = document.createElement("div");
    bubble.className = "chat-bubble";
    bubble.innerHTML = format(text);

    msg.appendChild(avatar);
    msg.appendChild(bubble);
    log.appendChild(msg);
    log.scrollTop = log.scrollHeight;
  }

  function typingOn() {
    const t = document.createElement("div");
    t.className = "chat-msg bot";
    t.id = "typing";
    t.innerHTML =
      '<div class="chat-avatar">AI</div><div class="chat-bubble typing">pensando...</div>';
    log.appendChild(t);
    log.scrollTop = log.scrollHeight;
  }

  function typingOff() {
    document.getElementById("typing")?.remove();
  }

  // =============================
  // NORMALIZACIÓN + SINÓNIMOS
  // =============================
  function norm(s) {
    return String(s || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  const SYN = [
    ["cmd", ["simbolo del sistema", "símbolo del sistema", "consola windows", "terminal de windows"]],
    ["bat", ["batch", ".bat", "script bat", "archivo bat", "cmd script"]],
    ["so", ["sistema operativo", "sistemas operativos", "operating system", "os"]],
    ["kernel", ["nucleo", "núcleo"]],
    ["memoria virtual", ["paging", "paginacion", "paginación", "swap", "pagefile"]],
    ["redes", ["networking", "tcp ip", "tcp/ip"]],
    ["permisos", ["privilegios", "autorizaciones", "acls", "chmod"]],
    ["procesos", ["process", "processes"]],
    ["hilos", ["threads", "thread"]],
    ["planificador", ["scheduler"]],
    ["sistema de archivos", ["filesystem", "file system"]],
    ["arranque", ["boot", "bootloader", "grub", "uefi", "bios"]],
  ];

  function expandText(userText) {
    let x = norm(userText);
    for (const [k, arr] of SYN) {
      for (const a of arr) {
        if (x.includes(norm(a))) x += " " + k;
      }
    }
    return x;
  }

  // =============================
  // SCORING KB
  // =============================
  function scoreEntry(userText, entry) {
    const t = expandText(userText);
    let s = 0;

    for (const p of entry.patterns || []) {
      const pp = norm(p);
      if (!pp) continue;
      if (t === pp) s += 14;
      else if (t.includes(pp)) s += 8;
    }

    for (const tag of entry.tags || []) {
      const tg = norm(tag);
      if (tg && t.includes(tg)) s += 3;
    }

    if (
      t.startsWith("que es ") ||
      t.startsWith("que significa ") ||
      t.startsWith("definicion de ")
    ) {
      s += 1;
    }

    if (t.includes("ejemplo") && (entry.tags || []).some((x) => norm(x).includes("bat"))) {
      s += 2;
    }

    return s;
  }

  function bestMatches(text, limit = 6) {
    if (!KB.length) return [];
    const scored = KB
      .map((e) => ({ e, s: scoreEntry(text, e) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s);
    return scored.slice(0, limit);
  }

  function compress(text) {
    const lines = String(text).split("\n").filter(Boolean);
    if (lines.length <= 5) return text;
    return (
      lines.slice(0, 4).join("\n") +
      "\n\n(Escribe `nivel:2` o `modo:profe` para más detalle.)"
    );
  }

  function buildExtras(entry) {
    const tags = (entry.tags || []).map(String);
    const isBat = tags.some((t) => norm(t).includes("bat") || norm(t).includes("batch"));
    const isNet = tags.some((t) => norm(t).includes("redes") || norm(t).includes("dns") || norm(t).includes("tcp"));
    const isSO = tags.some((t) => norm(t).includes("so") || norm(t).includes("kernel") || norm(t).includes("sistema operativo"));

    const extras = [];
    if (isBat) extras.push("✅ **Tip pro (Batch):** usa comillas: `set \"VAR=valor\"` y `\"%VAR%\"`.");
    if (isBat) extras.push("✅ **Tip pro (Batch):** logs: `comando >> log.txt 2>&1`.");
    if (isNet) extras.push("✅ **Tip pro (Redes):** prueba IP vs dominio para separar fallo DNS de conectividad.");
    if (isSO) extras.push("✅ **Tip pro (SO):** relaciona el concepto con procesos/memoria/seguridad (muy típico).");

    return extras.length ? extras.join("\n") : "";
  }

  function pickAnswer(entry) {
    const short = entry.short || "";
    const normal = entry.answer || short || "Sin contenido.";

    if (SETTINGS.mode === "corto" || SETTINGS.level === 1) {
      return short || compress(normal);
    }

    if (SETTINGS.level === 3) {
      const extra = buildExtras(entry);
      return extra ? normal + "\n\n" + extra : normal;
    }

    return normal;
  }

  function bestAnswer(text) {
    const m = bestMatches(text, 6);
    if (!m.length) return null;
    if (m[0].s < 8) return null; // umbral
    return pickAnswer(m[0].e);
  }

  // =============================
  // COMANDOS
  // =============================
  const TOPICS = [
    "Kernel, syscalls, user/kernel space",
    "Procesos, hilos, scheduler, context switch",
    "Memoria virtual, paginación, page fault",
    "Permisos, filesystem, arranque",
    "Windows vs Linux, PATH, servicios y logs",
    "Redes: TCP/UDP, DNS, ping, tracert, netstat",
    "Batch: set/if/for/goto/call, redirecciones, delayed expansion, logs",
  ];

  function helpText() {
    return [
      "**Comandos:**",
      "- `help` → ver esto",
      "- `topics` → temas sugeridos",
      "- `modo:profe` / `modo:corto`",
      "- `nivel:1` / `nivel:2` / `nivel:3`",
      "- `pasos:on` / `pasos:off`",
      "- `buscar: <texto>` → lista coincidencias",
      "- `glosario: <término>` → definición rápida",
      "- `quiz batch` / `quiz redes`",
      "",
      `**Estado:** modo=${SETTINGS.mode}, nivel=${SETTINGS.level}, pasos=${SETTINGS.steps ? "on" : "off"}`,
      "",
      "Tip: pega un script `.bat` y lo analizo.",
    ].join("\n");
  }

  function topicsText() {
    return "**Temas:**\n- " + TOPICS.join("\n- ");
  }

  function setMode(text) {
    const v = norm(text.replace(/^modo:\s*/i, ""));
    if (v === "profe" || v === "corto") {
      SETTINGS.mode = v;
      saveSettings();
      return `Modo cambiado a **${SETTINGS.mode}**.`;
    }
    return "Usa: `modo:profe` o `modo:corto`.";
  }

  function setLevel(text) {
    const v = norm(text.replace(/^nivel:\s*/i, ""));
    const n = Number(v);
    if ([1, 2, 3].includes(n)) {
      SETTINGS.level = n;
      saveSettings();
      return `Nivel cambiado a **${SETTINGS.level}**.`;
    }
    return "Usa: `nivel:1`, `nivel:2` o `nivel:3`.";
  }

  function setSteps(text) {
    const v = norm(text.replace(/^pasos:\s*/i, ""));
    if (v === "on" || v === "off") {
      SETTINGS.steps = v === "on";
      saveSettings();
      return `Pasos: **${SETTINGS.steps ? "on" : "off"}**.`;
    }
    return "Usa: `pasos:on` o `pasos:off`.";
  }

  function searchList(text) {
    const q = text.replace(/^buscar:\s*/i, "").trim();
    if (!q) return "Usa: `buscar: memoria virtual` o `buscar: for /f`";
    const m = bestMatches(q, 8);
    if (!m.length) {
      return `No encontré nada para: **${q}**. Prueba sinónimos (ej: “paginación”, “swap”).`;
    }

    const lines = m.map((x, i) => {
      const title = x.e.patterns && x.e.patterns[0] ? x.e.patterns[0] : x.e.id;
      const desc = x.e.short || "";
      return `${i + 1}) **${title}** — ${desc}`;
    });

    return ["Resultados para **" + q + "**:", ...lines, "", "Escribe el término y te lo explico."].join("\n");
  }

  function glossary(text) {
    const q = text.replace(/^glosario:\s*/i, "").trim();
    if (!q) return "Usa: `glosario: scheduler` o `glosario: errorlevel`";
    const m = bestMatches(q, 3);
    if (!m.length || m[0].s < 7) return `No encuentro una definición clara de **${q}**. Prueba \`buscar: ${q}\`.`;

    const e = m[0].e;
    const title = e.patterns && e.patterns[0] ? e.patterns[0] : e.id;
    const one = e.short || compress(e.answer || "");
    return `**${title}**\n\n${one}`;
  }

  // =============================
  // QUIZZES
  // =============================
  function runQuiz(kind) {
    if (kind === "batch") {
      return [
        "**Mini-quiz Batch (A/B/C)**",
        "1) Limpia pantalla\nA) clear  B) cls  C) wipe",
        "2) Pedir valor\nA) set /p  B) ask  C) scan",
        "3) Terminar script\nA) end  B) exit  C) stop",
        "",
        "Responde: `respuestas: B,A,B`",
      ].join("\n");
    }
    if (kind === "redes") {
      return [
        "**Mini-quiz Redes (A/B/C)**",
        "1) Orientado a conexión\nA) UDP  B) TCP  C) ICMP",
        "2) Puertos+PID en Windows\nA) netstat -ano  B) ipconfig /all  C) route print",
        "3) DNS sirve para\nA) cifrar  B) resolver nombres  C) comprimir",
        "",
        "Responde: `respuestas: B,A,B`",
      ].join("\n");
    }
    return "Quiz no disponible. Usa `quiz batch` o `quiz redes`.";
  }

  function parseAnswers(text) {
    const m = text.match(
      /respuestas:\s*([ABCabc])\s*,\s*([ABCabc])\s*,\s*([ABCabc])/,
    );
    if (!m) return null;
    return [m[1], m[2], m[3]].map((x) => x.toUpperCase());
  }

  function gradeAnswers(ans) {
    const key = ["B", "A", "B"];
    let score = 0;
    for (let i = 0; i < 3; i++) if (ans[i] === key[i]) score++;
    return `Resultado: **${score}/3**. ${
      score === 3 ? "¡Perfecto! ✅" : "Bien. Si quieres te explico las falladas."
    }`;
  }

  // =============================
  // DETECTAR + ANALIZAR BAT PEGADO
  // =============================
  function looksLikeBatch(text) {
    const t = norm(text);
    const hits = [
      "@echo off",
      "set /p",
      "set /a",
      "if ",
      "for ",
      "goto ",
      "call ",
      "errorlevel",
      "chcp ",
      "timeout",
      "2>&1",
      "choice ",
      "start ",
    ];
    let c = 0;
    for (const h of hits) if (t.includes(h)) c++;
    return c >= 2;
  }

  function analyzeBatch(text) {
    const t = norm(text);
    const features = [];
    const check = (k, label) => {
      if (t.includes(k)) features.push(label);
    };

    check("@echo off", "Salida limpia (`@echo off`)");
    check("chcp", "Codepage/UTF-8 (`chcp`)");
    check("set /p", "Entrada usuario (`set /p`)");
    check("set /a", "Cálculos (`set /a`)");
    check("if ", "Condicionales (`if`)");
    check("for ", "Bucles (`for`)");
    check("goto ", "Menús/saltos (`goto`)");
    check("call ", "Subrutinas (`call`)");
    check("choice ", "Menú robusto (`choice`)");
    check("2>&1", "Logging (`2>&1`)");
    check("timeout", "Esperas (`timeout`)");

    const proTips = [
      "Comillas siempre: `set \"VAR=valor\"` y `\"%VAR%\"`.",
      "Si cambias variables en bucles: `setlocal enabledelayedexpansion` y `!var!`.",
      "Para logs: `comando >> log.txt 2>&1`.",
      "Valida input del usuario antes de usarlo en rutas/comandos.",
    ];

    if (!SETTINGS.steps) {
      return [
        "**He detectado un script Batch (.bat).**",
        features.length ? `Señales: **${features.join(", ")}**` : "",
        "",
        "**Mejoras pro típicas:**\n- " + proTips.join("\n- "),
      ]
        .filter(Boolean)
        .join("\n");
    }

    return [
      "**He detectado un script Batch (.bat).**",
      features.length
        ? `1) Señales detectadas: **${features.join(", ")}**`
        : "1) Señales detectadas: (no claras)",
      "2) Dime el objetivo (limpieza, menú, backup…) y te lo explico por bloques.",
      "3) Mejoras pro típicas:",
      "- " + proTips.join("\n- "),
    ].join("\n");
  }

  function toStepsIfEnabled(text) {
    if (!SETTINGS.steps) return text;

    const hasNumbered = /\n\d\)/.test(text) || /\n\d\./.test(text);
    if (hasNumbered) return text;

    const lines = String(text).split("\n");
    const bullets = lines.filter((l) => l.trim().startsWith("- "));
    if (bullets.length >= 3) {
      const head =
        lines.find((l) => l.trim() && !l.trim().startsWith("- ")) || "";
      const rest = bullets.map(
        (b, i) => `${i + 1}) ${b.trim().replace(/^- /, "")}`,
      );
      return [head, "", ...rest].join("\n").trim();
    }

    return text;
  }

  // =============================
  // CORE: RESPUESTA
  // =============================
  function botReply(userTextRaw) {
    const userText = userTextRaw.trim();
    const t = norm(userText);

    // comandos
    if (t === "help") return helpText();
    if (t === "topics") return topicsText();
    if (t.startsWith("modo:")) return setMode(userText);
    if (t.startsWith("nivel:")) return setLevel(userText);
    if (t.startsWith("pasos:")) return setSteps(userText);
    if (t.startsWith("buscar:")) return searchList(userText);
    if (t.startsWith("glosario:")) return glossary(userText);
    if (t.startsWith("quiz ")) return runQuiz(t.replace(/^quiz\s+/i, "").trim());

    const ans = parseAnswers(userText);
    if (ans) return gradeAnswers(ans);

    // scripts bat pegados
    if (looksLikeBatch(userText)) {
      const direct = bestAnswer(userText);
      return toStepsIfEnabled(direct || analyzeBatch(userText));
    }

    // KB
    const kb = bestAnswer(userText);
    if (kb) return toStepsIfEnabled(kb);

    return [
      "Puedo ayudarte con **Sistemas Operativos**, **Redes** y **Batch (.bat)**.",
      "Prueba con:",
      "- `topics`",
      "- `buscar: netstat`",
      "- `glosario: scheduler`",
      "- `modo:corto` (chuleta) o `nivel:3` (pro)",
      "- o pega un script `.bat` y lo analizo",
    ].join("\n");
  }

  // =============================
  // EVENTOS
  // =============================
  function handleSend(text) {
    const clean = text.trim();
    if (!clean) return;

    addMessage(clean, "user");
    input.value = "";

    typingOn();
    setTimeout(() => {
      typingOff();
      addMessage(botReply(clean), "bot");
    }, 170);
  }

  chips.forEach((btn) => {
    btn.addEventListener("click", () => handleSend(btn.dataset.say || btn.textContent));
  });

  send.addEventListener("click", () => handleSend(input.value));
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleSend(input.value);
  });

  // =============================
  // BIENVENIDA
  // =============================
  addMessage(
    `Hola 👋 Soy **SI-Bot** (offline).\nEscribe \`help\`.\nEstado: modo=${SETTINGS.mode}, nivel=${SETTINGS.level}, pasos=${SETTINGS.steps ? "on" : "off"}.`,
    "bot",
  );
});