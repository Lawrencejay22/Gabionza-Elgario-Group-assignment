// --- DOM Elements (common to both sign-in and register forms) ---
const messageModalOverlay = document.getElementById('message-modal-overlay');
const messageModalTitle = document.getElementById('message-modal-title');
const messageModalBody = document.getElementById('message-modal-body');
const messageModalCloseBtn = document.getElementById('message-modal-close-btn');

// --- Show/Hide Password functionality ---
function togglePasswordVisibility(passwordInputId, checkboxId) {
    const passwordInput = document.getElementById(passwordInputId);
    const checkbox = document.getElementById(checkboxId);
    if (passwordInput && checkbox) {
        checkbox.addEventListener('change', () => {
            passwordInput.type = checkbox.checked ? 'text' : 'password';
        });
    }
}

// --- Message Modal Functions ---
function showMessageModal(title, message, type = 'info') {
    if (!messageModalOverlay || !messageModalTitle || !messageModalBody || !messageModalCloseBtn) {
        console.error("Message modal elements not found. Cannot display message box.");
        return;
    }
    messageModalTitle.textContent = title;
    messageModalBody.textContent = message;
    messageModalTitle.style.color = '';
    if (type === 'success') {
        messageModalTitle.style.color = '#388e3c';
    } else if (type === 'error') {
        messageModalTitle.style.color = '#d32f2f';
    } else {
        messageModalTitle.style.color = '#1976d2';
    }
    messageModalOverlay.classList.remove('hidden');
    const messageModalContent = messageModalOverlay.querySelector('.modal-content');
    if (messageModalContent) {
        setTimeout(() => {
            messageModalContent.classList.remove('opacity-0', 'scale-95');
            messageModalContent.classList.add('opacity-100', 'scale-100');
        }, 10);
    }
}

function hideMessageModal() {
    const messageModalContent = messageModalOverlay.querySelector('.modal-content');
    if (messageModalOverlay && messageModalContent) {
        messageModalContent.classList.remove('opacity-100', 'scale-100');
        messageModalContent.classList.add('opacity-0', 'scale-95');
        setTimeout(() => {
            messageModalOverlay.classList.add('hidden');
        }, 300);
    }
}

// --- Main Entry Point: Initialize all functionality when the DOM is ready ---
document.addEventListener('DOMContentLoaded', () => {
    // --- Form Switch Logic ---
    const switchButtons = document.querySelectorAll('.form-switch-btn');
    switchButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = button.dataset.target;
            document.getElementById('signin-form-container').style.display = 'none';
            document.getElementById('register-form-container').style.display = 'none';
            document.getElementById(targetId).style.display = 'block';
        });
    });

    // --- Message Modal Events ---
    if (messageModalCloseBtn) {
        messageModalCloseBtn.addEventListener('click', hideMessageModal);
    }
    if (messageModalOverlay) {
        messageModalOverlay.addEventListener('click', (event) => {
            if (event.target === messageModalOverlay) {
                hideMessageModal();
            }
        });
    }

    // --- Password Visibility Toggles ---
    togglePasswordVisibility('password', 'show-signin-password');
    togglePasswordVisibility('create_password', 'show-signup-password');
    togglePasswordVisibility('confirm_password', 'show-signup-confirm-password');

    // --- Registration Success Modal ---
    const params = new URLSearchParams(window.location.search);
    if (params.get('registered')) {
        showMessageModal('Registration Successful', 'You can now sign in with your new account.', 'success');
        // Switch to sign-in form automatically
        document.getElementById('signin-form-container').style.display = 'block';
        document.getElementById('register-form-container').style.display = 'none';
    }
});