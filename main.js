document.addEventListener("DOMContentLoaded", () => {
  // =======================
  // QUIZ: abrir modal
  // =======================
  const openQuizBtn = document.getElementById("openQuizBtn");
  const quizModal = document.getElementById("quizModal");

  if (openQuizBtn && quizModal) {
    openQuizBtn.addEventListener("click", () => {
      quizModal.style.display = "flex";
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

  // Aplicar al cargar
  setTheme(localStorage.getItem("theme") || "light");

  // Click
  if (toggle) {
    toggle.addEventListener("click", () => {
      const newTheme = document.body.classList.contains("dark")
        ? "light"
        : "dark";
      setTheme(newTheme);
    });
  }
});

// Cerrar quiz
function closeQuiz() {
  const quizModal = document.getElementById("quizModal");
  if (quizModal) quizModal.style.display = "none";
}

// Cerrar modal nombre
function closeName() {
  const nameModal = document.getElementById("nameModal");
  if (nameModal) nameModal.style.display = "none";
}

// Comprobación del quiz (detecta la página)
function checkQuiz() {
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

  let score = 0;

  for (let q in correct) {
    const selected = document.querySelector(`input[name="${q}"]:checked`);
    if (selected && selected.value === correct[q]) score++;
  }

  if (score === 25) {
    closeQuiz();
    const nameModal = document.getElementById("nameModal");
    if (nameModal) nameModal.style.display = "flex";
  } else {
    alert(
      "Algunas respuestas son incorrectas. Revisa el contenido e inténtalo de nuevo.",
    );
  }
}

// Generar diploma (detecta la página)
function generateDiploma() {
  const nameInput = document.getElementById("studentName");
  const diplomaText = document.getElementById("diplomaText");
  const diplomaModal = document.getElementById("diplomaModal");
  const nameModal = document.getElementById("nameModal");

  if (!nameInput || !diplomaText || !diplomaModal || !nameModal) return;

  const name = nameInput.value.trim();
  if (name === "") {
    alert("Por favor, introduce tu nombre.");
    return;
  }

  // Cerrar modal de nombre
  nameModal.style.display = "none";

  const isHistoria = window.location.pathname
    .toLowerCase()
    .includes("historia");
  const mensaje = isHistoria
    ? "has completado con éxito todo el estudio de <strong>HISTORIA DE LOS SISTEMAS OPERATIVOS</strong>. ¡Enhorabuena!"
    : "has completado con éxito todo el estudio del <strong>CURSO BAT</strong>. ¡Enhorabuena!";

  diplomaText.innerHTML = `<strong>${name}</strong>, ${mensaje}`;
  diplomaModal.style.display = "flex";
}

function closeDiploma() {
  const diplomaModal = document.getElementById("diplomaModal");
  if (diplomaModal) diplomaModal.style.display = "none";
}

/* =========================
   CONSOLA CMD (solo juego.html)
   ========================= */
document.addEventListener("DOMContentLoaded", () => {
  const out = document.getElementById("cmdOutput");
  const input = document.getElementById("cmdInput");

  // Si no estamos en juego.html, no hacemos nada
  if (!out || !input) return;

  function print(text = "") {
    out.innerHTML += text + "\n";
    out.scrollTop = out.scrollHeight;
  }

  function cls() {
    out.innerHTML = "";
  }

  function menu() {
    print("========================================");
    print("        JUEGO PIEDRA PAPEL TIJERA");
    print("========================================");
    print("");
    print("1) Jugar");
    print("2) Instrucciones");
    print("3) Salir");
    print("");
    print("Escribe una opción y pulsa ENTER");
  }

  function instrucciones() {
    print("");
    print("INSTRUCCIONES:");
    print("- Escribe piedra, papel o tijera cuando el juego lo pida.");
    print("- El ordenador elegirá aleatoriamente.");
    print("- Se mostrará si ganas, pierdes o empatas.");
    print("");
    print("Pulsa ENTER para volver al menú...");
  }

  function jugar() {
    print("");
    print("Escribe tu elección: piedra / papel / tijera");
    print("");
  }

  // Estado
  let estado = "menu";

  // Inicio
  cls();
  print("Bienvenido al juego BAT de Piedra, Papel o Tijera");
  print("");
  menu();

  // Mejor: no forzar scroll al cargar (haz foco al primer click)
  document.addEventListener(
    "click",
    () => {
      input.focus();
    },
    { once: true },
  );

  input.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;

    const cmd = input.value.trim().toLowerCase();
    input.value = "";

    print("C:\\JuegoBAT>" + cmd);

    if (estado === "menu") {
      if (cmd === "1") {
        estado = "jugar";
        jugar();
      } else if (cmd === "2") {
        estado = "instrucciones";
        instrucciones();
      } else if (cmd === "3" || cmd === "exit") {
        print("");
        print("Saliendo del juego...");
        print("Gracias por jugar.");
        estado = "salir";
      } else if (cmd === "cls") {
        cls();
        menu();
      } else {
        print("Opción no válida.");
      }
    } else if (estado === "instrucciones") {
      estado = "menu";
      menu();
    } else if (estado === "jugar") {
      const opciones = ["piedra", "papel", "tijera"];

      if (!opciones.includes(cmd)) {
        print("Opción no válida. Escribe piedra, papel o tijera.");
        return;
      }

      const pc = opciones[Math.floor(Math.random() * 3)];
      print("El ordenador elige: " + pc);

      if (cmd === pc) {
        print("Resultado: EMPATE");
      } else if (
        (cmd === "piedra" && pc === "tijera") ||
        (cmd === "tijera" && pc === "papel") ||
        (cmd === "papel" && pc === "piedra")
      ) {
        print("Resultado: ¡HAS GANADO!");
      } else {
        print("Resultado: HAS PERDIDO");
      }

      print("");
      print("Pulsa ENTER para volver al menú...");
      estado = "volver_menu";
    } else if (estado === "volver_menu") {
      estado = "menu";
      menu();
    }
  });
});
