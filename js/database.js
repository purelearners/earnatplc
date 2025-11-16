// Global Variables
let currentUser = null;
let allWordsData = [];
let subjectsByGrade = {};

// Load user profile from database
async function loadUserProfile(uid) {
    try {
        const snapshot = await db.ref('users/' + uid + '/profile').once('value');

        if (snapshot.exists()) {
            const profile = snapshot.val();
            currentUser = {
                uid: uid,
                ...profile
            };

            // Update UI
            document.getElementById('userName').textContent = profile.name;
            document.getElementById('userGrade').textContent = profile.grade;
            document.getElementById('gemsDisplay').textContent = profile.gems;
            document.getElementById('selectedGrade').textContent = 'Grade ' + profile.grade;

            // Check if can claim reward
            if (profile.gems >= 1000) {
                document.getElementById('claimRewardContainer').style.display = 'block';
            }

            console.log('User profile loaded:', profile);
            return true;
        } else {
            console.error('No profile found');
            showError('Error loading user profile');
            return false;
        }

    } catch (error) {
        console.error('Error loading profile:', error);
        showError('Error loading profile: ' + error.message);
        return false;
    }
}

// Log user login
async function logUserLogin(uid, userType = 'student') {
    try {
        const loginId = 'login_' + Date.now();
        const loginData = {
            timestamp: Date.now(),
            date: new Date().toLocaleString(),
            userType: userType,
            deviceInfo: navigator.userAgent.substring(0, 100)
        };

        await db.ref('users/' + uid + '/loginHistory/' + loginId).set(loginData);
        console.log('Login logged successfully');
    } catch (error) {
        console.error('Error logging login:', error);
    }
}

// Log test completion
async function logTestCompletion(testData) {
    if (!currentUser) {
        console.error('No user logged in');
        return;
    }

    try {
        const testId = `test_${testData.subject}_Grade${testData.grade}_Set${testData.setId}_${Date.now()}`;

        const logEntry = {
            subject: testData.subject,
            grade: testData.grade,
            setId: testData.setId,
            timestamp: Date.now(),
            date: new Date().toLocaleString(),
            totalQuestions: testData.totalQuestions,
            correctAnswers: testData.correctAnswers,
            errors: testData.errors,
            errorDetails: testData.errorDetails || [],
            timeTaken: testData.timeTaken,
            gemsEarned: testData.gemsEarned,
            mode: testData.mode
        };

        // Save test log
        await db.ref('users/' + currentUser.uid + '/testLogs/' + testId).set(logEntry);

        // Update gems
        const newGems = currentUser.gems + (testData.gemsEarned || 0);
        await db.ref('users/' + currentUser.uid + '/profile/gems').set(newGems);

        // Update local state
        currentUser.gems = newGems;
        document.getElementById('gemsDisplay').textContent = newGems;

        // Check if can claim reward
        if (newGems >= 1000) {
            document.getElementById('claimRewardContainer').style.display = 'block';
        }

        console.log('Test logged and gems updated:', logEntry);

    } catch (error) {
        console.error('Error logging test:', error);
    }
}

// Claim reward
async function claimReward() {
    if (currentUser.gems < 1000) {
        alert('You need at least 1000 gems to claim a reward');
        return;
    }

    try {
        // Reset gems to 0
        await db.ref('users/' + currentUser.uid + '/profile/gems').set(0);

        currentUser.gems = 0;
        document.getElementById('gemsDisplay').textContent = '0';
        document.getElementById('claimRewardContainer').style.display = 'none';

        alert('🎉 Congratulations! You claimed your reward! Your gems have been reset.');

    } catch (error) {
        console.error('Error claiming reward:', error);
        alert('Error claiming reward: ' + error.message);
    }
}

// Update gems
async function updateGems(gemsToAdd) {
    if (!currentUser) return;

    try {
        const newGems = currentUser.gems + gemsToAdd;
        await db.ref('users/' + currentUser.uid + '/profile/gems').set(newGems);

        currentUser.gems = newGems;
        document.getElementById('gemsDisplay').textContent = newGems;

        if (newGems >= 1000) {
            document.getElementById('claimRewardContainer').style.display = 'block';
        }

    } catch (error) {
        console.error('Error updating gems:', error);
    }
}