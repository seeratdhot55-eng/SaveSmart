/**
 * SaveSmart - Core Application Script
 * Handles Theme Management, Dashboard Calculations, 
 * 100-Day Challenge tracking, and Achievements.
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- INITIALIZATION ---
    initTheme();
    initNavigation();
    
    // Determine which page is currently active and load specific logic
    const path = window.location.pathname;
    if (path.includes('dashboard.html')) {
        initDashboard();
    } else if (path.includes('challenge.html')) {
        initChallenge();
    } else if (path.includes('achievements.html')) {
        initAchievements();
    }
    
    // Always update motivational quotes if the container exists on the page
    displayDailyQuote();
});

// ==========================================
// 1. THEME MANAGEMENT (Light / Dark Mode)
// ==========================================
function initTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) return;

    // Check for saved theme preference, otherwise default to light
    const currentTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    
    // Update button icon/text based on current theme
    themeToggle.textContent = currentTheme === 'dark' ? '☀️' : '🌙';

    themeToggle.addEventListener('click', () => {
        let theme = document.documentElement.getAttribute('data-theme');
        let newTheme = theme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        themeToggle.textContent = newTheme === 'dark' ? '☀️' : '🌙';
    });
}

// ==========================================
// 2. NAVIGATION (Mobile Hamburger Menu)
// ==========================================
function initNavigation() {
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            navToggle.classList.toggle('active');
        });
    }
}

// ==========================================
// 3. DASHBOARD LOGIC
// ==========================================
function initDashboard() {
    const goalInput = document.getElementById('goal-amount');
    const savedInput = document.getElementById('current-saved');
    const saveBtn = document.getElementById('save-dashboard-btn');
    
    // Load previously saved values
    const storedGoal = localStorage.getItem('savingsGoal') || 0;
    const storedSaved = localStorage.getItem('currentSavings') || 0;

    if (goalInput && savedInput) {
        goalInput.value = storedGoal > 0 ? storedGoal : '';
        savedInput.value = storedSaved > 0 ? storedSaved : '';
    }

    // Initial progress calculation
    updateProgressBar(storedSaved, storedGoal);

    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            const goalValue = parseFloat(goalInput.value) || 0;
            const savedValue = parseFloat(savedInput.value) || 0;

            if (goalValue < 0 || savedValue < 0) {
                alert('Please enter valid positive numbers.');
                return;
            }

            // Save to localStorage
            localStorage.setItem('savingsGoal', goalValue);
            localStorage.setItem('currentSavings', savedValue);

            // Update UI
            updateProgressBar(savedValue, goalValue);
            
            // Trigger a visual confirmation
            saveBtn.textContent = 'Saved! ✓';
            saveBtn.style.background = '#2ecc71';
            setTimeout(() => {
                saveBtn.textContent = 'Update Tracker';
                saveBtn.style.background = '';
            }, 2000);
        });
    }
}

function updateProgressBar(saved, goal) {
    const progressBar = document.getElementById('progress-bar');
    const progressPercentText = document.getElementById('progress-percent');
    const remainingText = document.getElementById('remaining-amount');

    if (!progressBar || !progressPercentText || !remainingText) return;

    if (goal <= 0) {
        progressBar.style.width = '0%';
        progressPercentText.textContent = '0%';
        remainingText.textContent = 'Set a goal to see remaining amount.';
        return;
    }

    // Calculate percentage capped at 100%
    let percentage = (saved / goal) * 100;
    percentage = Math.min(Math.round(percentage), 100);

    // Update DOM
    progressBar.style.width = `${percentage}%`;
    progressPercentText.textContent = `${percentage}%`;

    const remaining = goal - saved;
    if (remaining <= 0) {
        remainingText.textContent = 'Congratulations! You hit your savings goal! 🎉';
    } else {
        remainingText.textContent = `$${remaining.toLocaleString()} left to reach your goal.`;
    }
}

// ==========================================
// 4. 100-DAY CHALLENGE LOGIC
// ==========================================
function initChallenge() {
    const gridContainer = document.getElementById('challenge-grid');
    const challengeProgressText = document.getElementById('challenge-progress-text');
    if (!gridContainer) return;

    // Retrieve checked days array or initialize empty tracking object
    let challengeData = JSON.parse(localStorage.getItem('challengeData')) || {};

    // Generate 100 interactive day cards
    for (let i = 1; i <= 100; i++) {
        const dayCard = document.createElement('div');
        dayCard.className = 'day-card';
        if (challengeData[i]) {
            dayCard.classList.add('completed');
        }

        // Inner HTML structure for the custom checkbox card
        dayCard.innerHTML = `
            <span>Day ${i}</span>
            <input type="checkbox" id="day-${i}" ${challengeData[i] ? 'checked' : ''}>
            <label for="day-${i}"></label>
        `;

        // Handle card click behavior
        dayCard.addEventListener('click', function(e) {
            // Prevent event double-firing if clicking directly on the label/input
            if (e.target.tagName === 'INPUT') return;
            
            const checkbox = this.querySelector('input[type="checkbox"]');
            checkbox.checked = !checkbox.checked;
            toggleDayProgress(i, checkbox.checked, this);
        });

        // Ensure direct checkbox clicks are captured correctly
        const checkbox = dayCard.querySelector('input[type="checkbox"]');
        checkbox.addEventListener('change', function() {
            toggleDayProgress(i, this.checked, dayCard);
        });

        gridContainer.appendChild(dayCard);
    }

    updateChallengeStats();
}

function toggleDayProgress(dayNumber, isChecked, cardElement) {
    let challengeData = JSON.parse(localStorage.getItem('challengeData')) || {};
    
    if (isChecked) {
        challengeData[dayNumber] = true;
        cardElement.classList.add('completed');
    } else {
        delete challengeData[dayNumber];
        cardElement.classList.remove('completed');
    }

    localStorage.setItem('challengeData', JSON.stringify(challengeData));
    updateChallengeStats();
}

function updateChallengeStats() {
    const challengeProgressText = document.getElementById('challenge-progress-text');
    if (!challengeProgressText) return;

    const challengeData = JSON.parse(localStorage.getItem('challengeData')) || {};
    const daysCompleted = Object.keys(challengeData).length;
    
    challengeProgressText.textContent = `${daysCompleted} / 100 Days Completed`;
}

// ==========================================
// 5. ACHIEVEMENTS LOGIC
// ==========================================
function initAchievements() {
    const storedGoal = parseFloat(localStorage.getItem('savingsGoal')) || 0;
    const storedSaved = parseFloat(localStorage.getItem('currentSavings')) || 0;
    const challengeData = JSON.parse(localStorage.getItem('challengeData')) || {};
    const daysCompleted = Object.keys(challengeData).length;

    // Metric Calculations
    const progressPercent = storedGoal > 0 ? (storedSaved / storedGoal) * 100 : 0;

    // Milestone Configurations mapped directly to HTML Badge IDs
    const milestones = {
        'badge-first-step': storedSaved > 0,
        'badge-halfway': progressPercent >= 50,
        'badge-goal-achieved': progressPercent >= 100 && storedGoal > 0,
        'badge-challenge-10': daysCompleted >= 10,
        'badge-challenge-50': daysCompleted >= 50,
        'badge-challenge-100': daysCompleted >= 100
    };

    // Evaluate and unlock badges dynamically
    for (const [badgeId, conditionsMet] of Object.entries(milestones)) {
        const badgeElement = document.getElementById(badgeId);
        if (badgeElement) {
            if (conditionsMet) {
                badgeElement.classList.add('unlocked');
                badgeElement.classList.remove('locked');
            } else {
                badgeElement.classList.remove('unlocked');
                badgeElement.classList.add('locked');
            }
        }
    }
}

// ==========================================
// 6. DYNAMIC MOTIVATIONAL QUOTES
// ==========================================
function displayDailyQuote() {
    const quoteElement = document.getElementById('motivational-quote');
    if (!quoteElement) return;

    const quotes = [
        "Don't save what is left after spending; spend what is left after saving. – Warren Buffett",
        "Small amounts saved daily add up to big wealth over time.",
        "The safest way to double your money is to fold it over once and put it in your pocket. – Kin Hubbard",
        "Do not bite off more than you can chew. Budget small, save steady.",
        "A penny saved is a penny earned. – Benjamin Franklin",
        "Financial freedom is less about what you earn and more about how you manage it.",
        "Your future self will thank you for the sacrifices you make today.",
        "Beware of little expenses; a small leak will sink a great ship. – Benjamin Franklin",
        "The goal isn't more money. The goal is living life on your own terms.",
        "Consistency is the secret key to building lasting wealth."
    ];

    // Select a unique quote each day based on the calendar day of the year
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now - start;
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    
    // Use modulo operator to cleanly cycle through available array indices
    const quoteIndex = dayOfYear % quotes.length;
    quoteElement.textContent = `"${quotes[quoteIndex]}"`;
}
