let tipsData = [];

let currentTipIndex = 0;

const GAME_MODE_ID = "questions_for_company";
const SUB_MODE_ID = "why_tutorial";

function renderTip(index) {
    const progressEl = document.getElementById('tip-progress');
    const titleEl = document.getElementById('tip-title');
    const contentEl = document.getElementById('tip-content');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const feedbackMsg = document.getElementById('feedback-msg');

    if (!tipsData.length) {
        progressEl.textContent = 'No tips yet';
        titleEl.textContent = 'Coming soon';
        contentEl.textContent = 'Add entries to trainingMode/db/why_ask_questions.json to show them here.';
        prevBtn.style.display = 'none';
        nextBtn.style.display = 'none';
        return;
    }

    const tip = tipsData[index];
    progressEl.textContent = `Tip ${index + 1} / ${tipsData.length}`;
    titleEl.textContent = tip.title || tip.question || '';
    contentEl.textContent = tip.description || tip.answer || '';

    // Button visibility
    prevBtn.style.display = index > 0 ? 'block' : 'none';

    feedbackMsg.textContent = '';

    if (index >= tipsData.length - 1) {
        nextBtn.style.display = 'none';
        feedbackMsg.textContent = 'You have completed all tips!';
        feedbackMsg.style.color = '#5cff5c';
        Progress.completeSubMode(GAME_MODE_ID, SUB_MODE_ID);
    } else {
        nextBtn.style.display = 'block';
    }
}

function handleNext() {
    if (currentTipIndex < tipsData.length - 1) {
        currentTipIndex++;
        renderTip(currentTipIndex);
    }
}

function handlePrev() {
    if (currentTipIndex > 0) {
        currentTipIndex--;
        renderTip(currentTipIndex);
    }
}

async function loadData() {
    try {
        const response = await fetch('../db/why_ask_questions.json');
        tipsData = await response.json();

        if (document.getElementById('tip-title')) {
            renderTip(currentTipIndex);
        }
    } catch (error) {
        console.error('Error loading why_ask_questions data:', error);
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
