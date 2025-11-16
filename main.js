// Main initialization and event listeners

// Set grade selection to show subjects
document.addEventListener('DOMContentLoaded', () => {
    // Grade selection handler
    document.getElementById('gradeSelection').addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            currentGrade = currentUser.grade;
            document.getElementById('gradeSelection').classList.remove('active');
            document.getElementById('subjectSelection').classList.add('active');
            displaySubjects();
        }
    });

    console.log('Main app loaded');
});