/**
 * minimap.js
 * Interactive World Map for Training Mode in Job Interview Kombat.
 * Renders game modes as campaign nodes on a 2D map board with SVG path lines.
 * Clicking a node opens a Zone Detail modal to select and launch submodes (phases).
 */

document.addEventListener('DOMContentLoaded', async () => {
    // --- DOM References ---
    const overallProgressLabel = document.getElementById('overall-progress-label');
    const overallProgressFill = document.getElementById('overall-progress-fill');
    
    const dropdownToggle = document.getElementById('dropdown-toggle');
    const dropdownArrow = document.getElementById('dropdown-arrow');
    const dropdownMenu = document.getElementById('dropdown-menu');

    const mapViewport = document.getElementById('map-viewport');
    const mapNodesContainer = document.getElementById('map-nodes-container');
    const mapPathSvg = document.getElementById('map-path-svg');

    const zoneModalOverlay = document.getElementById('zone-modal-overlay');
    const zoneModalCard = document.getElementById('zone-modal-card');
    const zoneModalClose = document.getElementById('zone-modal-close');
    const zoneModalIcon = document.getElementById('zone-modal-icon');
    const zoneModalCategory = document.getElementById('zone-modal-category');
    const zoneModalTitle = document.getElementById('zone-modal-title');
    const zoneModalDesc = document.getElementById('zone-modal-desc');
    const zoneModalProgressCount = document.getElementById('zone-modal-progress-count');
    const zoneModalProgressFill = document.getElementById('zone-modal-progress-fill');
    const zonePhasesGrid = document.getElementById('zone-phases-grid');

    let gameModes = [];
    let selectedMode = null;
    let dropdownOpen = false;

    // --- Load Data & Init ---
    try {
        const res = await fetch('../db/gameModes.json');
        const data = await res.json();
        gameModes = data.gameModes || [];
    } catch (err) {
        console.error('Failed to load gameModes.json:', err);
        return;
    }

    if (typeof Progress !== 'undefined') {
        Progress.load();
    }

    updateOverallProgress();
    renderQuickDropdown();
    renderWorldMap();

    // Redraw SVG paths on window resize
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            drawMapPaths();
        }, 80);
    });

    // Dropdown listeners
    dropdownToggle.addEventListener('click', toggleDropdown);
    document.addEventListener('click', (e) => {
        const container = document.querySelector('.quick-select-container');
        if (container && !container.contains(e.target)) {
            closeDropdown();
        }
    });

    // Modal close listeners
    zoneModalClose.addEventListener('click', closeZoneModal);
    zoneModalOverlay.addEventListener('click', (e) => {
        if (e.target === zoneModalOverlay) {
            closeZoneModal();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeDropdown();
            closeZoneModal();
        }
    });

    // Open modal directly if mode specified in URL query (e.g. ?select=meetings)
    const urlParams = new URLSearchParams(window.location.search);
    const modeParam = urlParams.get('mode') || urlParams.get('select');
    if (modeParam) {
        const targetMode = gameModes.find(m => m.id === modeParam);
        if (targetMode) {
            openZoneModal(targetMode);
        }
    }

    // --- Functions ---

    /** Update campaign overall completion */
    function updateOverallProgress() {
        if (typeof Progress === 'undefined' || !gameModes.length) return;
        const { completed, total } = Progress.getOverallProgress(gameModes);
        const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
        
        overallProgressLabel.textContent = `PROGRESS: ${completed}/${total} (${percent}%)`;
        overallProgressFill.style.width = `${percent}%`;
    }

    /** Pre-requisite check for Game Mode unlock */
    function prevRequiredIndex(modeIndex) {
        for (let i = modeIndex - 1; i >= 0; i--) {
            if (!gameModes[i].optional) return i;
        }
        return -1;
    }

    function isGameModeUnlocked(modeIndex) {
        const mode = gameModes[modeIndex];
        if (!mode) return false;
        if (mode.optional || mode.unlocked) return true;

        const prevIdx = prevRequiredIndex(modeIndex);
        if (prevIdx === -1) return true;

        if (typeof Progress === 'undefined') return false;
        const prevMode = gameModes[prevIdx];
        const subModeIds = prevMode.subModes.map(s => s.id);
        return Progress.isGameModeComplete(prevMode.id, subModeIds);
    }

    function isPhaseUnlocked(mode, phaseIndex) {
        if (phaseIndex === 0 || mode.unlocked) return true;
        if (typeof Progress === 'undefined') return false;

        const prevPhase = mode.subModes[phaseIndex - 1];
        if (!prevPhase) return false;

        return Progress.isSubModeComplete(mode.id, prevPhase.id);
    }

    function isPhaseComplete(mode, subModeId) {
        if (typeof Progress === 'undefined') return false;
        return Progress.isSubModeComplete(mode.id, subModeId);
    }

    /** Quick Dropdown */
    function renderQuickDropdown() {
        dropdownMenu.innerHTML = '';
        gameModes.forEach((mode, idx) => {
            const unlocked = isGameModeUnlocked(idx);
            const item = document.createElement('button');
            item.className = 'dropdown-item';

            const subModeIds = mode.subModes.map(s => s.id);
            const isComplete = typeof Progress !== 'undefined' && Progress.isGameModeComplete(mode.id, subModeIds);

            if (unlocked) {
                item.innerHTML = isComplete
                    ? `<span class="dropdown-complete-icon">✓</span> ${mode.name}`
                    : `${mode.name}`;
                if (isComplete) item.classList.add('dropdown-complete');

                item.addEventListener('click', () => {
                    closeDropdown();
                    openZoneModal(mode);
                });
            } else {
                item.innerHTML = `<i class="hn hn-lock dropdown-lock-icon"></i> ${mode.name}`;
                item.classList.add('dropdown-locked');
                item.disabled = true;
            }

            dropdownMenu.appendChild(item);
        });
    }

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

    /** Render World Map Grid with Serpentine Winding Path */
    function renderWorldMap() {
        mapNodesContainer.innerHTML = '';

        const DEFAULT_EMOJIS = {
            tutorial_grammar: '🎓',
            introduction: '👋',
            experience: '💼',
            meetings: '🚨',
            classic_questions: '❓',
            soft_skills: '💖',
            hard_skills: '💻',
            salary_negotiation: '💰',
            profile: '👤'
        };

        // Re-order nodes for serpentine winding layout:
        // Row 1: [0, 1, 2] (Left -> Right)
        // Row 2: [5, 4, 3] (Left <- Right, so order in container is 3 at col 3, 4 at col 2, 5 at col 1)
        // Row 3: [6, 7, 8] (Left -> Right)
        const serpentineIndices = [0, 1, 2, 5, 4, 3, 6, 7, 8];

        // Map gameModes into serpentine grid slots
        gameModes.forEach((mode, idx) => {
            const unlocked = isGameModeUnlocked(idx);
            const subModeIds = mode.subModes.map(s => s.id);
            
            let completedCount = 0;
            let totalCount = subModeIds.length;
            if (typeof Progress !== 'undefined') {
                const prog = Progress.getGameModeProgress(mode.id, subModeIds);
                completedCount = prog.completed;
            }

            const isFullyComplete = completedCount === totalCount && totalCount > 0;
            const modeEmoji = mode.icon_emoji || DEFAULT_EMOJIS[mode.id] || '🎮';

            const node = document.createElement('div');
            node.className = `map-mode-node mode-${mode.id}`;
            node.id = `node-${mode.id}`;
            node.setAttribute('data-index', idx);

            // Assign grid order based on serpentine sequence
            // Row 1: idx 0,1,2 -> order 1,2,3
            // Row 2: idx 3,4,5 -> order 6,5,4
            // Row 3: idx 6,7,8 -> order 7,8,9
            let gridOrder = idx + 1;
            if (idx === 3) gridOrder = 6;
            if (idx === 4) gridOrder = 5;
            if (idx === 5) gridOrder = 4;
            node.style.order = gridOrder;

            if (unlocked) {
                node.classList.add('unlocked');
            } else {
                node.classList.add('locked');
            }

            if (isFullyComplete) {
                node.classList.add('completed');
            }

            // Optional or Complete Badge
            const badgeHtml = mode.optional
                ? `<span class="node-badge optional">TUTORIAL</span>`
                : (isFullyComplete ? `<span class="node-badge complete">✓ 100%</span>` : '');

            node.innerHTML = `
                ${badgeHtml}
                <div class="node-icon-wrapper">
                    ${unlocked ? `<span class="node-emoji">${modeEmoji}</span>` : `<i class="hn hn-lock"></i>`}
                    ${unlocked ? `<span class="node-index">${idx + 1}</span>` : ''}
                </div>
                <div class="node-info">
                    <span class="node-title">${mode.name}</span>
                    <span class="node-progress">${unlocked ? `${completedCount}/${totalCount} PHASES` : '🔒 LOCKED'}</span>
                </div>
            `;

            if (unlocked) {
                node.addEventListener('click', () => openZoneModal(mode));
            } else {
                node.addEventListener('click', () => {
                    node.classList.add('shake');
                    setTimeout(() => node.classList.remove('shake'), 500);
                });
            }

            mapNodesContainer.appendChild(node);
        });

        // Request animation frame for initial SVG path drawing
        requestAnimationFrame(() => {
            setTimeout(drawMapPaths, 120);
        });
    }

    /** Draw SVG connecting paths between sequential nodes */
    function drawMapPaths() {
        mapPathSvg.innerHTML = '';
        const nodeEls = mapNodesContainer.querySelectorAll('.map-mode-node');
        if (nodeEls.length < 2) return;

        const viewportRect = mapViewport.getBoundingClientRect();
        mapPathSvg.setAttribute('viewBox', `0 0 ${viewportRect.width} ${viewportRect.height}`);
        mapPathSvg.style.width = viewportRect.width + 'px';
        mapPathSvg.style.height = viewportRect.height + 'px';

        const centers = Array.from(nodeEls).map((node, i) => {
            const iconWrapper = node.querySelector('.node-icon-wrapper');
            const rect = iconWrapper.getBoundingClientRect();
            return {
                x: rect.left + rect.width / 2 - viewportRect.left,
                y: rect.top + rect.height / 2 - viewportRect.top,
                unlocked: isGameModeUnlocked(i)
            };
        });

        for (let i = 0; i < centers.length - 1; i++) {
            const from = centers[i];
            const to = centers[i + 1];

            // Control points for smooth organic curves
            const deltaX = to.x - from.x;
            const deltaY = to.y - from.y;
            const midX = (from.x + to.x) / 2 + (deltaY * 0.15);
            const midY = (from.y + to.y) / 2 - (deltaX * 0.15);

            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', `M ${from.x} ${from.y} Q ${midX} ${midY}, ${to.x} ${to.y}`);
            
            const isPathUnlocked = from.unlocked && to.unlocked;
            path.setAttribute('class', isPathUnlocked ? 'map-path-line' : 'map-path-line locked');
            
            mapPathSvg.appendChild(path);
        }
    }

    /** Open Zone Detail Modal for a Game Mode */
    function openZoneModal(mode) {
        selectedMode = mode;
        const modeIndex = gameModes.findIndex(m => m.id === mode.id);

        // Header info
        const DEFAULT_EMOJIS = {
            tutorial_grammar: '🎓',
            introduction: '👋',
            experience: '💼',
            meetings: '🚨',
            classic_questions: '❓',
            soft_skills: '💖',
            hard_skills: '💻',
            salary_negotiation: '💰',
            profile: '👤'
        };

        const modeEmoji = mode.icon_emoji || DEFAULT_EMOJIS[mode.id] || '🎮';
        zoneModalIcon.innerHTML = `<span class="node-emoji">${modeEmoji}</span>`;
        zoneModalCategory.textContent = mode.optional ? 'OPTIONAL TUTORIAL' : `CAMPAIGN ZONE ${modeIndex + 1}`;
        zoneModalTitle.textContent = mode.name;
        zoneModalDesc.textContent = mode.description || `Master all interview scenarios in the ${mode.name} campaign.`;

        // Progress
        const subModeIds = mode.subModes.map(s => s.id);
        let completed = 0;
        if (typeof Progress !== 'undefined') {
            const prog = Progress.getGameModeProgress(mode.id, subModeIds);
            completed = prog.completed;
        }
        const total = subModeIds.length;
        const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

        zoneModalProgressCount.textContent = `${completed} / ${total} COMPLETED`;
        zoneModalProgressFill.style.width = `${percent}%`;

        // Render phases
        zonePhasesGrid.innerHTML = '';
        mode.subModes.forEach((sub, pIdx) => {
            const unlocked = isPhaseUnlocked(mode, pIdx);
            const complete = isPhaseComplete(mode, sub.id);

            const phaseCard = document.createElement(unlocked ? 'a' : 'div');
            phaseCard.className = `phase-card ${unlocked ? 'unlocked' : 'locked'} ${complete ? 'complete' : ''}`;

            if (unlocked) {
                phaseCard.href = sub.link;
            }

            const iconClass = unlocked ? (sub.icon_class || 'hn hn-gamepad-solid') : 'hn hn-lock';
            const statusLabel = complete ? '✓ COMPLETED' : (unlocked ? 'AVAILABLE' : '🔒 LOCKED');

            phaseCard.innerHTML = `
                <div class="phase-card-header">
                    <span class="phase-card-num">PHASE ${pIdx + 1}</span>
                    <span class="phase-card-status">${statusLabel}</span>
                </div>
                <div class="phase-card-body">
                    <div class="phase-card-icon">
                        <i class="${iconClass}"></i>
                    </div>
                    <div class="phase-card-text">
                        <span class="phase-card-title">${sub.name}</span>
                        <span class="phase-card-action">${unlocked ? 'START CHALLENGE ➔' : 'Complete previous phase'}</span>
                    </div>
                </div>
            `;

            zonePhasesGrid.appendChild(phaseCard);
        });

        // Show Modal
        zoneModalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeZoneModal() {
        zoneModalOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }
});
