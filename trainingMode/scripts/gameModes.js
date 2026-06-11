/**
 * gameModes.js
 * Carrega modos de jogo do JSON, renderiza na página trainingMode.html
 * com paginação e navegação tópicos → sub-modos.
 */

const ITEMS_PER_PAGE = 4;

let gameModes = [];
let currentPage = 0;
let currentView = "topics"; // "topics" ou "submodes"
let selectedMode = null;

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

function renderTopics() {
    currentView = "topics";
    container.innerHTML = "";

    const totalPages = getTotalPages();
    const start = currentPage * ITEMS_PER_PAGE;
    const end = Math.min(start + ITEMS_PER_PAGE, gameModes.length);
    const pageItems = gameModes.slice(start, end);

    pageItems.forEach((mode, index) => {
        const btn = document.createElement("button");
        btn.className = "menu-item animate-enter";
        btn.style.animationDelay = `${index * 0.08}s`;
        btn.id = "topic-" + mode.id;
        btn.textContent = mode.name;
        btn.addEventListener("click", () => {
            selectedMode = mode;
            currentPage = 0;
            renderSubModes(mode);
        });
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
        link.textContent = sub.name;
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
