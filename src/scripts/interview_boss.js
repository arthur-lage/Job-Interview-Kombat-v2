/**
 * interview_boss.js
 * Multi-Boss Final Game Mode: "THE INTERVIEW"
 * Supports 3 distinct Interviewer Bosses:
 * - 👔 Marcus Vance (PM Boss - Product, Metrics & Strategy)
 * - 📋 Valerie Stone (QA Boss - Test Automation, Compliance & Zero-Defects)
 * - 💻 Julian Thorne (Tech Lead Boss - Architecture, Concurrency & Scalability)
 * Job Interview Kombat v2
 */

document.addEventListener("DOMContentLoaded", () => {
    // --- State Variables ---
    let gameData = null;
    let selectedBossId = "pm";
    let currentBoss = null;
    let currentPhases = [];

    let currentPhaseIdx = 0;
    let currentQuestionIdx = 0;
    let totalQuestionsCount = 0;
    let questionsAnsweredCount = 0;

    let playerHp = 100;
    let bossHp = 100;
    let momentum = 0;
    let score = 0;

    let timerInterval = null;
    let timeLeft = 0;
    let isQuestionActive = false;

    // --- DOM Elements ---
    const lightningFlash = document.getElementById("lightning-flash");
    const playerHpBar = document.getElementById("player-hp-bar");
    const playerHpText = document.getElementById("player-hp-text");
    const playerStatusBadge = document.getElementById("player-status-badge");
    const momentumFill = document.getElementById("momentum-fill");
    const powerMoveBtn = document.getElementById("power-move-btn");

    const bossHpBar = document.getElementById("boss-hp-bar");
    const bossHpText = document.getElementById("boss-hp-text");
    const bossStatusBadge = document.getElementById("boss-status-badge");
    const bossSpriteImg = document.getElementById("boss-sprite-img");
    const bossDisplayName = document.getElementById("boss-display-name");
    const bossTagName = document.getElementById("boss-tag-name");
    const bossTagSub = document.getElementById("boss-tag-sub");
    const bossSubtextTitle = document.getElementById("boss-subtext-title");

    const phaseBadgeText = document.getElementById("phase-badge-text");
    const turnTimerBox = document.getElementById("turn-timer-box");
    const turnTimerVal = document.getElementById("turn-timer-val");

    const curriculumTag = document.getElementById("curriculum-tag");
    const roundCounterText = document.getElementById("round-counter-text");
    const bossQuoteText = document.getElementById("boss-quote-text");
    const bossReactionBox = document.getElementById("boss-reaction-bar");
    const bossReactionText = document.getElementById("boss-reaction-text");
    const responseCardsGrid = document.getElementById("response-cards-grid");

    // Modals
    const bossSelectModal = document.getElementById("boss-select-modal");
    const hudChangeBossBtn = document.getElementById("hud-change-boss-btn");

    const feedbackModal = document.getElementById("feedback-modal-overlay");
    const feedbackBadgeTag = document.getElementById("feedback-badge-tag");
    const feedbackTitle = document.getElementById("feedback-title");
    const damageStatText = document.getElementById("damage-stat-text");
    const feedbackExplanationText = document.getElementById("feedback-explanation-text");
    const nextTurnBtn = document.getElementById("next-turn-btn");

    const phaseSplashModal = document.getElementById("phase-splash-overlay");
    const splashPhaseTitle = document.getElementById("splash-phase-title");
    const splashPhaseSub = document.getElementById("splash-phase-sub");
    const splashPhaseDesc = document.getElementById("splash-phase-desc");
    const startPhaseBtn = document.getElementById("start-phase-btn");

    const victoryModal = document.getElementById("victory-modal-overlay");
    const victoryFinalScore = document.getElementById("victory-final-score");
    const victoryFinalHp = document.getElementById("victory-final-hp");
    const victoryReplayBtn = document.getElementById("victory-replay-btn");

    const defeatModal = document.getElementById("defeat-modal-overlay");
    const defeatBossHp = document.getElementById("defeat-boss-hp");
    const retryBossBtn = document.getElementById("retry-boss-btn");

    const combatToast = document.getElementById("combat-toast");
    const toastText = document.getElementById("toast-text");

    // --- Sound FX helper (Web Audio API Synthesizer) ---
    const playCombatTone = (type) => {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);

            if (type === "hit") {
                osc.type = "sawtooth";
                osc.frequency.setValueAtTime(240, ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(70, ctx.currentTime + 0.2);
                gain.gain.setValueAtTime(0.3, ctx.currentTime);
                gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.2);
                osc.start();
                osc.stop(ctx.currentTime + 0.2);
            } else if (type === "critical") {
                osc.type = "triangle";
                osc.frequency.setValueAtTime(520, ctx.currentTime);
                osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1);
                gain.gain.setValueAtTime(0.35, ctx.currentTime);
                gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.35);
                osc.start();
                osc.stop(ctx.currentTime + 0.35);
            } else if (type === "hurt") {
                osc.type = "square";
                osc.frequency.setValueAtTime(140, ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(45, ctx.currentTime + 0.3);
                gain.gain.setValueAtTime(0.3, ctx.currentTime);
                gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.3);
                osc.start();
                osc.stop(ctx.currentTime + 0.3);
            }
        } catch (e) {}
    };

    // --- Init Function ---
    async function init() {
        if (typeof Progress !== "undefined") {
            Progress.load();
        }

        try {
            const res = await fetch("../db/final_interview_boss.json");
            gameData = await res.json();

            setupEventListeners();

            // Check URL Query Param ?boss=pm / ?boss=qa / ?boss=tech_lead
            const urlParams = new URLSearchParams(window.location.search);
            const queryBoss = urlParams.get("boss") || urlParams.get("select");

            if (queryBoss && gameData.bosses && gameData.bosses[queryBoss]) {
                selectBoss(queryBoss);
            } else {
                // Open Boss Select Modal
                bossSelectModal.classList.add("active");
            }
        } catch (err) {
            console.error("Failed to load final_interview_boss.json:", err);
            bossQuoteText.textContent = "Error loading boss database. Please verify file path.";
        }
    }

    function setupEventListeners() {
        // Modal Buttons
        nextTurnBtn.addEventListener("click", advanceToNextTurn);
        startPhaseBtn.addEventListener("click", onStartPhaseClick);
        powerMoveBtn.addEventListener("click", triggerPowerMove);
        retryBossBtn.addEventListener("click", resetBattle);
        victoryReplayBtn.addEventListener("click", resetBattle);

        // Switch Boss in HUD
        if (hudChangeBossBtn) {
            hudChangeBossBtn.addEventListener("click", () => {
                clearInterval(timerInterval);
                bossSelectModal.classList.add("active");
            });
        }

        // Boss Select Cards & Buttons
        const rosterCards = document.querySelectorAll(".boss-roster-card");
        rosterCards.forEach(card => {
            card.addEventListener("click", (e) => {
                const bossId = card.getAttribute("data-boss");
                if (bossId) selectBoss(bossId);
            });
        });

        const selectBtns = document.querySelectorAll(".roster-select-btn");
        selectBtns.forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                const bossId = btn.getAttribute("data-boss");
                if (bossId) selectBoss(bossId);
            });
        });
    }

    function selectBoss(bossId) {
        if (!gameData || !gameData.bosses || !gameData.bosses[bossId]) return;

        selectedBossId = bossId;
        currentBoss = gameData.bosses[bossId];
        currentPhases = currentBoss.phases || [];
        totalQuestionsCount = currentPhases.reduce((sum, p) => sum + p.questions.length, 0);

        // Update Visuals
        bossDisplayName.textContent = currentBoss.name;
        if (bossTagName) bossTagName.textContent = currentBoss.name;
        if (bossTagSub) bossTagSub.textContent = currentBoss.title;
        if (bossSubtextTitle) bossSubtextTitle.textContent = `${currentBoss.name.toUpperCase()} - RESOLVE`;
        bossSpriteImg.src = currentBoss.sprite;

        // Hide Boss Select Modal
        bossSelectModal.classList.remove("active");

        // Save selected boss preference
        try { localStorage.setItem("jik_selected_boss_id", bossId); } catch(e) {}

        // Reset and Start
        resetBattle();
    }

    function resetBattle() {
        defeatModal.classList.remove("active");
        victoryModal.classList.remove("active");
        feedbackModal.classList.remove("active");
        phaseSplashModal.classList.remove("active");

        currentPhaseIdx = 0;
        currentQuestionIdx = 0;
        questionsAnsweredCount = 0;
        playerHp = 100;
        bossHp = 100;
        momentum = 0;
        score = 0;

        updateHpUI();
        updateMomentumUI();
        startBattle();
    }

    function startBattle() {
        if (!currentPhases.length) return;
        showPhaseSplash(currentPhases[currentPhaseIdx]);
    }

    function showPhaseSplash(phase) {
        clearInterval(timerInterval);
        splashPhaseTitle.textContent = `PHASE ${phase.phaseId}`;
        splashPhaseSub.textContent = phase.title.replace(`PHASE ${phase.phaseId}: `, "");
        splashPhaseDesc.textContent = phase.timed
            ? `⚠️ CRITICAL CRISIS PROTOCOL! You have ${phase.timeLimit} seconds per question. Think fast and maintain your composure under pressure!`
            : `${phase.subtitle}. Structure your responses carefully using proven professional frameworks.`;

        phaseSplashModal.classList.add("active");
    }

    function onStartPhaseClick() {
        phaseSplashModal.classList.remove("active");
        loadQuestion();
    }

    function loadQuestion() {
        clearInterval(timerInterval);
        isQuestionActive = true;

        const currentPhase = currentPhases[currentPhaseIdx];
        const question = currentPhase.questions[currentQuestionIdx];

        // Update HUD
        phaseBadgeText.textContent = currentPhase.title;
        curriculumTag.textContent = question.context || "EXECUTIVE EVALUATION";
        roundCounterText.textContent = `ROUND ${question.roundNumber} / ${totalQuestionsCount}`;
        bossQuoteText.textContent = `"${question.bossPrompt}"`;

        bossReactionBox.style.display = "none";

        // Setup Timer if phase is timed
        if (currentPhase.timed && currentPhase.timeLimit > 0) {
            turnTimerBox.style.display = "flex";
            timeLeft = currentPhase.timeLimit;
            turnTimerVal.textContent = `${timeLeft}s`;

            timerInterval = setInterval(() => {
                timeLeft--;
                turnTimerVal.textContent = `${timeLeft}s`;

                if (timeLeft <= 5) {
                    turnTimerBox.style.background = "rgba(255, 0, 0, 0.4)";
                } else {
                    turnTimerBox.style.background = "rgba(255, 30, 86, 0.2)";
                }

                if (timeLeft <= 0) {
                    clearInterval(timerInterval);
                    handleTimeOut();
                }
            }, 1000);
        } else {
            turnTimerBox.style.display = "none";
        }

        // Render response cards
        renderResponseOptions(question.options);
    }

    function renderResponseOptions(options) {
        responseCardsGrid.innerHTML = "";

        // Shuffle options for replayability
        const shuffled = [...options].sort(() => Math.random() - 0.5);

        shuffled.forEach((opt) => {
            const card = document.createElement("div");
            card.className = "response-card";
            card.innerHTML = `
                <span class="response-card-badge">${opt.badge || "RESPONSE TACTIC"}</span>
                <p class="response-card-text">${opt.text}</p>
            `;

            card.addEventListener("click", () => {
                if (!isQuestionActive) return;
                handleOptionSelect(opt, card);
            });

            responseCardsGrid.appendChild(card);
        });
    }

    function handleOptionSelect(opt, cardEl) {
        isQuestionActive = false;
        clearInterval(timerInterval);

        // Visual selection indicator
        if (opt.isCorrect) {
            cardEl.classList.add("selected-correct");
            playCombatTone("critical");
            flashLightning();

            // Boss takes damage (Ignoring JSON bossDamage which is too high)
            bossHp = Math.max(0, bossHp - 12);
            score += 150;

            // Momentum build up
            momentum = Math.min(100, momentum + 40);
            updateMomentumUI();

            // Boss animation shake
            bossSpriteImg.classList.add("shake");
            setTimeout(() => bossSpriteImg.classList.remove("shake"), 500);

            // Update Boss reaction in quote card
            if (opt.bossReaction) {
                bossReactionBox.style.display = "flex";
                bossReactionText.textContent = `"${opt.bossReaction}"`;
            }

            showFeedback(true, opt);
        } else {
            cardEl.classList.add("selected-wrong");
            playCombatTone("hurt");

            // Screen shake
            document.body.classList.add("shake-screen");
            setTimeout(() => document.body.classList.remove("shake-screen"), 500);

            // Player takes damage
            const dmg = opt.playerDamage || 30;
            playerHp = Math.max(0, playerHp - dmg);

            // Reset momentum on error
            momentum = Math.max(0, momentum - 25);
            updateMomentumUI();

            // Boss reaction
            if (opt.bossReaction) {
                bossReactionBox.style.display = "flex";
                bossReactionText.textContent = `"${opt.bossReaction}"`;
            }

            showFeedback(false, opt);
        }

        updateHpUI();
    }

    function handleTimeOut() {
        if (!isQuestionActive) return;
        isQuestionActive = false;

        playCombatTone("hurt");
        document.body.classList.add("shake-screen");
        setTimeout(() => document.body.classList.remove("shake-screen"), 500);

        playerHp = Math.max(0, playerHp - 30);
        momentum = 0;
        updateMomentumUI();
        updateHpUI();

        feedbackBadgeTag.textContent = "TIME OUT! FROZE UNDER PRESSURE";
        feedbackBadgeTag.style.color = "var(--boss-crimson)";
        feedbackTitle.textContent = "COMPOSURE BREACH!";
        feedbackTitle.style.color = "var(--boss-crimson)";
        damageStatText.textContent = "💔 Player Composure -30% (Hesitation Penalty)";
        damageStatText.style.color = "var(--boss-crimson)";
        feedbackExplanationText.textContent = "During a critical incident, hesitation and complete silence creates panic. Immediate, structured triage communication is essential!";

        feedbackModal.classList.add("active");
    }

    function showFeedback(isPositive, opt) {
        if (isPositive) {
            feedbackBadgeTag.textContent = `SUCCESS: ${opt.badge || "EXECUTIVE PRESENCE"}`;
            feedbackBadgeTag.style.color = "var(--player-green)";
            feedbackTitle.textContent = "CRITICAL STRIKE!";
            feedbackTitle.style.color = "var(--boss-gold)";
            damageStatText.textContent = `💥 Boss Skepticism -${opt.bossDamage || 34}%`;
            damageStatText.style.color = "var(--boss-gold)";
        } else {
            feedbackBadgeTag.textContent = `BLUNDER: ${opt.badge || "TACTICAL ERROR"}`;
            feedbackBadgeTag.style.color = "var(--boss-crimson)";
            feedbackTitle.textContent = "COMPOSURE CRACKED!";
            feedbackTitle.style.color = "var(--boss-crimson)";
            damageStatText.textContent = `💔 Player Composure -${opt.playerDamage || 30}%`;
            damageStatText.style.color = "var(--boss-crimson)";
        }

        feedbackExplanationText.textContent = opt.feedback || "Maintain structure, calm metrics, and executive focus.";
        feedbackModal.classList.add("active");
    }

    function advanceToNextTurn() {
        feedbackModal.classList.remove("active");
        questionsAnsweredCount++;

        // Check Defeat
        if (playerHp <= 0) {
            triggerDefeat();
            return;
        }

        // Check Instant Victory (Boss HP depleted)
        if (bossHp <= 0) {
            triggerVictory();
            return;
        }

        const currentPhase = currentPhases[currentPhaseIdx];
        currentQuestionIdx++;

        // Advance to next question in phase or next phase
        if (currentQuestionIdx < currentPhase.questions.length) {
            loadQuestion();
        } else {
            // Finished current phase!
            currentPhaseIdx++;
            currentQuestionIdx = 0;

            if (currentPhaseIdx < currentPhases.length) {
                showPhaseSplash(currentPhases[currentPhaseIdx]);
            } else {
                // All phases complete!
                if (playerHp > 0) {
                    triggerVictory();
                } else {
                    triggerDefeat();
                }
            }
        }
    }

    // --- Power Move: Strategic Counter-Question ---
    function triggerPowerMove() {
        if (momentum < 100 || !isQuestionActive) return;

        momentum = 0;
        updateMomentumUI();

        playCombatTone("critical");
        flashLightning();

        // Massive Boss damage
        const powerDmg = 30;
        bossHp = Math.max(0, bossHp - powerDmg);
        score += 250;
        updateHpUI();

        bossSpriteImg.classList.add("shake");
        setTimeout(() => bossSpriteImg.classList.remove("shake"), 600);

        showCombatToast("⚡ EXECUTIVE COUNTER-QUESTION STRIKE! -30% BOSS RESOLVE!");

        bossReactionBox.style.display = "flex";
        bossReactionText.textContent = `"A brilliant counter-question. You're demonstrating executive vision and seizing control of the room."`;

        // Check if this finished the boss!
        if (bossHp <= 0) {
            setTimeout(triggerVictory, 1200);
        }
    }

    function updateHpUI() {
        // Player HP
        playerHpBar.style.width = `${playerHp}%`;
        playerHpText.textContent = `${playerHp}%`;

        if (playerHp > 60) {
            playerStatusBadge.textContent = "COMPOSED";
            playerStatusBadge.style.color = "var(--player-green)";
        } else if (playerHp > 30) {
            playerStatusBadge.textContent = "SHAKEN";
            playerStatusBadge.style.color = "var(--boss-gold)";
        } else {
            playerStatusBadge.textContent = "CRITICAL";
            playerStatusBadge.style.color = "var(--boss-crimson)";
        }

        // Boss HP
        bossHpBar.style.width = `${bossHp}%`;
        bossHpText.textContent = `${bossHp}%`;

        if (bossHp > 65) {
            bossStatusBadge.textContent = "SKEPTICAL";
        } else if (bossHp > 30) {
            bossStatusBadge.textContent = "PRESSURED";
            bossStatusBadge.style.color = "var(--boss-gold)";
        } else {
            bossStatusBadge.textContent = "CORNERED";
            bossStatusBadge.style.color = "var(--player-cyan)";
        }
    }

    function updateMomentumUI() {
        momentumFill.style.width = `${momentum}%`;

        if (momentum >= 100) {
            powerMoveBtn.classList.add("ready");
            powerMoveBtn.disabled = false;
            powerMoveBtn.querySelector(".power-ready-badge").textContent = "READY!";
        } else {
            powerMoveBtn.classList.remove("ready");
            powerMoveBtn.disabled = true;
            powerMoveBtn.querySelector(".power-ready-badge").textContent = `${momentum}%`;
        }
    }

    function flashLightning() {
        lightningFlash.classList.add("flash");
        setTimeout(() => lightningFlash.classList.remove("flash"), 90);
    }

    function showCombatToast(msg) {
        toastText.textContent = msg;
        combatToast.classList.add("show");
        setTimeout(() => combatToast.classList.remove("show"), 2600);
    }

    // --- Victory & Defeat Handlers ---
    function triggerVictory() {
        clearInterval(timerInterval);

        // Mark completion in Progress system
        if (typeof Progress !== "undefined") {
            Progress.completeSubMode("final_interview", `boss_${selectedBossId}`);
            Progress.completeSubMode("final_interview", "boss_interview");
        }
        try {
            localStorage.setItem(`jik_boss_beaten_${selectedBossId}`, "true");
            localStorage.setItem("trainingMode_subMode_wins", JSON.stringify({
                ...JSON.parse(localStorage.getItem("trainingMode_subMode_wins") || "{}"),
                [`boss_${selectedBossId}`]: true
            }));
        } catch (e) {}

        const finalScoreVal = score + (playerHp * 10);
        victoryFinalScore.textContent = `${finalScoreVal} PTS`;
        victoryFinalHp.textContent = `${playerHp}%`;

        victoryModal.classList.add("active");
    }

    function triggerDefeat() {
        clearInterval(timerInterval);
        defeatBossHp.textContent = `${bossHp}%`;
        defeatModal.classList.add("active");
    }

    // Initialize game
    init();
});
