const blanksData = [
    {
        id: 1,
        question: "Tell me a little about yourself.",
        text: "I am 27 years old and I recently {blank} in Computer Science. I have a strong {blank} in web development and I am {blank} about creating efficient applications.",
        correctWords: ["graduated", "background", "passionate"],
        wordBank: ["graduated", "background", "passionate", "failed", "interest", "lazy"]
    },
    {
        id: 2,
        question: "Why do you want to work here?",
        text: "I've been following your company's recent expansion into renewable energy, and I'm very {blank} by your commitment to {blank}. My background {blank} perfectly with your goals.",
        correctWords: ["impressed", "sustainability", "aligns"],
        wordBank: ["impressed", "sustainability", "aligns", "bored", "money", "clashes", "profit"]
    },
    {
        id: 3,
        question: "What do you consider to be your weaknesses?",
        text: "Sometimes I can be hesitant in {blank} tasks because I like to ensure things are done a certain way. However, I've been taking management courses to {blank} my {blank} skills.",
        correctWords: ["delegating", "improve", "leadership"],
        wordBank: ["delegating", "improve", "leadership", "ignoring", "worsen", "cooking", "doing"]
    },
    {
        id: 4,
        question: "Where do you see yourself in five years?",
        text: "In five years, I hope to have {blank} my skills significantly. I see myself taking on more leadership {blank} and contributing to the strategic {blank} of the company.",
        correctWords: ["developed", "responsibilities", "goals"],
        wordBank: ["developed", "responsibilities", "goals", "forgotten", "vacations", "losses", "ignored"]
    },
    {
        id: 5,
        question: "What are your greatest strengths?",
        text: "I'd say my greatest strength is my {blank} ability. In my last role, I was able to identify the {blank} of a persistent bug and implemented a fix that reduced system {blank}.",
        correctWords: ["problem-solving", "root cause", "downtime"],
        wordBank: ["problem-solving", "root cause", "downtime", "laziness", "surface", "speed", "uptime"]
    },
    {
        id: 6,
        question: "Why should we hire you?",
        text: "Based on what we've discussed, my background in {blank} and my proven ability to lead {blank} teams align perfectly with the goals for this position. I can hit the ground {blank} and add immediate value.",
        correctWords: ["data analysis", "cross-functional", "running"],
        wordBank: ["data analysis", "cross-functional", "running", "nothing", "isolated", "walking", "sleeping"]
    },
    {
        id: 7,
        question: "Do you have any questions for us?",
        text: "Can you tell me more about the {blank} responsibilities of this role and how {blank} is measured here?",
        correctWords: ["day-to-day", "success"],
        wordBank: ["day-to-day", "success", "vacation", "failure", "salary", "lunch"]
    },
    {
        id: 8,
        question: "How do you handle stress/pressure?",
        text: "When faced with a tight {blank}, I break the project down into manageable tasks, {blank} them, and stay {blank} until it's done.",
        correctWords: ["deadline", "prioritize", "focused"],
        wordBank: ["deadline", "prioritize", "focused", "schedule", "ignore", "distracted", "asleep"]
    },
    {
        id: 9,
        question: "Describe a challenge or conflict you've faced at work, and how you dealt with it.",
        text: "A project I was leading was falling behind schedule due to a {blank} between departments. I organized a brief sync meeting, clarified {blank}, and we were able to get back on {blank}.",
        correctWords: ["miscommunication", "responsibilities", "track"],
        wordBank: ["miscommunication", "responsibilities", "track", "fight", "salaries", "vacation", "budget"]
    },
    {
        id: 10,
        question: "What do you consider to be your biggest professional achievement?",
        text: "My biggest achievement was completely {blank} our team's workflow process, which led to a 30% increase in {blank} over six {blank}.",
        correctWords: ["overhauling", "productivity", "months"],
        wordBank: ["overhauling", "productivity", "months", "destroying", "laziness", "days", "ignoring"]
    },
    {
        id: 11,
        question: "Why do you want to leave your current job?",
        text: "I've learned a lot in my current role, but I'm looking for a position that offers more {blank} to take on leadership responsibilities and grow my {blank} in a new {blank}.",
        correctWords: ["opportunities", "skill set", "industry"],
        wordBank: ["opportunities", "skill set", "industry", "money", "vacation", "excuses", "office"]
    },
    {
        id: 12,
        question: "How would your friends describe you?",
        text: "They would probably say I'm highly {blank}, dependable, and always willing to lend an {blank} when someone needs to talk through a {blank}.",
        correctWords: ["organized", "ear", "problem"],
        wordBank: ["organized", "ear", "problem", "messy", "hand", "joke", "lazy"]
    }
];

let currentIndex = 0;
let isLocked = false;
let userAnswers = []; // Will store the words the user has placed in order

function renderQuestion(index) {
    const q = blanksData[index];
    document.getElementById('question-progress').textContent = `Question ${index + 1} / ${blanksData.length}`;
    document.getElementById('question-title').textContent = q.question;

    const textContainer = document.getElementById('fill-in-text');
    textContainer.innerHTML = '';

    // Parse the text to create spans for blanks
    const parts = q.text.split('{blank}');
    userAnswers = new Array(parts.length - 1).fill(null);

    parts.forEach((part, i) => {
        const textNode = document.createTextNode(part);
        textContainer.appendChild(textNode);

        if (i < parts.length - 1) {
            const slot = document.createElement('span');
            slot.className = 'blank-slot';
            slot.dataset.index = i;
            slot.addEventListener('click', () => handleSlotClick(i));
            textContainer.appendChild(slot);
        }
    });

    const bankContainer = document.getElementById('word-bank');
    bankContainer.innerHTML = '';

    // Shuffle the word bank
    const shuffledBank = [...q.wordBank].sort(() => Math.random() - 0.5);

    shuffledBank.forEach(word => {
        const chip = document.createElement('div');
        chip.className = 'word-chip';
        chip.textContent = word;
        chip.dataset.word = word;
        chip.addEventListener('click', () => handleWordClick(word, chip));
        bankContainer.appendChild(chip);
    });

    isLocked = false;
    document.getElementById('feedback-msg').textContent = '';
    document.getElementById('feedback-msg').style.color = '';
    document.getElementById('confirm-btn').style.display = 'block';
    document.getElementById('next-btn').style.display = 'none';
}

function handleWordClick(word, chipElement) {
    if (isLocked) return;

    // Find first empty slot
    const emptyIndex = userAnswers.indexOf(null);
    if (emptyIndex === -1) return; // No empty slots

    // Fill the slot
    userAnswers[emptyIndex] = word;

    // Update UI
    const slots = document.querySelectorAll('.blank-slot');
    slots[emptyIndex].textContent = word;
    slots[emptyIndex].classList.add('filled');

    // Hide the chip in the bank
    chipElement.classList.add('hidden');
}

function handleSlotClick(index) {
    if (isLocked) return;

    const word = userAnswers[index];
    if (!word) return;

    // Remove from array
    userAnswers[index] = null;

    // Update UI
    const slots = document.querySelectorAll('.blank-slot');
    slots[index].textContent = '';
    slots[index].classList.remove('filled');

    // Show the chip in the bank again
    // We must find the specific chip that was hidden
    const chips = document.querySelectorAll('.word-chip');
    for (let chip of chips) {
        if (chip.dataset.word === word && chip.classList.contains('hidden')) {
            chip.classList.remove('hidden');
            break; // only reveal one instance
        }
    }
}

function handleConfirm() {
    if (isLocked) return;

    if (userAnswers.includes(null)) {
        const fb = document.getElementById('feedback-msg');
        fb.textContent = "Please fill all the blanks.";
        fb.style.color = '#ff6b6b';
        return;
    }

    const q = blanksData[currentIndex];
    const fb = document.getElementById('feedback-msg');
    const slots = document.querySelectorAll('.blank-slot');

    isLocked = true;

    let allCorrect = true;

    userAnswers.forEach((ans, i) => {
        if (ans === q.correctWords[i]) {
            slots[i].classList.add('correct');
        } else {
            slots[i].classList.add('wrong');
            allCorrect = false;
        }
    });

    if (allCorrect) {
        fb.textContent = "Correct! Well done.";
        fb.style.color = '#5cff5c';
        document.getElementById('confirm-btn').style.display = 'none';

        if (currentIndex < blanksData.length - 1) {
            document.getElementById('next-btn').style.display = 'block';
        } else {
            document.getElementById('next-btn').style.display = 'none';
            fb.textContent += " You have completed all questions!";
            Progress.completeSubMode("classic_questions", "fill_in_blanks")
        }
    } else {
        fb.textContent = "Incorrect. Try again!";
        fb.style.color = '#ff6b6b';

        // Wait 1.5 seconds then unlock and reset wrong slots
        setTimeout(() => {
            userAnswers.forEach((ans, i) => {
                if (ans !== q.correctWords[i]) {
                    handleSlotClick(i);
                    slots[i].classList.remove('wrong');
                } else {
                    slots[i].classList.remove('correct'); // Reset correct highlighting so they can submit again
                }
            });
            isLocked = false;
            fb.textContent = "";
        }, 1500);
    }
}

function handleNext() {
    if (currentIndex < blanksData.length - 1) {
        currentIndex++;
        renderQuestion(currentIndex);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('question-title')) {
        renderQuestion(currentIndex);

        const confirmBtn = document.getElementById('confirm-btn');
        if (confirmBtn) {
            confirmBtn.addEventListener('click', handleConfirm);
        }

        const nextBtn = document.getElementById('next-btn');
        if (nextBtn) {
            nextBtn.addEventListener('click', handleNext);
        }
    }
});
