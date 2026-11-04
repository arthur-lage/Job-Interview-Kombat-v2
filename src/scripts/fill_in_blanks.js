let blanksData = [];

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

async function loadData() {
    try {
        const response = await fetch('../db/fill_in_blanks.json');
        blanksData = await response.json();
        
        if (document.getElementById('question-title')) {
            renderQuestion(currentIndex);
        }
    } catch (error) {
        console.error('Error loading fill_in_blanks data:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadData();

    const confirmBtn = document.getElementById('confirm-btn');
    if (confirmBtn) {
        confirmBtn.addEventListener('click', handleConfirm);
    }

    const nextBtn = document.getElementById('next-btn');
    if (nextBtn) {
        nextBtn.addEventListener('click', handleNext);
    }
});
