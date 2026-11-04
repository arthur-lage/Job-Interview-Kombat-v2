let scenariosData = [];

let currentScenarioIndex = 0;
let selectedOption = null;
let isLocked = false;

function renderChatDialog(dialog) {
    const chatContainer = document.getElementById('chat-dialog');
    chatContainer.innerHTML = '';

    dialog.forEach(msg => {
        const msgDiv = document.createElement('div');
        msgDiv.className = `chat-msg ${msg.role}`;

        const roleLabel = document.createElement('div');
        roleLabel.className = 'chat-role';
        roleLabel.innerHTML = msg.role === 'interviewer'
            ? '<i class="hn hn-tech-companies"></i> Interviewer'
            : '<i class="hn hn-user-solid"></i> You (Candidate)';

        const bubble = document.createElement('div');
        bubble.className = 'chat-bubble';
        bubble.textContent = msg.text;

        msgDiv.appendChild(roleLabel);
        msgDiv.appendChild(bubble);
        chatContainer.appendChild(msgDiv);
    });

    // Add the "pending" typing indicator bubble
    const pendingDiv = document.createElement('div');
    pendingDiv.className = 'chat-msg pending';
    pendingDiv.id = 'pending-msg';

    const pendingRole = document.createElement('div');
    pendingRole.className = 'chat-role';
    pendingRole.innerHTML = '<i class="hn hn-user-solid"></i> You (Candidate)';

    const pendingBubble = document.createElement('div');
    pendingBubble.className = 'chat-bubble';
    pendingBubble.innerHTML = 'What should you say next? <span class="typing-dots"><span></span><span></span><span></span></span>';

    pendingDiv.appendChild(pendingRole);
    pendingDiv.appendChild(pendingBubble);
    chatContainer.appendChild(pendingDiv);
}

function renderTipBadge(tipReference) {
    const badge = document.getElementById('tip-badge');
    if (tipReference) {
        badge.textContent = `Tip: ${tipReference}`;
        badge.style.display = 'inline-flex';
    } else {
        badge.style.display = 'none';
    }
}

function revealChosenAnswer(scenario, chosenId) {
    const pending = document.getElementById('pending-msg');
    if (!pending) return;

    const chosenOption = scenario.options.find(o => o.id === chosenId);
    if (!chosenOption) return;

    const isCorrect = chosenId === scenario.correctOption;

    // Replace the pending indicator with the chosen answer
    pending.className = `chat-msg interviewee chosen ${isCorrect ? 'correct-answer' : 'wrong-answer'}`;
    pending.id = '';

    const roleEl = pending.querySelector('.chat-role');
    roleEl.innerHTML = '<i class="hn hn-user-solid"></i> You (Candidate)';

    const bubbleEl = pending.querySelector('.chat-bubble');
    bubbleEl.textContent = chosenOption.text;

    // If the chosen answer was wrong, also show the correct one
    if (!isCorrect) {
        const correctOption = scenario.options.find(o => o.id === scenario.correctOption);
        if (correctOption) {
            const correctDiv = document.createElement('div');
            correctDiv.className = 'chat-msg interviewee chosen correct-answer';

            const correctRole = document.createElement('div');
            correctRole.className = 'chat-role';
            correctRole.innerHTML = '<i class="hn hn-user-solid"></i> Best response';
            correctRole.style.color = '#5cff5c';

            const correctBubble = document.createElement('div');
            correctBubble.className = 'chat-bubble';
            correctBubble.textContent = correctOption.text;

            correctDiv.appendChild(correctRole);
            correctDiv.appendChild(correctBubble);

            const chatContainer = document.getElementById('chat-dialog');
            chatContainer.appendChild(correctDiv);
        }
    }
}

function renderScenario(index) {
    const s = scenariosData[index];
    document.getElementById('question-progress').textContent = `Scenario ${index + 1} / ${scenariosData.length}`;
    document.getElementById('scenario-title').textContent = s.title;
    document.getElementById('scenario-context').textContent = s.context;
    document.getElementById('mini-quiz_scenario-question').textContent = s.question;

    // Render the chat dialog
    renderChatDialog(s.dialog);

    // Render the tip badge
    renderTipBadge(s.tipReference);

    const optionsContainer = document.getElementById('mini-quiz_options');
    optionsContainer.innerHTML = ''; // clear previous

    s.options.forEach(opt => {
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

    const s = scenariosData[currentScenarioIndex];
    const fb = document.getElementById('feedback-msg');
    const expl = document.getElementById('explanation-msg');
    const optionsContainer = document.getElementById('mini-quiz_options');

    // Lock the UI
    isLocked = true;

    // Highlight correct and incorrect options
    Array.from(optionsContainer.children).forEach(child => {
        const childId = child.dataset.optId;
        if (childId === s.correctOption) {
            child.classList.add('correct');
        } else if (childId === selectedOption) {
            child.classList.add('wrong');
        }
    });

    if (selectedOption === s.correctOption) {
        fb.textContent = "Correct! Well done.";
        fb.style.color = '#5cff5c';
    } else {
        fb.textContent = "Incorrect.";
        fb.style.color = '#ff6b6b';
    }

    // Reveal the chosen answer in the chat dialog
    revealChosenAnswer(s, selectedOption);

    // Show explanation
    expl.textContent = s.explanation;
    expl.style.display = 'block';

    // Swap buttons
    document.getElementById('confirm-btn').style.display = 'none';

    if (currentScenarioIndex < scenariosData.length - 1) {
        document.getElementById('next-btn').style.display = 'block';
    } else {
        document.getElementById('next-btn').style.display = 'none';
        fb.textContent += " You have completed all scenarios!";
        Progress.completeSubMode("salary_negotiation", "salary_examples");
    }
}

function handleNext() {
    if (currentScenarioIndex < scenariosData.length - 1) {
        currentScenarioIndex++;
        renderScenario(currentScenarioIndex);

        // Scroll back to the top of the card
        document.querySelector('.card-viewer').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

async function loadData() {
    try {
        const response = await fetch('../db/salary_examples.json');
        scenariosData = await response.json();

        if (document.getElementById('scenario-title')) {
            renderScenario(currentScenarioIndex);
        }
    } catch (error) {
        console.error('Error loading salary_examples data:', error);
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
