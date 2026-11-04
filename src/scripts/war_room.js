/**
 * war_room.js
 * Multi-Level Emergency Meeting Simulator (Meetings Module)
 */

document.addEventListener("DOMContentLoaded", () => {
    let gameData = null;
    let currentLevelIndex = 0;
    let currentScenarioIndex = 0;
    let chaosLevel = 50;
    let totalScore = 0;
    let timerInterval = null;
    let timeLeft = 26;

    // UI Elements
    const warBg = document.getElementById("war-bg");
    const levelSelectModal = document.getElementById("level-select-modal");
    const levelGrid = document.getElementById("level-grid");
    const changeLevelBtn = document.getElementById("change-level-btn");
    const warBadgeTitle = document.getElementById("war-badge-title");

    const timerVal = document.getElementById("timer-val");
    const timerBox = document.getElementById("timer-box");
    const chaosVal = document.getElementById("chaos-val");
    const chaosBarInner = document.getElementById("chaos-bar-inner");
    const phaseTag = document.getElementById("phase-tag");
    const speakerTag = document.getElementById("speaker-tag");
    const scenarioPrompt = document.getElementById("scenario-prompt");
    const optionsList = document.getElementById("options-list");
    const currentRoundEl = document.getElementById("current-round");
    const totalRoundsEl = document.getElementById("total-rounds");

    // Modals
    const feedbackModal = document.getElementById("feedback-modal");
    const feedbackTitle = document.getElementById("feedback-title");
    const feedbackText = document.getElementById("feedback-text");
    const feedbackNextBtn = document.getElementById("feedback-next-btn");

    const victoryModal = document.getElementById("victory-modal");
    const victoryNextLevelBtn = document.getElementById("victory-next-level-btn");
    const finalChaos = document.getElementById("final-chaos");
    const finalScore = document.getElementById("final-score");

    const defeatModal = document.getElementById("defeat-modal");
    const retryLevelBtn = document.getElementById("retry-level-btn");
    const defeatMenuBtn = document.getElementById("defeat-menu-btn");

    init();

    async function init() {
        if (typeof Progress !== 'undefined') {
            Progress.load();
        }

        try {
            const res = await fetch("../db/war_room_questions.json");
            gameData = await res.json();
            renderLevelSelection();
        } catch (err) {
            console.error("Failed to load War Room dataset:", err);
            scenarioPrompt.textContent = "Error loading War Room dataset.";
        }
    }

    function renderLevelSelection() {
        levelGrid.innerHTML = "";
        clearInterval(timerInterval);

        // Hide all result/feedback overlays
        defeatModal.classList.remove("active");
        victoryModal.classList.remove("active");
        feedbackModal.classList.remove("active");

        gameData.levels.forEach((lvl, idx) => {
            const card = document.createElement("div");
            card.className = "level-card";
            const diffClass = lvl.difficulty.toLowerCase();

            card.innerHTML = `
                <div class="level-card-left">
                    <span class="level-icon">${lvl.icon || "🚨"}</span>
                    <div>
                        <div class="level-info-title">${lvl.name}</div>
                        <div class="level-info-desc">${lvl.description} (${lvl.scenarios.length} rounds)</div>
                    </div>
                </div>
                <span class="level-badge ${diffClass}">${lvl.difficulty}</span>
            `;

            card.addEventListener("click", () => startLevel(idx));
            levelGrid.appendChild(card);
        });

        levelSelectModal.classList.add("active");
    }

    function startLevel(levelIndex) {
        currentLevelIndex = levelIndex;
        currentScenarioIndex = 0;
        totalScore = 0;

        const lvlData = gameData.levels[currentLevelIndex];
        chaosLevel = lvlData.initialChaos || 50;
        totalRoundsEl.textContent = lvlData.scenarios.length;
        warBadgeTitle.textContent = `🚨 ${lvlData.name}`;

        levelSelectModal.classList.remove("active");
        victoryModal.classList.remove("active");
        defeatModal.classList.remove("active");
        feedbackModal.classList.remove("active");

        updateChaosUI();
        loadScenario(0);
    }

    function updateChaosUI() {
        chaosLevel = Math.max(0, Math.min(100, chaosLevel));
        chaosVal.textContent = `${chaosLevel}%`;
        chaosBarInner.style.width = `${chaosLevel}%`;

        if (chaosLevel > 70) {
            warBg.classList.add("crisis-active");
            chaosBarInner.style.background = "linear-gradient(90deg, #ff8c00, #ff1a40)";
        } else if (chaosLevel > 40) {
            warBg.classList.remove("crisis-active");
            chaosBarInner.style.background = "linear-gradient(90deg, #ffeb3b, #ff8c00)";
        } else {
            warBg.classList.remove("crisis-active");
            chaosBarInner.style.background = "linear-gradient(90deg, #00e676, #ffeb3b)";
        }
    }

    function startTimer() {
        clearInterval(timerInterval);
        const lvlData = gameData.levels[currentLevelIndex];
        timeLeft = lvlData.timePerQuestion || 26;
        timerVal.textContent = `${timeLeft}s`;
        timerBox.classList.remove("timer-warning");

        timerInterval = setInterval(() => {
            timeLeft--;
            timerVal.textContent = `${timeLeft}s`;

            if (timeLeft <= 5) {
                timerBox.classList.add("timer-warning");
            }

            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                handleTimeout();
            }
        }, 1000);
    }

    function loadScenario(index) {
        const lvlData = gameData.levels[currentLevelIndex];
        if (index >= lvlData.scenarios.length) {
            finishGame();
            return;
        }

        currentScenarioIndex = index;
        currentRoundEl.textContent = currentScenarioIndex + 1;

        const sc = lvlData.scenarios[index];
        phaseTag.textContent = sc.phase;
        speakerTag.textContent = `👤 ${sc.speaker}`;
        scenarioPrompt.textContent = sc.prompt;

        optionsList.innerHTML = "";
        const labels = ["A", "B", "C"];

        sc.options.forEach((opt, idx) => {
            const btn = document.createElement("button");
            btn.className = "war-option-btn";
            btn.innerHTML = `
                <span class="opt-prefix">${labels[idx]}</span>
                <span>${opt.text}</span>
            `;
            btn.addEventListener("click", () => handleSelectOption(opt, sc, btn));
            optionsList.appendChild(btn);
        });

        startTimer();
    }

    function handleSelectOption(selectedOpt, scenario, clickedBtn) {
        clearInterval(timerInterval);

        const buttons = optionsList.querySelectorAll(".war-option-btn");
        buttons.forEach(b => b.disabled = true);

        chaosLevel += selectedOpt.chaosDelta;
        totalScore += selectedOpt.score || 0;
        updateChaosUI();

        scenario.options.forEach((opt, idx) => {
            if (opt.isCorrect) {
                buttons[idx].classList.add("opt-correct");
            }
        });

        if (!selectedOpt.isCorrect) {
            clickedBtn.classList.add("opt-wrong");
        }

        setTimeout(() => {
            showFeedback(selectedOpt, scenario);
        }, 800);
    }

    function handleTimeout() {
        const buttons = optionsList.querySelectorAll(".war-option-btn");
        buttons.forEach(b => b.disabled = true);

        chaosLevel += 30;
        updateChaosUI();

        const lvlData = gameData.levels[currentLevelIndex];
        const scenario = lvlData.scenarios[currentScenarioIndex];

        scenario.options.forEach((opt, idx) => {
            if (opt.isCorrect) {
                buttons[idx].classList.add("opt-correct");
            }
        });

        setTimeout(() => {
            feedbackTitle.textContent = "⏱️ TIME EXPIRED!";
            feedbackTitle.style.color = "#ff1a40";
            feedbackText.innerHTML = `
                <p><strong>Panic set in due to hesitation! (+30% Chaos)</strong></p>
                <p>${scenario.explanation}</p>
            `;
            feedbackModal.classList.add("active");
        }, 600);
    }

    function showFeedback(selectedOpt, scenario) {
        if (selectedOpt.isCorrect) {
            feedbackTitle.innerHTML = '<i class="hn hn-badge-check-solid" style="color:#00e676"></i> OPTIMAL RESPONSE!';
            feedbackTitle.style.color = "#00e676";
        } else {
            feedbackTitle.innerHTML = '<i class="hn hn-exclamation-triangle-solid" style="color:#ff1a40"></i> SUB-OPTIMAL INCIDENT RESPONSE';
            feedbackTitle.style.color = "#ff1a40";
        }

        feedbackText.innerHTML = `
            <p><strong>${selectedOpt.feedback}</strong></p>
            <hr style="border: 0; border-top: 1px dashed #5a2a78; margin: 10px 0;">
            <p><i class="hn hn-star-solid" style="color:#fdd201"></i> <em>${scenario.explanation}</em></p>
        `;

        feedbackModal.classList.add("active");
    }

    feedbackNextBtn.addEventListener("click", () => {
        feedbackModal.classList.remove("active");

        if (chaosLevel >= 100) {
            defeatModal.classList.add("active");
        } else {
            loadScenario(currentScenarioIndex + 1);
        }
    });

    function finishGame() {
        if (chaosLevel >= 100) {
            defeatModal.classList.add("active");
        } else {
            if (typeof Progress !== 'undefined') {
                Progress.completeSubMode("meetings", "meetings_war_room");
            }
            finalChaos.textContent = `${chaosLevel}%`;
            finalScore.textContent = `${totalScore} pts`;

            // Configura botão de próximo nível se existir
            if (currentLevelIndex < gameData.levels.length - 1) {
                victoryNextLevelBtn.style.display = "inline-block";
                victoryNextLevelBtn.onclick = () => startLevel(currentLevelIndex + 1);
            } else {
                victoryNextLevelBtn.style.display = "none";
            }

            victoryModal.classList.add("active");
        }
    }

    // Navegação de modais
    changeLevelBtn.addEventListener("click", () => {
        renderLevelSelection();
    });

    retryLevelBtn.addEventListener("click", () => {
        startLevel(currentLevelIndex);
    });

    defeatMenuBtn.addEventListener("click", () => {
        renderLevelSelection();
    });
});
