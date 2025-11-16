/ ==========================================
// AUTHENTICATION FUNCTIONS
// ==========================================

async function handleStudentSignup() {
    const name = document.getElementById('signupName').value.trim();
    const grade = parseInt(document.getElementById('signupGrade').value);
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;

    if (!name || !grade || !email || !password) {
        showError('Please fill all fields');
        return;
    }

    if (password.length < 6) {
        showError('Password must be at least 6 characters');
        return;
    }

    showLoading(true);

    try {
        // Create user in Firebase Auth
        const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;

        console.log('✓ User created:', user.uid);

        // Save profile to database
        await firebase.database().ref('users/' + user.uid).set({
            profile: {
                name: name,
                grade: grade,
                email: email,
                gems: 50,
                createdAt: Date.now()
            },
            loginHistory: {},
            testLogs: {},
            completedSets: {}
        });

        console.log('✓ Profile created in database');

        showLoading(false);
        showError('Registration successful! Please log in.', 'success');
        
        // Clear form
        document.getElementById('signupName').value = '';
        document.getElementById('signupGrade').value = '';
        document.getElementById('signupEmail').value = '';
        document.getElementById('signupPassword').value = '';
        
        // Switch to login
        switchTab('student-login');

    } catch (error) {
        showLoading(false);
        console.error('✗ Signup error:', error);
        
        if (error.code === 'auth/email-already-in-use') {
            showError('Email already in use');
        } else if (error.code === 'auth/weak-password') {
            showError('Password is too weak');
        } else {
            showError('Signup error: ' + error.message);
        }
    }
}

async function handleStudentLogin() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) {
        showError('Please enter email and password');
        return;
    }

    showLoading(true);

    try {
        const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
        const user = userCredential.user;

        console.log('✓ Student login successful:', user.uid);

        // Log the login
        await logUserLogin(user.uid, 'student');

        // Load user profile
        const profileLoaded = await loadUserProfile(user.uid);
        
        if (!profileLoaded) {
            showLoading(false);
            showError('Could not load user profile');
            await firebase.auth().signOut();
            return;
        }

        // Load word data from Google Sheets
        console.log('Loading word data...');
        const dataLoadSuccess = await loadWordData();
        
        if (!dataLoadSuccess) {
            console.warn('⚠ Warning: Word data may not have loaded');
        }

        showLoading(false);

        // Show student dashboard
        document.getElementById('authContainer').classList.remove('active');
        document.getElementById('studentDashboard').classList.add('active');

        // Initialize app
        await initializeApp();

    } catch (error) {
        showLoading(false);
        console.error('✗ Login error:', error);
        
        if (error.code === 'auth/user-not-found') {
            showError('User not found');
        } else if (error.code === 'auth/wrong-password') {
            showError('Wrong password');
        } else {
            showError('Login error: ' + error.message);
        }
    }
}

async function handleAdminLogin() {
    const email = document.getElementById('adminEmail').value.trim();
    const password = document.getElementById('adminPassword').value;

    if (!email || !password) {
        showError('Please enter email and password');
        return;
    }

    showLoading(true);

    try {
        const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
        const user = userCredential.user;

        console.log('Checking admin status for:', email);

        // Check if admin
        const adminSnapshot = await firebase.database().ref('admins/' + email).once('value');
        
        if (!adminSnapshot.exists() || adminSnapshot.val() !== true) {
            showLoading(false);
            await firebase.auth().signOut();
            showError('Access denied. This account is not an admin.');
            return;
        }

        console.log('✓ Admin login successful:', email);

        // Log admin login
        await logUserLogin(user.uid, 'admin');

        showLoading(false);

        // Show admin dashboard
        document.getElementById('authContainer').classList.remove('active');
        document.getElementById('adminDashboard').classList.add('active');

        // Load admin data
        await loadAdminData();

    } catch (error) {
        showLoading(false);
        console.error('✗ Admin login error:', error);
        
        if (error.code === 'auth/user-not-found') {
            showError('Admin not found');
        } else if (error.code === 'auth/wrong-password') {
            showError('Wrong password');
        } else {
            showError('Login error: ' + error.message);
        }
    }
}

async function handleLogout() {
    try {
        await firebase.auth().signOut();
        
        // Reset UI
        document.getElementById('authContainer').classList.add('active');
        document.getElementById('studentDashboard').classList.remove('active');
        document.getElementById('adminDashboard').classList.remove('active');
        
        // Clear forms
        document.getElementById('loginEmail').value = '';
        document.getElementById('loginPassword').value = '';
        document.getElementById('adminEmail').value = '';
        document.getElementById('adminPassword').value = '';
        
        console.log('✓ Logged out successfully');
    } catch (error) {
        console.error('✗ Logout error:', error);
    }
}

// TAB SWITCHING
function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });

    // Remove active from all buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Show selected tab
    document.getElementById(tabName).classList.add('active');

    // Mark button as active
    const button = document.querySelector(`[data-tab="${tabName}"]`);
    if (button) {
        button.classList.add('active');
    }

    // Clear error message
    const errorDiv = document.getElementById('authError');
    if (errorDiv) {
        errorDiv.classList.remove('show');
    }
}

// Setup tab listeners
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            switchTab(e.target.dataset.tab);
        });
    });
});
