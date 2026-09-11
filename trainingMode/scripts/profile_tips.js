let tipsData = [];

let currentTipIndex = 0;
let selectedOption = null;
let isLocked = false;

function renderTip(index) {
    const tip = tipsData[index];
    document.getElementById('tip-progress').textContent = `Tip ${index + 1} / ${tipsData.length}`;
    document.getElementById('tip-title').textContent = tip.title;
    document.getElementById('tip-content').textContent = tip.description;
    document.getElementById('mini-quiz_question').textContent = tip.question;

    const optionsContainer = document.getElementById('mini-quiz_options');
    optionsContainer.innerHTML = ''; // clear previous

    tip.options.forEach(opt => {
        const div = document.createElement('div');
        div.className = `mini-quiz-option option-${opt.id}`;
        div.dataset.optId = opt.id;

        const textSpan = document.createElement('span');
        textSpan.textContent = opt.text;
        div.appendChild(textSpan);

        const icon = document.createElement('i');
        icon.className = 'hn hn-check check-icon';
        div.appendChild(icon);

        div.addEventListener('click', () => {
            if (isLocked) return; // Disallow changing answer ONLY after it's confirmed

            // highlight selection
            Array.from(optionsContainer.children).forEach(child => {
                child.classList.remove('selected');
            });
            div.classList.add('selected');

            selectedOption = opt.id;
        });

        optionsContainer.appendChild(div);
    });

    selectedOption = null;
    isLocked = false;
    document.getElementById('feedback-msg').textContent = '';
    document.getElementById('feedback-msg').style.color = '';
    document.getElementById('explanation-msg').style.display = 'none';
    document.getElementById('explanation-msg').textContent = '';
    document.getElementById('confirm-btn').style.display = 'block';
    document.getElementById('next-btn').style.display = 'none';
}

function handleConfirm() {
    if (isLocked) return;

    if (!selectedOption) {
        const fb = document.getElementById('feedback-msg');
        fb.textContent = "Please select an answer.";
        fb.style.color = '#ff6b6b';
        return;
    }

    const tip = tipsData[currentTipIndex];
    const fb = document.getElementById('feedback-msg');
    const expl = document.getElementById('explanation-msg');
    const optionsContainer = document.getElementById('mini-quiz_options');

    // Lock the UI
    isLocked = true;

    // Highlight correct and incorrect options
    Array.from(optionsContainer.children).forEach(child => {
        const childId = child.dataset.optId;
        if (childId === tip.correctOption) {
            child.classList.add('correct');
        } else if (childId === selectedOption) {
            child.classList.add('wrong');
        }
    });

    if (selectedOption === tip.correctOption) {
        fb.textContent = "Correct! Well done.";
        fb.style.color = '#5cff5c';
    } else {
        fb.textContent = "Incorrect.";
        fb.style.color = '#ff6b6b';
    }

    // Show explanation
    expl.textContent = tip.explanation;
    expl.style.display = 'block';

    // Swap buttons
    document.getElementById('confirm-btn').style.display = 'none';

    if (currentTipIndex < tipsData.length - 1) {
        document.getElementById('next-btn').style.display = 'block';
    } else {
        document.getElementById('next-btn').style.display = 'none';
        fb.textContent += " You have completed all tips!";
        if (typeof window.markSubModeWon === 'function') {
            window.markSubModeWon("profile_tips");
        }
        if (typeof Progress !== 'undefined') {
            Progress.completeSubMode("profile", "profile_tips");
        }
    }
}

function handleNext() {
    if (currentTipIndex < tipsData.length - 1) {
        currentTipIndex++;
        renderTip(currentTipIndex);
    }
}

async function loadData() {
    try {
        const response = await fetch('../db/profile_tips.json');
        tipsData = await response.json();
        
        if (document.getElementById('tip-title')) {
            renderTip(currentTipIndex);
        }
    } catch (error) {
        console.error('Error loading profile_tips data:', error);
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
