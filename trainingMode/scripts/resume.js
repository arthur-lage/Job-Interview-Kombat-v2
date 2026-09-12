/**
 * resume.js
 * Sistema de Currículo — Resume Builder
 * Job Interview Kombat v2
 *
 * Funcionalidades:
 *   - 100% Editável: O usuário pode editar todos os campos do formulário a qualquer momento.
 *   - Edição Direta no Documento: Campos no preview do papel (.rdoc) são contenteditable com sync bidirecional.
 *   - Exemplos / Sugestões Prontas: Botão de sugestão em cada seção com frases profissionais em inglês.
 *   - Ações Práticas: Imprimir / Salvar em PDF (window.print), Copiar texto formatado, Limpar e Preencher exemplo completo.
 *   - Persistência automática em localStorage (trainingMode_resume_data).
 *   - Progresso do jogo integrado (exibe módulos do jogo dominados sem travar a edição).
 */

// ---------------------------------------------------------------------------
// MAPA: topicId → subModeIds que precisam ser vencidos
// ---------------------------------------------------------------------------
const TOPIC_SUBMODES = {
    tutorial_grammar: ['tutorial_lessons', 'tutorial_quiz'],
    profile: ['profile_tips', 'profile_quiz'],
    introduction: ['intro_lesson', 'intro_quiz'],
    experience: ['exp_lesson', 'exp_quiz'],
    meetings: ['meetings_tutorial', 'meetings_war_room'],
    classic_questions: ['common_questions', 'fill_in_blanks'],
    soft_skills: ['soft_lesson', 'soft_vocab', 'soft_quiz'],
    salary_negotiation: ['salary_tips', 'salary_examples'],
};

// ---------------------------------------------------------------------------
// ESTRUTURA DO CURRÍCULO
// ---------------------------------------------------------------------------
const RESUME_SECTIONS = [
    {
        id: 'personal_info',
        title: '👤 Personal Information',
        topic: 'tutorial_grammar',
        topicName: 'Grammar & Basics',
        fields: [
            { id: 'full_name', label: 'Full Name', placeholder: 'e.g. Alex Rivera', type: 'text' },
            { id: 'email', label: 'Email', placeholder: 'e.g. alex.rivera.dev@gmail.com', type: 'text' },
            { id: 'linkedin', label: 'LinkedIn', placeholder: 'e.g. linkedin.com/in/alexrivera-tech', type: 'text' },
            { id: 'phone', label: 'Phone', placeholder: 'e.g. +55 (31) 98765-4321', type: 'text' },
        ]
    },
    {
        id: 'professional_summary',
        title: '🎯 Professional Summary',
        topic: 'profile',
        topicName: 'Profile & Pitch',
        fields: [
            { id: 'summary_kw1', label: 'Keyword 1', placeholder: 'e.g. results-driven', type: 'text' },
            { id: 'summary_kw2', label: 'Keyword 2', placeholder: 'e.g. collaborative', type: 'text' },
            { id: 'summary_kw3', label: 'Keyword 3', placeholder: 'e.g. solutions-oriented', type: 'text' },
            { id: 'summary_text', label: 'Summary Sentence', placeholder: 'e.g. Results-driven and collaborative Software Engineer with 4+ years of experience delivering scalable web systems.', type: 'textarea' },
        ]
    },
    {
        id: 'self_introduction',
        title: '🗣️ Self-Introduction',
        topic: 'introduction',
        topicName: 'Introduction & Elevator Pitch',
        fields: [
            { id: 'intro_paragraph', label: 'Introduction Paragraph', placeholder: 'Write a brief self-introduction in English (2–3 sentences). e.g. "Hi, I am Alex Rivera. Over the past 4 years, I have engineered full-stack web platforms..."', type: 'textarea' },
        ]
    },
    {
        id: 'work_experience',
        title: '💼 Work Experience',
        topic: 'experience',
        topicName: 'STAR Method & Experience',
        fields: [
            { id: 'job_title', label: 'Job Title', placeholder: 'e.g. Full-Stack Software Engineer', type: 'text' },
            { id: 'company', label: 'Company', placeholder: 'e.g. Global Tech Innovations', type: 'text' },
            { id: 'exp_period', label: 'Period', placeholder: 'e.g. 2022 – Present', type: 'text' },
            { id: 'achievement', label: 'Key Achievement (STAR method)', placeholder: 'e.g. Spearheaded microservices migration, reducing API latency by 38% and supporting 500k monthly active users.', type: 'textarea' },
        ]
    },
    {
        id: 'communication',
        title: '🤝 Meetings & Communication',
        topic: 'meetings',
        topicName: 'Meetings & War Room',
        fields: [
            { id: 'comm_skill1', label: 'Communication Skill 1', placeholder: 'e.g. Active Listening & Stakeholder Alignment', type: 'text' },
            { id: 'comm_skill2', label: 'Communication Skill 2', placeholder: 'e.g. Crisis De-escalation in War Rooms', type: 'text' },
            { id: 'meeting_phrase', label: 'Favourite Meeting Phrase', placeholder: 'e.g. "Let\'s align on action items and prioritize by immediate business impact."', type: 'text' },
        ]
    },
    {
        id: 'classic_answers',
        title: '❓ Classic Interview Answers',
        topic: 'classic_questions',
        topicName: 'Common Questions',
        fields: [
            { id: 'why_hire', label: '"Why should we hire you?"', placeholder: 'e.g. Because I bring a proven blend of technical rigor and cross-functional empathy, consistently delivering production features on time.', type: 'textarea' },
            { id: 'strength', label: '"What is your greatest strength?"', placeholder: 'e.g. My ability to break down ambiguous engineering problems and communicate clear roadmaps.', type: 'textarea' },
            { id: 'weakness', label: '"What is your weakness?"', placeholder: 'e.g. I used to take on too many tasks at once, but I now strictly enforce priority triage and async delegation.', type: 'textarea' },
        ]
    },
    {
        id: 'soft_skills_section',
        title: '⭐ Soft Skills',
        topic: 'soft_skills',
        topicName: 'Soft Skills',
        fields: [
            { id: 'soft1', label: 'Top Soft Skill 1', placeholder: 'e.g. Cross-Functional Leadership', type: 'text' },
            { id: 'soft2', label: 'Top Soft Skill 2', placeholder: 'e.g. Constructive Code Review', type: 'text' },
            { id: 'soft3', label: 'Top Soft Skill 3', placeholder: 'e.g. Crisis De-escalation', type: 'text' },
        ]
    },
    {
        id: 'salary',
        title: '💰 Salary Expectation',
        topic: 'salary_negotiation',
        topicName: 'Salary Negotiation',
        fields: [
            { id: 'salary_range', label: 'Expected Salary Range', placeholder: 'e.g. R$ 8.500 – R$ 11.000 / month (or $85,000 - $95,000 / yr)', type: 'text' },
            { id: 'salary_justify', label: 'Justification', placeholder: 'e.g. Based on market benchmarks for software engineers and my demonstrated track record of scaling high-availability systems.', type: 'textarea' },
        ]
    },
];

// ---------------------------------------------------------------------------
// EXEMPLOS PROFISSIONAIS (SUGESTÕES)
// ---------------------------------------------------------------------------
const SAMPLE_DATA = {
    full_name: 'Alex Rivera',
    email: 'alex.rivera.dev@gmail.com',
    phone: '+55 (31) 98765-4321',
    linkedin: 'linkedin.com/in/alexrivera-tech',
    summary_kw1: 'results-driven',
    summary_kw2: 'collaborative',
    summary_kw3: 'solutions-oriented',
    summary_text: 'Results-driven and collaborative Software Engineer with 4+ years of experience delivering scalable web applications and distributed cloud systems.',
    intro_paragraph: 'Hi, I am Alex Rivera. Over the past 4 years, I have engineered full-stack web platforms with high test coverage and low latency. I excel at translating complex business requirements into resilient technical solutions.',
    job_title: 'Full-Stack Software Engineer',
    company: 'Global Tech Innovations',
    exp_period: '2022 – Present',
    achievement: 'Spearheaded the migration of monolithic services to microservices, reducing API response times by 38% and supporting over 500k monthly active users.',
    comm_skill1: 'Active Listening & Stakeholder Alignment',
    comm_skill2: 'Incident Leadership & Crisis Triage',
    meeting_phrase: "Let's align on action items and prioritize by immediate business impact.",
    why_hire: 'Because I bring a proven blend of technical rigor and cross-functional empathy, consistently delivering resilient production features on time.',
    strength: 'My ability to break down ambiguous engineering problems and communicate clear, phased roadmaps to both engineers and executives.',
    weakness: 'I used to take on too many tasks at once, but I now strictly enforce priority triage and asynchronous delegation.',
    soft1: 'Cross-Functional Leadership',
    soft2: 'Constructive Code Review',
    soft3: 'Crisis De-escalation',
    salary_range: 'R$ 8.500 – R$ 11.000 / month',
    salary_justify: 'Based on market benchmarks for mid-to-senior software engineers in Brazil and my demonstrated track record of scaling high-availability systems.',
};

// ---------------------------------------------------------------------------
// PERSISTENCE HELPERS
// ---------------------------------------------------------------------------
const WINS_KEY = 'trainingMode_subMode_wins';
const DATA_KEY = 'trainingMode_resume_data';

function getWins() {
    try { return JSON.parse(localStorage.getItem(WINS_KEY)) || {}; }
    catch { return {}; }
}

function getResumeData() {
    try { return JSON.parse(localStorage.getItem(DATA_KEY)) || {}; }
    catch { return {}; }
}

function saveResumeData(data) {
    localStorage.setItem(DATA_KEY, JSON.stringify(data));
}

function markSubModeWon(subModeId) {
    const wins = getWins();
    wins[subModeId] = true;
    localStorage.setItem(WINS_KEY, JSON.stringify(wins));
}

function isTopicUnlocked(topicId) {
    const wins = getWins();
    const submodes = TOPIC_SUBMODES[topicId] || [];
    const hasProgress = typeof Progress !== 'undefined';
    return submodes.length > 0 && submodes.every(id => {
        if (wins[id] === true) return true;
        if (hasProgress && Progress.isSubModeComplete(topicId, id)) return true;
        return false;
    });
}

// ---------------------------------------------------------------------------
// PREVIEW HELPERS
// ---------------------------------------------------------------------------

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

/**
 * Retorna HTML de um campo para o preview do documento.
 * Totalmente interativo com contenteditable para edição direta no papel!
 */
function rdocField(fieldId, placeholder) {
    const data = getResumeData();
    const rawVal = data[fieldId] !== undefined ? data[fieldId] : '';
    const trimmed = rawVal.trim();

    if (!trimmed) {
        return `<span class="rdoc-field rdoc-ph rdoc-ph--empty" data-field="${fieldId}" contenteditable="true" spellcheck="false" title="Click to edit">${escapeHtml(placeholder)}</span>`;
    }
    return `<span class="rdoc-field rdoc-filled" data-field="${fieldId}" contenteditable="true" spellcheck="false" title="Click to edit">${escapeHtml(rawVal)}</span>`;
}

function buildResumePreviewHTML() {
    const f = (id, ph) => rdocField(id, ph);

    return `
        <!-- Personal Header -->
        <div class="rdoc-personal-header">
            <div class="rdoc-name">${f('full_name', 'YOUR FULL NAME')}</div>
            <div class="rdoc-contact">
                ${f('email', 'your@email.com')}
                <span class="rdoc-sep">·</span>
                ${f('phone', '+55 (31) 90000-0000')}
                <span class="rdoc-sep">·</span>
                ${f('linkedin', 'linkedin.com/in/yourprofile')}
            </div>
        </div>

        <!-- Professional Summary -->
        <div class="rdoc-section">
            <div class="rdoc-section-title">PROFESSIONAL SUMMARY</div>
            <p class="rdoc-text">
                I am a ${f('summary_kw1', '[keyword 1]')},
                ${f('summary_kw2', '[keyword 2]')} and
                ${f('summary_kw3', '[keyword 3]')} professional.
            </p>
            <p class="rdoc-text rdoc-mt">${f('summary_text', '[Write your professional summary sentence here...]')}</p>
        </div>

        <!-- Self-Introduction -->
        <div class="rdoc-section">
            <div class="rdoc-section-title">SELF-INTRODUCTION</div>
            <p class="rdoc-text">${f('intro_paragraph', '[Write a brief self-introduction in English (2–3 sentences)...]')}</p>
        </div>

        <!-- Work Experience -->
        <div class="rdoc-section">
            <div class="rdoc-section-title">WORK EXPERIENCE</div>
            <div class="rdoc-exp-header">
                <span class="rdoc-exp-title">${f('job_title', '[Job Title]')}</span>
                <span class="rdoc-sep">—</span>
                ${f('company', '[Company Name]')}
                <span class="rdoc-exp-period">${f('exp_period', '[Period]')}</span>
            </div>
            <p class="rdoc-text rdoc-mt">${f('achievement', '[Describe your key achievement in this role using STAR method...]')}</p>
        </div>

        <!-- Communication -->
        <div class="rdoc-section">
            <div class="rdoc-section-title">COMMUNICATION & MEETINGS</div>
            <div class="rdoc-skills-row">
                ${f('comm_skill1', '[Communication Skill 1]')}
                <span class="rdoc-sep">·</span>
                ${f('comm_skill2', '[Communication Skill 2]')}
            </div>
            <p class="rdoc-text rdoc-quote">"${f('meeting_phrase', '[Your favourite meeting phrase...]')}"</p>
        </div>

        <!-- Interview Prep -->
        <div class="rdoc-section">
            <div class="rdoc-section-title">INTERVIEW PREPARATION</div>
            <div class="rdoc-qa-block">
                <span class="rdoc-q">Why should we hire you?</span>
                <p class="rdoc-text">${f('why_hire', '[Your answer here...]')}</p>
            </div>
            <div class="rdoc-qa-block">
                <span class="rdoc-q">Greatest strength?</span>
                <p class="rdoc-text">${f('strength', '[Your answer here...]')}</p>
            </div>
            <div class="rdoc-qa-block">
                <span class="rdoc-q">Main weakness?</span>
                <p class="rdoc-text">${f('weakness', '[Your answer here...]')}</p>
            </div>
        </div>

        <!-- Soft Skills -->
        <div class="rdoc-section">
            <div class="rdoc-section-title">SOFT SKILLS</div>
            <div class="rdoc-skills-row rdoc-skills-pills">
                ${f('soft1', '[Skill 1]')}
                <span class="rdoc-sep">·</span>
                ${f('soft2', '[Skill 2]')}
                <span class="rdoc-sep">·</span>
                ${f('soft3', '[Skill 3]')}
            </div>
        </div>

        <!-- Salary -->
        <div class="rdoc-section">
            <div class="rdoc-section-title">SALARY EXPECTATION</div>
            <p class="rdoc-text">
                <span class="rdoc-salary-range">${f('salary_range', '[Expected Salary Range]')}</span>
            </p>
            <p class="rdoc-text rdoc-mt">${f('salary_justify', '[Justification for your salary expectation...]')}</p>
        </div>
    `;
}

function updateResumePreview() {
    const previewContent = document.querySelector('.rdoc');
    if (previewContent) {
        previewContent.innerHTML = buildResumePreviewHTML();
    }
}

// ---------------------------------------------------------------------------
// PLAIN TEXT EXPORT HELPER (FOR COPY TO CLIPBOARD)
// ---------------------------------------------------------------------------
function getResumePlainText() {
    const d = getResumeData();
    const g = id => (d[id] || '').trim();
    let text = '';

    const name = g('full_name') || 'YOUR FULL NAME';
    text += `${name.toUpperCase()}\n`;
    const contact = [g('email'), g('phone'), g('linkedin')].filter(Boolean).join(' | ');
    if (contact) text += `${contact}\n`;
    text += `\n============================================================\n\n`;

    // Professional Summary
    text += `PROFESSIONAL SUMMARY\n`;
    text += `--------------------\n`;
    const kws = [g('summary_kw1'), g('summary_kw2'), g('summary_kw3')].filter(Boolean);
    if (kws.length) text += `Core Qualities: ${kws.join(', ')}\n`;
    if (g('summary_text')) text += `${g('summary_text')}\n`;
    text += `\n`;

    // Self-Introduction
    if (g('intro_paragraph')) {
        text += `SELF-INTRODUCTION\n`;
        text += `-----------------\n`;
        text += `${g('intro_paragraph')}\n\n`;
    }

    // Work Experience
    if (g('job_title') || g('company') || g('achievement')) {
        text += `WORK EXPERIENCE\n`;
        text += `---------------\n`;
        text += `${g('job_title') || 'Role'} — ${g('company') || 'Company'} (${g('exp_period') || 'Period'})\n`;
        if (g('achievement')) text += `${g('achievement')}\n`;
        text += `\n`;
    }

    // Communication & Meetings
    if (g('comm_skill1') || g('comm_skill2') || g('meeting_phrase')) {
        text += `COMMUNICATION & MEETINGS\n`;
        text += `------------------------\n`;
        const comm = [g('comm_skill1'), g('comm_skill2')].filter(Boolean);
        if (comm.length) text += `Key Skills: ${comm.join(' · ')}\n`;
        if (g('meeting_phrase')) text += `Key Phrase: "${g('meeting_phrase')}"\n`;
        text += `\n`;
    }

    // Classic Questions
    if (g('why_hire') || g('strength') || g('weakness')) {
        text += `INTERVIEW PREPARATION\n`;
        text += `---------------------\n`;
        if (g('why_hire')) text += `Q: Why should we hire you?\nA: ${g('why_hire')}\n\n`;
        if (g('strength')) text += `Q: What is your greatest strength?\nA: ${g('strength')}\n\n`;
        if (g('weakness')) text += `Q: What is your weakness?\nA: ${g('weakness')}\n\n`;
    }

    // Soft Skills
    const soft = [g('soft1'), g('soft2'), g('soft3')].filter(Boolean);
    if (soft.length) {
        text += `SOFT SKILLS\n`;
        text += `-----------\n`;
        text += `${soft.join(' · ')}\n\n`;
    }

    // Salary
    if (g('salary_range') || g('salary_justify')) {
        text += `SALARY EXPECTATION\n`;
        text += `------------------\n`;
        if (g('salary_range')) text += `Target: ${g('salary_range')}\n`;
        if (g('salary_justify')) text += `Justification: ${g('salary_justify')}\n`;
    }

    return text.trim();
}

function showToast(message) {
    const existing = document.querySelector('.resume-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'resume-toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 2200);
    });
}

// ---------------------------------------------------------------------------
// MODAL RENDERING
// ---------------------------------------------------------------------------

function buildResumeModal() {
    const data = getResumeData();

    // Overlay
    const overlay = document.createElement('div');
    overlay.id = 'resume-overlay';
    overlay.className = 'resume-overlay';

    // Modal
    const modal = document.createElement('div');
    modal.className = 'resume-modal';

    // Header
    const header = document.createElement('div');
    header.className = 'resume-modal-header';
    header.innerHTML = `
        <div class="resume-header-title">
            <span class="resume-icon-doc">📄</span>
            <div>
                <h2>My English Resume</h2>
                <span class="resume-header-sub">Professional Job Interview Portfolio</span>
            </div>
        </div>
        <div class="resume-header-actions">
            <button type="button" class="resume-action-btn" id="resume-sample-btn" title="Fill all fields with professional software engineer sample">✨ Sample</button>
            <button type="button" class="resume-action-btn" id="resume-copy-btn" title="Copy formatted text to clipboard">📋 Copy Text</button>
            <button type="button" class="resume-action-btn primary" id="resume-print-btn" title="Print or save as PDF">🖨️ Print / PDF</button>
            <button type="button" class="resume-action-btn danger" id="resume-clear-btn" title="Clear all fields">🗑️ Clear</button>
            <button class="resume-close-btn" id="resume-close-btn" title="Close">✕</button>
        </div>
    `;

    // Progress stats: sections filled + game modules completed
    const calculateStats = () => {
        const curData = getResumeData();
        let filledCount = 0;
        RESUME_SECTIONS.forEach(sec => {
            const hasAny = sec.fields.some(f => (curData[f.id] || '').trim().length > 0);
            if (hasAny) filledCount++;
        });
        const masterCount = RESUME_SECTIONS.filter(s => isTopicUnlocked(s.topic)).length;
        const total = RESUME_SECTIONS.length;
        const pct = Math.round((filledCount / total) * 100);
        return { filledCount, masterCount, total, pct };
    };

    const stats = calculateStats();

    const progressWrap = document.createElement('div');
    progressWrap.className = 'resume-progress-wrap';
    progressWrap.id = 'resume-progress-wrap';
    progressWrap.innerHTML = `
        <div class="resume-progress-label">
            <span><strong>${stats.filledCount} of ${stats.total} sections filled (${stats.pct}%)</strong> · 🎓 ${stats.masterCount} game modules mastered</span>
            <span class="resume-auto-save-tag">💾 Auto-saved</span>
        </div>
        <div class="resume-progress-track">
            <div class="resume-progress-bar" id="resume-progress-bar" style="width: ${stats.pct}%"></div>
        </div>
    `;

    // Body — two columns
    const body = document.createElement('div');
    body.className = 'resume-modal-body';

    // ── Left panel: form sections ──────────────────────────────────────────
    const formPanel = document.createElement('div');
    formPanel.className = 'resume-form-panel';

    RESUME_SECTIONS.forEach(section => {
        const mastered = isTopicUnlocked(section.topic);
        const sectionEl = document.createElement('div');
        sectionEl.className = 'resume-section unlocked';
        sectionEl.id = 'resume-section-' + section.id;

        const badgeHTML = mastered
            ? `<span class="resume-unlocked-badge"><i class="hn hn-badge-check-solid"></i> 🎓 ${section.topicName} Mastered</span>`
            : `<span class="resume-lock-badge in-progress"><i class="hn hn-book-open"></i> 📚 ${section.topicName}</span>`;

        const fieldsHTML = section.fields.map(field => {
            const value = data[field.id] || '';
            const escapedValue = value.replace(/"/g, '&quot;');
            if (field.type === 'textarea') {
                return `
                    <div class="resume-field">
                        <label class="resume-field-label" for="rf-${field.id}">${field.label}</label>
                        <textarea
                            id="rf-${field.id}"
                            class="resume-field-input resume-textarea"
                            placeholder="${field.placeholder}"
                            data-field="${field.id}"
                            rows="3"
                        >${escapeHtml(value)}</textarea>
                    </div>
                `;
            }
            return `
                <div class="resume-field">
                    <label class="resume-field-label" for="rf-${field.id}">${field.label}</label>
                    <input
                        id="rf-${field.id}"
                        type="text"
                        class="resume-field-input"
                        placeholder="${field.placeholder}"
                        value="${escapedValue}"
                        data-field="${field.id}"
                    />
                </div>
            `;
        }).join('');

        sectionEl.innerHTML = `
            <div class="resume-section-header">
                <div class="resume-section-title-group">
                    <span class="resume-section-title">${section.title}</span>
                    ${badgeHTML}
                </div>
                <button type="button" class="resume-suggest-btn" data-section="${section.id}" title="Fill this section with professional English example">💡 Suggestion</button>
            </div>
            <div class="resume-fields">
                ${fieldsHTML}
            </div>
        `;

        formPanel.appendChild(sectionEl);
    });

    // ── Right panel: live resume preview ──────────────────────────────────
    const previewPanel = document.createElement('div');
    previewPanel.className = 'resume-preview-panel';

    const previewLabel = document.createElement('div');
    previewLabel.className = 'resume-preview-label';
    previewLabel.innerHTML = `
        <span>📋 Document Preview</span>
        <span class="resume-preview-hint">✍️ Click any field on paper to edit directly</span>
    `;

    const rdoc = document.createElement('div');
    rdoc.className = 'rdoc';
    rdoc.innerHTML = buildResumePreviewHTML();

    previewPanel.appendChild(previewLabel);
    previewPanel.appendChild(rdoc);

    body.appendChild(formPanel);
    body.appendChild(previewPanel);

    // Footer
    const footer = document.createElement('div');
    footer.className = 'resume-modal-footer';
    footer.innerHTML = `
        <span class="resume-save-hint">✍️ All changes save live to your browser. You can export or print your resume anytime!</span>
    `;

    modal.appendChild(header);
    modal.appendChild(progressWrap);
    modal.appendChild(body);
    modal.appendChild(footer);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Update progress bar helper
    const refreshStats = () => {
        const s = calculateStats();
        const bar = document.getElementById('resume-progress-bar');
        const label = document.querySelector('.resume-progress-label strong');
        if (bar) bar.style.width = s.pct + '%';
        if (label) label.textContent = `${s.filledCount} of ${s.total} sections filled (${s.pct}%)`;

        const fabBadge = document.querySelector('.resume-fab .resume-fab-badge');
        if (fabBadge) fabBadge.textContent = s.filledCount + '/' + s.total;
    };

    // ── 1. Form Inputs live change ──────────────────────────────────────────
    formPanel.addEventListener('input', e => {
        const target = e.target;
        if (!target.dataset.field) return;
        const resumeData = getResumeData();
        resumeData[target.dataset.field] = target.value;
        saveResumeData(resumeData);
        updateResumePreview();
        refreshStats();
    });

    // ── 2. Direct In-Document editing in .rdoc ───────────────────────────────
    rdoc.addEventListener('input', e => {
        const target = e.target;
        if (!target.classList.contains('rdoc-field')) return;
        const fieldId = target.dataset.field;
        if (!fieldId) return;

        const val = target.innerText;
        const resumeData = getResumeData();
        resumeData[fieldId] = val;
        saveResumeData(resumeData);

        // Update corresponding input in form panel without losing focus
        const formInput = document.getElementById('rf-' + fieldId);
        if (formInput && formInput.value !== val) {
            formInput.value = val;
        }

        if (val.trim().length > 0) {
            target.classList.remove('rdoc-ph', 'rdoc-ph--empty');
            target.classList.add('rdoc-filled');
        } else {
            target.classList.remove('rdoc-filled');
            target.classList.add('rdoc-ph', 'rdoc-ph--empty');
        }

        refreshStats();
    });

    rdoc.addEventListener('focusin', e => {
        const target = e.target;
        if (target.classList.contains('rdoc-ph--empty')) {
            target.dataset.originalPh = target.innerText;
            target.innerText = '';
            target.classList.remove('rdoc-ph--empty');
        }
    });

    rdoc.addEventListener('focusout', e => {
        const target = e.target;
        if (target.classList.contains('rdoc-field') && !target.innerText.trim()) {
            const fieldId = target.dataset.field;
            let placeholder = target.dataset.originalPh || '[Click to edit]';
            target.innerText = placeholder;
            target.classList.add('rdoc-ph', 'rdoc-ph--empty');
            target.classList.remove('rdoc-filled');
        }
    });

    // ── 3. Section Suggestions ("💡 Suggestion" buttons) ───────────────────
    formPanel.addEventListener('click', e => {
        const btn = e.target.closest('.resume-suggest-btn');
        if (!btn) return;
        const sectionId = btn.dataset.section;
        const section = RESUME_SECTIONS.find(s => s.id === sectionId);
        if (!section) return;

        const resumeData = getResumeData();
        section.fields.forEach(f => {
            if (SAMPLE_DATA[f.id]) {
                resumeData[f.id] = SAMPLE_DATA[f.id];
                const input = document.getElementById('rf-' + f.id);
                if (input) input.value = SAMPLE_DATA[f.id];
            }
        });
        saveResumeData(resumeData);
        updateResumePreview();
        refreshStats();
        showToast(`💡 Inserted suggestions for ${section.title}!`);
    });

    // ── 4. Fill Full Sample ────────────────────────────────────────────────
    document.getElementById('resume-sample-btn').addEventListener('click', () => {
        saveResumeData({ ...SAMPLE_DATA });
        RESUME_SECTIONS.forEach(sec => {
            sec.fields.forEach(f => {
                const input = document.getElementById('rf-' + f.id);
                if (input && SAMPLE_DATA[f.id]) input.value = SAMPLE_DATA[f.id];
            });
        });
        updateResumePreview();
        refreshStats();
        showToast('✨ Professional sample resume loaded!');
    });

    // ── 5. Copy Plain Text ─────────────────────────────────────────────────
    document.getElementById('resume-copy-btn').addEventListener('click', () => {
        const text = getResumePlainText();
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => {
                showToast('📋 Resume copied to clipboard!');
            }).catch(() => {
                fallbackCopy(text);
            });
        } else {
            fallbackCopy(text);
        }
    });

    function printResume() {
        const data = getResumeData();
        const g = (k) => (data[k] || '').trim();

        const fullName = g('full_name') || 'CANDIDATE NAME';
        const email = g('email');
        const phone = g('phone');
        const linkedin = g('linkedin');
        const contactItems = [email, phone, linkedin].filter(Boolean);

        // Build sections
        let sectionsHTML = '';

        // 1. Professional Summary
        const kw = [g('summary_kw1'), g('summary_kw2'), g('summary_kw3')].filter(Boolean);
        const summaryText = g('summary_text');
        if (kw.length || summaryText) {
            let text = '';
            if (kw.length) {
                text += `Results-oriented professional recognized for being ${kw.join(', ')}. `;
            }
            if (summaryText) text += summaryText;
            sectionsHTML += `
                <div class="print-section">
                    <div class="print-section-title">Professional Summary</div>
                    <p class="print-text">${escapeHtml(text)}</p>
                </div>
            `;
        }

        // 2. Self-Introduction
        if (g('intro_paragraph')) {
            sectionsHTML += `
                <div class="print-section">
                    <div class="print-section-title">Self-Introduction</div>
                    <p class="print-text">${escapeHtml(g('intro_paragraph'))}</p>
                </div>
            `;
        }

        // 3. Work Experience
        if (g('job_title') || g('company') || g('achievement')) {
            sectionsHTML += `
                <div class="print-section">
                    <div class="print-section-title">Work Experience</div>
                    <div class="print-exp-header">
                        <span><strong>${escapeHtml(g('job_title') || 'Role')}</strong> — <span class="print-exp-company">${escapeHtml(g('company') || 'Company')}</span></span>
                        <span class="print-exp-period">${escapeHtml(g('exp_period') || '')}</span>
                    </div>
                    ${g('achievement') ? `<p class="print-text print-achievement">${escapeHtml(g('achievement'))}</p>` : ''}
                </div>
            `;
        }

        // 4. Communication & Leadership
        const commSkills = [g('comm_skill1'), g('comm_skill2')].filter(Boolean);
        const meetingPhrase = g('meeting_phrase');
        if (commSkills.length || meetingPhrase) {
            sectionsHTML += `
                <div class="print-section">
                    <div class="print-section-title">Communication & Leadership</div>
                    ${commSkills.length ? `<p class="print-text"><strong>Core Strengths:</strong> ${escapeHtml(commSkills.join(' · '))}</p>` : ''}
                    ${meetingPhrase ? `<p class="print-quote">"${escapeHtml(meetingPhrase)}"</p>` : ''}
                </div>
            `;
        }

        // 5. Classic Interview Answers
        if (g('why_hire') || g('strength') || g('weakness')) {
            sectionsHTML += `
                <div class="print-section">
                    <div class="print-section-title">Key Interview Responses</div>
                    ${g('why_hire') ? `
                        <div class="print-qa">
                            <div class="print-q">Why should we hire you?</div>
                            <div class="print-a">${escapeHtml(g('why_hire'))}</div>
                        </div>
                    ` : ''}
                    ${g('strength') ? `
                        <div class="print-qa">
                            <div class="print-q">Greatest Professional Strength</div>
                            <div class="print-a">${escapeHtml(g('strength'))}</div>
                        </div>
                    ` : ''}
                    ${g('weakness') ? `
                        <div class="print-qa">
                            <div class="print-q">Area of Growth / Working Weakness</div>
                            <div class="print-a">${escapeHtml(g('weakness'))}</div>
                        </div>
                    ` : ''}
                </div>
            `;
        }

        // 6. Soft Skills
        const softSkills = [g('soft1'), g('soft2'), g('soft3')].filter(Boolean);
        if (softSkills.length) {
            sectionsHTML += `
                <div class="print-section">
                    <div class="print-section-title">Soft Skills & Competencies</div>
                    <p class="print-text">${escapeHtml(softSkills.join('   •   '))}</p>
                </div>
            `;
        }

        // 7. Salary Expectation
        if (g('salary_range') || g('salary_justify')) {
            sectionsHTML += `
                <div class="print-section">
                    <div class="print-section-title">Salary Expectation</div>
                    ${g('salary_range') ? `<p class="print-text"><strong>Target:</strong> ${escapeHtml(g('salary_range'))}</p>` : ''}
                    ${g('salary_justify') ? `<p class="print-text print-mt">${escapeHtml(g('salary_justify'))}</p>` : ''}
                </div>
            `;
        }

        if (!sectionsHTML.trim()) {
            sectionsHTML = `
                <div class="print-section">
                    <div class="print-section-title">Resume Content</div>
                    <p class="print-text" style="color: #666; font-style: italic;">No information entered yet. Fill in your details or click "✨ Sample" to populate example content.</p>
                </div>
            `;
        }

        const printHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Resume - ${escapeHtml(fullName)}</title>
    <style>
        @page {
            size: A4 portrait;
            margin: 12mm 15mm;
        }
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        body {
            font-family: 'Georgia', 'Times New Roman', serif;
            font-size: 10pt;
            line-height: 1.5;
            color: #111827;
            background: #ffffff;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }
        .print-doc {
            width: 100%;
            max-width: 800px;
            margin: 0 auto;
        }
        .print-header {
            text-align: center;
            border-bottom: 2px solid #111827;
            padding-bottom: 8px;
            margin-bottom: 12px;
        }
        .print-name {
            font-size: 20pt;
            font-weight: bold;
            letter-spacing: 0.04em;
            text-transform: uppercase;
            color: #09090b;
            margin-bottom: 4px;
        }
        .print-contacts {
            font-size: 9pt;
            color: #4b5563;
        }
        .print-sep {
            color: #6b21a8;
            font-weight: bold;
            margin: 0 6px;
        }
        .print-section {
            margin-bottom: 12px;
            page-break-inside: avoid;
            break-inside: avoid;
        }
        .print-section-title {
            font-family: 'Arial', 'Helvetica Neue', sans-serif;
            font-size: 8.5pt;
            font-weight: bold;
            letter-spacing: 0.12em;
            text-transform: uppercase;
            color: #581c87;
            border-bottom: 1.5px solid #581c87;
            padding-bottom: 2px;
            margin-bottom: 6px;
        }
        .print-text {
            font-size: 9.5pt;
            color: #1f2937;
            line-height: 1.5;
        }
        .print-mt {
            margin-top: 4px;
        }
        .print-exp-header {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            font-size: 9.5pt;
            color: #111827;
            margin-bottom: 3px;
        }
        .print-exp-company {
            font-weight: normal;
            font-style: italic;
            color: #374151;
        }
        .print-exp-period {
            font-size: 8.5pt;
            color: #6b7280;
            font-style: italic;
        }
        .print-achievement {
            margin-top: 3px;
        }
        .print-quote {
            font-style: italic;
            color: #374151;
            border-left: 2px solid #a855f7;
            padding-left: 8px;
            margin-top: 4px;
            font-size: 9.5pt;
        }
        .print-qa {
            margin-bottom: 8px;
        }
        .print-qa:last-child {
            margin-bottom: 0;
        }
        .print-q {
            font-family: 'Arial', 'Helvetica Neue', sans-serif;
            font-size: 8.5pt;
            font-weight: bold;
            color: #111827;
            margin-bottom: 1px;
        }
        .print-a {
            font-size: 9.5pt;
            color: #1f2937;
            line-height: 1.5;
        }
    </style>
</head>
<body>
    <div class="print-doc">
        <header class="print-header">
            <h1 class="print-name">${escapeHtml(fullName)}</h1>
            ${contactItems.length ? `
                <div class="print-contacts">
                    ${contactItems.map(item => `<span>${escapeHtml(item)}</span>`).join('<span class="print-sep">·</span>')}
                </div>
            ` : ''}
        </header>
        ${sectionsHTML}
    </div>
</body>
</html>`;

        try {
            let printFrame = document.getElementById('resume-print-frame');
            if (printFrame) printFrame.remove();

            printFrame = document.createElement('iframe');
            printFrame.id = 'resume-print-frame';
            printFrame.style.position = 'fixed';
            printFrame.style.right = '0';
            printFrame.style.bottom = '0';
            printFrame.style.width = '0';
            printFrame.style.height = '0';
            printFrame.style.border = 'none';
            printFrame.style.visibility = 'hidden';
            document.body.appendChild(printFrame);

            const frameDoc = printFrame.contentWindow.document;
            frameDoc.open();
            frameDoc.write(printHTML);
            frameDoc.close();

            setTimeout(() => {
                try {
                    printFrame.contentWindow.focus();
                    printFrame.contentWindow.print();
                    setTimeout(() => printFrame.remove(), 1500);
                } catch (frameErr) {
                    window.print();
                }
            }, 180);
        } catch (e) {
            window.print();
        }
    }

    function fallbackCopy(text) {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try {
            document.execCommand('copy');
            showToast('📋 Resume copied to clipboard!');
        } catch {
            showToast('⚠️ Could not copy automatically.');
        }
        ta.remove();
    }

    // ── 6. Print / PDF ─────────────────────────────────────────────────────
    document.getElementById('resume-print-btn').addEventListener('click', printResume);
    window.printResume = printResume;

    // ── 7. Clear All ───────────────────────────────────────────────────────
    document.getElementById('resume-clear-btn').addEventListener('click', () => {
        if (confirm('Are you sure you want to clear all resume fields?')) {
            saveResumeData({});
            RESUME_SECTIONS.forEach(sec => {
                sec.fields.forEach(f => {
                    const input = document.getElementById('rf-' + f.id);
                    if (input) input.value = '';
                });
            });
            updateResumePreview();
            refreshStats();
            showToast('🗑️ Resume cleared.');
        }
    });

    // Close on button
    document.getElementById('resume-close-btn').addEventListener('click', closeResumeModal);

    // Close on overlay click (outside modal)
    overlay.addEventListener('click', e => {
        if (e.target === overlay) closeResumeModal();
    });

    // Close on Escape
    document.addEventListener('keydown', handleEscapeKey);

    // Animate in
    requestAnimationFrame(() => {
        overlay.classList.add('active');
    });
}

function handleEscapeKey(e) {
    if (e.key === 'Escape') closeResumeModal();
}

function openResumeModal() {
    const existing = document.getElementById('resume-overlay');
    if (existing) existing.remove();
    buildResumeModal();
}

function closeResumeModal() {
    const overlay = document.getElementById('resume-overlay');
    if (!overlay) return;

    document.removeEventListener('keydown', handleEscapeKey);

    overlay.classList.remove('active');
    overlay.addEventListener('transitionend', () => overlay.remove(), { once: true });
}

// ---------------------------------------------------------------------------
// FLOATING BUTTON
// ---------------------------------------------------------------------------

function initResumeButton() {
    let btn = document.getElementById('resume-fab');
    if (!btn) {
        // Auto-inject FAB if on training pages
        const isTrainingPage = window.location.pathname.includes('trainingMode') ||
            document.querySelector('.world-map-main') ||
            document.getElementById('menu-container');

        if (isTrainingPage) {
            btn = document.createElement('button');
            btn.className = 'resume-fab';
            btn.id = 'resume-fab';
            btn.title = 'Open My Resume';
            btn.innerHTML = `
                <span class="resume-fab-icon">📄</span>
                <span class="resume-fab-label">Resume</span>
                <span class="resume-fab-badge">0/8</span>
            `;
            document.body.appendChild(btn);
        }
    }
    if (!btn) return;

    const updateBadge = () => {
        const curData = getResumeData();
        let filledCount = 0;
        RESUME_SECTIONS.forEach(sec => {
            const hasAny = sec.fields.some(f => (curData[f.id] || '').trim().length > 0);
            if (hasAny) filledCount++;
        });
        const badge = btn.querySelector('.resume-fab-badge');
        if (badge) {
            badge.textContent = filledCount + '/' + RESUME_SECTIONS.length;
        }
    };

    updateBadge();
    btn.addEventListener('click', openResumeModal);
}

document.addEventListener('DOMContentLoaded', initResumeButton);

// Expose globally
window.openResumeModal = openResumeModal;
window.closeResumeModal = closeResumeModal;
window.markSubModeWon = markSubModeWon;
