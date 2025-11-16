// Admin Dashboard Functions
async function loadAdminData() {
    try {
        showLoading(true);

        // Get all users
        const usersSnapshot = await db.ref('users').once('value');
        const users = usersSnapshot.val() || {};

        const userList = Object.keys(users).map(uid => ({
            uid: uid,
            ...users[uid].profile,
            testCount: Object.keys(users[uid].testLogs || {}).length,
            loginCount: Object.keys(users[uid].loginHistory || {}).length
        }));

        // Update stats
        document.getElementById('totalStudents').textContent = userList.length;
        
        // Today's logins
        const today = new Date().toDateString();
        let todayLogins = 0;
        Object.values(users).forEach(user => {
            Object.values(user.loginHistory || {}).forEach(login => {
                const loginDate = new Date(login.date).toDateString();
                if (loginDate === today) todayLogins++;
            });
        });
        document.getElementById('todayLogins').textContent = todayLogins;

        // Total tests
        let totalTests = 0;
        Object.values(users).forEach(user => {
            totalTests += Object.keys(user.testLogs || {}).length;
        });
        document.getElementById('totalTests').textContent = totalTests;

        // Average gems
        const totalGems = userList.reduce((sum, user) => sum + (user.gems || 0), 0);
        const avgGems = userList.length > 0 ? Math.round(totalGems / userList.length) : 0;
        document.getElementById('avgGems').textContent = avgGems;

        // Populate student list
        populateStudentsList(userList);

        // Populate log student select
        populateLogStudentSelect(userList);

        showLoading(false);

    } catch (error) {
        showLoading(false);
        console.error('Error loading admin data:', error);
    }
}

function populateStudentsList(students) {
    const container = document.getElementById('studentsList');
    container.innerHTML = '';

    students.forEach(student => {
        const card = document.createElement('div');
        card.className = 'student-card';
        card.innerHTML = `
            <div class="student-name">${student.name}</div>
            <div class="student-info">📧 ${student.email}</div>
            <div class="student-info">📅 Grade: ${student.grade}</div>
            <div class="student-info">💎 Gems: ${student.gems || 0}</div>
            <div class="student-info">✏️ Tests: ${student.testCount}</div>
            <div class="student-info">🔓 Logins: ${student.loginCount}</div>
            <span class="student-grade">Grade ${student.grade}</span>
        `;
        container.appendChild(card);
    });
}

function populateLogStudentSelect(students) {
    const select = document.getElementById('logStudentSelect');
    select.innerHTML = '<option value="">Select Student</option>';

    students.forEach(student => {
        const option = document.createElement('option');
        option.value = student.uid;
        option.textContent = `${student.name} (${student.email})`;
        select.appendChild(option);
    });
}

function filterStudents() {
    const search = document.getElementById('studentSearch').value.toLowerCase();
    const cards = document.querySelectorAll('.student-card');

    cards.forEach(card => {
        const name = card.querySelector('.student-name').textContent.toLowerCase();
        const email = Array.from(card.querySelectorAll('.student-info'))
            .find(info => info.textContent.includes('@'))
            .textContent.toLowerCase();

        if (name.includes(search) || email.includes(search)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

async function loadStudentLogs() {
    const studentUid = document.getElementById('logStudentSelect').value;

    if (!studentUid) {
        document.getElementById('logsList').innerHTML = '';
        return;
    }

    try {
        showLoading(true);

        // Get login history
        const loginSnapshot = await db.ref('users/' + studentUid + '/loginHistory').once('value');
        const logins = loginSnapshot.val() || {};

        // Get test logs
        const testSnapshot = await db.ref('users/' + studentUid + '/testLogs').once('value');
        const tests = testSnapshot.val() || {};

        const logsList = document.getElementById('logsList');
        logsList.innerHTML = '';

        // Display logins
        Object.values(logins).forEach(login => {
            const logItem = document.createElement('div');
            logItem.className = 'log-item';
            logItem.innerHTML = `
                <div class="log-title">🔓 Login</div>
                <div class="log-detail">${login.date}</div>
                <div class="log-detail">Device: ${login.deviceInfo.substring(0, 50)}...</div>
            `;
            logsList.appendChild(logItem);
        });

        // Display tests
        Object.values(tests).forEach(test => {
            const correctPercent = Math.round((test.correctAnswers / test.totalQuestions) * 100);
            const logItem = document.createElement('div');
            logItem.className = 'log-item';
            logItem.innerHTML = `
                <div class="log-title">✏️ ${test.subject} Test - Set ${test.setId + 1}</div>
                <div class="log-detail">Score: ${test.correctAnswers}/${test.totalQuestions} (${correctPercent}%)</div>
                <div class="log-detail">Errors: ${test.errors}</div>
                <div class="log-detail">Gems Earned: +${test.gemsEarned}</div>
                <div class="log-detail">${test.mode === 'test' ? '⏱️ Test Mode' : '📖 Practice Mode'}</div>
                ${test.errorDetails && test.errorDetails.length > 0 ? `
                    <div class="log-detail" style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #eee;">
                        Errors:<br>
                        ${test.errorDetails.map(err => `
                            Q${err.questionNum}: "${err.word}" → You wrote: "${err.userAnswer}"
                        `).join('<br>')}
                    </div>
                ` : ''}
                <div class="log-timestamp">${test.date}</div>
            `;
            logsList.appendChild(logItem);
        });

        showLoading(false);

    } catch (error) {
        showLoading(false);
        console.error('Error loading logs:', error);
    }
}

function switchAdminTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.classList.remove('active');
    });

    // Deactivate all buttons
    document.querySelectorAll('.admin-nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Show selected tab
    document.getElementById(tabName + '-tab').classList.add('active');

    // Mark button as active
    document.querySelector(`[onclick="switchAdminTab('${tabName}')"]`).classList.add('active');
}