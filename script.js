/* =========================================================
   BRAIN BATTLE — COMPLETE GAME ENGINE
   Clean rebuild matched to the current index.html
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

const playerLevel = document.getElementById("playerLevel");

const homeLevelLabel = document.getElementById("homeLevelLabel");
const homeLevelTitle = document.getElementById("homeLevelTitle");
const homeXPText = document.getElementById("homeXPText");
const homeXPBar = document.getElementById("homeXPBar");
const homeNextUnlock = document.getElementById("homeNextUnlock");

const progressLevelLabel = document.getElementById("progressLevelLabel");
const progressLevelTitle = document.getElementById("progressLevelTitle");
const progressXPText = document.getElementById("progressXPText");
const progressXPBar = document.getElementById("progressXPBar");
const progressNextUnlock = document.getElementById("progressNextUnlock");

const progressBest = document.getElementById("progressBest");
const progressBattles = document.getElementById("progressBattles");
const progressCorrect = document.getElementById("progressCorrect");
const progressStreak = document.getElementById("progressStreak");
const progressQuestions = document.getElementById("progressQuestions");

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

const challengeModal = document.getElementById("challengeModal");
const challengeTargetScore = document.getElementById("challengeTargetScore");
const acceptChallengeBtn = document.getElementById("acceptChallengeBtn");
const declineChallengeBtn = document.getElementById("declineChallengeBtn");

const challengeBanner = document.getElementById("challengeBanner");
const challengeResultBox = document.getElementById("challengeResultBox");

const challengeCreatorBox = document.getElementById("challengeCreatorBox");
const challengeCreatorText = document.getElementById("challengeCreatorText");

const answerButtons = document.querySelectorAll(".answer-btn");

const soundToggleBtn = document.getElementById("soundToggleBtn");


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

function loadPlayer() {

    try {

        const saved =
            localStorage.getItem("brainBattlePlayer");

        if (!saved) {
            return { ...DEFAULT_PLAYER };
        }

        return {
            ...DEFAULT_PLAYER,
            ...JSON.parse(saved)
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

let player = loadPlayer();


function savePlayer() {

    try {

        localStorage.setItem(
            "brainBattlePlayer",
            JSON.stringify(player)
        );

    } catch (error) {

        console.warn(
            "Could not save player data.",
            error
        );
    }
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


/* =========================================================
   CHALLENGE VARIABLES
========================================================= */

let challengeTarget = null;
let challengeActive = false;

/*
 * creatorMode means:
 * "I am the person who created the challenge."
 *
 * challengeActive means:
 * "I am currently playing against somebody else's score."
 */
let creatorMode = false;


/* =========================================================
   AUDIO SYSTEM
========================================================= */

let audioContext = null;

let soundEnabled =
    localStorage.getItem("brainBattleSound") !== "off";


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
            audioContext.state === "suspended"
        ) {

            audioContext.resume();
        }

    } catch (error) {

        console.warn(
            "Audio initialization failed.",
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

        const startTime =
            audioContext.currentTime + delay;

        oscillator.type = type;
        oscillator.frequency.value = frequency;

        gain.gain.setValueAtTime(
            0,
            startTime
        );

        gain.gain.linearRampToValueAtTime(
            volume,
            startTime + 0.01
        );

        gain.gain.exponentialRampToValueAtTime(
            0.001,
            startTime + duration
        );

        oscillator.connect(gain);
        gain.connect(audioContext.destination);

        oscillator.start(startTime);

        oscillator.stop(
            startTime + duration + 0.02
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


function playComboSound(value) {

    if (value < 3) {
        return;
    }

    const base =
        Math.min(
            1200,
            500 + value * 45
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
            ? "🔊"
            : "🔇";

    soundToggleBtn.setAttribute(
        "aria-label",
        soundEnabled
            ? "Mute game sounds"
            : "Turn game sounds on"
    );

    soundToggleBtn.setAttribute(
        "title",
        soundEnabled
            ? "Mute game sounds"
            : "Turn game sounds on"
    );
}


function toggleSound() {

    soundEnabled =
        !soundEnabled;

    localStorage.setItem(
        "brainBattleSound",
        soundEnabled
            ? "on"
            : "off"
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

        if (questionText) {

            questionText.textContent =
                "Loading questions...";
        }

        const response =
            await fetch("questions.json");

        if (!response.ok) {

            throw new Error(
                `questions.json returned ${response.status}`
            );
        }

        const data =
            await response.json();

        if (!Array.isArray(data)) {

            throw new Error(
                "questions.json must contain an array."
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

        if (!questions.length) {

            throw new Error(
                "No valid questions found."
            );
        }

        console.log(
            `🧠 Loaded ${questions.length} questions.`
        );

        updateAllUI();

        /*
         * Check for an incoming challenge only
         * after the game has loaded.
         */
        readChallengeFromURL();

    } catch (error) {

        console.error(error);

        if (questionText) {

            questionText.textContent =
                "Could not load questions. Make sure questions.json is in the same folder.";
        }

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
        level >= 1 &&
        level <= LEVEL_NAMES.length
    ) {

        return LEVEL_NAMES[
            level - 1
        ];
    }

    return "LEGENDARY MIND";
}


function calculateLevelFromXP() {

    let remainingXP =
        Math.max(0, player.xp);

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


function getCurrentLevelXP() {

    let remainingXP =
        Math.max(0, player.xp);

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

    if (levelUpNumber) {

        levelUpNumber.textContent =
            level;
    }

    if (levelUpTitle) {

        levelUpTitle.textContent =
            getLevelTitle(level);
    }

    levelUpModal.classList.remove(
        "hidden"
    );

    playLevelUpSound();
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
   STREAK
========================================================= */

function updateStreak() {

    const today =
        dateKey();

    if (
        player.lastPlayedDate === today
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
   SHUFFLING
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
   PREPARE QUESTIONS
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

    return currentQuestions.length > 0;
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

    currentMode =
        mode;

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

    if (scoreElement) {
        scoreElement.textContent = "0";
    }

    if (comboElement) {
        comboElement.textContent = "0";
    }

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

    if (timerElement) {

        timerElement.textContent =
            GAME_TIME;
    }

    if (timerBox) {

        timerBox.classList.remove(
            "warning"
        );
    }

    if (gameProgressFill) {

        gameProgressFill.style.width =
            "100%";
    }

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

            if (timerElement) {

                timerElement.textContent =
                    currentSecond;
            }

            if (gameProgressFill) {

                gameProgressFill.style.width =
                    `${Math.max(
                        0,
                        (remaining / GAME_TIME) * 100
                    )}%`;
            }

            if (
                remaining <= 10
            ) {

                if (timerBox) {

                    timerBox.classList.add(
                        "warning"
                    );
                }

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

    if (questionText) {

        questionText.textContent =
            currentQuestion.question;
    }

    if (questionCategory) {

        questionCategory.textContent =
            currentQuestion.category ||
            "General";
    }

    if (questionNumber) {

        questionNumber.textContent =
            `Question ${currentQuestionIndex + 1}`;
    }

    const options =
        shuffleArray(
            currentQuestion.options.slice(0, 4)
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
                options[index];

            const answerText =
                button.querySelector(
                    ".answer-text"
                );

            if (answerText) {

                answerText.textContent =
                    options[index];
            }
        }
    );
}


/* =========================================================
   ANSWER
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

    const currentQuestion =
        currentQuestions[
            currentQuestionIndex
        ];

    const selectedAnswer =
        button.dataset.answer;

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

        bestComboThisGame =
            Math.max(
                bestComboThisGame,
                combo
            );

        player.bestCombo =
            Math.max(
                player.bestCombo,
                combo
            );

        player.correct++;

        if (scoreElement) {

            scoreElement.textContent =
                score;
        }

        if (comboElement) {

            comboElement.textContent =
                combo;
        }

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

        if (comboElement) {

            comboElement.textContent =
                "0";
        }

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

    if (timerBox) {

        timerBox.classList.remove(
            "warning"
        );
    }

    if (gameProgressFill) {

        gameProgressFill.style.width =
            "0%";
    }

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

    addXP(
        xpEarned
    );

    player.level =
        calculateLevelFromXP();

    if (isDailyGame) {

        player.dailyPlayedDate =
            dateKey();
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
        oldBest
    );
}


/* =========================================================
   XP
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
    oldBest
) {

    if (finalScore) {

        finalScore.textContent =
            score;
    }

    if (resultCorrect) {

        resultCorrect.textContent =
            correctAnswers;
    }

    if (resultAnswered) {

        resultAnswered.textContent =
            answeredQuestions;
    }

    if (resultBestCombo) {

        resultBestCombo.textContent =
            bestComboThisGame;
    }

    if (resultXP) {

        resultXP.textContent =
            `+${xpEarned}`;
    }

    if (newBest) {

        newBest.classList.toggle(
            "hidden",
            score <= oldBest
        );
    }

    if (resultIcon) {

        if (score >= 25) {

            resultIcon.textContent =
                "🔥";

        } else if (score >= 20) {

            resultIcon.textContent =
                "🧠";

        } else if (score >= 10) {

            resultIcon.textContent =
                "⚡";

        } else {

            resultIcon.textContent =
                "💪";
        }
    }

    if (resultMessage) {

        if (isDailyGame) {

            resultMessage.textContent =
                score >= 20
                    ? "You crushed today's game!"
                    : "Daily game complete!";

        } else if (score >= 25) {

            resultMessage.textContent =
                "Absolutely flying!";

        } else if (score >= 20) {

            resultMessage.textContent =
                "Sharp thinking!";

        } else if (score >= 10) {

            resultMessage.textContent =
                "Nice run!";

        } else {

            resultMessage.textContent =
                "Keep pushing!";
        }
    }

    /*
     * If this was a challenge received from
     * somebody else, compare the scores.
     */
    updateChallengeResult();

    /*
     * If the player is not creating a challenge,
     * return the normal result buttons.
     */
    if (!creatorMode) {

        if (shareBtn) {

            shareBtn.textContent =
                "📤 Share My Score";
        }

        if (copyChallengeBtn) {

            copyChallengeBtn.classList.add(
                "hidden"
            );
        }

        hideCreatorChallengeMessage();
    }

    showScreen(
        "resultScreen"
    );
}


/* =========================================================
   ACHIEVEMENTS
========================================================= */

const ACHIEVEMENTS = {

    first_game: {
        name: "First Battle",
        condition: () =>
            player.battles >= 1
    },

    double_digits: {
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

    combo5: {
        name: "Combo Master",
        condition: () =>
            player.bestCombo >= 5
    },

    level5: {
        name: "Level 5",
        condition: () =>
            player.level >= 5
    },

    level10: {
        name: "Genius",
        condition: () =>
            player.level >= 10
    },

    games25: {
        name: "Battle Veteran",
        condition: () =>
            player.battles >= 25
    }
};


function checkAchievements() {

    Object.keys(
        ACHIEVEMENTS
    ).forEach(id => {

        const achievement =
            ACHIEVEMENTS[id];

        if (
            achievement.condition() &&
            !player.achievements.includes(id)
        ) {

            player.achievements.push(id);

            showToast(
                "🏅",
                `Achievement unlocked: ${achievement.name}`
            );
        }
    });

    savePlayer();

    updateAchievementUI();
}


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
                player.achievements.includes(id);

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

    const requirements = {
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

            const title =
                card.querySelector(
                    "h3"
                );

            if (!status || !title) {
                return;
            }

            const name =
                title.textContent
                    .trim()
                    .toLowerCase();

            let mode =
                "classic";

            if (name.includes("hard")) {
                mode = "hard";
            } else if (name.includes("speed")) {
                mode = "speed";
            } else if (name.includes("genius")) {
                mode = "genius";
            } else if (name.includes("elite")) {
                mode = "elite";
            } else if (name.includes("legendary")) {
                mode = "legendary";
            }

            const requiredLevel =
                requirements[mode];

            const unlocked =
                player.level >= requiredLevel;

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

        dailyDate.textContent =
            new Date().toLocaleDateString(
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

        startDailyBtn.textContent =
            player.dailyPlayedDate === dateKey()
                ? "Play Daily Again"
                : "Start Daily Battle";
    }
}


/* =========================================================
   PLAYER UI
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
            (currentXP / requiredXP) * 100
        );

    const title =
        getLevelTitle(level);

    if (playerLevel) {

        playerLevel.textContent =
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

    if (homeLevelLabel) {

        homeLevelLabel.textContent =
            `LEVEL ${level}`;
    }

    if (homeLevelTitle) {

        homeLevelTitle.textContent =
            title;
    }

    if (homeXPText) {

        homeXPText.textContent =
            `${currentXP} / ${requiredXP} XP`;
    }

    if (homeXPBar) {

        homeXPBar.style.width =
            `${percentage}%`;
    }

    const nextUnlock =
        getNextUnlock();

    if (homeNextUnlock) {

        homeNextUnlock.textContent =
            nextUnlock
                ? `Next unlock: ${nextUnlock.name} at Level ${nextUnlock.level}.`
                : "You've unlocked every major mode. Keep climbing!";
    }

    if (progressLevelLabel) {

        progressLevelLabel.textContent =
            `LEVEL ${level}`;
    }

    if (progressLevelTitle) {

        progressLevelTitle.textContent =
            title;
    }

    if (progressXPText) {

        progressXPText.textContent =
            `${currentXP} / ${requiredXP} XP`;
    }

    if (progressXPBar) {

        progressXPBar.style.width =
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

    if (progressQuestions) {

        progressQuestions.textContent =
            player.totalQuestions;
    }

    if (progressNextUnlock) {

        progressNextUnlock.textContent =
            nextUnlock
                ? `Next unlock: ${nextUnlock.name} at Level ${nextUnlock.level}.`
                : "All major game modes unlocked.";
    }

    savePlayer();
}


function getNextUnlock() {

    const levels =
        Object.keys(
            LEVEL_UNLOCKS
        )
        .map(Number)
        .sort(
            (a, b) => a - b
        );

    for (
        const level of levels
    ) {

        if (
            player.level <
            level
        ) {

            return {
                level,
                name:
                    LEVEL_UNLOCKS[level]
            };
        }
    }

    return null;
}


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

/*
 * NEW CHALLENGE FORMAT:
 *
 * https://brain-battle-crrm.onrender.com/?challenge=18
 *
 * We also support the old:
 *
 * https://brain-battle-crrm.onrender.com/#challenge=18
 */


/* =========================================================
   CREATE CHALLENGE URL
========================================================= */

function createChallengeURL(target) {

    const cleanBase =
        window.location.href.split("#")[0].split("?")[0];

    return (
        `${cleanBase}?challenge=${encodeURIComponent(
            Math.floor(Number(target))
        )}`
    );
}


function getChallengeURL(target) {

    return createChallengeURL(target);
}


/* =========================================================
   CHALLENGE TEXT
========================================================= */

function getChallengeText(target) {

    const url =
        getChallengeURL(target);

    return (
        `🧠 I scored ${target} on Brain Battle in 60 seconds!\n\n` +
        `Can you beat me? 😏⚡\n\n` +
        `Play my challenge:\n` +
        `${url}`
    );
}


/* =========================================================
   READ INCOMING CHALLENGE
========================================================= */

function readChallengeFromURL() {

    let target = null;

    /*
     * First check the NEW format:
     *
     * ?challenge=18
     */
    try {

        const params =
            new URLSearchParams(
                window.location.search
            );

        if (
            params.has("challenge")
        ) {

            target =
                Number(
                    params.get("challenge")
                );
        }

    } catch (error) {

        console.warn(
            "Could not read challenge query.",
            error
        );
    }


    /*
     * If no new challenge was found,
     * check the OLD format:
     *
     * #challenge=18
     */
    if (
        target === null ||
        !Number.isFinite(target)
    ) {

        const hash =
            window.location.hash;

        if (
            hash.startsWith(
                "#challenge="
            )
        ) {

            try {

                target =
                    Number(
                        decodeURIComponent(
                            hash.substring(
                                "#challenge=".length
                            )
                        )
                    );

            } catch (error) {

                console.warn(
                    "Could not read old challenge link.",
                    error
                );
            }
        }
    }


    /*
     * No challenge in the URL.
     */
    if (
        target === null ||
        !Number.isFinite(target) ||
        target < 0
    ) {

        return;
    }


    /*
     * Valid incoming challenge.
     */
    challengeTarget =
        Math.floor(target);

    challengeActive =
        true;

    creatorMode =
        false;


    if (challengeTargetScore) {

        challengeTargetScore.textContent =
            challengeTarget;
    }


    if (challengeModal) {

        challengeModal.classList.remove(
            "hidden"
        );
    }

    console.log(
        "⚔️ Incoming challenge:",
        challengeTarget
    );
}


/* =========================================================
   ACCEPT CHALLENGE
========================================================= */

function acceptChallenge() {

    if (
        challengeTarget === null ||
        !Number.isFinite(challengeTarget)
    ) {

        return;
    }

    creatorMode =
        false;

    challengeActive =
        true;

    if (challengeModal) {

        challengeModal.classList.add(
            "hidden"
        );
    }

    /*
     * Remove the challenge parameter from
     * the address bar after accepting.
     *
     * The challengeTarget variable remains,
     * so the game still knows the target.
     */
    cleanChallengeURL();

    initAudio();

    showChallengeBanner();

    startGame("classic");
}


/* =========================================================
   DECLINE CHALLENGE
========================================================= */

function declineChallenge() {

    challengeActive =
        false;

    challengeTarget =
        null;

    creatorMode =
        false;

    if (challengeModal) {

        challengeModal.classList.add(
            "hidden"
        );
    }

    cleanChallengeURL();

    showChallengeBanner();

    showToast(
        "🧠",
        "No worries. You can play normally."
    );
}


/* =========================================================
   CLEAN CHALLENGE URL
========================================================= */

function cleanChallengeURL() {

    const cleanBase =
        window.location.href
            .split("#")[0]
            .split("?")[0];

    window.history.replaceState(
        {},
        document.title,
        cleanBase
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
        creatorMode ||
        !challengeActive ||
        challengeTarget === null
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
        creatorMode ||
        !challengeActive ||
        challengeTarget === null
    ) {

        challengeResultBox.classList.add(
            "hidden"
        );

        return;
    }

    challengeResultBox.classList.remove(
        "hidden"
    );

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
   CREATE CHALLENGE
========================================================= */

function createMyChallenge() {

    if (
        player.best <= 0
    ) {

        showToast(
            "🧠",
            "Play a game first to create your challenge."
        );

        return;
    }

    /*
     * IMPORTANT:
     *
     * You are creating the challenge.
     * You are NOT receiving one.
     */
    creatorMode =
        true;

    challengeActive =
        false;

    challengeTarget =
        null;

    score =
        player.best;

    if (finalScore) {

        finalScore.textContent =
            player.best;
    }

    if (resultCorrect) {

        resultCorrect.textContent =
            "—";
    }

    if (resultAnswered) {

        resultAnswered.textContent =
            "—";
    }

    if (resultBestCombo) {

        resultBestCombo.textContent =
            "—";
    }

    if (resultXP) {

        resultXP.textContent =
            "—";
    }

    if (newBest) {

        newBest.classList.add(
            "hidden"
        );
    }

    if (resultMessage) {

        resultMessage.textContent =
            "Ready to challenge someone?";
    }

    if (resultIcon) {

        resultIcon.textContent =
            "⚔️";
    }

    showScreen(
        "resultScreen"
    );

    showCreatorChallengeMessage();

    showToast(
        "⚔️",
        "Challenge ready! Send the link to a friend."
    );
}


/* =========================================================
   CREATOR MESSAGE
========================================================= */

function showCreatorChallengeMessage() {

    if (!challengeCreatorBox) {
        return;
    }

    challengeCreatorBox.classList.remove(
        "hidden"
    );

    if (challengeCreatorText) {

        challengeCreatorText.textContent =
            `You scored ${player.best} points. Send this challenge to a friend and see if they can beat you — or simply show them your score.`;
    }

    if (shareBtn) {

        shareBtn.textContent =
            "⚔️ Share Challenge";
    }

    if (copyChallengeBtn) {

        copyChallengeBtn.classList.remove(
            "hidden"
        );
    }

    /*
     * The normal "Share My Score" button becomes
     * the challenge-sharing button while creator mode
     * is active.
     */
}


/* =========================================================
   HIDE CREATOR MESSAGE
========================================================= */

function hideCreatorChallengeMessage() {

    if (challengeCreatorBox) {

        challengeCreatorBox.classList.add(
            "hidden"
        );
    }
}


/* =========================================================
   SHARE CHALLENGE
========================================================= */

async function shareChallenge() {

    const target =
        creatorMode
            ? player.best
            : challengeTarget;

    if (
        target === null ||
        !Number.isFinite(target)
    ) {

        return;
    }

    const url =
        getChallengeURL(target);

    const text =
        getChallengeText(target);

    if (
        navigator.share &&
        typeof navigator.share === "function"
    ) {

        try {

            await navigator.share({

                title:
                    "Brain Battle Challenge",

                text:
                    `🧠 I scored ${target} on Brain Battle. Can you beat me? 😏⚡`,

                url:
                    url
            });

            showToast(
                "⚔️",
                "Challenge shared!"
            );

            return;

        } catch (error) {

            /*
             * Closing the share sheet is not an error
             * that should show another toast.
             */
            if (
                error &&
                error.name === "AbortError"
            ) {

                return;
            }
        }
    }

    await copyText(
        text
    );

    showToast(
        "⚔️",
        "Challenge link copied!"
    );
}


/* =========================================================
   COPY CHALLENGE
========================================================= */

async function copyChallenge() {

    const target =
        creatorMode
            ? player.best
            : challengeTarget;

    if (
        target === null ||
        !Number.isFinite(target)
    ) {

        return;
    }

    const url =
        getChallengeURL(target);

    /*
     * Copy the actual link prominently.
     */
    await copyText(
        url
    );

    showToast(
        "🔗",
        "Challenge link copied!"
    );
}


/* =========================================================
   SHARE NORMAL SCORE
========================================================= */

async function shareScore() {

    /*
     * If the player is currently creating
     * a challenge, this button shares the challenge.
     */
    if (creatorMode) {

        await shareChallenge();

        return;
    }

    const text =
        `🧠 I scored ${score} on Brain Battle in 60 seconds. Can you beat me? ⚡`;

    if (
        navigator.share &&
        typeof navigator.share === "function"
    ) {

        try {

            await navigator.share({

                title:
                    "Brain Battle",

                text
            });

            showToast(
                "✓",
                "Score shared!"
            );

            return;

        } catch (error) {

            if (
                error &&
                error.name === "AbortError"
            ) {

                return;
            }
        }
    }

    await copyText(
        text
    );

    showToast(
        "✓",
        "Score copied!"
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

    textarea.style.left =
        "-9999px";

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

    } catch (error) {

        console.warn(
            "Fallback copy failed.",
            error
        );

        return false;

    } finally {

        textarea.remove();
    }

    return true;
}


/* =========================================================
   CLEAR CHALLENGE
========================================================= */

function clearChallenge() {

    challengeActive =
        false;

    challengeTarget =
        null;

    creatorMode =
        false;

    if (challengeModal) {

        challengeModal.classList.add(
            "hidden"
        );
    }

    if (challengeBanner) {

        challengeBanner.innerHTML =
            "";
    }

    if (challengeResultBox) {

        challengeResultBox.innerHTML =
            "";

        challengeResultBox.classList.add(
            "hidden"
        );
    }

    hideCreatorChallengeMessage();

    if (shareBtn) {

        shareBtn.textContent =
            "📤 Share My Score";
    }

    if (copyChallengeBtn) {

        copyChallengeBtn.classList.add(
            "hidden"
        );
    }

    cleanChallengeURL();
}


/* =========================================================
   TOAST
========================================================= */

let toastTimeout = null;


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

            /*
             * Starting a normal game from home
             * should not accidentally become an
             * incoming challenge.
             */
            clearChallenge();

            startGame(
                "classic"
            );
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

            /*
             * Daily game is a normal game,
             * not a friend challenge.
             */
            clearChallenge();

            startGame(
                "daily"
            );
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


/* =========================================================
   SOUND BUTTON
========================================================= */

if (soundToggleBtn) {

    soundToggleBtn.addEventListener(
        "click",
        toggleSound
    );
}


/* =========================================================
   CREATE CHALLENGE BUTTON
========================================================= */

if (challengeHomeBtn) {

    challengeHomeBtn.addEventListener(
        "click",
        createMyChallenge
    );
}


/* =========================================================
   PLAY AGAIN
========================================================= */

if (playAgainBtn) {

    playAgainBtn.addEventListener(
        "click",
        () => {

            hideCreatorChallengeMessage();

            /*
             * If this player accepted somebody else's
             * challenge, keep that challenge active.
             *
             * If this was a normal game or creator screen,
             * simply play normally.
             */
            if (
                challengeActive &&
                !creatorMode
            ) {

                startGame(
                    "classic"
                );

            } else {

                creatorMode =
                    false;

                startGame(
                    currentMode
                );
            }
        }
    );
}


/* =========================================================
   RESULT HOME
========================================================= */

if (resultHomeBtn) {

    resultHomeBtn.addEventListener(
        "click",
        () => {

            clearChallenge();

            showScreen(
                "homeScreen"
            );
        }
    );
}


/* =========================================================
   SHARE BUTTON
========================================================= */

if (shareBtn) {

    shareBtn.addEventListener(
        "click",
        shareScore
    );
}


/* =========================================================
   COPY CHALLENGE BUTTON
========================================================= */

if (copyChallengeBtn) {

    copyChallengeBtn.addEventListener(
        "click",
        copyChallenge
    );
}


/* =========================================================
   LEVEL UP CLOSE
========================================================= */

const levelUpCloseBtn =
    document.getElementById(
        "closeLevelUpBtn"
    );

if (levelUpCloseBtn) {

    levelUpCloseBtn.addEventListener(
        "click",
        () => {

            if (levelUpModal) {

                levelUpModal.classList.add(
                    "hidden"
                );
            }

            updateAllUI();
        }
    );
}


/* =========================================================
   ACCEPT CHALLENGE BUTTON
========================================================= */

if (acceptChallengeBtn) {

    acceptChallengeBtn.addEventListener(
        "click",
        acceptChallenge
    );
}


/* =========================================================
   DECLINE CHALLENGE BUTTON
========================================================= */

if (declineChallengeBtn) {

    declineChallengeBtn.addEventListener(
        "click",
        declineChallenge
    );
}


/* =========================================================
   ANSWER BUTTONS
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
   BRAND HOME
========================================================= */

const brandHome =
    document.getElementById(
        "brandHome"
    );

if (brandHome) {

    brandHome.addEventListener(
        "click",
        () => {

            if (gameRunning) {
                return;
            }

            clearChallenge();

            showScreen(
                "homeScreen"
            );
        }
    );
}


/* =========================================================
   ESCAPE KEY
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key !== "Escape"
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
   PREVENT ACCIDENTAL EXIT DURING GAME
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
   INITIALIZE
========================================================= */

updateAllUI();

loadQuestions();

console.log(
    "🧠 Brain Battle initialized."
);

console.log(
    "Player:",
    player
);

/* =========================================================
   BRAIN BATTLE — GOOGLE ANALYTICS EVENTS
   Added separately so the main game code stays untouched.
========================================================= */

(function () {

    // Make sure Google Analytics is available
    function bbTrack(eventName, parameters = {}) {
        if (typeof gtag === "function") {
            gtag("event", eventName, parameters);
        }
    }

    // -------------------------------------------------------
    // 1. GAME START
    // -------------------------------------------------------

    document.addEventListener("click", function (event) {

        if (event.target.closest("#startBtn")) {
            bbTrack("game_start");
        }

        // ---------------------------------------------------
        // 2. DAILY CHALLENGE START
        // ---------------------------------------------------

        if (event.target.closest("#startDailyBtn")) {
            bbTrack("daily_challenge_started");
        }

        // ---------------------------------------------------
        // 3. CHALLENGE ACCEPTED
        // ---------------------------------------------------

        if (event.target.closest("#acceptChallengeBtn")) {
            bbTrack("challenge_accepted");
        }

        // ---------------------------------------------------
        // 4. CHALLENGE CREATED
        // ---------------------------------------------------

        if (event.target.closest("#challengeHomeBtn")) {
            bbTrack("challenge_created");
        }

        // ---------------------------------------------------
        // 5. SHARE / COPY
        // ---------------------------------------------------

        if (
            event.target.closest("#shareBtn") ||
            event.target.closest("#copyChallengeBtn")
        ) {
            bbTrack("share_clicked");
        }

    });


    // -------------------------------------------------------
    // 6. CHALLENGE OPENED
    // -------------------------------------------------------

    const params = new URLSearchParams(window.location.search);
    const challengeScore = params.get("challenge");

    if (challengeScore !== null) {

        bbTrack("challenge_opened", {
            target_score: Number(challengeScore)
        });

    }


    // -------------------------------------------------------
    // 7. TRACK QUESTIONS ANSWERED
    // -------------------------------------------------------

    document.addEventListener("click", function (event) {

        const answerButton = event.target.closest(".answer-btn");

        if (!answerButton) return;

        bbTrack("question_answered");

    });


    // -------------------------------------------------------
    // 8. DETECT GAME COMPLETION
    // -------------------------------------------------------

    let gameStarted = false;
    let gameCompleted = false;

    document.addEventListener("click", function (event) {

        if (
            event.target.closest("#startBtn") ||
            event.target.closest("#playAgainBtn") ||
            event.target.closest("#acceptChallengeBtn")
        ) {

            gameStarted = true;
            gameCompleted = false;

        }

    });


    // Watch for the result screen appearing
    const resultScreen = document.querySelector("#resultScreen");

    if (resultScreen) {

        const observer = new MutationObserver(function () {

            const isVisible =
                !resultScreen.classList.contains("hidden") &&
                resultScreen.style.display !== "none";

            if (isVisible && gameStarted && !gameCompleted) {

                gameCompleted = true;

                const scoreElement =
                    document.querySelector("#finalScore");

                const score =
                    scoreElement
                        ? Number(scoreElement.textContent) || 0
                        : 0;

                bbTrack("game_complete", {
                    score: score
                });

            }

        });

        observer.observe(resultScreen, {
            attributes: true,
            attributeFilter: ["class", "style"]
        });

    }


    // -------------------------------------------------------
    // 9. GAME ABANDONED
    // -------------------------------------------------------

    window.addEventListener("beforeunload", function () {

        if (gameStarted && !gameCompleted) {

            bbTrack("game_abandoned");

        }

    });


    console.log("🧠 Brain Battle Analytics loaded.");

})();