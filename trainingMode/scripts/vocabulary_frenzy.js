// ---------------------------------------------------------------------------
// RESUME / PROGRESS INTEGRATION — detecta topicId e subModeId da URL
// ---------------------------------------------------------------------------

function getVocabSubModeId() {
    const params = new URLSearchParams(window.location.search);
    return params.get('submode') || null;
}

function getTopicId() {
    const params = new URLSearchParams(window.location.search);
    return params.get('topic') || null;
}

const descriptionGoButton = document.querySelector("#description-go")
const descriptionMenu = document.querySelector(".mode-description")
const descriptionMenuTimer = document.querySelector("#description-time")
const descriptionMenuTheme = document.querySelector("#description-theme")

const gameContainer = document.querySelector(".game-container")
const gameCards = document.querySelector(".game-cards")

const resultsContainer = document.querySelector(".result-container")

// THEMES padrão (usados como fallback e para selecionar o tema do jogo)
const DEFAULT_THEMES = [{
    type: 'soft_skills',
    text: "Soft Skills"
}, {
    type: 'hard_skills',
    text: "Hard Skills"
}]

const game = {
    score: 0,
    scoreMultiplier: 10,
    theme: null, // definido dinamicamente após carregar o vocabulário
    vocabularyData: null,
    chosenVocabulary: [],
    timer: {
        default: 30,
        current: 30
    },
    chooseVocabulary: async (totalCount = 16) => {
        const response = await fetch('../db/vocabulary_frenzy.json')
        const data = await response.json()

        const topicId = getTopicId()

        // --- Load ALL vocabulary across every topic ---
        const allWords = Object.values(data).flat()

        // --- Determine the current topic's word list ---
        let topicWords = []

        if (Array.isArray(data)) {
            topicWords = data
        } else if (topicId && data[topicId]) {
            topicWords = data[topicId]
        } else {
            topicWords = allWords
        }

        // --- Find the dominant type in this topic (= the theme) ---
        const typeCounts = {}
        topicWords.forEach(item => {
            typeCounts[item.type] = (typeCounts[item.type] || 0) + 1
        })
        const themeType = Object.entries(typeCounts)
            .sort((a, b) => b[1] - a[1])[0][0]

        game.theme = {
            type: themeType,
            text: themeType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
        }

        // --- Pick correct words (from the theme type) ---
        const correctPool = topicWords
            .filter(item => item.type === themeType)
            .sort(() => Math.random() - 0.5)

        const minCorrect = Math.min(6, correctPool.length)
        const maxCorrect = Math.min(Math.ceil(totalCount * 0.5), correctPool.length)
        const correctCount = Math.floor(Math.random() * (maxCorrect - minCorrect + 1)) + minCorrect
        const correctWords = correctPool.slice(0, correctCount)

        // --- Pick distractor words (from OTHER topics, NOT the theme type) ---
        const correctVocabSet = new Set(correctWords.map(w => w.vocabulary))
        const distractorPool = allWords
            .filter(item => item.type !== themeType && !correctVocabSet.has(item.vocabulary))
            .sort(() => Math.random() - 0.5)

        const distractorCount = totalCount - correctCount
        const distractors = distractorPool.slice(0, distractorCount)

        // --- Combine and shuffle ---
        game.vocabularyData = [...correctWords, ...distractors]
            .sort(() => Math.random() - 0.5)

        return game.vocabularyData
    },

    createCards: () => {
        gameCards.innerHTML = ""
        game.vocabularyData.forEach((card, index) => {
            const gameCard = document.createElement("div")
            gameCard.classList.add("game-card")
            gameCard.textContent = card.vocabulary
            gameCard.style.animationDelay = `${index * 40}ms`
            gameCard.addEventListener("click", () => {
                gameCard.classList.toggle("selected")
            })
            gameCards.appendChild(gameCard)
        })
    },

    start: async () => {
        // Só recarrega se o vocabulário ainda não foi carregado pelo setupDescriptionMenu
        if (!game.vocabularyData || game.vocabularyData.length === 0) {
            await game.chooseVocabulary(16)
        }
        game.createCards()
        game.startTimer()
    },

    timerInterval: null,

    startTimer: () => {
        const timerDisplay = document.querySelector("#timer")

        game.timer.current = game.timer.default
        timerDisplay.textContent = game.timer.current + "s"

        game.timerInterval = setInterval(() => {
            game.timer.current--
            timerDisplay.textContent = game.timer.current + "s"

            if (game.timer.current <= 0) {
                clearInterval(game.timerInterval)
                game.endGame()
            }
        }, 1000)
    },

    endGame: () => {
        const cards = document.querySelectorAll(".game-card")
        cards.forEach(card => {
            card.style.pointerEvents = "none"
            card.style.opacity = "0.5"
            if (card.classList.contains("selected")) {
                game.chosenVocabulary.push(card.textContent)
            }
        })

        const themeVocabSet = new Set(
            game.vocabularyData
                .filter(item => item.type === game.theme.type)
                .map(item => item.vocabulary)
        )

        const correctWords = game.chosenVocabulary.filter(word => themeVocabSet.has(word))
        const wrongWords = game.chosenVocabulary.filter(word => !themeVocabSet.has(word))

        game.score = correctWords.length * game.scoreMultiplier
        game.score -= wrongWords.length * game.scoreMultiplier

        setTimeout(() => {
            setupResultScreen(correctWords, wrongWords)
        }, 500)
    }
}

const setupResultScreen = (correctWords, wrongWords) => {
    document.querySelector("#result-theme").textContent = game.theme.text
    document.querySelector("#result-score").textContent = game.score
    document.getElementById("result-correct-count").textContent = correctWords.length
    document.getElementById("result-wrong-count").textContent = wrongWords.length

    const missedWords = game.vocabularyData
        .filter(item => item.type === game.theme.type && !game.chosenVocabulary.includes(item.vocabulary))
        .map(item => item.vocabulary)

    document.querySelector(".result-left-words .word-list").textContent =
        missedWords.length > 0 ? missedWords.join(", ") : "None, you got all the right answers!"

    // Render picked word chips
    const picksList = document.getElementById('picks-list')
    picksList.innerHTML = ''

    if (game.chosenVocabulary.length === 0) {
        const empty = document.createElement('span')
        empty.classList.add('picks-empty')
        empty.textContent = "You didn't select any words!"
        picksList.appendChild(empty)
    } else {
        const correctSet = new Set(correctWords)
        game.chosenVocabulary.forEach(word => {
            const chip = document.createElement('span')
            chip.classList.add('pick-chip')
            chip.classList.add(correctSet.has(word) ? 'pick-correct' : 'pick-wrong')
            chip.textContent = word
            picksList.appendChild(chip)
        })
    }

    gameContainer.classList.remove("active")
    resultsContainer.classList.add("active")

    // Registra vitória se score positivo
    if (game.score > 0) {
        const params = new URLSearchParams(window.location.search);
        const topic = params.get('topic');
        const subModeId = params.get('submode');

        // Resume Builder
        if (subModeId && typeof window.markSubModeWon === 'function') {
            window.markSubModeWon(subModeId);
        }

        // Progress: marca sub-modo como completo para o sistema de desbloqueio
        if (topic && subModeId && typeof Progress !== 'undefined') {
            Progress.completeSubMode(topic, subModeId);
        }
    }

    document.querySelector(".finish-button").addEventListener("click", () => {
        document.location.href = "../pages/minimap.html"
    })
}

const setupGameScreen = () => {
    document.querySelector("#game-theme").textContent = game.theme.text
    document.querySelector("#timer").textContent = game.timer.current + "s"

    const doneBtn = document.getElementById('done-btn')
    doneBtn.addEventListener('click', () => {
        if (game.timerInterval === null) return // já encerrado
        clearInterval(game.timerInterval)
        game.timerInterval = null
        doneBtn.disabled = true
        game.endGame()
    }, { once: true })
}

descriptionGoButton.addEventListener("click", () => {
    descriptionMenu.classList.remove("active")
    setupGameScreen()
    gameContainer.classList.add("active")

    setTimeout(() => {
        game.start()
    }, 500);
})

const setupDescriptionMenu = async () => {
    // Pré-carrega o vocabulário para que game.theme esteja disponível
    await game.chooseVocabulary(16)

    descriptionMenuTimer.textContent = game.timer.default
    descriptionMenuTheme.textContent = game.theme ? game.theme.text : '—'

    setTimeout(() => {
        descriptionMenu.classList.add("active")
    }, 400)
}

addEventListener('load', () => {
    setupDescriptionMenu()
})