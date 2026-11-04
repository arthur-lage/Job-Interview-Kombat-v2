// =====================================================
// lesson.js — Theory Lesson Reader
// Loads lessons from lessons.json, filtered by ?topic=
// Displays index and a card-based lesson reader.
// Tracks completion per lesson via localStorage.
// =====================================================

// --- URL params ---
const params       = new URLSearchParams(window.location.search);
const topicId      = params.get('topic') || 'tutorial_grammar';
const subModeId    = params.get('submode') || null;

// --- State ---
let lessons        = [];
let currentIndex   = 0;
const DONE_KEY     = `lesson_done_${topicId}`;

// --- DOM refs ---
const indexScreen  = document.getElementById('lesson-index');
const readerScreen = document.getElementById('lesson-reader');
const indexGrid    = document.getElementById('lesson-index-grid');

const lessonIcon       = document.getElementById('lesson-icon');
const lessonCategory   = document.getElementById('lesson-category');
const lessonTitleEl    = document.getElementById('lesson-title');
const lessonSubtitle   = document.getElementById('lesson-subtitle');
const lessonIntro      = document.getElementById('lesson-intro');
const lessonSections   = document.getElementById('lesson-sections');
const lessonDots       = document.getElementById('lesson-dots');
const progressLabel    = document.getElementById('lesson-progress-label');

const prevBtn          = document.getElementById('lesson-prev-btn');
const nextBtn          = document.getElementById('lesson-next-btn');
const backToIndexBtn   = document.getElementById('lesson-back-to-index');
const doneBtn          = document.getElementById('lesson-done-btn');
const completeOverlay  = document.getElementById('lesson-complete-overlay');

// --- Persistence helpers ---
function getDoneSet() {
    try { return new Set(JSON.parse(localStorage.getItem(DONE_KEY) || '[]')); }
    catch { return new Set(); }
}

function markDone(lessonId) {
    const set = getDoneSet();
    set.add(lessonId);
    localStorage.setItem(DONE_KEY, JSON.stringify([...set]));
}

function isLessonDone(lessonId) {
    return getDoneSet().has(lessonId);
}

function allDone() {
    const done = getDoneSet();
    return lessons.every(l => done.has(l.id));
}

// --- Init ---
async function init() {
    try {
        const res  = await fetch('../db/lessons.json');
        const data = await res.json();

        lessons = data[topicId] || [];

        if (lessons.length === 0) {
            indexGrid.innerHTML = '<p style="color:rgba(255,255,255,0.5);font-family:PixelOperatorFont,monospace;font-size:1.4rem;text-align:center;">No lessons found for this topic.</p>';
            return;
        }

        renderIndex();
    } catch (err) {
        console.error('[Lesson] Failed to load lessons:', err);
    }
}

// --- Render Index ---
function renderIndex() {
    indexGrid.innerHTML = '';

    lessons.forEach((lesson, i) => {
        const done = isLessonDone(lesson.id);

        const card = document.createElement('button');
        card.className = 'lesson-index-card animate-enter' + (done ? ' done' : '');
        card.style.animationDelay = `${i * 60}ms`;
        card.setAttribute('aria-label', `Open lesson: ${lesson.title}`);

        card.innerHTML = `
            ${done ? '<i class="hn hn-badge-check-solid done-check-icon"></i>' : ''}
            <span class="lesson-card-icon">${lesson.icon || '<i class="hn hn-graduation-cap"></i>'}</span>
            <span class="lesson-card-category">${lesson.category}</span>
            <span class="lesson-card-title">${lesson.title}</span>
            <span class="lesson-card-subtitle">${lesson.subtitle}</span>
            <span class="lesson-index-card-arrow">→ START LESSON</span>
        `;

        card.addEventListener('click', () => openLesson(i));
        indexGrid.appendChild(card);
    });
}

// --- Open a lesson ---
function openLesson(index) {
    currentIndex = index;
    indexScreen.style.display  = 'none';
    readerScreen.classList.add('active');
    renderLesson();
}

// --- Back to index ---
backToIndexBtn.addEventListener('click', () => {
    readerScreen.classList.remove('active');
    indexScreen.style.display = 'flex';
    renderIndex(); // refresh done states
});

// --- Render current lesson ---
function renderLesson() {
    const lesson = lessons[currentIndex];
    if (!lesson) return;

    const done = isLessonDone(lesson.id);

    // Animate card in
    const card = document.getElementById('lesson-card');
    card.classList.remove('slide-in');
    void card.offsetWidth; // reflow
    card.classList.add('slide-in');

    // Fill header
    lessonIcon.innerHTML         = lesson.icon || '<i class="hn hn-graduation-cap"></i>';
    lessonCategory.textContent = lesson.category;
    lessonTitleEl.textContent  = lesson.title;
    lessonSubtitle.textContent = lesson.subtitle;
    lessonIntro.textContent    = lesson.content;

    // Fill sections
    lessonSections.innerHTML = '';
    (lesson.sections || []).forEach(sec => {
        const section = document.createElement('div');
        section.className = 'lesson-section';

        const examplesHtml = (sec.examples || [])
            .map(ex => `<div class="lesson-example">${formatExample(escapeHtml(ex))}</div>`)
            .join('');

        const tipHtml = sec.tip
            ? `<div class="lesson-tip">
                    <span class="lesson-tip-icon"><i class="hn hn-star-solid"></i></span>
                    <span class="lesson-tip-text">${escapeHtml(sec.tip)}</span>
               </div>`
            : '';

        section.innerHTML = `
            <div class="lesson-section-heading">${escapeHtml(sec.heading)}</div>
            <div class="lesson-section-text">${escapeHtml(sec.text)}</div>
            <div class="lesson-examples">${examplesHtml}</div>
            ${tipHtml}
        `;
        lessonSections.appendChild(section);
    });

    // Progress
    progressLabel.textContent = `${currentIndex + 1} / ${lessons.length}`;

    // Dots
    renderDots();

    // Nav buttons
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex === lessons.length - 1;

    // Done button state
    if (done) {
        doneBtn.innerHTML = '<i class="hn hn-badge-check-solid"></i> DONE';
        doneBtn.classList.add('already-done');
    } else {
        doneBtn.innerHTML = '<i class="hn hn-badge-check-solid"></i> MARK AS DONE';
        doneBtn.classList.remove('already-done');
    }

    // Scroll card to top
    document.getElementById('lesson-card').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// --- Dots ---
function renderDots() {
    lessonDots.innerHTML = '';
    const doneSet = getDoneSet();

    lessons.forEach((lesson, i) => {
        const dot = document.createElement('div');
        dot.className = 'lesson-dot';

        if (i === currentIndex) dot.classList.add('active');
        else if (doneSet.has(lesson.id)) dot.classList.add('completed');

        dot.addEventListener('click', () => navigateTo(i));
        lessonDots.appendChild(dot);
    });
}

function navigateTo(index) {
    if (index === currentIndex) return;
    currentIndex = index;
    renderLesson();
}

// --- Navigation ---
prevBtn.addEventListener('click', () => {
    if (currentIndex > 0) {
        currentIndex--;
        renderLesson();
    }
});

nextBtn.addEventListener('click', () => {
    if (currentIndex < lessons.length - 1) {
        currentIndex++;
        renderLesson();
    }
});

// --- Mark as done ---
doneBtn.addEventListener('click', () => {
    const lesson = lessons[currentIndex];
    markDone(lesson.id);

    doneBtn.innerHTML = '<i class="hn hn-badge-check-solid"></i> DONE';
    doneBtn.classList.add('already-done');
    renderDots();

    if (allDone()) {
        showCompletionOverlay();
    } else {
        // Auto-advance to next undone lesson
        const nextUndone = lessons.findIndex((l, i) => i > currentIndex && !isLessonDone(l.id));
        if (nextUndone !== -1) {
            setTimeout(() => {
                currentIndex = nextUndone;
                renderLesson();
            }, 400);
        }
    }

    // Register progress
    if (subModeId && typeof window.markSubModeWon === 'function') {
        window.markSubModeWon(subModeId);
    }
    if (topicId && subModeId && typeof Progress !== 'undefined') {
        Progress.completeSubMode(topicId, subModeId);
    }
});

// --- Completion overlay ---
function showCompletionOverlay() {
    const done  = getDoneSet();
    const total = lessons.length;
    const count = lessons.filter(l => done.has(l.id)).length;

    document.getElementById('stat-done').textContent  = count;
    document.getElementById('stat-total').textContent = total;

    completeOverlay.classList.add('active');
}

// --- Keyboard navigation ---
document.addEventListener('keydown', (e) => {
    if (!readerScreen.classList.contains('active')) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        if (currentIndex < lessons.length - 1) { currentIndex++; renderLesson(); }
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        if (currentIndex > 0) { currentIndex--; renderLesson(); }
    } else if (e.key === 'Escape') {
        backToIndexBtn.click();
    }
});

// --- Helpers ---
function escapeHtml(str) {
    const d = document.createElement('div');
    d.appendChild(document.createTextNode(str));
    return d.innerHTML;
}

function formatExample(escapedStr) {
    return escapedStr
        .replace(/\[CHECK\]/g, '<i class="hn hn-badge-check-solid" style="color:#00e676"></i>')
        .replace(/\[WRONG\]/g, '<i class="hn hn-exclamation-triangle-solid" style="color:#ff1a40"></i>');
}

// --- Start ---
init();
