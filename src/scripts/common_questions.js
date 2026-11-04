let questionsData = [];

let currentQuestionIndex = 0;
let selectedOption = null;
let isLocked = false;

function renderQuestion(index) {
    const q = questionsData[index];
    document.getElementById('question-progress').textContent = `Question ${index + 1} / ${questionsData.length}`;
    document.getElementById('common-question').textContent = q.question;
    document.getElementById('how-to-answer').textContent = q.howToAnswer;
    document.getElementById('mini-quiz_common-question').textContent = q.question;

    const optionsContainer = document.getElementById('mini-quiz_options');
    optionsContainer.innerHTML = ''; // clear previous

    q.options.forEach(opt => {
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

    const q = questionsData[currentQuestionIndex];
    const fb = document.getElementById('feedback-msg');
    const expl = document.getElementById('explanation-msg');
    const optionsContainer = document.getElementById('mini-quiz_options');

    // Lock the UI
    isLocked = true;

    // Highlight correct and incorrect options
    Array.from(optionsContainer.children).forEach(child => {
        const childId = child.dataset.optId;
        if (childId === q.correctOption) {
            child.classList.add('correct');
        } else if (childId === selectedOption) {
            child.classList.add('wrong');
        }
    });

    if (selectedOption === q.correctOption) {
        fb.textContent = "Correct! Well done.";
        fb.style.color = '#5cff5c';
    } else {
        fb.textContent = "Incorrect.";
        fb.style.color = '#ff6b6b';
    }

    // Show explanation
    expl.textContent = q.explanation;
    expl.style.display = 'block';

    // Swap buttons
    document.getElementById('confirm-btn').style.display = 'none';

    if (currentQuestionIndex < questionsData.length - 1) {
        document.getElementById('next-btn').style.display = 'block';
    } else {
        document.getElementById('next-btn').style.display = 'none';
        fb.textContent += " You have completed all questions!";
        Progress.completeSubMode("classic_questions", "common_questions")
    }
}

function handleNext() {
    if (currentQuestionIndex < questionsData.length - 1) {
        currentQuestionIndex++;
        renderQuestion(currentQuestionIndex);
    }
}

async function loadData() {
    try {
        const response = await fetch('../db/common_questions.json');
        questionsData = await response.json();
        
        if (document.getElementById('common-question')) {
            renderQuestion(currentQuestionIndex);
        }
    } catch (error) {
        console.error('Error loading common_questions data:', error);
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
