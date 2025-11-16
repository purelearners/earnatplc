// Learning Module Functions
let currentMode = null;
let currentSubject = null;
let currentGrade = null;
let currentSetId = null;
let currentWords = [];
let currentWordIndex = 0;
let testTimer = null;
let testStartTime = null;
let testErrors = [];

// Initialize app
async function initializeApp() {
    try {
        console.log('Initializing learning app...');
        
        // Load word data
        loadWordData();
        
        // Show grade selection
        document.getElementById('gradeSelection').classList.add('active');
        document.getElementById('learningSection').classList.add('active');
        document.getElementById('practiceSection').style.display = 'none';

        console.log('App initialized');
    } catch (error) {
        console.error('Error initializing app:', error);
    }
}

// Start Spellathon
function startSpellathon() {
    document.getElementById('practiceSection').style.display = 'none';
    document.getElementById('learningSection').classList.add('active');
    document.getElementById('gradeSelection').classList.add('active');
}

// Back to dashboard
function backToDashboard() {
    document.getElementById('learningSection').classList.remove('active');
    document.getElementById('practiceSection').style.display = 'block';
    resetLearning();
}

// Display subjects
function displaySubjects() {
    const subjects = getSubjectsForGrade(currentGrade);
    const subjectList = document.getElementById('subjectList');
    subjectList.innerHTML = '';

    if (subjects.length === 0) {
        subjectList.innerHTML = '<p>No subjects available for this grade</p>';
        return;
    }

    subjects.forEach(subject => {
        const btn = document.createElement('button');
        btn.textContent = subject;
        btn.className = 'selection-btn';
        btn.onclick = () => selectSubject(subject);
        subjectList.appendChild(btn);
    });
}

// Select subject
function selectSubject(subject) {
    currentSubject = subject;
    document.getElementById('subjectSelection').classList.remove('active');
    document.getElementById('modeSelection').classList.add('active');
}

// Select mode
function selectMode(mode) {
    currentMode = mode;
    document.getElementById('modeSelection').classList.remove('active');
    displaySets();
}

// Display available sets
function displaySets() {
    const setCount = getSetCountForSubject(currentGrade, currentSubject);
    const setList = document.getElementById('setList');
    setList.innerHTML = '';

    if (setCount === 0) {
        setList.innerHTML = '<p>No word sets available</p>';
        return;
    }

    for (let i = 0; i < setCount; i++) {
        const btn = document.createElement('button');
        btn.textContent = `Set ${i + 1}`;
        btn.className = 'selection-btn';
        btn.onclick = () => selectSet(i);
        setList.appendChild(btn);
    }

    document.getElementById('setSelection').classList.add('active');
}

// Select set
function selectSet(setId) {
    currentSetId = setId;
    currentWords = getWordsForGradeAndSubject(currentGrade, currentSubject, setId);
    currentWordIndex = 0;
    testErrors = [];

    // Hide selection steps
    document.querySelectorAll('.selection-step').forEach(step => {
        step.classList.remove('active');
    });

    // Show learning view
    document.getElementById('learningView').classList.add('active');
    displayWord();
}

// Display current word
function displayWord() {
    if (currentWordIndex >= currentWords.length) {
        finishSet();
        return;
    }

    const word = currentWords[currentWordIndex];
    
    document.getElementById('currentWord').textContent = word.word;
    document.getElementById('wordMeaning').textContent = word.meaning;
    document.getElementById('wordIPA').textContent = 'IPA: ' + word.ipa;
    document.getElementById('progressIndicator').textContent = (currentWordIndex + 1) + '/' + currentWords.length;

    // Show appropriate input area
    if (currentMode === 'learn') {
        document.getElementById('practiceArea').classList.add('active');
        document.getElementById('testArea').classList.remove('active');
        document.getElementById('spellingInput').value = '';
        generateKeyboard('keyboard');
    } else if (currentMode === 'test') {
        document.getElementById('testArea').classList.add('active');
        document.getElementById('practiceArea').classList.remove('active');
        document.getElementById('testInput').value = '';
        generateKeyboard('testKeyboard');
        startTestTimer();
    }

    // Clear feedback
    document.getElementById('feedback').classList.remove('active');
    document.getElementById('spellingInput').focus();
}

// Generate QWERTY Keyboard
function generateKeyboard(containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    const layout = [
        ['Q','W','E','R','T','Y','U','I','O','P'],
        ['A','S','D','F','G','H','J','K','L'],
        ['Z','X','C','V','B','N','M']
    ];

    layout.forEach(row => {
        const rowDiv = document.createElement('div');
        rowDiv.style.display = 'grid';
        rowDiv.style.gridTemplateColumns = 'repeat(' + row.length + ', 1fr)';
        rowDiv.style.gap = '6px';
        rowDiv.style.marginBottom = '6px';

        row.forEach(letter => {
            const btn = document.createElement('button');
            btn.className = 'keyboard-key';
            btn.textContent = letter;
            btn.onclick = () => addLetter(letter, containerId);
            rowDiv.appendChild(btn);
        });

        container.appendChild(rowDiv);
    });

    // Backspace button
    const backspaceDiv = document.createElement('div');
    backspaceDiv.style.display = 'grid';
    backspaceDiv.style.gridTemplateColumns = '1fr';

    const backspaceBtn = document.createElement('button');
    backspaceBtn.className = 'keyboard-key keyboard-key-backspace';
    backspaceBtn.textContent = '⌫ Backspace';
    backspaceBtn.onclick = () => deleteLetter(containerId);
    
    backspaceDiv.appendChild(backspaceBtn);
    container.appendChild(backspaceDiv);
}

// Add letter
function addLetter(letter, inputType) {
    const inputId = inputType === 'keyboard' ? 'spellingInput' : 'testInput';
    const input = document.getElementById(inputId);
    input.value += letter;
}

// Delete letter
function deleteLetter(inputType) {
    const inputId = inputType === 'keyboard' ? 'spellingInput' : 'testInput';
    const input = document.getElementById(inputId);
    input.value = input.value.slice(0, -1);
}

// Check answer
function checkAnswer() {
    const userAnswer = document.getElementById('spellingInput').value.toLowerCase().trim();
    const correctAnswer = currentWords[currentWordIndex].word.toLowerCase();

    const isCorrect = userAnswer === correctAnswer;
    showFeedback(isCorrect);

    if (isCorrect) {
        updateGems(2); // +2 gems for practice
        setTimeout(() => nextWord(), 1500);
    }
}

// Test timer
function startTestTimer() {
    let timeLeft = 30;
    document.getElementById('testTimer').textContent = timeLeft;

    testTimer = setInterval(() => {
        timeLeft--;
        document.getElementById('testTimer').textContent = timeLeft;

        if (timeLeft <= 0) {
            clearInterval(testTimer);
            submitTestAnswer();
        }
    }, 1000);
}

// Submit test answer
function submitTestAnswer() {
    clearInterval(testTimer);

    const userAnswer = document.getElementById('testInput').value.toLowerCase().trim();
    const word = currentWords[currentWordIndex];
    const correctAnswer = word.word.toLowerCase();

    const isCorrect = userAnswer === correctAnswer;
    showFeedback(isCorrect);

    if (isCorrect) {
        updateGems(5); // +5 gems for test
    } else {
        testErrors.push({
            questionNum: currentWordIndex + 1,
            word: word.word,
            userAnswer: userAnswer || '(blank)',
            correctAnswer: correctAnswer,
            mistake: userAnswer === '' ? 'no_answer' : 'wrong_spelling'
        });
    }

    setTimeout(() => nextWord(), 1500);
}

// Show feedback
function showFeedback(isCorrect) {
    const feedback = document.getElementById('feedback');
    feedback.classList.add('active');

    if (isCorrect) {
        feedback.textContent = '✓ Correct!';
        feedback.className = 'feedback correct active';
    } else {
        const correctWord = currentWords[currentWordIndex].word;
        feedback.textContent = '✗ Incorrect. Correct spelling: ' + correctWord;
        feedback.className = 'feedback incorrect active';
    }
}

// Next word
function nextWord() {
    currentWordIndex++;
    displayWord();
}

// Finish set
async function finishSet() {
    const correctCount = currentWords.length - testErrors.length;
    const gemsEarned = currentMode === 'learn' ? correctCount * 2 : correctCount * 5;

    // Log test if in test mode
    if (currentMode === 'test') {
        await logTestCompletion({
            subject: currentSubject,
            grade: currentGrade,
            setId: currentSetId,
            totalQuestions: currentWords.length,
            correctAnswers: correctCount,
            errors: testErrors.length,
            errorDetails: testErrors,
            timeTaken: 0,
            gemsEarned: gemsEarned,
            mode: currentMode
        });
    }

    alert(`Set Complete! \nCorrect: ${correctCount}/${currentWords.length}\nGems Earned: +${gemsEarned}`);
    
    resetLearning();
    backToDashboard();
}

// Reset learning state
function resetLearning() {
    document.querySelectorAll('.selection-step').forEach(step => {
        step.classList.remove('active');
    });
    document.getElementById('learningView').classList.remove('active');
    currentMode = null;
    currentSubject = null;
    currentSetId = null;
    currentWords = [];
    currentWordIndex = 0;
    testErrors = [];
}

// Back to set selection
function backToSetSelection() {
    document.getElementById('learningView').classList.remove('active');
    document.getElementById('setSelection').classList.add('active');
}

// Audio playback (placeholder)
function playAudio(type) {
    const word = currentWords[currentWordIndex];
    const text = type === 'word' ? word.word : 
                 type === 'syllables' ? word.word :
                 word.word.split('').join(' ');
    
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.8;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
    }
}