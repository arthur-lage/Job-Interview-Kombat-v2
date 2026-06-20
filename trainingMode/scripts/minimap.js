/**
 * minimap.js
 * Minimap level selection with a dropdown to pick game modes.
 * Loads gameModes.json, populates the dropdown, and renders
 * submodes as phase nodes on a map when a game mode is selected.
 * Uses HackerNoon Pixel Icon Library classes from icon_class in JSON.
 *
 * Sistema de desbloqueio:
 *   - Game modes: TUTORIAL e PERSONA sempre desbloqueados.
 *     A partir de INTRODUÇÃO, cada modo requer que TODOS os sub-modos
 *     do modo anterior estejam completos.
 *   - Fases (sub-modos): dentro de cada game mode, as fases são sequenciais.
 *     Vocabulary é sempre desbloqueado. Audio Quiz requer Vocabulary completo.
 *     Quiz requer Audio Quiz completo. Interview requer Quiz completo.
 */

// --- DOM refs ---
const dropdownToggle = document.getElementById('dropdown-toggle');
const dropdownLabel = document.getElementById('dropdown-label');
const dropdownArrow = document.getElementById('dropdown-arrow');
const dropdownMenu = document.getElementById('dropdown-menu');
const phasesContainer = document.getElementById('phases-container');
const phasesPlaceholder = document.getElementById('phases-placeholder');
const phasesMap = document.getElementById('phases-map');
const phasesNodes = document.getElementById('phases-nodes');
const pathSvg = document.getElementById('path-svg');

let gameModes = [];
let selectedModeId = null;
let dropdownOpen = false;

/** Índice a partir do qual os game modes ficam bloqueados por progresso (0-based) */
const FIRST_LOCKED_MODE_INDEX = 2; // introduction é o 3º item (index 2)

// --- Init ---
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const res = await fetch('../db/gameModes.json');
        const data = await res.json();
        gameModes = data.gameModes;
    } catch (err) {
        console.error('Error loading gameModes:', err);
        return;
    }

    // Garante que Progress esteja carregado
    if (typeof Progress !== 'undefined') {
        Progress.load();
    }

    renderDropdown();

    // Toggle dropdown
    dropdownToggle.addEventListener('click', toggleDropdown);

    // Close dropdown on outside click
    document.addEventListener('click', (e) => {
        if (!document.getElementById('dropdown-container').contains(e.target)) {
            closeDropdown();
        }
    });

    // Keyboard: Escape to close dropdown
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeDropdown();
    });

    // Redraw paths on resize
    window.addEventListener('resize', () => {
        if (selectedModeId !== null) {
            drawPaths();
        }
    });
});

// --- Game Mode Unlock Logic ---

/**
 * Verifica se um game mode (pelo seu índice global) está desbloqueado.
 * - Índices < FIRST_LOCKED_MODE_INDEX: sempre desbloqueado.
 * - Índices >= FIRST_LOCKED_MODE_INDEX: requer que o modo anterior esteja 100% completo.
 */
function isGameModeUnlocked(modeIndex) {
    if (modeIndex < FIRST_LOCKED_MODE_INDEX) return true;
    if (typeof Progress === 'undefined') return false;

    const prevMode = gameModes[modeIndex - 1];
    if (!prevMode) return false;

    const subModeIds = prevMode.subModes.map(s => s.id);
    return Progress.isGameModeComplete(prevMode.id, subModeIds);
}

/**
 * Verifica se uma fase (sub-modo) dentro de um game mode está desbloqueada.
 * A primeira fase (index 0, Vocabulary) é sempre desbloqueada.
 * As fases seguintes requerem que a fase anterior esteja completa.
 */
function isPhaseUnlocked(mode, phaseIndex) {
    if (phaseIndex === 0) return true;
    if (typeof Progress === 'undefined') return false;

    const prevPhase = mode.subModes[phaseIndex - 1];
    if (!prevPhase) return false;

    return Progress.isSubModeComplete(mode.id, prevPhase.id);
}

/**
 * Verifica se uma fase (sub-modo) já foi completada.
 */
function isPhaseComplete(mode, subModeId) {
    if (typeof Progress === 'undefined') return false;
    return Progress.isSubModeComplete(mode.id, subModeId);
}

// --- Render dropdown items ---
function renderDropdown() {
    dropdownMenu.innerHTML = '';

    gameModes.forEach((mode, index) => {
        const unlocked = isGameModeUnlocked(index);
        const item = document.createElement('button');
        item.className = 'dropdown-item';
        item.id = 'dropdown-' + mode.id;

        if (unlocked) {
            // Verifica se o modo está 100% completo
            let isComplete = false;
            if (typeof Progress !== 'undefined') {
                const subModeIds = mode.subModes.map(s => s.id);
                isComplete = Progress.isGameModeComplete(mode.id, subModeIds);
            }

            item.innerHTML = isComplete
                ? `<span class="dropdown-complete-icon">✓</span> ${mode.name}`
                : mode.name;

            if (isComplete) item.classList.add('dropdown-complete');

            item.addEventListener('click', () => selectMode(mode));
        } else {
            item.innerHTML = `<i class="hn hn-lock dropdown-lock-icon"></i> ${mode.name}`;
            item.classList.add('dropdown-locked');
            item.disabled = true;
            item.title = 'Complete todos os sub-modos do modo anterior para desbloquear';
        }

        dropdownMenu.appendChild(item);
    });
}

// --- Toggle dropdown ---
function toggleDropdown() {
    dropdownOpen = !dropdownOpen;
    dropdownToggle.classList.toggle('open', dropdownOpen);
    dropdownMenu.classList.toggle('open', dropdownOpen);
}

function closeDropdown() {
    dropdownOpen = false;
    dropdownToggle.classList.remove('open');
    dropdownMenu.classList.remove('open');
}

// --- Select a game mode ---
function selectMode(mode) {
    selectedModeId = mode.id;
    dropdownLabel.textContent = mode.name;
    closeDropdown();

    // Update selected state in dropdown
    dropdownMenu.querySelectorAll('.dropdown-item').forEach((item) => {
        item.classList.toggle('selected', item.id === 'dropdown-' + mode.id);
    });

    renderPhases(mode);
}

// --- Render phase nodes on the map ---
function renderPhases(mode) {
    phasesPlaceholder.style.display = 'none';
    phasesMap.style.display = 'flex';
    phasesMap.style.flexDirection = 'column';
    phasesMap.style.alignItems = 'center';
    phasesMap.classList.remove('entering');

    // Force reflow for animation
    void phasesMap.offsetWidth;
    phasesMap.classList.add('entering');

    phasesNodes.innerHTML = '';

    mode.subModes.forEach((sub, i) => {
        const unlocked = isPhaseUnlocked(mode, i);
        const completed = isPhaseComplete(mode, sub.id);

        const node = document.createElement(unlocked ? 'a' : 'div');
        node.className = 'phase-node';
        node.id = 'phase-' + sub.id;

        if (unlocked) {
            node.href = sub.link;
        } else {
            node.classList.add('phase-locked');
        }

        if (completed) {
            node.classList.add('phase-completed');
        }

        // Use icon_class from JSON (HackerNoon Pixel Icon Library)
        // If locked, show lock icon instead
        const iconClass = unlocked
            ? (sub.icon_class || 'hn hn-gamepad-solid')
            : 'hn hn-lock';

        const completeBadge = completed
            ? `<span class="phase-complete-badge">✓</span>`
            : '';

        node.innerHTML = `
            <div class="phase-icon">
                <i class="${iconClass}"></i>
                <span class="phase-num">${i + 1}</span>
                ${completeBadge}
            </div>
            <span class="phase-label">${sub.name}</span>
            <span class="phase-tag">${unlocked ? 'PHASE ' + (i + 1) : '🔒 LOCKED'}</span>
        `;

        phasesNodes.appendChild(node);
    });

    // Draw paths between phases after render
    requestAnimationFrame(() => {
        setTimeout(() => {
            drawPaths();
        }, 100);
    });
}

// --- Draw dotted paths between phase nodes using SVG ---
function drawPaths() {
    pathSvg.innerHTML = '';

    const nodes = phasesNodes.querySelectorAll('.phase-node');
    if (nodes.length < 2) return;

    const containerRect = phasesMap.getBoundingClientRect();

    const centers = Array.from(nodes).map(node => {
        const iconEl = node.querySelector('.phase-icon');
        const rect = iconEl.getBoundingClientRect();
        return {
            x: rect.left + rect.width / 2 - containerRect.left,
            y: rect.top + rect.height / 2 - containerRect.top,
            locked: node.classList.contains('phase-locked'),
        };
    });

    // Set SVG viewBox to match container
    pathSvg.setAttribute('viewBox', `0 0 ${containerRect.width} ${containerRect.height}`);
    pathSvg.style.width = containerRect.width + 'px';
    pathSvg.style.height = containerRect.height + 'px';

    // Draw line segments between consecutive nodes
    for (let i = 0; i < centers.length - 1; i++) {
        const from = centers[i];
        const to = centers[i + 1];

        const midX = (from.x + to.x) / 2;
        const midY = Math.min(from.y, to.y) - 15;

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', `M ${from.x} ${from.y} Q ${midX} ${midY}, ${to.x} ${to.y}`);
        path.setAttribute('class', to.locked ? 'path-line path-line-locked' : 'path-line');
        pathSvg.appendChild(path);
    }
}
