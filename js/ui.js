// UI Helper Functions
function showError(message, type = 'error') {
    const errorDiv = document.getElementById('authError');
    errorDiv.textContent = message;
    errorDiv.classList.add('show');

    if (type === 'success') {
        errorDiv.style.background = '#e8f5e9';
        errorDiv.style.color = '#4caf50';
    } else {
        errorDiv.style.background = '#ffebee';
        errorDiv.style.color = '#f44336';
    }

    setTimeout(() => {
        errorDiv.classList.remove('show');
    }, 4000);
}

function showLoading(show) {
    const spinner = document.getElementById('loadingSpinner');
    if (show) {
        spinner.style.display = 'flex';
    } else {
        spinner.style.display = 'none';
    }
}