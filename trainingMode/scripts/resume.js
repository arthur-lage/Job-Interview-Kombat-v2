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
    introduction: ['intro_lesson', 'intro_quiz'],
    profile: ['profile_tips', 'profile_quiz'],
    hard_skills: ['hard_lesson', 'hard_vocab', 'hard_quiz'],
    experience: ['exp_lesson', 'exp_quiz'],
    tutorial_grammar: ['tutorial_lessons', 'tutorial_quiz'],
};

// ---------------------------------------------------------------------------
// ESTRUTURA DO CURRÍCULO
// ---------------------------------------------------------------------------
const RESUME_SECTIONS = [
    {
        id: 'personal_info',
        title: '👤 Personal Information',
        topic: 'introduction',
        topicName: 'Profile & Contact',
        fields: [
            { id: 'full_name', label: 'Full Name', placeholder: 'e.g. Alex Rivera', type: 'text' },
            { id: 'professional_title', label: 'Professional Title', placeholder: 'e.g. Senior Full-Stack Engineer', type: 'text' },
            { id: 'email', label: 'Email', placeholder: 'e.g. alex.rivera.dev@gmail.com', type: 'text' },
            { id: 'phone', label: 'Phone', placeholder: 'e.g. +55 (31) 98765-4321', type: 'text' },
            { id: 'linkedin', label: 'LinkedIn / Portfolio', placeholder: 'e.g. linkedin.com/in/alexrivera-tech', type: 'text' },
            { id: 'location', label: 'Location / Work Model', placeholder: 'e.g. Belo Horizonte, Brazil (Remote)', type: 'text' },
        ]
    },
    {
        id: 'professional_summary',
        title: '🎯 Professional Summary',
        topic: 'profile',
        topicName: 'Summary & Pitch',
        fields: [
            { id: 'summary_text', label: 'Professional Summary', placeholder: 'e.g. Results-driven Full-Stack Software Engineer with 5+ years of experience designing, developing, and scaling high-performance web applications and distributed cloud systems...', type: 'textarea' },
            { id: 'core_competencies', label: 'Core Competencies / Keywords', placeholder: 'e.g. Distributed Systems · Cloud Architecture · Microservices · CI/CD Pipelines · Agile Leadership', type: 'text' },
        ]
    },
    {
        id: 'technical_knowledge',
        title: '💻 Technical Knowledge',
        topic: 'hard_skills',
        topicName: 'Hard Skills & Tech',
        fields: [
            { id: 'tech_languages', label: 'Programming Languages', placeholder: 'e.g. JavaScript (ES6+), TypeScript, Python, SQL, HTML5/CSS3', type: 'text' },
            { id: 'tech_frameworks', label: 'Frameworks & Libraries', placeholder: 'e.g. React, Node.js, Express, Next.js, Django, TailwindCSS', type: 'text' },
            { id: 'tech_databases_cloud', label: 'Databases & Cloud', placeholder: 'e.g. PostgreSQL, MongoDB, Redis, AWS (S3, EC2, Lambda), Docker', type: 'text' },
            { id: 'tech_tools_methods', label: 'Tools & Methodologies', placeholder: 'e.g. Git, GitHub Actions, RESTful APIs, GraphQL, TDD/Jest, Agile/Scrum', type: 'text' },
        ]
    },
    {
        id: 'work_experience',
        title: '💼 Work Experience',
        topic: 'experience',
        topicName: 'STAR Method & Exp',
        fields: [
            { id: 'job_title', label: 'Job Title', placeholder: 'e.g. Senior Full-Stack Engineer', type: 'text' },
            { id: 'company', label: 'Company Name', placeholder: 'e.g. Global Tech Innovations', type: 'text' },
            { id: 'exp_period', label: 'Period / Dates', placeholder: 'e.g. 2022 – Present', type: 'text' },
            { id: 'exp_location', label: 'Location / Work Model', placeholder: 'e.g. Remote', type: 'text' },
            { id: 'achievement', label: 'Key Achievements & Impact (STAR method)', placeholder: 'e.g. • Spearheaded the migration from monolithic architecture to microservices using Node.js and Docker, reducing API response latency by 38% for 500k+ active users.\n• Designed and automated end-to-end CI/CD pipelines via GitHub Actions, decreasing deployment failure rate by 45%.\n• Mentored 4 mid/junior engineers on clean architecture, unit testing, and collaborative code reviews.', type: 'textarea' },
        ]
    },
    {
        id: 'education_languages',
        title: '🎓 Education and Languages',
        topic: 'tutorial_grammar',
        topicName: 'Education & Languages',
        fields: [
            { id: 'education_degree', label: 'Degree & Field of Study', placeholder: 'e.g. B.S. in Computer Science', type: 'text' },
            { id: 'education_school', label: 'Institution & Graduation Year', placeholder: 'e.g. Federal University of Minas Gerais (UFMG) · 2018 – 2022', type: 'text' },
            { id: 'languages', label: 'Languages & Proficiency', placeholder: 'e.g. English (Fluent / Full Professional), Portuguese (Native), Spanish (Intermediate)', type: 'text' },
            { id: 'certifications', label: 'Certifications & Honors', placeholder: 'e.g. AWS Certified Solutions Architect – Associate (2023), Scrum Master PSM I', type: 'text' },
        ]
    },
];

// ---------------------------------------------------------------------------
// EXEMPLOS PROFISSIONAIS (SUGESTÕES)
// ---------------------------------------------------------------------------
const SAMPLE_DATA = {
    full_name: 'Alex Rivera',
    professional_title: 'Senior Full-Stack Engineer',
    email: 'alex.rivera.dev@gmail.com',
    phone: '+55 (31) 98765-4321',
    linkedin: 'linkedin.com/in/alexrivera-tech',
    location: 'Belo Horizonte, Brazil (Remote)',

    summary_text: 'Results-driven Full-Stack Software Engineer with 5+ years of experience designing, developing, and scaling high-performance web applications and distributed cloud systems. Proven track record in migrating monolithic architectures to microservices, optimizing low-latency backend systems, and driving agile best practices across cross-functional engineering teams.',
    core_competencies: 'Distributed Systems · Cloud Architecture · Microservices · CI/CD Automation · Agile Leadership',

    tech_languages: 'JavaScript (ES6+), TypeScript, Python, SQL, HTML5/CSS3',
    tech_frameworks: 'React, Node.js, Express, Next.js, Django, TailwindCSS',
    tech_databases_cloud: 'PostgreSQL, MongoDB, Redis, AWS (S3, EC2, Lambda), Docker',
    tech_tools_methods: 'Git, GitHub Actions, RESTful APIs, GraphQL, TDD/Jest, Agile/Scrum',

    job_title: 'Senior Full-Stack Engineer',
    company: 'Global Tech Innovations',
    exp_period: '2022 – Present',
    exp_location: 'Remote',
    achievement: '• Spearheaded the migration from monolithic architecture to microservices using Node.js and Docker, reducing API response latency by 38% for 500k+ active users.\n• Designed and automated end-to-end CI/CD pipelines via GitHub Actions, decreasing deployment failure rate by 45%.\n• Mentored 4 mid/junior engineers on clean architecture, unit testing, and collaborative code reviews.',

    education_degree: 'B.S. in Computer Science',
    education_school: 'Federal University of Minas Gerais (UFMG) · 2018 – 2022',
    languages: 'English (Fluent / Full Professional), Portuguese (Native), Spanish (Intermediate)',
    certifications: 'AWS Certified Solutions Architect – Associate (2023), Scrum Master PSM I',
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
            <div class="rdoc-role">${f('professional_title', 'PROFESSIONAL TITLE / TARGET ROLE')}</div>
            <div class="rdoc-contact">
                ${f('email', 'your.email@example.com')}
                <span class="rdoc-sep">·</span>
                ${f('phone', '+55 (31) 90000-0000')}
                <span class="rdoc-sep">·</span>
                ${f('linkedin', 'linkedin.com/in/yourprofile')}
                <span class="rdoc-sep">·</span>
                ${f('location', 'Location / Remote')}
            </div>
        </div>

        <!-- 1. Professional Summary -->
        <div class="rdoc-section">
            <div class="rdoc-section-title">PROFESSIONAL SUMMARY</div>
            <p class="rdoc-text">${f('summary_text', '[Write your professional summary highlighting your key background, years of experience, and main achievements...]')}</p>
            <p class="rdoc-text rdoc-mt"><strong class="rdoc-tech-cat">Core Competencies:</strong> ${f('core_competencies', '[e.g. Distributed Systems · Cloud Architecture · Microservices · CI/CD · Agile Leadership]')}</p>
        </div>

        <!-- 2. Technical Knowledge -->
        <div class="rdoc-section">
            <div class="rdoc-section-title">TECHNICAL KNOWLEDGE</div>
            <div class="rdoc-tech-row">
                <span class="rdoc-tech-cat">Programming Languages:</span> ${f('tech_languages', '[e.g. JavaScript (ES6+), TypeScript, Python, SQL, HTML5/CSS3]')}
            </div>
            <div class="rdoc-tech-row">
                <span class="rdoc-tech-cat">Frameworks & Libraries:</span> ${f('tech_frameworks', '[e.g. React, Node.js, Express, Next.js, Django, TailwindCSS]')}
            </div>
            <div class="rdoc-tech-row">
                <span class="rdoc-tech-cat">Databases & Cloud:</span> ${f('tech_databases_cloud', '[e.g. PostgreSQL, MongoDB, Redis, AWS (S3, EC2, Lambda), Docker]')}
            </div>
            <div class="rdoc-tech-row">
                <span class="rdoc-tech-cat">Tools & Methodologies:</span> ${f('tech_tools_methods', '[e.g. Git, GitHub Actions, RESTful APIs, GraphQL, TDD/Jest, Agile/Scrum]')}
            </div>
        </div>

        <!-- 3. Work Experience -->
        <div class="rdoc-section">
            <div class="rdoc-section-title">WORK EXPERIENCE</div>
            <div class="rdoc-exp-header">
                <span class="rdoc-exp-title">${f('job_title', '[Job Title]')}</span>
                <span class="rdoc-sep">—</span>
                <span class="rdoc-exp-company">${f('company', '[Company Name]')}</span>
                <span class="rdoc-exp-loc">(${f('exp_location', 'Remote')})</span>
                <span class="rdoc-exp-period">${f('exp_period', '[Period]')}</span>
            </div>
            <div class="rdoc-text rdoc-mt rdoc-pre-line">${f('achievement', '[Describe your key achievement using STAR method (Situation, Task, Action, Result)...]')}</div>
        </div>

        <!-- 4. Education and Languages -->
        <div class="rdoc-section">
            <div class="rdoc-section-title">EDUCATION AND LANGUAGES</div>
            <div class="rdoc-edu-row">
                <span class="rdoc-tech-cat">Education:</span> ${f('education_degree', '[Degree & Major]')} — ${f('education_school', '[Institution & Year]')}
            </div>
            <div class="rdoc-edu-row">
                <span class="rdoc-tech-cat">Languages:</span> ${f('languages', '[e.g. English (Fluent / Full Professional), Portuguese (Native), Spanish (Intermediate)]')}
            </div>
            <div class="rdoc-edu-row">
                <span class="rdoc-tech-cat">Certifications:</span> ${f('certifications', '[e.g. AWS Certified Solutions Architect, Scrum Master PSM I]')}
            </div>
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
    if (g('professional_title')) {
        text += `${g('professional_title')}\n`;
    }
    const contact = [g('email'), g('phone'), g('linkedin'), g('location')].filter(Boolean).join(' | ');
    if (contact) text += `${contact}\n`;
    text += `\n============================================================\n\n`;

    // 1. Professional Summary
    text += `PROFESSIONAL SUMMARY\n`;
    text += `--------------------\n`;
    if (g('summary_text')) text += `${g('summary_text')}\n`;
    if (g('core_competencies')) text += `Core Competencies: ${g('core_competencies')}\n`;
    text += `\n`;

    // 2. Technical Knowledge
    text += `TECHNICAL KNOWLEDGE\n`;
    text += `-------------------\n`;
    if (g('tech_languages')) text += `• Languages: ${g('tech_languages')}\n`;
    if (g('tech_frameworks')) text += `• Frameworks & Libraries: ${g('tech_frameworks')}\n`;
    if (g('tech_databases_cloud')) text += `• Databases & Cloud: ${g('tech_databases_cloud')}\n`;
    if (g('tech_tools_methods')) text += `• Tools & Methodologies: ${g('tech_tools_methods')}\n`;
    text += `\n`;

    // 3. Work Experience
    if (g('job_title') || g('company') || g('achievement')) {
        text += `WORK EXPERIENCE\n`;
        text += `---------------\n`;
        const companyStr = [g('company'), g('exp_location')].filter(Boolean).join(', ');
        text += `${g('job_title') || 'Role'} — ${companyStr || 'Company'} (${g('exp_period') || 'Period'})\n`;
        if (g('achievement')) text += `${g('achievement')}\n`;
        text += `\n`;
    }

    // 4. Education and Languages
    text += `EDUCATION AND LANGUAGES\n`;
    text += `-----------------------\n`;
    if (g('education_degree') || g('education_school')) {
        const edu = [g('education_degree'), g('education_school')].filter(Boolean).join(' — ');
        text += `• Education: ${edu}\n`;
    }
    if (g('languages')) text += `• Languages: ${g('languages')}\n`;
    if (g('certifications')) text += `• Certifications: ${g('certifications')}\n`;

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
            ? `<span class="resume-unlocked-badge" title="Mastered in Training Mode">🎓 ${section.topicName} Mastered</span>`
            : `<span class="resume-lock-badge in-progress" title="Module in Progress">📚 ${section.topicName}</span>`;

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
                if (input) {
                    input.value = SAMPLE_DATA[f.id];
                    input.classList.remove('just-suggested');
                    void input.offsetWidth;
                    input.classList.add('just-suggested');
                }
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
                if (input && SAMPLE_DATA[f.id]) {
                    input.value = SAMPLE_DATA[f.id];
                    input.classList.remove('just-suggested');
                    void input.offsetWidth;
                    input.classList.add('just-suggested');
                }
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
        const professionalTitle = g('professional_title');
        const email = g('email');
        const phone = g('phone');
        const linkedin = g('linkedin');
        const location = g('location');
        const contactItems = [email, phone, linkedin, location].filter(Boolean);

        // Build sections
        let sectionsHTML = '';

        // 1. Professional Summary
        const summaryText = g('summary_text');
        const competencies = g('core_competencies');
        if (summaryText || competencies) {
            sectionsHTML += `
                <div class="print-section">
                    <div class="print-section-title">Professional Summary</div>
                    ${summaryText ? `<p class="print-text">${escapeHtml(summaryText)}</p>` : ''}
                    ${competencies ? `<p class="print-text print-mt"><strong class="print-tech-cat">Core Competencies:</strong> ${escapeHtml(competencies)}</p>` : ''}
                </div>
            `;
        }

        // 2. Technical Knowledge
        const techLang = g('tech_languages');
        const techFw = g('tech_frameworks');
        const techDbCloud = g('tech_databases_cloud');
        const techTools = g('tech_tools_methods');
        if (techLang || techFw || techDbCloud || techTools) {
            sectionsHTML += `
                <div class="print-section">
                    <div class="print-section-title">Technical Knowledge</div>
                    ${techLang ? `<div class="print-tech-row"><strong class="print-tech-cat">Programming Languages:</strong> ${escapeHtml(techLang)}</div>` : ''}
                    ${techFw ? `<div class="print-tech-row"><strong class="print-tech-cat">Frameworks & Libraries:</strong> ${escapeHtml(techFw)}</div>` : ''}
                    ${techDbCloud ? `<div class="print-tech-row"><strong class="print-tech-cat">Databases & Cloud:</strong> ${escapeHtml(techDbCloud)}</div>` : ''}
                    ${techTools ? `<div class="print-tech-row"><strong class="print-tech-cat">Tools & Methodologies:</strong> ${escapeHtml(techTools)}</div>` : ''}
                </div>
            `;
        }

        // 3. Work Experience
        if (g('job_title') || g('company') || g('achievement')) {
            const companyLocation = [g('company'), g('exp_location')].filter(Boolean).join(' · ');
            sectionsHTML += `
                <div class="print-section">
                    <div class="print-section-title">Work Experience</div>
                    <div class="print-exp-header">
                        <span><strong>${escapeHtml(g('job_title') || 'Role')}</strong> — <span class="print-exp-company">${escapeHtml(companyLocation || 'Company')}</span></span>
                        <span class="print-exp-period">${escapeHtml(g('exp_period') || '')}</span>
                    </div>
                    ${g('achievement') ? `<div class="print-text print-achievement print-pre-line">${escapeHtml(g('achievement'))}</div>` : ''}
                </div>
            `;
        }

        // 4. Education and Languages
        const eduDegree = g('education_degree');
        const eduSchool = g('education_school');
        const langs = g('languages');
        const certs = g('certifications');
        if (eduDegree || eduSchool || langs || certs) {
            sectionsHTML += `
                <div class="print-section">
                    <div class="print-section-title">Education and Languages</div>
                    ${(eduDegree || eduSchool) ? `
                        <div class="print-edu-row">
                            <strong class="print-tech-cat">Education:</strong> ${escapeHtml([eduDegree, eduSchool].filter(Boolean).join(' — '))}
                        </div>
                    ` : ''}
                    ${langs ? `
                        <div class="print-edu-row">
                            <strong class="print-tech-cat">Languages:</strong> ${escapeHtml(langs)}
                        </div>
                    ` : ''}
                    ${certs ? `
                        <div class="print-edu-row">
                            <strong class="print-tech-cat">Certifications:</strong> ${escapeHtml(certs)}
                        </div>
                    ` : ''}
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
            margin-bottom: 2px;
        }
        .print-role {
            font-family: 'Arial', 'Helvetica Neue', sans-serif;
            font-size: 10pt;
            font-weight: 600;
            color: #581c87;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 5px;
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
        .print-tech-row {
            font-size: 9.5pt;
            line-height: 1.5;
            color: #1f2937;
            margin-bottom: 3px;
        }
        .print-tech-cat {
            font-weight: bold;
            color: #111827;
        }
        .print-edu-row {
            font-size: 9.5pt;
            line-height: 1.5;
            color: #1f2937;
            margin-bottom: 3px;
        }
        .print-pre-line {
            white-space: pre-line;
        }
    </style>
</head>
<body>
    <div class="print-doc">
        <header class="print-header">
            <h1 class="print-name">${escapeHtml(fullName)}</h1>
            ${professionalTitle ? `<div class="print-role">${escapeHtml(professionalTitle)}</div>` : ''}
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
    // Only attach to pages that already have the FAB button in their HTML
    // (trainingMode.html and minimap.html)
    const btn = document.getElementById('resume-fab');
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
