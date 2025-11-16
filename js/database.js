// ==========================================
// DATABASE FUNCTIONS
// ==========================================
// Note: Global variables are in globals.js

async function loadUserProfile(uid) {
    try {
        const snapshot = await firebase.database().ref('users/' + uid + '/profile').once('value');

        if (snapshot.exists()) {
            const profile = snapshot.val();
            currentUser = {
                uid: uid,
                ...profile
            };

            // Update UI
            document.getElementById('userName').textContent = profile.name || 'Student';
            document.getElementById('userGrade').textContent = profile.grade || '1';
            document.getElementById('gemsDisplay').textContent = profile.gems || '0';
            document.getElementById('selectedGrade').textContent = 'Grade ' + profile.grade;

            // Check if can claim reward
            if (profile.gems >= 1000) {
                document.getElementById('claimRewardContainer').style.display = 'block';
            }

            console.log('✓ User profile loaded:', profile);
            return true;
        } else {
            console.error('✗ No profile found for user:', uid);
            showError('Error loading user profile');
            return false;
        }

    } catch (error) {
        console.error('✗ Error loading profile:', error);
        showError('Error loading profile: ' + error.message);
        return false;
    }
}

async function logUserLogin(uid, userType = 'student') {
    try {
        const loginId = 'login_' + Date.now();
        const loginData = {
            timestamp: Date.now(),
            date: new Date().toLocaleString(),
            userType: userType,
            deviceInfo: navigator.userAgent.substring(0, 100)
        };

        await firebase.database().ref('users/' + uid + '/loginHistory/' + loginId).set(loginData);
        console.log('✓ Login logged successfully');
        return true;
    } catch (error) {
        console.error('✗ Error logging login:', error);
        return false;
    }
}

async function logTestCompletion(testData) {
    if (!currentUser) {
        console.error('✗ No user logged in');
        return false;
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
        await firebase.database().ref('users/' + currentUser.uid + '/testLogs/' + testId).set(logEntry);

        // Update gems
        const newGems = currentUser.gems + (testData.gemsEarned || 0);
        await firebase.database().ref('users/' + currentUser.uid + '/profile/gems').set(newGems);

        // Update local state
        currentUser.gems = newGems;
        document.getElementById('gemsDisplay').textContent = newGems;

        // Check if can claim reward
        if (newGems >= 1000) {
            document.getElementById('claimRewardContainer').style.display = 'block';
        }

        console.log('✓ Test logged and gems updated:', logEntry);
        return true;

    } catch (error) {
        console.error('✗ Error logging test:', error);
        return false;
    }
}

async function claimReward() {
    if (!currentUser || currentUser.gems < 1000) {
        alert('You need at least 1000 gems to claim a reward');
        return false;
    }

    try {
        await firebase.database().ref('users/' + currentUser.uid + '/profile/gems').set(0);

        currentUser.gems = 0;
        document.getElementById('gemsDisplay').textContent = '0';
        document.getElementById('claimRewardContainer').style.display = 'none';

        alert('🎉 Congratulations! You claimed your reward! Your gems have been reset.');
        return true;

    } catch (error) {
        console.error('✗ Error claiming reward:', error);
        alert('Error claiming reward: ' + error.message);
        return false;
    }
}

async function updateGems(gemsToAdd) {
    if (!currentUser) {
        console.warn('⚠ No user logged in, skipping gem update');
        return false;
    }

    try {
        const newGems = currentUser.gems + gemsToAdd;
        await firebase.database().ref('users/' + currentUser.uid + '/profile/gems').set(newGems);

        currentUser.gems = newGems;
        document.getElementById('gemsDisplay').textContent = newGems;

        if (newGems >= 1000) {
            document.getElementById('claimRewardContainer').style.display = 'block';
        }

        return true;

    } catch (error) {
        console.error('✗ Error updating gems:', error);
        return false;
    }
}
