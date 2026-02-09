document.addEventListener("DOMContentLoaded", () => {
  

  document.documentElement.classList.add("js-anim");

  /* =========================================================
     TIMELINE ANIMATIONS (stagger + reveal + failsafe)
     ========================================================= */
  const items = document.querySelectorAll(".timeline .timeline-item");

  if (items.length) {
    // Stagger (entran una tras otra)
    items.forEach((el, i) =>
      el.style.setProperty("--delay", `${i * 70}ms`)
    );

    // Reveal al hacer scroll
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target); // se anima solo una vez
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -10% 0px" }
    );

    items.forEach((el) => io.observe(el));

    // 🔒 FAILSAFE: si en 800ms no se ha mostrado ninguna, mostramos todas
    setTimeout(() => {
      const anyVisible = document.querySelector(
        ".timeline-item.is-visible"
      );
      if (!anyVisible)
        items.forEach((el) => el.classList.add("is-visible"));
    }, 800);
  }


  

  // =======================
  // QUIZ: abrir modal
  // =======================
  const openQuizBtn = document.getElementById("openQuizBtn");
  const quizModal = document.getElementById("quizModal");

  if (openQuizBtn && quizModal) {
    openQuizBtn.addEventListener("click", () => {
      quizModal.style.display = "flex";
      resetQuizUI();
    });
  }

  // =======================
  // MODO OSCURO / CLARO
  // =======================
  const toggle = document.getElementById("themeToggle");

  function setTheme(theme) {
    document.body.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
    if (toggle) toggle.textContent = theme === "dark" ? "☀️" : "🌙";
  }

  setTheme(localStorage.getItem("theme") || "light");

  if (toggle) {
    toggle.addEventListener("click", () => {
      const newTheme = document.body.classList.contains("dark")
        ? "light"
        : "dark";
      setTheme(newTheme);
    });
  }
});

/* =========================================================
   QUIZ UI HELPERS
   ========================================================= */
function resetQuizUI() {
  const quizResult = document.getElementById("quizResult");
  if (quizResult) {
    quizResult.style.display = "none";
    quizResult.innerHTML = "";
  }

  document.querySelectorAll(".quiz-q").forEach((q) => {
    q.classList.remove("is-correct", "is-wrong");
    q.querySelector(".quiz-badge")?.remove();
    q.querySelector(".quiz-explain")?.remove();
  });

  document.querySelectorAll(".quiz-opt").forEach((l) => {
    l.classList.remove("correct", "wrong", "missed");
  });

  enhanceQuizMarkupOnce();
}

let __quizEnhanced = false;
function enhanceQuizMarkupOnce() {
  if (__quizEnhanced) return;
  const form = document.getElementById("quizForm");
  if (!form) return;

  form.querySelectorAll("label").forEach((label) => {
    label.classList.add("quiz-opt");
  });

  const children = Array.from(form.children);
  let currentWrap = null;

  function isQuestionP(el) {
    return (
      el &&
      el.tagName === "P" &&
      el.querySelector("strong") &&
      /(\d+\.)/.test(el.textContent.trim())
    );
  }

  children.forEach((node) => {
    if (isQuestionP(node)) {
      currentWrap = document.createElement("div");
      currentWrap.className = "quiz-q";
      form.insertBefore(currentWrap, node);
      currentWrap.appendChild(node);
      return;
    }

    // no mover el botón final
    if (node.tagName === "BUTTON") return;

    if (currentWrap && node.nodeType === 1) {
      currentWrap.appendChild(node);
    }
  });

  __quizEnhanced = true;
}

/* =========================================================
   QUIZ MODAL
   ========================================================= */
function closeQuiz() {
  const quizModal = document.getElementById("quizModal");
  if (quizModal) quizModal.style.display = "none";
}

/* =========================================================
   NAME MODAL
   ========================================================= */
function openNameModal() {
  const nameModal = document.getElementById("nameModal");
  const nameInput = document.getElementById("studentName");

  if (nameModal) nameModal.style.display = "flex";

  if (nameInput) {
    setTimeout(() => nameInput.focus(), 60);
    nameInput.onkeydown = (e) => {
      if (e.key === "Enter") generateDiploma();
    };
  }
}

function closeName() {
  const nameModal = document.getElementById("nameModal");
  if (nameModal) nameModal.style.display = "none";
}

/* =========================================================
   CHECK QUIZ (feedback + abre modal nombre si 25/25)
   ========================================================= */
function checkQuiz() {
  const form = document.getElementById("quizForm");
  if (!form) return;

  enhanceQuizMarkupOnce();

  const isHistoria = window.location.pathname
    .toLowerCase()
    .includes("historia");

  const correct = isHistoria
    ? {
        q1: "1964",
        q2: "compatibilidad",
        q3: "multiprogramacion",
        q4: "thompson_ritchie",
        q5: "bell_labs",
        q6: "simplicidad",
        q7: "gui_raton",
        q8: "mac_windows",
        q9: "1981",
        q10: "linea_comandos",
        q11: "gui_multitarea",
        q12: "macintosh",
        q13: "inicio_tareas",
        q14: "1991",
        q15: "kernel_unix",
        q16: "profesional",
        q17: "active_directory",
        q18: "unix_darwin",
        q19: "multitouch_appstore",
        q20: "2008",
        q21: "kernel_linux",
        q22: "pc_tablets",
        q23: "actualizaciones",
        q24: "apps_android",
        q25: "nube_contenedores_ia",
      }
    : {
        q1: "cls",
        q2: "set /p",
        q3: "%random%",
        q4: "goto",
        q5: "pause",
        q6: "echo",
        q7: "title",
        q8: "color",
        q9: "set",
        q10: ":etiqueta",
        q11: "exit",
        q12: ">",
        q13: ">>",
        q14: "date /t",
        q15: "time /t",
        q16: "dir",
        q17: "mkdir",
        q18: "del",
        q19: "rmdir",
        q20: "timeout /t 5",
        q21: "if",
        q22: "for",
        q23: "type",
        q24: "cd",
        q25: "exit",
      };

  // Limpia estilos anteriores
  document.querySelectorAll(".quiz-opt").forEach((l) => {
    l.classList.remove("correct", "wrong", "missed");
  });
  document.querySelectorAll(".quiz-q").forEach((q) => {
    q.classList.remove("is-correct", "is-wrong");
    q.querySelector(".quiz-badge")?.remove();
    q.querySelector(".quiz-explain")?.remove();
  });

  let score = 0;
  let answered = 0;

  for (const qName in correct) {
    const selected = document.querySelector(`input[name="${qName}"]:checked`);
    const rightValue = correct[qName];

    if (selected) answered++;

    const rightInput = document.querySelector(
      `input[name="${qName}"][value="${CSS.escape(rightValue)}"]`,
    );

    const selectedLabel = selected ? selected.closest("label") : null;
    const rightLabel = rightInput ? rightInput.closest("label") : null;

    const wrap = findQuestionWrapForName(qName);

    if (selected && selected.value === rightValue) {
      score++;
      if (wrap) {
        wrap.classList.add("is-correct");
        addBadge(wrap, true);
      }
      if (rightLabel) rightLabel.classList.add("correct");
    } else {
      if (wrap) {
        wrap.classList.add("is-wrong");
        addBadge(wrap, false);
      }
      if (rightLabel) rightLabel.classList.add("correct");
      if (selectedLabel) selectedLabel.classList.add("wrong");
      if (!selectedLabel && rightLabel) rightLabel.classList.add("missed");

      if (wrap) {
        const explain = document.createElement("div");
        explain.className = "quiz-explain";
        explain.innerHTML = selected
          ? `Respuesta correcta marcada en <strong>verde</strong>.`
          : `No respondiste esta pregunta. La correcta está marcada en <strong>verde</strong>.`;
        wrap.appendChild(explain);
      }
    }
  }

  const quizResult = document.getElementById("quizResult");
  const all = Object.keys(correct).length;
  const ok = score === all;

  if (quizResult) {
    quizResult.style.display = "block";
    quizResult.innerHTML = `
      <div class="qr-title">${ok ? "✅ ¡Perfecto!" : "📌 Revisión del Quiz"}</div>
      <div class="qr-sub">
        Puntuación: <strong>${score}/${all}</strong> · Respondidas: <strong>${answered}/${all}</strong>
        ${ok ? "· Abriendo el diploma..." : "· Te marco en verde la correcta y en rojo tu elección si fallaste."}
      </div>
      <div class="qr-actions">
        ${
          ok
            ? `<button type="button" class="btn-quiz" onclick="continueToName()">Continuar</button>`
            : `<button type="button" class="btn-quiz btn-secondary" onclick="scrollToFirstWrong()">Ir a la primera incorrecta</button>
               <button type="button" class="btn-quiz" onclick="resetQuizForm()">Reintentar</button>`
        }
      </div>
    `;
  }

  if (ok) {
    setTimeout(() => {
      closeQuiz();
      openNameModal();
    }, 250);
  }
}

function continueToName() {
  closeQuiz();
  openNameModal();
}

function findQuestionWrapForName(qName) {
  const any = document.querySelector(`input[name="${qName}"]`);
  if (!any) return null;
  return any.closest(".quiz-q") || null;
}

function addBadge(wrap, ok) {
  const p =
    wrap.querySelector("p strong")?.closest("p") || wrap.querySelector("p");
  if (!p) return;

  const badge = document.createElement("span");
  badge.className = `quiz-badge ${ok ? "ok" : "bad"}`;
  badge.textContent = ok ? "✔ Correcta" : "✖ Incorrecta";
  p.appendChild(badge);
}

function scrollToFirstWrong() {
  const firstWrong = document.querySelector(".quiz-q.is-wrong");
  if (firstWrong)
    firstWrong.scrollIntoView({ behavior: "smooth", block: "start" });
}

function resetQuizForm() {
  const form = document.getElementById("quizForm");
  if (form) form.reset();
  resetQuizUI();
}

/* =========================================================
   DIPLOMA
   ========================================================= */
function generateDiploma() {
  const nameInput = document.getElementById("studentName");
  const diplomaText = document.getElementById("diplomaText");
  const diplomaModal = document.getElementById("diplomaModal");
  const nameModal = document.getElementById("nameModal");
  const diplomaName = document.getElementById("diplomaName");
  const diplomaDate = document.getElementById("diplomaDate");
  const diplomaId = document.getElementById("diplomaId");

  if (!nameInput || !diplomaText || !diplomaModal || !nameModal) return;

  const name = nameInput.value.trim();
  if (name === "") {
    alert("Por favor, introduce tu nombre.");
    nameInput.focus();
    return;
  }

  nameModal.style.display = "none";

  const isHistoria = window.location.pathname
    .toLowerCase()
    .includes("historia");
  const titulo = isHistoria
    ? "HISTORIA DE LOS SISTEMAS OPERATIVOS"
    : "CURSO DE PROGRAMACIÓN BATCH (BAT)";

  diplomaText.innerHTML = `
    <p>
      Se certifica que <strong>${escapeHtml(name)}</strong> ha completado con éxito
      el contenido de <strong>${titulo}</strong> demostrando comprensión de los conceptos clave.
    </p>
    <p style="margin-top:10px;">
      ¡Enhorabuena por tu esfuerzo y constancia! 🏆
    </p>
  `;

  if (diplomaName) diplomaName.textContent = name;

  const now = new Date();
  const dateStr = now.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "2-digit",
  });
  if (diplomaDate) diplomaDate.textContent = dateStr;

  const id = `SI-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
    2,
    "0",
  )}${String(now.getDate()).padStart(2, "0")}-${Math.random()
    .toString(36)
    .slice(2, 7)
    .toUpperCase()}`;
  if (diplomaId) diplomaId.textContent = id;

  diplomaModal.style.display = "flex";
}

function printDiploma() {
  document.body.classList.add("print-diploma");
  window.print();
  setTimeout(() => document.body.classList.remove("print-diploma"), 300);
}

function closeDiploma() {
  const diplomaModal = document.getElementById("diplomaModal");
  if (diplomaModal) diplomaModal.style.display = "none";
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/* =========================================================
   CONSOLA CMD (juego.html) — 2 JUEGOS + INSTRUCCIONES SEPARADAS
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  const out = document.getElementById("cmdOutput");
  const input = document.getElementById("cmdInput");
  if (!out || !input) return;

  function print(text = "") {
    out.innerHTML += text + "\n";
    out.scrollTop = out.scrollHeight;
  }

  function cls() {
    out.innerHTML = "";
  }

  function header() {
    print("========================================");
    print("           CONSOLA BAT");
    print("========================================");
    print("");
  }

  function menu() {
    header();
    print("1) Jugar: Piedra, Papel o Tijera");
    print("2) Instrucciones: Piedra, Papel o Tijera");
    print("3) Jugar: Adivina el numero");
    print("4) Instrucciones: Adivina el numero");
    print("5) Instrucciones generales");
    print("6) Salir");
    print("");
    print("Escribe una opcion y pulsa ENTER");
  }

  function instruccionesGenerales() {
    header();
    print("INSTRUCCIONES GENERALES:");
    print("- Escribe el numero del menu (1-6) y pulsa ENTER.");
    print("- En cualquier momento puedes escribir:");
    print("    cls   -> limpia pantalla y vuelve al menu");
    print("    exit  -> salir");
    print("");
    print("Pulsa ENTER para volver al menu...");
  }

  function instruccionesPPT() {
    header();
    print("INSTRUCCIONES: PIEDRA, PAPEL O TIJERA");
    print("----------------------------------------");
    print("- Escribe: piedra, papel o tijera.");
    print("- El ordenador elige una opcion al azar.");
    print("- Reglas:");
    print("    piedra gana a tijera");
    print("    tijera gana a papel");
    print("    papel gana a piedra");
    print("- Si eliges lo mismo que el ordenador: empate.");
    print("");
    print("Pulsa ENTER para volver al menu...");
  }

  function instruccionesAdivina() {
    header();
    print("INSTRUCCIONES: ADIVINA EL NUMERO");
    print("----------------------------------------");
    print("- El ordenador piensa un numero del 1 al 20.");
    print("- Escribe un numero y pulsa ENTER para probar.");
    print("- Te dira si debes ir MAS ALTO o MAS BAJO.");
    print("- Ganas cuando aciertas. Se cuentan los intentos.");
    print("");
    print("Pulsa ENTER para volver al menu...");
  }

  // ===== Juego 1: Piedra Papel Tijera
  function pptStart() {
    header();
    print("JUEGO: PIEDRA, PAPEL O TIJERA");
    print("----------------------------------------");
    print("Escribe tu eleccion: piedra / papel / tijera");
    print("");
  }

  function pptPlay(choice) {
    const opciones = ["piedra", "papel", "tijera"];
    const pc = opciones[Math.floor(Math.random() * 3)];
    print("El ordenador elige: " + pc);

    if (choice === pc) {
      print("Resultado: EMPATE");
    } else if (
      (choice === "piedra" && pc === "tijera") ||
      (choice === "tijera" && pc === "papel") ||
      (choice === "papel" && pc === "piedra")
    ) {
      print("Resultado: ¡HAS GANADO!");
    } else {
      print("Resultado: HAS PERDIDO");
    }

    print("");
    print("Pulsa ENTER para volver al menu...");
  }

  // ===== Juego 2: Adivina el numero
  let guessTarget = null;
  let guessTries = 0;

  function guessStart() {
    guessTarget = Math.floor(Math.random() * 20) + 1; // 1..20
    guessTries = 0;

    header();
    print("JUEGO: ADIVINA EL NUMERO (1 al 20)");
    print("----------------------------------------");
    print("He pensado un numero del 1 al 20.");
    print("Escribe tu intento y pulsa ENTER.");
    print("");
  }

  function guessTry(cmd) {
    const n = Number(cmd);

    if (!Number.isFinite(n) || !Number.isInteger(n)) {
      print("Eso no parece un numero valido. Prueba otra vez (1-20).");
      return false;
    }

    if (n < 1 || n > 20) {
      print("Fuera de rango. Debe ser entre 1 y 20.");
      return false;
    }

    guessTries++;

    if (n === guessTarget) {
      print(`✅ Correcto. Era el ${guessTarget}.`);
      print(`Intentos: ${guessTries}`);
      print("");
      print("Pulsa ENTER para volver al menu...");
      return true;
    }

    if (n < guessTarget) {
      print("🔼 Pista: MAS ALTO.");
    } else {
      print("🔽 Pista: MAS BAJO.");
    }

    print(`Intentos: ${guessTries}`);
    return false;
  }

  // ===== Estado
  let estado = "menu";

  cls();
  print("Bienvenido a la consola de juego BAT.");
  print("");
  menu();

  document.addEventListener("click", () => input.focus(), { once: true });

  input.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;

    const cmd = input.value.trim().toLowerCase();
    input.value = "";

    if (cmd !== "") print("C:\\JuegoBAT>" + cmd);

    // comandos globales
    if (cmd === "cls") {
      cls();
      menu();
      estado = "menu";
      return;
    }
    if (cmd === "exit") {
      print("");
      print("Saliendo...");
      print("Gracias por jugar.");
      estado = "salir";
      return;
    }
    if (estado === "salir") return;

    // MENU
    if (estado === "menu") {
      if (cmd === "1") {
        estado = "ppt";
        pptStart();
      } else if (cmd === "2") {
        estado = "help_ppt";
        instruccionesPPT();
      } else if (cmd === "3") {
        estado = "guess";
        guessStart();
      } else if (cmd === "4") {
        estado = "help_guess";
        instruccionesAdivina();
      } else if (cmd === "5") {
        estado = "help_general";
        instruccionesGenerales();
      } else if (cmd === "6") {
        print("");
        print("Saliendo...");
        print("Gracias por jugar.");
        estado = "salir";
      } else {
        print("Opcion no valida.");
      }
      return;
    }

    // PANTALLAS DE AYUDA (ENTER -> volver al menu)
    if (
      estado === "help_general" ||
      estado === "help_ppt" ||
      estado === "help_guess"
    ) {
      estado = "menu";
      cls();
      menu();
      return;
    }

    // JUEGO PPT
    if (estado === "ppt") {
      const opciones = ["piedra", "papel", "tijera"];
      if (!opciones.includes(cmd)) {
        print("Opcion no valida. Escribe piedra, papel o tijera.");
        return;
      }
      pptPlay(cmd);
      estado = "volver_menu";
      return;
    }

    // JUEGO ADIVINA
    if (estado === "guess") {
      const finished = guessTry(cmd);
      if (finished) estado = "volver_menu";
      return;
    }

    // VOLVER MENU
    if (estado === "volver_menu") {
      estado = "menu";
      cls();
      menu();
      return;
    }
  });

  
});