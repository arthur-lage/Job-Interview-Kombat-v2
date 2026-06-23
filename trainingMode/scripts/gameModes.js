/**
 * gameModes.js
 * Carrega modos de jogo do JSON, renderiza na página trainingMode.html
 * com paginação, navegação tópicos → sub-modos e sistema de desbloqueio progressivo.
 *
 * Regra de desbloqueio:
 *   - Os dois primeiros modos (TUTORIAL GRAMATICA e PROFILE) são sempre desbloqueados.
 *   - A partir de INTRODUCAO, cada modo só desbloqueia quando TODOS os sub-modos
 *     do modo anterior foram completados (verificado via Progress).
 */

const ITEMS_PER_PAGE = 4;

let gameModes = [];
let currentPage = 0;
let currentView = "topics"; // "topics" ou "submodes"
let selectedMode = null;

/** Travas reativadas. Módulos opcionais são ignorados ao calcular pré-requisitos. */

const container = document.getElementById("menu-container");
const pagination = document.getElementById("pagination");
const prevBtn = document.getElementById("page-prev");
const nextBtn = document.getElementById("page-next");
const pageIndicator = document.getElementById("page-indicator");
const backBtn = document.getElementById("back-btn");

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const res = await fetch("../db/gameModes.json");
        const data = await res.json();
        gameModes = data.gameModes;
    } catch (err) {
        console.error("Erro ao carregar gameModes:", err);
        return;
    }

    // Garante que Progress esteja carregado
    if (typeof Progress !== 'undefined') {
        Progress.load();
    }

    renderTopics();

    prevBtn.addEventListener("click", () => {
        if (currentPage > 0) {
            currentPage--;
            renderCurrentView();
        }
    });

    nextBtn.addEventListener("click", () => {
        const totalPages = getTotalPages();
        if (currentPage < totalPages - 1) {
            currentPage++;
            renderCurrentView();
        }
    });
});

function getTotalPages() {
    const items = currentView === "topics" ? gameModes : selectedMode.subModes;
    return Math.ceil(items.length / ITEMS_PER_PAGE);
}

function renderCurrentView() {
    if (currentView === "topics") {
        renderTopics();
    } else {
        renderSubModes(selectedMode);
    }
}

/**
 * Encontra o índice do último módulo obrigatório antes de `modeIndex`.
 */
function prevRequiredIndex(modeIndex) {
    for (let i = modeIndex - 1; i >= 0; i--) {
        if (!gameModes[i].optional) return i;
    }
    return -1;
}

/**
 * Verifica se um modo está desbloqueado.
 * - Opcionais: sempre desbloqueados.
 * - Obrigatórios: requerem que o anterior obrigatório esteja 100% completo.
 */
function isModeUnlocked(modeIndex) {
    const mode = gameModes[modeIndex];
    if (!mode) return false;
    if (mode.optional) return true;

    const prevIdx = prevRequiredIndex(modeIndex);
    if (prevIdx === -1) return true;

    if (typeof Progress === 'undefined') return false;
    const prevMode = gameModes[prevIdx];
    const subModeIds = prevMode.subModes.map(s => s.id);
    return Progress.isGameModeComplete(prevMode.id, subModeIds);
}

function renderTopics() {
    currentView = "topics";
    container.innerHTML = "";

    const totalPages = getTotalPages();
    const start = currentPage * ITEMS_PER_PAGE;
    const end = Math.min(start + ITEMS_PER_PAGE, gameModes.length);
    const pageItems = gameModes.slice(start, end);

    pageItems.forEach((mode, localIndex) => {
        const globalIndex = start + localIndex;
        const unlocked = isModeUnlocked(globalIndex);

        const btn = document.createElement("button");
        btn.className = "menu-item animate-enter";
        btn.style.animationDelay = `${localIndex * 0.08}s`;
        btn.id = "topic-" + mode.id;

        if (unlocked) {
            // Verifica se o modo está 100% completo para mostrar indicador
            let isComplete = false;
            if (typeof Progress !== 'undefined') {
                const subModeIds = mode.subModes.map(s => s.id);
                isComplete = Progress.isGameModeComplete(mode.id, subModeIds);
            }

            btn.innerHTML = isComplete
                ? `<span class="mode-complete-icon">✓</span> ${mode.name}`
                : mode.name;

            if (isComplete) btn.classList.add("mode-complete");

            btn.addEventListener("click", () => {
                selectedMode = mode;
                currentPage = 0;
                renderSubModes(mode);
            });
        } else {
            btn.innerHTML = `<i class="hn hn-lock mode-lock-icon"></i> ${mode.name}`;
            btn.classList.add("locked");
            btn.disabled = true;
            btn.title = "Complete todos os sub-modos do modo anterior para desbloquear";
        }

        container.appendChild(btn);
    });

    updatePagination(totalPages);

    // Voltar = ir pra home
    backBtn.href = "/";
    backBtn.onclick = null;
}

function renderSubModes(mode) {
    currentView = "submodes";
    container.innerHTML = "";

    const totalPages = getTotalPages();
    const start = currentPage * ITEMS_PER_PAGE;
    const end = Math.min(start + ITEMS_PER_PAGE, mode.subModes.length);
    const pageItems = mode.subModes.slice(start, end);

    pageItems.forEach((sub, index) => {
        const link = document.createElement("a");
        link.className = "menu-item animate-enter";
        link.style.animationDelay = `${index * 0.08}s`;
        link.id = sub.id;
        link.href = sub.link;

        // Verifica se este sub-modo já foi completado
        let isComplete = false;
        if (typeof Progress !== 'undefined') {
            isComplete = Progress.isSubModeComplete(mode.id, sub.id);
        }

        if (isComplete) {
            link.innerHTML = `<span class="submode-complete-icon">✓</span> ${sub.name}`;
            link.classList.add("submode-complete");
        } else {
            link.textContent = sub.name;
        }

        container.appendChild(link);
    });

    // BACK no final (só se cabe ou se é a última página)
    if (currentPage === totalPages - 1 || totalPages <= 1) {
        const backItem = document.createElement("button");
        backItem.className = "menu-item back-btn animate-enter";
        backItem.style.animationDelay = `${pageItems.length * 0.08}s`;
        backItem.textContent = "BACK";
        backItem.addEventListener("click", goBackToTopics);
        container.appendChild(backItem);
    }

    updatePagination(totalPages);

    // Voltar (header) = voltar pra tópicos
    backBtn.onclick = (e) => {
        e.preventDefault();
        goBackToTopics();
    };
}

function goBackToTopics() {
    currentPage = 0;
    selectedMode = null;
    renderTopics();
}

function updatePagination(totalPages) {
    if (totalPages <= 1) {
        pagination.style.visibility = "hidden";
    } else {
        pagination.style.visibility = "visible";
        pageIndicator.textContent = (currentPage + 1) + "/" + totalPages;
        prevBtn.disabled = currentPage === 0;
        nextBtn.disabled = currentPage === totalPages - 1;
    }
}
