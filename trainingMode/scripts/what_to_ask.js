let questionsData = [];

let currentQuestionIndex = 0;

const GAME_MODE_ID = "questions_for_company";
const SUB_MODE_ID = "what_to_ask";

function renderQuestion(index) {
    const progressEl = document.getElementById('tip-progress');
    const titleEl = document.getElementById('tip-title');
    const contentEl = document.getElementById('tip-content');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const feedbackMsg = document.getElementById('feedback-msg');

    if (!questionsData.length) {
        progressEl.textContent = 'No questions yet';
        titleEl.textContent = 'Coming soon';
        contentEl.textContent = 'Add entries to trainingMode/db/what_to_ask.json to show them here.';
        prevBtn.style.display = 'none';
        nextBtn.style.display = 'none';
        return;
    }

    const item = questionsData[index];
    progressEl.textContent = `Question ${index + 1} / ${questionsData.length}`;
    titleEl.textContent = item.question || item.title || '';
    contentEl.textContent = item.description || item.answer || '';

    // Button visibility
    prevBtn.style.display = index > 0 ? 'block' : 'none';

    feedbackMsg.textContent = '';

    if (index >= questionsData.length - 1) {
        nextBtn.style.display = 'none';
        feedbackMsg.textContent = 'You have completed all questions!';
        feedbackMsg.style.color = '#5cff5c';
        Progress.completeSubMode(GAME_MODE_ID, SUB_MODE_ID);
    } else {
        nextBtn.style.display = 'block';
    }
}

function handleNext() {
    if (currentQuestionIndex < questionsData.length - 1) {
        currentQuestionIndex++;
        renderQuestion(currentQuestionIndex);
    }
}

function handlePrev() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        renderQuestion(currentQuestionIndex);
    }
}

async function loadData() {
    try {
        const response = await fetch('../db/what_to_ask.json');
        questionsData = await response.json();

        if (document.getElementById('tip-title')) {
            renderQuestion(currentQuestionIndex);
        }
    } catch (error) {
        console.error('Error loading what_to_ask data:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadData();

    const nextBtn = document.getElementById('next-btn');
    if (nextBtn) {
        nextBtn.addEventListener('click', handleNext);
    }

    const prevBtn = document.getElementById('prev-btn');
    if (prevBtn) {
        prevBtn.addEventListener('click', handlePrev);
    }
});
