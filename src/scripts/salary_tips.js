let tipsData = [];

let currentTipIndex = 0;

function renderTip(index) {
    const tip = tipsData[index];
    document.getElementById('tip-progress').textContent = `Tip ${index + 1} / ${tipsData.length}`;
    document.getElementById('tip-title').textContent = tip.title;
    document.getElementById('tip-content').textContent = tip.description;

    // Button visibility
    document.getElementById('prev-btn').style.display = index > 0 ? 'block' : 'none';

    const feedbackMsg = document.getElementById('feedback-msg');
    feedbackMsg.textContent = '';

    if (index >= tipsData.length - 1) {
        document.getElementById('next-btn').style.display = 'none';
        feedbackMsg.textContent = 'You have completed all tips!';
        feedbackMsg.style.color = '#5cff5c';
        Progress.completeSubMode("salary_negotiation", "salary_tips");
    } else {
        document.getElementById('next-btn').style.display = 'block';
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
        const response = await fetch('../db/salary_tips.json');
        tipsData = await response.json();

        if (document.getElementById('tip-title')) {
            renderTip(currentTipIndex);
        }
    } catch (error) {
        console.error('Error loading salary_tips data:', error);
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
