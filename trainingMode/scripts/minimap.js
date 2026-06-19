/**
 * minimap.js
 * Minimap level selection with a dropdown to pick game modes.
 * Loads gameModes.json, populates the dropdown, and renders
 * submodes as phase nodes on a map when a game mode is selected.
 * Uses HackerNoon Pixel Icon Library classes from icon_class in JSON.
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

// --- Render dropdown items ---
function renderDropdown() {
    dropdownMenu.innerHTML = '';

    gameModes.forEach((mode) => {
        const item = document.createElement('button');
        item.className = 'dropdown-item';
        item.id = 'dropdown-' + mode.id;
        item.textContent = mode.name;
        item.addEventListener('click', () => selectMode(mode));
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
        const node = document.createElement('a');
        node.className = 'phase-node';
        node.href = sub.link;
        node.id = 'phase-' + sub.id;

        // Use icon_class from JSON (HackerNoon Pixel Icon Library)
        const iconClass = sub.icon_class || 'hn hn-gamepad-solid';

        node.innerHTML = `
            <div class="phase-icon">
                <i class="${iconClass}"></i>
                <span class="phase-num">${i + 1}</span>
            </div>
            <span class="phase-label">${sub.name}</span>
            <span class="phase-tag">PHASE ${i + 1}</span>
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
        path.setAttribute('class', 'path-line');
        pathSvg.appendChild(path);
    }
}
