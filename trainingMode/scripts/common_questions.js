const questionsData = [
    {
        id: 1,
        question: "Tell me a little about yourself.",
        howToAnswer: "With this question, the interviewer wants to know a bit of your academic/working journey. You should talk about your professional background, what graduation course did you choose and why, your hard and soft skills.",
        options: [
            { id: 'a', text: "I'm Susan, I am 37 years old and I really love reading and skiing. I also like spending time with my family and friends. I usually listen to rock and electronic music." },
            { id: 'b', text: "I'm Joe, I am 27 years old and I recently graduated in Computer Science. I have a strong background in web development and I am passionate about creating efficient web applications." }, // correct
            { id: 'c', text: "Well, I was born in New York, then we moved to Chicago. I had a dog named Rex. In high school, I played basketball. Then I went to college because I didn't know what else to do." }
        ],
        correctOption: 'b',
        explanation: "Option B is correct because it focuses on your professional background and relevant skills. Option A is too personal, and Option C lacks focus and relevance to the job."
    },
    {
        id: 2,
        question: "Why do you want to work here?",
        howToAnswer: "Show that you have researched the company. Connect your skills, goals, and values with the company's mission and what they do.",
        options: [
            { id: 'a', text: "I saw that you have a ping pong table in the break room and free snacks. Plus, the salary looks pretty good." },
            { id: 'b', text: "I just need a job right now to pay my bills. Honestly, I apply to every open position I can find on the internet." },
            { id: 'c', text: "I've been following your company's recent expansion into renewable energy, and I'm very impressed by your commitment to sustainability. My background aligns perfectly with your goals." } // correct
        ],
        correctOption: 'c',
        explanation: "Option C is correct because it demonstrates you've researched the company and aligns your background with their specific goals (sustainability). Options A and B focus on personal gain rather than what you can offer the company."
    },
    {
        id: 3,
        question: "What do you consider to be your weaknesses?",
        howToAnswer: "This question is about self-awareness and your ability to improve. Mention a real, but not critical, weakness and explain how you are working to overcome it.",
        options: [
            { id: 'a', text: "Sometimes I can be hesitant in delegating tasks because I like to ensure things are done a certain way. However, I've been taking management courses to improve my leadership skills." }, // correct
            { id: 'b', text: "I am a perfectionist, which means I care too much about my work and I always do everything perfectly." },
            { id: 'c', text: "I'm always late for everything. I just can't seem to wake up on time, no matter how many alarms I set. It's just how I am." }
        ],
        correctOption: 'a',
        explanation: "Option A is correct because it identifies a real, understandable weakness (hesitation in delegating) and immediately shows how you are proactively working to improve it. Options B and C are either clichés or show a lack of professional growth."
    },
    {
        id: 4,
        question: "Where do you see yourself in five years?",
        howToAnswer: "The employer wants to know if your career goals align with the position and the company. Show ambition, but keep it realistic and relevant to the role.",
        options: [
            { id: 'a', text: "I hope to be sitting on a beach in the Bahamas, sipping cocktails and not having to work at all!" },
            { id: 'b', text: "In five years, I hope to have developed my skills significantly in this field. I see myself taking on more leadership responsibilities and contributing to the strategic goals of the company." }, // correct
            { id: 'c', text: "In five years, I would love to be exactly in the same role, doing exactly the same things, without any additional responsibilities." }
        ],
        correctOption: 'b',
        explanation: "Option B is correct because it shows ambition, alignment with the company's goals, and a desire for professional growth. Option A is unprofessional, and Option C shows a lack of drive."
    },
    {
        id: 5,
        question: "What are your greatest strengths?",
        howToAnswer: "The interviewer is looking for work-related strengths. Focus on qualities that are relevant to the job you are applying for and provide a brief example to back them up.",
        options: [
            { id: 'a', text: "I'd say my greatest strength is my problem-solving ability. In my last role, I was able to identify the root cause of a persistent bug and implemented a fix that reduced system downtime." }, // correct
            { id: 'b', text: "I am a very fast runner and I can hold my breath for two minutes. I'm also really good at video games." },
            { id: 'c', text: "I don't really know, maybe I'm a nice person? My mom always tells me I'm very smart." }
        ],
        correctOption: 'a',
        explanation: "Option A is correct because it highlights a relevant professional skill (problem-solving) and provides a concrete example (the STAR method) to prove it. Options B and C are either irrelevant or lack self-awareness."
    },
    {
        id: 6,
        question: "Why should we hire you?",
        howToAnswer: "Summarize your unique qualifications and how they make you the best fit for the role.",
        options: [
            { id: 'a', text: "Because I'm a really hard worker and I need a job right now to pay my rent. I promise I won't let you down!" },
            { id: 'b', text: "Honestly, I don't know who else is applying, but I guess I'm a decent choice. I usually get the job done eventually." },
            { id: 'c', text: "Based on what we've discussed, my background in data analysis and my proven ability to lead cross-functional teams align perfectly with the goals for this position. I can hit the ground running and add immediate value." }
        ],
        correctOption: 'c',
        explanation: "Option C is correct because it connects your specific skills (data analysis, leadership) directly to the needs of the role. Options A and B sound desperate or indifferent."
    },
    {
        id: 7,
        question: "Do you have any questions for us?",
        howToAnswer: "Prepare thoughtful questions that demonstrate your interest in the company and the position.",
        options: [
            { id: 'a', text: "Can you tell me more about the day-to-day responsibilities of this role and how success is measured here?" },
            { id: 'b', text: "No, I think you covered everything. I just want to know when I can start and how much I'll be paid." },
            { id: 'c', text: "Do you guys strictly monitor internet usage? I like to check my social media during the day." }
        ],
        correctOption: 'a',
        explanation: "Option A is correct because it shows you are engaged and thinking critically about the role. Options B and C are focused on personal benefits or reflect poorly on your work ethic."
    },
    {
        id: 8,
        question: "How do you handle stress/pressure?",
        howToAnswer: "Provide examples of how you manage challenging situations effectively.",
        options: [
            { id: 'a', text: "I try to avoid stressful situations as much as possible. If it gets too much, I usually take a few days off to recover." },
            { id: 'b', text: "I actually work best under pressure. When faced with a tight deadline, I break the project down into manageable tasks, prioritize them, and stay focused until it's done." },
            { id: 'c', text: "I tend to panic a bit, but then I drink a lot of coffee and stay up all night to finish the work." }
        ],
        correctOption: 'b',
        explanation: "Option B is correct because it explains a practical, actionable strategy (breaking down tasks, prioritizing) to manage stress. Options A and C show an inability to handle typical workplace pressure."
    },
    {
        id: 9,
        question: "Describe a challenge or conflict you've faced at work, and how you dealt with it.",
        howToAnswer: "Focus on how you resolved the issue and what you learned from the experience.",
        options: [
            { id: 'a', text: "I had a coworker who was always taking credit for my ideas. I confronted them publicly in a meeting to make sure everyone knew the truth." },
            { id: 'b', text: "I just ignored it. I find it's better to keep your head down and not cause any drama, even if it means doing someone else's work." },
            { id: 'c', text: "A project I was leading was falling behind schedule due to a miscommunication between departments. I organized a brief sync meeting, clarified responsibilities, and we were able to get back on track." }
        ],
        correctOption: 'c',
        explanation: "Option C is correct because it shows leadership, proactive communication, and problem-solving without blaming others. Option A is aggressive, and Option B is passive-avoidant."
    },
    {
        id: 10,
        question: "What do you consider to be your biggest professional achievement?",
        howToAnswer: "Choose an achievement that demonstrates skills relevant to the job. Use the STAR method to structure your answer and highlight the impact you made.",
        options: [
            { id: 'a', text: "My biggest achievement was completely overhauling our team's workflow process, which led to a 30% increase in productivity over six months." },
            { id: 'b', text: "I once won a pie-eating contest at a company picnic. It was a really fun day and everyone was cheering for me." },
            { id: 'c', text: "I managed to not get fired from my last job for three years, which was a record for me since I usually get bored and quit." }
        ],
        correctOption: 'a',
        explanation: "Option A is correct because it focuses on a relevant professional accomplishment and uses clear metrics (30% increase) to demonstrate impact. Options B and C are either irrelevant or highlight a lack of ambition."
    },
    {
        id: 11,
        question: "Why do you want to leave your current job?",
        howToAnswer: "Keep it positive. Focus on what you are looking forward to in a new role, such as new challenges or growth opportunities, rather than complaining about your previous employer.",
        options: [
            { id: 'a', text: "My boss was terrible and the company culture was toxic. I just couldn't stand being there for another minute." },
            { id: 'b', text: "I've learned a lot in my current role, but I'm looking for a position that offers more opportunities to take on leadership responsibilities and grow my skill set in a new industry." },
            { id: 'c', text: "I heard that you pay a lot more here, and honestly, I just want a higher salary without doing more work." }
        ],
        correctOption: 'b',
        explanation: "Option B is correct because it frames your departure positively, focusing on your desire for growth and new challenges. Option A is negative and unprofessional, and Option C focuses only on money."
    },
    {
        id: 12,
        question: "How would your friends describe you?",
        howToAnswer: "Choose traits that translate well to the workplace, such as reliability, organization, or being a good listener. Provide a brief example if possible.",
        options: [
            { id: 'a', text: "They'd say I'm the life of the party and always down for a good time. I'm very spontaneous and hate planning things." },
            { id: 'b', text: "They would probably say I'm highly organized, dependable, and always willing to lend an ear when someone needs to talk through a problem." },
            { id: 'c', text: "They think I'm pretty quiet and prefer to stay out of the way. I don't really like interacting with people much." }
        ],
        correctOption: 'b',
        explanation: "Option B is correct because it translates personal traits (organized, dependable, good listener) into highly valuable workplace skills. Options A and C highlight traits that might be disruptive or uncollaborative in a team setting."
    }
];

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

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('common-question')) {
        renderQuestion(currentQuestionIndex);

        const confirmBtn = document.getElementById('confirm-btn');
        if (confirmBtn) {
            confirmBtn.addEventListener('click', handleConfirm);
        }

        const nextBtn = document.getElementById('next-btn');
        if (nextBtn) {
            nextBtn.addEventListener('click', handleNext);
        }
    }
});
