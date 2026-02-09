document.addEventListener("DOMContentLoaded", () => {
  const log = document.getElementById("chatLog");
  const input = document.getElementById("chatInput");
  const send = document.getElementById("chatSend");
  const chips = document.querySelectorAll(".chip");

  if (!log || !input || !send) return;

  const KB = [
    {
      keys: ["kernel", "núcleo"],
      answer:
        "El **kernel** es el núcleo del sistema operativo: gestiona CPU, memoria, procesos, drivers y el acceso al hardware. Ejemplos: Linux kernel, NT (Windows), XNU (macOS).",
    },
    {
      keys: ["proceso", "procesos", "hilo", "hilos", "thread"],
      answer:
        "**Proceso** = programa en ejecución con su memoria/recursos. **Hilo** = unidad de ejecución dentro del proceso (comparten memoria). Varios hilos permiten paralelismo/concurrencia.",
    },
    {
      keys: ["netstat"],
      answer:
        "`netstat` muestra conexiones de red, puertos en escucha y estadísticas. Tip clásico: `netstat -ano` (Windows) para ver puertos + PID.",
    },
    {
      keys: ["tcp", "udp"],
      answer:
        "**TCP** es orientado a conexión (fiable, ordenado). **UDP** no garantiza entrega (más rápido, ideal streaming/voz/juegos).",
    },
    {
      keys: ["windows", "linux", "diferencias"],
      answer:
        "Windows suele ser más cerrado y orientado a compatibilidad/UX; Linux es open-source, muy flexible y dominante en servidores. Ambos gestionan procesos, memoria y drivers, pero con filosofías distintas.",
    },
    {
      keys: ["batch", "bat", "cmd", "comandos básicos"],
      answer:
        "Batch (.bat) automatiza tareas en Windows. Básicos: `echo`, `set`, `set /p`, `if`, `for`, `goto`, `call`, `pause`, `exit`, `cls`.",
    },
  ];

  const TOPICS = [
    "Kernel y sistema operativo",
    "Procesos vs hilos",
    "Memoria (RAM, paginación)",
    "Redes (TCP/UDP, DNS, puertos)",
    "Windows vs Linux",
    "Batch/PowerShell (automatización)",
    "Seguridad básica (permisos, firewall)",
  ];

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

    const avatar = document.createElement("div");
    avatar.className = "chat-avatar";
    avatar.textContent = "AI";

    const bubble = document.createElement("div");
    bubble.className = "chat-bubble typing";
    bubble.textContent = "pensando...";

    t.appendChild(avatar);
    t.appendChild(bubble);
    log.appendChild(t);
    log.scrollTop = log.scrollHeight;
  }

  function typingOff() {
    document.getElementById("typing")?.remove();
  }

  function format(s) {
    // mini-formato: backticks a <code>
    return String(s)
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\n/g, "<br>");
  }

  function helpText() {
    return [
      "**Comandos disponibles**:",
      "- `help` → ver comandos",
      "- `topics` → ver temas sugeridos",
      "- `quiz batch` → mini test de Batch",
      "- `quiz redes` → mini test de redes",
      "",
      "O pregunta normal: “¿qué es un kernel?”, “¿qué hace netstat?”…",
    ].join("\n");
  }

  function topicsText() {
    return "**Temas:**\n- " + TOPICS.join("\n- ");
  }

  function runQuiz(kind) {
    if (kind === "batch") {
      return [
        "**Mini-quiz Batch (responde A/B/C)**",
        "1) ¿Qué comando limpia la pantalla?\nA) `clear`  B) `cls`  C) `wipe`",
        "2) ¿Cómo pides un valor al usuario?\nA) `set /p`  B) `ask`  C) `scan`",
        "3) ¿Qué cierra el script?\nA) `end`  B) `exit`  C) `stop`",
        "",
        "Escribe: `respuestas: B,A,B`",
      ].join("\n");
    }

    if (kind === "redes") {
      return [
        "**Mini-quiz Redes (responde A/B/C)**",
        "1) ¿Qué protocolo es orientado a conexión?\nA) UDP  B) TCP  C) ICMP",
        "2) ¿Qué comando ayuda a ver puertos + PID en Windows?\nA) `netstat -ano`  B) `ipconfig /all`  C) `route print`",
        "3) DNS sirve para…\nA) cifrar  B) resolver nombres  C) comprimir",
        "",
        "Escribe: `respuestas: B,A,B`",
      ].join("\n");
    }

    return "No conozco ese quiz. Prueba `quiz batch` o `quiz redes`.";
  }

  function parseAnswers(text) {
    const m = text.match(/respuestas:\s*([ABCabc])\s*,\s*([ABCabc])\s*,\s*([ABCabc])/);
    if (!m) return null;
    return [m[1], m[2], m[3]].map(x => x.toUpperCase());
  }

  function gradeAnswers(ans) {
    // respuestas “fijas” según los quizzes de arriba
    const key = ["B","A","B"];
    let score = 0;
    for (let i = 0; i < 3; i++) if (ans[i] === key[i]) score++;
    return `Resultado: **${score}/3**. ${score === 3 ? "¡Perfecto! ✅" : "Bien, si quieres te explico cada una."}`;
  }

  function botReply(userTextRaw) {
    const userText = userTextRaw.trim();
    const t = userText.toLowerCase();

    // comandos
    if (t === "help") return helpText();
    if (t === "topics") return topicsText();
    if (t.startsWith("quiz ")) return runQuiz(t.replace("quiz ", "").trim());

    const ans = parseAnswers(userText);
    if (ans) return gradeAnswers(ans);

    // KB match
    for (const item of KB) {
      if (item.keys.some(k => t.includes(k))) return item.answer;
    }

    // fallback “inteligente”
    return [
      "Puedo ayudarte con **Sistemas Informáticos** (SO, redes, procesos, Batch).",
      "Prueba con:",
      "- `topics` para ver temas",
      "- o pregunta: “¿qué es memoria virtual?”, “¿qué es DNS?”, “diferencias Windows vs Linux”",
    ].join("\n");
  }

  function handleSend(text) {
    const clean = text.trim();
    if (!clean) return;

    addMessage(clean, "user");
    input.value = "";

    typingOn();
    setTimeout(() => {
      typingOff();
      addMessage(botReply(clean), "bot");
    }, 420);
  }

  // chips
  chips.forEach(btn => {
    btn.addEventListener("click", () => handleSend(btn.dataset.say || btn.textContent));
  });

  // send
  send.addEventListener("click", () => handleSend(input.value));
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleSend(input.value);
  });

  // bienvenida
  addMessage(
    "Hola 👋 Soy **SI-Bot**.\nEscribe `help` para ver comandos o pregúntame algo (ej: **¿Qué es el kernel?**).",
    "bot"
  );
});
