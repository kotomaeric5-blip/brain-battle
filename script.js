/* =========================================================
   BRAIN BATTLE — GAME ENGINE
========================================================= */

/* =========================================================
   GAME SETTINGS
========================================================= */

const GAME_TIME = 60;

const LEVEL_NAMES = [
    "ROOKIE",
    "QUICK THINKER",
    "BRAIN RUNNER",
    "FAST MIND",
    "BRAIN FIGHTER",
    "SHARP MIND",
    "THINKING MACHINE",
    "BRAIN MASTER",
    "ELITE MIND",
    "GENIUS",
    "LEGENDARY MIND"
];

const LEVEL_UNLOCKS = {
    1: "Classic mode",
    5: "Hard Mode",
    7: "Speed Mode",
    10: "Genius Mode",
    15: "Elite Mode",
    20: "Legendary Mode"
};


/* =========================================================
   DOM ELEMENTS
========================================================= */

const homeScreen = document.getElementById("homeScreen");
const gameScreen = document.getElementById("gameScreen");
const resultScreen = document.getElementById("resultScreen");
const progressScreen = document.getElementById("progressScreen");
const achievementsScreen = document.getElementById("achievementsScreen");
const dailyScreen = document.getElementById("dailyScreen");

const startBtn = document.getElementById("startBtn");
const progressBtn = document.getElementById("progressBtn");
const dailyBtn = document.getElementById("dailyBtn");
const startDailyBtn = document.getElementById("startDailyBtn");
const challengeHomeBtn = document.getElementById("challengeHomeBtn");
const achievementsBtn = document.getElementById("achievementsBtn");
const levelsHomeBtn = document.getElementById("levelsHomeBtn");

const playAgainBtn = document.getElementById("playAgainBtn");
const resultHomeBtn = document.getElementById("resultHomeBtn");

const shareBtn = document.getElementById("shareBtn");
const copyChallengeBtn = document.getElementById("copyChallengeBtn");

const questionText = document.getElementById("questionText");
const questionCategory = document.getElementById("questionCategory");
const questionNumber = document.getElementById("questionNumber");

const scoreElement = document.getElementById("score");
const timerElement = document.getElementById("timer");
const comboElement = document.getElementById("combo");
const timerBox = document.getElementById("timerBox");

const gameProgressFill = document.getElementById("gameProgressFill");

const finalScore = document.getElementById("finalScore");
const resultMessage = document.getElementById("resultMessage");
const resultIcon = document.getElementById("resultIcon");

const resultCorrect = document.getElementById("resultCorrect");
const resultAnswered = document.getElementById("resultAnswered");
const resultBestCombo = document.getElementById("resultBestCombo");
const resultXP = document.getElementById("resultXP");

const newBest = document.getElementById("newBest");

const homeBest = document.getElementById("homeBest");
const homeStreak = document.getElementById("homeStreak");
const homeBattles = document.getElementById("homeBattles");
const homeLevel = document.getElementById("homeLevel");

const headerLevel = document.getElementById("headerLevel");

const homeLevelTitle = document.getElementById("homeLevelTitle");
const xpCurrentLevel = document.getElementById("xpCurrentLevel");
const xpText = document.getElementById("xpText");
const xpFill = document.getElementById("xpFill");
const nextUnlockText = document.getElementById("nextUnlockText");

const progressLevel = document.getElementById("progressLevel");
const progressLevelTitle = document.getElementById("progressLevelTitle");
const progressXP = document.getElementById("progressXP");
const progressXPText = document.getElementById("progressXPText");
const progressXPFill = document.getElementById("progressXPFill");
const progressNextUnlock = document.getElementById("progressNextUnlock");

const progressBest = document.getElementById("progressBest");
const progressBattles = document.getElementById("progressBattles");
const progressCorrect = document.getElementById("progressCorrect");
const progressStreak = document.getElementById("progressStreak");
const progressBestCombo = document.getElementById("progressBestCombo");
const progressTotalXP = document.getElementById("progressTotalXP");

const achievementCount = document.getElementById("achievementCount");

const dailyDate = document.getElementById("dailyDate");
const dailyStreak = document.getElementById("dailyStreak");
const dailyBest = document.getElementById("dailyBest");

const toast = document.getElementById("toast");
const toastIcon = document.getElementById("toastIcon");
const toastMessage = document.getElementById("toastMessage");

const levelUpModal = document.getElementById("levelUpModal");
const levelUpNumber = document.getElementById("levelUpNumber");
const levelUpTitle = document.getElementById("levelUpTitle");
const levelUpClose = document.getElementById("levelUpClose");

const challengeModal = document.getElementById("challengeModal");
const challengeTargetScore = document.getElementById("challengeTargetScore");
const acceptChallengeBtn = document.getElementById("acceptChallengeBtn");
const declineChallengeBtn = document.getElementById("declineChallengeBtn");

const challengeBanner = document.getElementById("challengeBanner");
const challengeResultBox = document.getElementById("challengeResultBox");

const answerButtons = document.querySelectorAll(".answer-btn");


/* =========================================================
   OPTIONAL SOUND BUTTON
========================================================= */

const soundToggleBtn =
    document.getElementById("soundToggleBtn");


/* =========================================================
   PLAYER DATA
========================================================= */

const DEFAULT_PLAYER = {
    xp: 0,
    level: 1,
    best: 0,
    battles: 0,
    correct: 0,
    streak: 0,
    bestCombo: 0,
    lastPlayedDate: "",
    dailyPlayedDate: "",
    dailyBest: 0,
    totalQuestions: 0,
    achievements: []
};

let player = loadPlayer();


function loadPlayer() {

    try {

        const saved =
            localStorage.getItem(
                "brainBattlePlayer"
            );

        if (!saved) {
            return { ...DEFAULT_PLAYER };
        }

        const parsed =
            JSON.parse(saved);

        return {
            ...DEFAULT_PLAYER,
            ...parsed
        };

    } catch (error) {

        console.warn(
            "Could not load player data.",
            error
        );

        return {
            ...DEFAULT_PLAYER
        };
    }
}


function savePlayer() {

    localStorage.setItem(
        "brainBattlePlayer",
        JSON.stringify(player)
    );
}


/* =========================================================
   GAME VARIABLES
========================================================= */

let questions = [];

let currentQuestions = [];
let currentQuestionIndex = 0;

let score = 0;
let combo = 0;
let bestComboThisGame = 0;
let correctAnswers = 0;
let answeredQuestions = 0;

let gameRunning = false;
let answerLocked = false;

let gameStartTime = 0;
let timerInterval = null;

let currentMode = "classic";
let isDailyGame = false;

let challengeTarget = null;
let challengeActive = false;

let toastTimeout = null;


/* =========================================================
   SOUND SYSTEM
========================================================= */

let audioContext = null;
let soundEnabled =
    localStorage.getItem(
        "brainBattleSound"
    ) !== "off";


function initAudio() {

    if (!soundEnabled) {
        return;
    }

    try {

        if (!audioContext) {

            const AudioContext =
                window.AudioContext ||
                window.webkitAudioContext;

            if (!AudioContext) {
                return;
            }

            audioContext =
                new AudioContext();
        }

        if (
            audioContext.state ===
            "suspended"
        ) {

            audioContext.resume();
        }

    } catch (error) {

        console.warn(
            "Audio could not be initialized.",
            error
        );
    }
}


function playTone(
    frequency,
    duration = 0.12,
    type = "sine",
    volume = 0.05,
    delay = 0
) {

    if (!soundEnabled) {
        return;
    }

    try {

        initAudio();

        if (!audioContext) {
            return;
        }

        const oscillator =
            audioContext.createOscillator();

        const gain =
            audioContext.createGain();

        oscillator.type = type;

        oscillator.frequency.value =
            frequency;

        gain.gain.setValueAtTime(
            0,
            audioContext.currentTime + delay
        );

        gain.gain.linearRampToValueAtTime(
            volume,
            audioContext.currentTime +
                delay +
                0.01
        );

        gain.gain.exponentialRampToValueAtTime(
            0.001,
            audioContext.currentTime +
                delay +
                duration
        );

        oscillator.connect(gain);
        gain.connect(audioContext.destination);

        oscillator.start(
            audioContext.currentTime +
                delay
        );

        oscillator.stop(
            audioContext.currentTime +
                delay +
                duration +
                0.02
        );

    } catch (error) {

        console.warn(
            "Sound playback failed.",
            error
        );
    }
}


function playCorrectSound() {

    playTone(
        660,
        0.08,
        "sine",
        0.05
    );

    playTone(
        880,
        0.12,
        "sine",
        0.045,
        0.06
    );
}


function playWrongSound() {

    playTone(
        180,
        0.16,
        "sawtooth",
        0.035
    );

    playTone(
        130,
        0.2,
        "sawtooth",
        0.025,
        0.07
    );
}


function playComboSound(comboValue) {

    if (comboValue < 3) {
        return;
    }

    const base =
        Math.min(
            1200,
            500 + comboValue * 45
        );

    playTone(
        base,
        0.08,
        "triangle",
        0.05
    );

    playTone(
        base + 180,
        0.1,
        "triangle",
        0.045,
        0.07
    );
}


function playTimerWarningSound() {

    playTone(
        900,
        0.08,
        "square",
        0.025
    );
}


function playGameOverSound() {

    playTone(
        500,
        0.12,
        "triangle",
        0.04
    );

    playTone(
        400,
        0.14,
        "triangle",
        0.035,
        0.1
    );

    playTone(
        300,
        0.2,
        "triangle",
        0.03,
        0.2
    );
}


function playNewBestSound() {

    playTone(
        523,
        0.1,
        "sine",
        0.05
    );

    playTone(
        659,
        0.1,
        "sine",
        0.05,
        0.1
    );

    playTone(
        784,
        0.16,
        "sine",
        0.055,
        0.2
    );
}


function playLevelUpSound() {

    playTone(
        523,
        0.1,
        "triangle",
        0.05
    );

    playTone(
        659,
        0.1,
        "triangle",
        0.05,
        0.1
    );

    playTone(
        784,
        0.12,
        "triangle",
        0.055,
        0.2
    );

    playTone(
        1047,
        0.22,
        "triangle",
        0.06,
        0.32
    );
}


function updateSoundButton() {

    if (!soundToggleBtn) {
        return;
    }

    soundToggleBtn.textContent =
        soundEnabled
            ? "🔊 Sound On"
            : "🔇 Sound Off";

    soundToggleBtn.setAttribute(
        "aria-pressed",
        String(soundEnabled)
    );
}


function toggleSound() {

    soundEnabled = !soundEnabled;

    localStorage.setItem(
        "brainBattleSound",
        soundEnabled ? "on" : "off"
    );

    updateSoundButton();

    if (soundEnabled) {

        initAudio();

        playTone(
            660,
            0.12,
            "sine",
            0.05
        );

        showToast(
            "🔊",
            "Sound turned on."
        );

    } else {

        showToast(
            "🔇",
            "Sound turned off."
        );
    }
}


/* =========================================================
   LOAD QUESTIONS
========================================================= */

async function loadQuestions() {

    try {

        questionText.textContent =
            "Loading questions...";

        const response =
            await fetch("questions.json");

        if (!response.ok) {

            throw new Error(
                `Question file returned ${response.status}`
            );
        }

        const data =
            await response.json();

        if (!Array.isArray(data)) {

            throw new Error(
                "questions.json must contain an array of questions."
            );
        }

        questions =
            data.filter(question => {

                return (
                    question &&
                    typeof question.question === "string" &&
                    Array.isArray(question.options) &&
                    question.options.length >= 4 &&
                    typeof question.answer === "string"
                );
            });

        if (questions.length === 0) {

            throw new Error(
                "No valid questions found."
            );
        }

        console.log(
            `Brain Battle loaded ${questions.length} questions.`
        );

        updateAllUI();

    } catch (error) {

        console.error(error);

        questionText.textContent =
            "Could not load questions. Make sure questions.json is in the same folder and run the game with Live Server.";

        showToast(
            "⚠️",
            "Question file could not be loaded."
        );
    }
}


/* =========================================================
   SCREEN NAVIGATION
========================================================= */

function showScreen(screenId) {

    const screens = [
        homeScreen,
        gameScreen,
        resultScreen,
        progressScreen,
        achievementsScreen,
        dailyScreen
    ];

    screens.forEach(screen => {

        if (screen) {
            screen.classList.remove(
                "active"
            );
        }
    });

    const target =
        document.getElementById(screenId);

    if (target) {

        target.classList.add(
            "active"
        );
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

    updateAllUI();
}


/* =========================================================
   LEVEL SYSTEM
========================================================= */

function xpRequiredForLevel(level) {

    return (
        100 +
        ((level - 1) * 50)
    );
}


function getLevelTitle(level) {

    if (
        level <=
        LEVEL_NAMES.length
    ) {

        return LEVEL_NAMES[
            level - 1
        ];
    }

    return "LEGENDARY MIND";
}


function getCurrentLevelXP() {

    let remainingXP =
        player.xp;

    let level = 1;

    while (
        remainingXP >=
        xpRequiredForLevel(level)
    ) {

        remainingXP -=
            xpRequiredForLevel(level);

        level++;
    }

    return {
        level,
        currentXP: remainingXP,
        requiredXP:
            xpRequiredForLevel(level)
    };
}


function calculateLevelFromXP() {

    let remainingXP =
        player.xp;

    let level = 1;

    while (
        remainingXP >=
        xpRequiredForLevel(level)
    ) {

        remainingXP -=
            xpRequiredForLevel(level);

        level++;
    }

    return level;
}


function addXP(amount) {

    if (amount <= 0) {
        return;
    }

    const oldLevel =
        player.level;

    player.xp += amount;

    player.level =
        calculateLevelFromXP();

    savePlayer();

    if (
        player.level >
        oldLevel
    ) {

        for (
            let level =
                oldLevel + 1;
            level <= player.level;
            level++
        ) {

            showLevelUp(level);
        }
    }
}


function showLevelUp(level) {

    if (!levelUpModal) {
        return;
    }

    levelUpNumber.textContent =
        level;

    levelUpTitle.textContent =
        getLevelTitle(level);

    levelUpModal.classList.remove(
        "hidden"
    );

    playLevelUpSound();

    checkAchievements();

    updateAllUI();
}


/* =========================================================
   LEVEL UNLOCKS
========================================================= */

function getNextUnlock() {

    const unlockLevels =
        Object.keys(
            LEVEL_UNLOCKS
        )
        .map(Number)
        .sort(
            (a, b) => a - b
        );

    for (
        const unlockLevel
        of unlockLevels
    ) {

        if (
            player.level <
            unlockLevel
        ) {

            return {
                level: unlockLevel,
                name:
                    LEVEL_UNLOCKS[
                        unlockLevel
                    ]
            };
        }
    }

    return null;
}


function isModeUnlocked(mode) {

    const requirements = {
        classic: 1,
        hard: 5,
        speed: 7,
        genius: 10,
        elite: 15,
        legendary: 20
    };

    const requiredLevel =
        requirements[mode] || 1;

    return (
        player.level >=
        requiredLevel
    );
}


/* =========================================================
   DATE HELPERS
========================================================= */

function dateKey(
    date = new Date()
) {

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            date.getDate()
        ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


function yesterdayKey() {

    const yesterday =
        new Date();

    yesterday.setDate(
        yesterday.getDate() - 1
    );

    return dateKey(yesterday);
}


/* =========================================================
   STREAK SYSTEM
========================================================= */

function updateStreak() {

    const today =
        dateKey();

    if (
        player.lastPlayedDate ===
        today
    ) {
        return;
    }

    if (
        player.lastPlayedDate ===
        yesterdayKey()
    ) {

        player.streak++;

    } else {

        player.streak = 1;
    }

    player.lastPlayedDate =
        today;

    savePlayer();
}


/* =========================================================
   QUESTION SHUFFLING
========================================================= */

function shuffleArray(array) {

    const result =
        [...array];

    for (
        let i =
            result.length - 1;
        i > 0;
        i--
    ) {

        const randomIndex =
            Math.floor(
                Math.random() *
                (i + 1)
            );

        [
            result[i],
            result[randomIndex]
        ] = [
            result[randomIndex],
            result[i]
        ];
    }

    return result;
}


/* =========================================================
   DAILY SEEDED SHUFFLE
========================================================= */

function seededRandom(seed) {

    let value = 0;

    for (
        let i = 0;
        i < seed.length;
        i++
    ) {

        value =
            (
                value * 31 +
                seed.charCodeAt(i)
            ) >>> 0;
    }

    return function () {

        value =
            (
                value * 1664525 +
                1013904223
            ) >>> 0;

        return (
            value /
            4294967296
        );
    };
}


function getDailyQuestions() {

    if (!questions.length) {
        return [];
    }

    const random =
        seededRandom(
            `brain-battle-${dateKey()}`
        );

    const result =
        [...questions];

    for (
        let i =
            result.length - 1;
        i > 0;
        i--
    ) {

        const randomIndex =
            Math.floor(
                random() *
                (i + 1)
            );

        [
            result[i],
            result[randomIndex]
        ] = [
            result[randomIndex],
            result[i]
        ];
    }

    return result;
}


/* =========================================================
   PREPARE GAME
========================================================= */

function prepareQuestions() {

    if (!questions.length) {

        showToast(
            "⚠️",
            "Questions are still loading."
        );

        return false;
    }

    if (isDailyGame) {

        currentQuestions =
            getDailyQuestions();

    } else {

        currentQuestions =
            shuffleArray(
                questions
            );
    }

    if (
        !currentQuestions.length
    ) {

        showToast(
            "⚠️",
            "No questions available."
        );

        return false;
    }

    return true;
}


/* =========================================================
   START GAME
========================================================= */

function startGame(
    mode = "classic"
) {

    if (gameRunning) {
        return;
    }

    if (!questions.length) {

        showToast(
            "⚠️",
            "Questions are still loading."
        );

        return;
    }

    initAudio();

    currentMode = mode;

    isDailyGame =
        mode === "daily";

    if (!prepareQuestions()) {
        return;
    }

    currentQuestionIndex = 0;

    score = 0;
    combo = 0;
    bestComboThisGame = 0;
    correctAnswers = 0;
    answeredQuestions = 0;

    answerLocked = false;
    gameRunning = true;

    scoreElement.textContent =
        "0";

    comboElement.textContent =
        "0";

    showChallengeBanner();

    showScreen(
        "gameScreen"
    );

    gameStartTime =
        Date.now();

    startTimer();

    showQuestion();
}


/* =========================================================
   TIMER
========================================================= */

function startTimer() {

    clearInterval(
        timerInterval
    );

    timerElement.textContent =
        GAME_TIME;

    timerBox.classList.remove(
        "warning"
    );

    gameProgressFill.style.width =
        "100%";

    let lastWarningSecond =
        GAME_TIME + 1;

    timerInterval =
        setInterval(() => {

            if (!gameRunning) {

                clearInterval(
                    timerInterval
                );

                return;
            }

            const elapsed =
                (
                    Date.now() -
                    gameStartTime
                ) / 1000;

            const remaining =
                Math.max(
                    0,
                    GAME_TIME -
                    elapsed
                );

            const currentSecond =
                Math.ceil(
                    remaining
                );

            timerElement.textContent =
                currentSecond;

            const percentage =
                (
                    remaining /
                    GAME_TIME
                ) * 100;

            gameProgressFill.style.width =
                `${Math.max(
                    0,
                    percentage
                )}%`;

            if (
                remaining <= 10
            ) {

                timerBox.classList.add(
                    "warning"
                );

                if (
                    currentSecond !==
                    lastWarningSecond
                ) {

                    playTimerWarningSound();

                    lastWarningSecond =
                        currentSecond;
                }
            }

            if (
                remaining <= 0
            ) {

                clearInterval(
                    timerInterval
                );

                endGame();
            }

        }, 100);
}


/* =========================================================
   SHOW QUESTION
========================================================= */

function showQuestion() {

    if (!gameRunning) {
        return;
    }

    if (
        currentQuestionIndex >=
        currentQuestions.length
    ) {

        currentQuestionIndex = 0;
    }

    const currentQuestion =
        currentQuestions[
            currentQuestionIndex
        ];

    if (!currentQuestion) {

        endGame();

        return;
    }

    answerLocked = false;

    questionText.textContent =
        currentQuestion.question;

    questionCategory.textContent =
        currentQuestion.category ||
        "General Knowledge";

    questionNumber.textContent =
        currentQuestionIndex + 1;

    const shuffledOptions =
        prepareOptions(
            currentQuestion
        );

    answerButtons.forEach(
        (button, index) => {

            button.classList.remove(
                "correct",
                "wrong",
                "disabled"
            );

            button.disabled = false;

            button.dataset.answer =
                shuffledOptions[index];

            const answerText =
                button.querySelector(
                    ".answer-text"
                );

            if (answerText) {

                answerText.textContent =
                    shuffledOptions[
                        index
                    ];
            }
        }
    );
}


/* =========================================================
   PREPARE OPTIONS
========================================================= */

function prepareOptions(question) {

    return shuffleArray(
        question.options.slice(0, 4)
    );
}


/* =========================================================
   ANSWER QUESTION
========================================================= */

function handleAnswer(button) {

    if (
        !gameRunning ||
        answerLocked
    ) {
        return;
    }

    answerLocked = true;

    answeredQuestions++;

    player.totalQuestions++;

    const selectedAnswer =
        button.dataset.answer;

    const currentQuestion =
        currentQuestions[
            currentQuestionIndex
        ];

    const correctAnswer =
        currentQuestion.answer;

    const isCorrect =
        normalizeAnswer(
            selectedAnswer
        ) ===
        normalizeAnswer(
            correctAnswer
        );

    answerButtons.forEach(
        btn => {

            btn.classList.add(
                "disabled"
            );

            btn.disabled = true;
        }
    );

    if (isCorrect) {

        button.classList.add(
            "correct"
        );

        score++;

        correctAnswers++;

        combo++;

        if (
            combo >
            bestComboThisGame
        ) {

            bestComboThisGame =
                combo;
        }

        if (
            combo >
            player.bestCombo
        ) {

            player.bestCombo =
                combo;
        }

        player.correct++;

        scoreElement.textContent =
            score;

        comboElement.textContent =
            combo;

        playCorrectSound();

        if (combo >= 3) {

            playComboSound(
                combo
            );

            showToast(
                "🔥",
                `${combo} combo! Keep going!`
            );
        }

    } else {

        button.classList.add(
            "wrong"
        );

        combo = 0;

        comboElement.textContent =
            "0";

        playWrongSound();

        answerButtons.forEach(
            btn => {

                if (
                    normalizeAnswer(
                        btn.dataset.answer
                    ) ===
                    normalizeAnswer(
                        correctAnswer
                    )
                ) {

                    btn.classList.add(
                        "correct"
                    );
                }
            }
        );
    }

    currentQuestionIndex++;

    setTimeout(() => {

        if (!gameRunning) {
            return;
        }

        showQuestion();

    }, isCorrect ? 150 : 450);
}


/* =========================================================
   ANSWER NORMALIZATION
========================================================= */

function normalizeAnswer(value) {

    return String(value)
        .trim()
        .toLowerCase()
        .replace(
            /\s+/g,
            " "
        );
}


/* =========================================================
   END GAME
========================================================= */

function endGame() {

    if (!gameRunning) {
        return;
    }

    gameRunning = false;

    clearInterval(
        timerInterval
    );

    timerInterval = null;

    answerLocked = true;

    timerBox.classList.remove(
        "warning"
    );

    gameProgressFill.style.width =
        "0%";

    answerButtons.forEach(
        button => {
            button.disabled = true;
        }
    );

    player.battles++;

    updateStreak();

    const oldBest =
        player.best;

    if (
        score >
        player.best
    ) {

        player.best =
            score;
    }

    if (
        isDailyGame &&
        score >
        player.dailyBest
    ) {

        player.dailyBest =
            score;
    }

    const xpEarned =
        calculateXP(
            score,
            bestComboThisGame
        );

    const oldLevel =
        player.level;

    addXP(
        xpEarned
    );

    player.level =
        calculateLevelFromXP();

    if (isDailyGame) {
        markDailyPlayed();
    }

    checkAchievements();

    savePlayer();

    playGameOverSound();

    if (
        score >
        oldBest
    ) {

        playNewBestSound();
    }

    showResult(
        xpEarned,
        oldBest,
        oldLevel
    );
}


/* =========================================================
   XP CALCULATION
========================================================= */

function calculateXP(
    scoreValue,
    comboValue
) {

    return (
        10 +
        (scoreValue * 5) +
        (
            Math.max(
                0,
                comboValue - 1
            ) * 2
        )
    );
}


/* =========================================================
   RESULT
========================================================= */

function showResult(
    xpEarned,
    oldBest,
    oldLevel
) {

    finalScore.textContent =
        score;

    resultCorrect.textContent =
        correctAnswers;

    resultAnswered.textContent =
        answeredQuestions;

    resultBestCombo.textContent =
        bestComboThisGame;

    resultXP.textContent =
        `+${xpEarned}`;

    newBest.classList.toggle(
        "hidden",
        score <= oldBest
    );

    if (
        score >= 25
    ) {

        resultIcon.textContent =
            "🔥";

        resultMessage.textContent =
            "Absolutely flying!";

    } else if (
        score >= 20
    ) {

        resultIcon.textContent =
            "🧠";

        resultMessage.textContent =
            "Sharp thinking!";

    } else if (
        score >= 10
    ) {

        resultIcon.textContent =
            "⚡";

        resultMessage.textContent =
            "Nice run!";

    } else {

        resultIcon.textContent =
            "💪";

        resultMessage.textContent =
            "Keep pushing!";
    }

    if (isDailyGame) {

        resultMessage.textContent =
            score >= 20
                ? "You crushed today's game!"
                : "Daily game complete!";
    }

    updateChallengeResult();

    showScreen(
        "resultScreen"
    );
}


/* =========================================================
   ACHIEVEMENTS
========================================================= */

const ACHIEVEMENTS = {

    first: {
        name: "First Game",
        condition: () =>
            player.battles >= 1
    },

    double: {
        name: "Double Digits",
        condition: () =>
            player.best >= 10
    },

    sharp: {
        name: "Sharp Mind",
        condition: () =>
            player.best >= 20
    },

    storm: {
        name: "Brain Storm",
        condition: () =>
            player.best >= 25
    },

    streak3: {
        name: "On Fire",
        condition: () =>
            player.streak >= 3
    },

    streak7: {
        name: "Week Warrior",
        condition: () =>
            player.streak >= 7
    },

    combo: {
        name: "Combo Starter",
        condition: () =>
            player.bestCombo >= 5
    },

    level5: {
        name: "Level 5",
        condition: () =>
            player.level >= 5
    },

    level10: {
        name: "Brain Master",
        condition: () =>
            player.level >= 10
    },

    games25: {
        name: "Dedicated",
        condition: () =>
            player.battles >= 25
    }
};


function checkAchievements() {

    let unlockedSomething =
        false;

    Object.keys(
        ACHIEVEMENTS
    ).forEach(id => {

        const achievement =
            ACHIEVEMENTS[id];

        if (
            achievement.condition() &&
            !player.achievements.includes(
                id
            )
        ) {

            player.achievements.push(
                id
            );

            unlockedSomething =
                true;

            showToast(
                "🏅",
                `Achievement unlocked: ${achievement.name}`
            );
        }
    });

    if (unlockedSomething) {
        savePlayer();
    }

    updateAchievementUI();
}


/* =========================================================
   ACHIEVEMENT UI
========================================================= */

function updateAchievementUI() {

    if (achievementCount) {

        achievementCount.textContent =
            player.achievements.length;
    }

    document
        .querySelectorAll(
            ".achievement-card"
        )
        .forEach(card => {

            const id =
                card.dataset.achievement;

            const unlocked =
                player.achievements.includes(
                    id
                );

            card.classList.toggle(
                "unlocked",
                unlocked
            );

            card.classList.toggle(
                "locked",
                !unlocked
            );

            const status =
                card.querySelector(
                    ".achievement-status"
                );

            if (status) {

                status.textContent =
                    unlocked
                        ? "✓"
                        : "🔒";
            }
        });
}


/* =========================================================
   MODE UI
========================================================= */

function updateModeUI() {

    const modes = {
        classic: 1,
        hard: 5,
        speed: 7,
        genius: 10,
        elite: 15,
        legendary: 20
    };

    document
        .querySelectorAll(
            ".mode-card"
        )
        .forEach(card => {

            const status =
                card.querySelector(
                    ".mode-status"
                );

            if (!status) {
                return;
            }

            const title =
                card.querySelector(
                    "h3"
                );

            if (!title) {
                return;
            }

            const name =
                title.textContent
                    .trim()
                    .toLowerCase();

            let mode =
                "classic";

            if (
                name.includes("hard")
            ) {

                mode = "hard";

            } else if (
                name.includes("speed")
            ) {

                mode = "speed";

            } else if (
                name.includes("genius")
            ) {

                mode = "genius";

            } else if (
                name.includes("elite")
            ) {

                mode = "elite";

            } else if (
                name.includes("legendary")
            ) {

                mode = "legendary";
            }

            const requiredLevel =
                modes[mode];

            const unlocked =
                player.level >=
                requiredLevel;

            card.classList.toggle(
                "unlocked",
                unlocked
            );

            card.classList.toggle(
                "locked",
                !unlocked
            );

            status.textContent =
                unlocked
                    ? "UNLOCKED"
                    : `LEVEL ${requiredLevel}`;
        });
}


/* =========================================================
   DAILY UI
========================================================= */

function updateDailyUI() {

    if (dailyDate) {

        const today =
            new Date();

        dailyDate.textContent =
            today.toLocaleDateString(
                undefined,
                {
                    weekday: "long",
                    month: "long",
                    day: "numeric"
                }
            ).toUpperCase();
    }

    if (dailyStreak) {

        dailyStreak.textContent =
            player.streak;
    }

    if (dailyBest) {

        dailyBest.textContent =
            player.dailyBest;
    }

    if (startDailyBtn) {

        const alreadyPlayed =
            player.dailyPlayedDate ===
            dateKey();

        startDailyBtn.textContent =
            alreadyPlayed
                ? "Play Daily Again"
                : "Start Daily Game";
    }
}


/* =========================================================
   MARK DAILY GAME
========================================================= */

function markDailyPlayed() {

    if (!isDailyGame) {
        return;
    }

    player.dailyPlayedDate =
        dateKey();

    savePlayer();
}


/* =========================================================
   HOME / PROGRESS UI
========================================================= */

function updatePlayerUI() {

    const levelData =
        getCurrentLevelXP();

    player.level =
        levelData.level;

    const level =
        levelData.level;

    const currentXP =
        levelData.currentXP;

    const requiredXP =
        levelData.requiredXP;

    const percentage =
        Math.min(
            100,
            (
                currentXP /
                requiredXP
            ) * 100
        );

    const title =
        getLevelTitle(level);

    if (headerLevel) {

        headerLevel.textContent =
            `LEVEL ${level}`;
    }

    if (homeBest) {

        homeBest.textContent =
            player.best;
    }

    if (homeStreak) {

        homeStreak.textContent =
            `${player.streak}🔥`;
    }

    if (homeBattles) {

        homeBattles.textContent =
            player.battles;
    }

    if (homeLevel) {

        homeLevel.textContent =
            level;
    }

    if (homeLevelTitle) {

        homeLevelTitle.textContent =
            title;
    }

    if (xpCurrentLevel) {

        xpCurrentLevel.textContent =
            level;
    }

    if (xpText) {

        xpText.textContent =
            `${currentXP} / ${requiredXP} XP`;
    }

    if (xpFill) {

        xpFill.style.width =
            `${percentage}%`;
    }

    const nextUnlock =
        getNextUnlock();

    if (nextUnlockText) {

        if (nextUnlock) {

            nextUnlockText.textContent =
                `Next unlock: ${nextUnlock.name} at Level ${nextUnlock.level}.`;

        } else {

            nextUnlockText.textContent =
                "You've unlocked every major mode. Keep climbing!";
        }
    }

    if (progressLevel) {

        progressLevel.textContent =
            level;
    }

    if (progressLevelTitle) {

        progressLevelTitle.textContent =
            title;
    }

    if (progressXP) {

        progressXP.textContent =
            `${player.xp} XP`;
    }

    if (progressXPText) {

        progressXPText.textContent =
            `${currentXP} / ${requiredXP} XP`;
    }

    if (progressXPFill) {

        progressXPFill.style.width =
            `${percentage}%`;
    }

    if (progressBest) {

        progressBest.textContent =
            player.best;
    }

    if (progressBattles) {

        progressBattles.textContent =
            player.battles;
    }

    if (progressCorrect) {

        progressCorrect.textContent =
            player.correct;
    }

    if (progressStreak) {

        progressStreak.textContent =
            player.streak;
    }

    if (progressBestCombo) {

        progressBestCombo.textContent =
            player.bestCombo;
    }

    if (progressTotalXP) {

        progressTotalXP.textContent =
            player.xp;
    }

    if (progressNextUnlock) {

        if (nextUnlock) {

            progressNextUnlock.textContent =
                `Next unlock: ${nextUnlock.name} at Level ${nextUnlock.level}.`;

        } else {

            progressNextUnlock.textContent =
                "All major game modes unlocked.";
        }
    }

    savePlayer();
}


/* =========================================================
   UPDATE EVERYTHING
========================================================= */

function updateAllUI() {

    updatePlayerUI();
    updateAchievementUI();
    updateModeUI();
    updateDailyUI();
    updateSoundButton();
}


/* =========================================================
   CHALLENGE SYSTEM
========================================================= */

function getChallengeURL() {

    const base =
        window.location.href
            .split("#")[0];

    return (
        `${base}#challenge=${encodeURIComponent(
            score
        )}`
    );
}


function getChallengeText() {

    return (
        `🧠 I scored ${score} on Brain Battle in 60 seconds!\n\n` +
        `Can you beat me? 😏⚡\n\n` +
        `Play my challenge:\n` +
        `${getChallengeURL()}`
    );
}


function createChallengeURL(
    target
) {

    const base =
        window.location.href
            .split("#")[0];

    return (
        `${base}#challenge=${encodeURIComponent(
            target
        )}`
    );
}


/* =========================================================
   CHALLENGE CREATOR MESSAGE
========================================================= */

function showCreatorChallengeMessage() {

    if (!resultScreen) {
        return;
    }

    let creatorBox =
        document.getElementById(
            "challengeCreatorBox"
        );

    if (!creatorBox) {

        creatorBox =
            document.createElement(
                "div"
            );

        creatorBox.id =
            "challengeCreatorBox";

        creatorBox.innerHTML = `
            <div class="challenge-creator-inner">
                <strong>⚔️ Challenge created!</strong>
                <span>You scored <b id="creatorChallengeScore">${score}</b> points.</span>
                <p>Send your challenge link to a friend and see if they can beat your score — or simply show them your score.</p>
                <div class="challenge-creator-actions">
                    <button id="creatorShareChallenge" type="button">
                        ⚔️ Share Challenge
                    </button>
                    <button id="creatorCopyChallenge" type="button">
                        🔗 Copy Challenge Link
                    </button>
                </div>
            </div>
        `;

        const resultContent =
            resultScreen.querySelector(
                ".result-card"
            ) ||
            resultScreen.firstElementChild;

        if (resultContent) {

            resultContent.appendChild(
                creatorBox
            );

        } else {

            resultScreen.appendChild(
                creatorBox
            );
        }

        const creatorShare =
            document.getElementById(
                "creatorShareChallenge"
            );

        const creatorCopy =
            document.getElementById(
                "creatorCopyChallenge"
            );

        if (creatorShare) {

            creatorShare.addEventListener(
                "click",
                shareChallenge
            );
        }

        if (creatorCopy) {

            creatorCopy.addEventListener(
                "click",
                copyChallenge
            );
        }
    }

    const creatorScore =
        document.getElementById(
            "creatorChallengeScore"
        );

    if (creatorScore) {

        creatorScore.textContent =
            score;
    }

    creatorBox.classList.remove(
        "hidden"
    );
}


function hideCreatorChallengeMessage() {

    const creatorBox =
        document.getElementById(
            "challengeCreatorBox"
        );

    if (creatorBox) {

        creatorBox.classList.add(
            "hidden"
        );
    }
}


/* =========================================================
   READ CHALLENGE FROM URL
========================================================= */

function readChallengeFromURL() {

    const hash =
        window.location.hash;

    if (
        !hash ||
        !hash.startsWith(
            "#challenge="
        )
    ) {
        return;
    }

    const value =
        decodeURIComponent(
            hash.replace(
                "#challenge=",
                ""
            )
        );

    const target =
        Number(value);

    if (
        Number.isFinite(target) &&
        target >= 0
    ) {

        challengeTarget =
            Math.floor(target);

        challengeActive =
            true;

        if (challengeTargetScore) {

            challengeTargetScore.textContent =
                challengeTarget;
        }

        if (challengeModal) {

            challengeModal.classList.remove(
                "hidden"
            );
        }
    }
}


/* =========================================================
   ACCEPT CHALLENGE
========================================================= */

function acceptChallenge() {

    if (
        challengeTarget === null
    ) {
        return;
    }

    challengeActive = true;

    if (challengeModal) {

        challengeModal.classList.add(
            "hidden"
        );
    }

    initAudio();

    showChallengeBanner();

    startGame(
        "classic"
    );
}


/* =========================================================
   DECLINE CHALLENGE
========================================================= */

function declineChallenge() {

    challengeActive = false;

    challengeTarget = null;

    if (challengeModal) {

        challengeModal.classList.add(
            "hidden"
        );
    }

    showToast(
        "🧠",
        "No worries. You can play normally."
    );
}


/* =========================================================
   CHALLENGE BANNER
========================================================= */

function showChallengeBanner() {

    if (!challengeBanner) {
        return;
    }

    if (
        challengeTarget === null ||
        !challengeActive
    ) {

        challengeBanner.innerHTML =
            "";

        return;
    }

    challengeBanner.innerHTML = `
        <div class="challenge-banner">
            ⚔️ BEAT ${challengeTarget} TO WIN THE CHALLENGE
        </div>
    `;
}


/* =========================================================
   CHALLENGE RESULT
========================================================= */

function updateChallengeResult() {

    if (!challengeResultBox) {
        return;
    }

    challengeResultBox.innerHTML =
        "";

    if (
        challengeTarget === null ||
        !challengeActive
    ) {
        return;
    }

    let className =
        "draw";

    let title =
        "IT'S A DRAW!";

    let message =
        `You matched the challenge score of ${challengeTarget}.`;

    if (
        score >
        challengeTarget
    ) {

        className =
            "win";

        title =
            "YOU BEAT THE CHALLENGE! 🏆";

        message =
            `You scored ${score} — ${score - challengeTarget} point(s) higher.`;

    } else if (
        score <
        challengeTarget
    ) {

        className =
            "lose";

        title =
            "THE CHALLENGE SURVIVES! 😏";

        message =
            `You need ${challengeTarget - score} more point(s) to beat it.`;
    }

    challengeResultBox.innerHTML = `
        <div class="challenge-result ${className}">
            <strong>${title}</strong>
            <span>${message}</span>
        </div>
    `;
}


/* =========================================================
   SHARE SCORE
========================================================= */

async function shareScore() {

    const text =
        `🧠 I scored ${score} on Brain Battle in 60 seconds. Can you beat me? ⚡`;

    if (
        navigator.share &&
        typeof navigator.share ===
            "function"
    ) {

        try {

            await navigator.share({
                title:
                    "Brain Battle",
                text,
                url:
                    window.location.href
                        .split("#")[0]
            });

            showToast(
                "✓",
                "Score shared!"
            );

            return;

        } catch (error) {

            if (
                error &&
                error.name ===
                    "AbortError"
            ) {

                return;
            }
        }
    }

    await copyText(text);

    showToast(
        "✓",
        "Score copied!"
    );
}


/* =========================================================
   SHARE CHALLENGE
========================================================= */

async function shareChallenge() {

    const text =
        getChallengeText();

    const url =
        getChallengeURL();

    if (
        navigator.share &&
        typeof navigator.share ===
            "function"
    ) {

        try {

            await navigator.share({
                title:
                    "Brain Battle Challenge",
                text:
                    `🧠 I scored ${score}. Can you beat me? 😏⚡`,
                url
            });

            showToast(
                "⚔️",
                "Challenge shared!"
            );

            return;

        } catch (error) {

            if (
                error &&
                error.name ===
                    "AbortError"
            ) {

                return;
            }
        }
    }

    await copyText(text);

    showToast(
        "⚔️",
        "Challenge link copied!"
    );
}


/* =========================================================
   COPY TEXT
========================================================= */

async function copyText(text) {

    try {

        if (
            navigator.clipboard &&
            navigator.clipboard.writeText
        ) {

            await navigator.clipboard.writeText(
                text
            );

            return true;
        }

    } catch (error) {

        console.warn(
            "Clipboard API failed.",
            error
        );
    }

    const textarea =
        document.createElement(
            "textarea"
        );

    textarea.value =
        text;

    textarea.style.position =
        "fixed";

    textarea.style.opacity =
        "0";

    document.body.appendChild(
        textarea
    );

    textarea.select();

    try {

        document.execCommand(
            "copy"
        );

    } catch (copyError) {

        console.warn(
            "Could not copy text.",
            copyError
        );
    }

    textarea.remove();

    return true;
}


/* =========================================================
   COPY CHALLENGE BUTTON
========================================================= */

async function copyChallenge() {

    const text =
        getChallengeText();

    await copyText(text);

    showToast(
        "⚔️",
        "Challenge link copied!"
    );
}


/* =========================================================
   TOAST
========================================================= */

function showToast(
    icon,
    message
) {

    if (!toast) {
        return;
    }

    clearTimeout(
        toastTimeout
    );

    if (toastIcon) {

        toastIcon.textContent =
            icon;
    }

    if (toastMessage) {

        toastMessage.textContent =
            message;
    }

    toast.classList.add(
        "show"
    );

    toastTimeout =
        setTimeout(() => {

            toast.classList.remove(
                "show"
            );

        }, 2600);
}


/* =========================================================
   BUTTON EVENTS
========================================================= */

if (startBtn) {

    startBtn.addEventListener(
        "click",
        () => {
            initAudio();
            startGame("classic");
        }
    );
}


if (progressBtn) {

    progressBtn.addEventListener(
        "click",
        () =>
            showScreen(
                "progressScreen"
            )
    );
}


if (dailyBtn) {

    dailyBtn.addEventListener(
        "click",
        () =>
            showScreen(
                "dailyScreen"
            )
    );
}


if (startDailyBtn) {

    startDailyBtn.addEventListener(
        "click",
        () => {
            initAudio();
            startGame("daily");
        }
    );
}


if (achievementsBtn) {

    achievementsBtn.addEventListener(
        "click",
        () =>
            showScreen(
                "achievementsScreen"
            )
    );
}


if (levelsHomeBtn) {

    levelsHomeBtn.addEventListener(
        "click",
        () =>
            showScreen(
                "progressScreen"
            )
    );
}


if (soundToggleBtn) {

    soundToggleBtn.addEventListener(
        "click",
        toggleSound
    );
}


if (challengeHomeBtn) {

    challengeHomeBtn.addEventListener(
        "click",
        () => {

            if (
                player.best <= 0
            ) {

                showToast(
                    "🧠",
                    "Play a game first to create your challenge."
                );

                return;
            }

            challengeTarget =
                player.best;

            challengeActive =
                true;

            score =
                player.best;

            showScreen(
                "resultScreen"
            );

            finalScore.textContent =
                player.best;

            showCreatorChallengeMessage();

            showToast(
                "⚔️",
                "Challenge ready! Send the link to a friend."
            );
        }
    );
}


if (playAgainBtn) {

    playAgainBtn.addEventListener(
        "click",
        () => {

            hideCreatorChallengeMessage();

            if (
                challengeActive
            ) {

                startGame(
                    "classic"
                );

            } else {

                startGame(
                    currentMode
                );
            }
        }
    );
}


if (resultHomeBtn) {

    resultHomeBtn.addEventListener(
        "click",
        () => {

            clearChallenge();

            hideCreatorChallengeMessage();

            showScreen(
                "homeScreen"
            );
        }
    );
}


if (shareBtn) {

    shareBtn.addEventListener(
        "click",
        shareScore
    );
}


if (copyChallengeBtn) {

    copyChallengeBtn.addEventListener(
        "click",
        copyChallenge
    );
}


if (levelUpClose) {

    levelUpClose.addEventListener(
        "click",
        () => {

            levelUpModal.classList.add(
                "hidden"
            );

            updateAllUI();
        }
    );
}


if (acceptChallengeBtn) {

    acceptChallengeBtn.addEventListener(
        "click",
        acceptChallenge
    );
}


if (declineChallengeBtn) {

    declineChallengeBtn.addEventListener(
        "click",
        declineChallenge
    );
}


/* =========================================================
   ANSWER BUTTON EVENTS
========================================================= */

answerButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            () =>
                handleAnswer(
                    button
                )
        );
    }
);


/* =========================================================
   BACK BUTTONS
========================================================= */

document
    .querySelectorAll(
        ".back-btn"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const backScreen =
                    button.dataset.back ||
                    "homeScreen";

                showScreen(
                    backScreen
                );
            }
        );
    });


/* =========================================================
   ESCAPE KEY
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key !==
            "Escape"
        ) {
            return;
        }

        if (
            levelUpModal &&
            !levelUpModal.classList.contains(
                "hidden"
            )
        ) {

            levelUpModal.classList.add(
                "hidden"
            );

            return;
        }

        if (
            challengeModal &&
            !challengeModal.classList.contains(
                "hidden"
            )
        ) {

            declineChallenge();
        }
    }
);


/* =========================================================
   PAGE VISIBILITY
========================================================= */

document.addEventListener(
    "visibilitychange",
    () => {

        /*
         * The timer uses Date.now(),
         * so leaving the tab does not
         * pause the game.
         */
    }
);


/* =========================================================
   PREVENT ACCIDENTAL PAGE EXIT
========================================================= */

window.addEventListener(
    "beforeunload",
    event => {

        if (!gameRunning) {
            return;
        }

        event.preventDefault();

        event.returnValue =
            "";
    }
);


/* =========================================================
   CHALLENGE RESULT CLEANUP
========================================================= */

function clearChallenge() {

    challengeActive =
        false;

    challengeTarget =
        null;

    if (challengeBanner) {

        challengeBanner.innerHTML =
            "";
    }

    if (challengeResultBox) {

        challengeResultBox.innerHTML =
            "";
    }

    hideCreatorChallengeMessage();
}


/* =========================================================
   INITIALIZE
========================================================= */

updateAllUI();

loadQuestions();

readChallengeFromURL();

console.log(
    "🧠 Brain Battle initialized."
);

console.log(
    "Player:",
    player
);