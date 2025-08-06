// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, signInWithCustomToken, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Global variables for Firebase instances and user ID
let app;
let db;
let auth;
let userId = null;

// --- DOM Elements ---
const authModalOverlay = document.getElementById('auth-modal-overlay');
const signinFormContainer = document.getElementById('signin-form-container');
const signupFormContainer = document.getElementById('signup-form-container');
const signinForm = document.getElementById('signin-form');
const signupForm = document.getElementById('signup-form');
const showSignupLink = document.getElementById('show-signup-link');
const showSigninLink = document.getElementById('show-signin-link');
const mainContent = document.getElementById('main-content'); // Main content area (student registration form)
const headerSignOutLink = document.getElementById('header-sign-out-link');
const registrationForm = document.getElementById('registration-form'); // Student Registration Form
const messageModalOverlay = document.getElementById('message-modal-overlay');
const messageModalTitle = document.getElementById('message-modal-title');
const messageModalBody = document.getElementById('message-modal-body');
const messageModalCloseBtn = document.getElementById('message-modal-close-btn');

// Elements for Music Player (ensure these exist in your HTML)
const bgMusic = document.getElementById('bgMusic'); // Audio element for background music
const playBtn = document.querySelector('.play-btn'); // Button to play/pause music

// Elements for Scroll to Top (ensure these exist in your HTML)
const scrollTopBtn = document.querySelector('.scroll-top'); // Button to scroll to top
const formTop = document.getElementById('form-top'); // Element to scroll to (e.g., top of your main form)

// Show/Hide Password functionality
function togglePasswordVisibility(passwordInputId, checkboxId) {
    const passwordInput = document.getElementById(passwordInputId);
    const checkbox = document.getElementById(checkboxId);
    if (passwordInput && checkbox) {
        checkbox.addEventListener('change', () => {
            if (checkbox.checked) {
                passwordInput.type = 'text';
            } else {
                passwordInput.type = 'password';
            }
        });
    }
}

// Apply show/hide password to sign-in and sign-up forms
document.addEventListener('DOMContentLoaded', () => {
    togglePasswordVisibility('signin-password', 'show-signin-password');
    togglePasswordVisibility('signup-password', 'show-signup-password');
    togglePasswordVisibility('signup-confirm-password', 'show-signup-confirm-password');
});


/**
 * Displays a custom message modal. This replaces any `alert()` or `confirm()` calls.
 * @param {string} title - The title of the message.
 * @param {string} message - The body of the message.
 * @param {string} type - 'success', 'error', or 'info' for styling.
 */
function showMessageModal(title, message, type = 'info') {
    if (!messageModalOverlay || !messageModalTitle || !messageModalBody || !messageModalCloseBtn) {
        console.error("Message modal elements not found. Cannot display message box.");
        return;
    }

    messageModalTitle.textContent = title;
    messageModalBody.textContent = message;

    // Reset previous styles
    messageModalTitle.style.color = '';

    // Apply type-specific styling
    if (type === 'success') {
        messageModalTitle.style.color = '#388e3c'; // Green
    } else if (type === 'error') {
        messageModalTitle.style.color = '#d32f2f'; // Red
    } else {
        messageModalTitle.style.color = '#1976d2'; // Blue
    }

    messageModalOverlay.classList.remove('hidden');
    // Add animation class if contentElement exists
    const messageModalContent = messageModalOverlay.querySelector('.modal-content');
    if (messageModalContent) {
        setTimeout(() => {
            messageModalContent.classList.remove('opacity-0', 'scale-95');
            messageModalContent.classList.add('opacity-100', 'scale-100');
        }, 10);
    }
}

/**
 * Hides the custom message modal.
 */
function hideMessageModal() {
    const messageModalContent = messageModalOverlay.querySelector('.modal-content');
    if (messageModalOverlay && messageModalContent) {
        messageModalContent.classList.remove('opacity-100', 'scale-100');
        messageModalContent.classList.add('opacity-0', 'scale-95');
        setTimeout(() => {
            messageModalOverlay.classList.add('hidden');
        }, 300); // Match transition duration
    }
}

// Close message modal on button click
if (messageModalCloseBtn) {
    messageModalCloseBtn.addEventListener('click', hideMessageModal);
}
// Close message modal when clicking outside the content
if (messageModalOverlay) {
    messageModalOverlay.addEventListener('click', (event) => {
        if (event.target === messageModalOverlay) {
            hideMessageModal();
        }
    });
}


/**
 * Initializes Firebase and sets up authentication listeners.
 * This function is called once when the window loads.
 */
async function initializeFirebase() {
    try {
        // Retrieve Firebase config and app ID from global variables provided by the environment
        const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
        const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};

        if (Object.keys(firebaseConfig).length === 0) {
            console.error("Firebase config is missing. Please ensure __firebase_config is set.");
            showMessageModal("Error", "Firebase configuration is missing. Cannot initialize the app.", 'error');
            return;
        }

        // Initialize Firebase app, authentication, and Firestore database
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);

        // Attempt to sign in with a custom token if available (for Canvas environment),
        // otherwise sign in anonymously to allow Firestore access.
        const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
        if (initialAuthToken) {
            try {
                await signInWithCustomToken(auth, initialAuthToken);
                console.log("Signed in with custom token.");
            } catch (error) {
                console.error("Error signing in with custom token:", error);
                // Fallback to anonymous sign-in if custom token fails
                await signInAnonymously(auth);
                console.log("Signed in anonymously due to custom token error.");
            }
        } else {
            // Sign in anonymously if no custom token is provided
            await signInAnonymously(auth);
            console.log("Signed in anonymously.");
        }

        // Listen for authentication state changes. This is the primary way to manage UI based on login status.
        onAuthStateChanged(auth, (user) => {
            if (user) {
                // User is logged in
                userId = user.uid;
                console.log("User is logged in:", userId);
                if (authModalOverlay) authModalOverlay.classList.add('hidden'); // Hide authentication modal
                if (mainContent) mainContent.classList.remove('hidden'); // Show main content (student registration form)
                if (headerSignOutLink) headerSignOutLink.classList.remove('hidden'); // Show sign out link in header
                checkAndLoadRegistrationData(userId); // Attempt to load existing registration data for this user
            } else {
                // User is logged out
                userId = null;
                console.log("User is logged out.");
                if (authModalOverlay) authModalOverlay.classList.remove('hidden'); // Show authentication modal
                if (signinFormContainer) signinFormContainer.classList.remove('hidden'); // Default to sign-in form
                if (signupFormContainer) signupFormContainer.classList.add('hidden'); // Hide sign-up form
                if (mainContent) mainContent.classList.add('hidden'); // Hide main content
                if (headerSignOutLink) headerSignOutLink.classList.add('hidden'); // Hide sign out link in header
            }
        });

    } catch (error) {
        console.error("Error initializing Firebase:", error);
        showMessageModal("Initialization Error", `Failed to initialize the application: ${error.message}`, 'error');
    }
}

/**
 * Handles user sign-in using email and password.
 * @param {Event} event - The form submission event.
 */
if (signinForm) {
    signinForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent default form submission
        const email = signinForm.elements['signin-email'].value;
        const password = signinForm.elements['signin-password'].value;

        try {
            await signInWithEmailAndPassword(auth, email, password);
            showMessageModal("Success", "Signed in successfully!", 'success');
        } catch (error) {
            console.error("Sign-in error:", error);
            let errorMessage = "Failed to sign in. Please check your email and password.";
            if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
                errorMessage = "Invalid email or password. Please try again.";
            } else if (error.code === 'auth/wrong-password') {
                errorMessage = "Incorrect password. Please try again.";
            }
            showMessageModal("Sign-in Failed", errorMessage, 'error');
        }
    });
}


/**
 * Handles user sign-up using email and password.
 * @param {Event} event - The form submission event.
 */
if (signupForm) {
    signupForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent default form submission
        const email = signupForm.elements['signup-email'].value;
        const password = signupForm.elements['signup-password'].value;
        const confirmPassword = signupForm.elements['signup-confirm-password'].value;
        const termsAccepted = signupForm.elements['signup-terms-privacy'].checked;

        if (password !== confirmPassword) {
            showMessageModal("Error", "Passwords do not match.", 'error');
            return;
        }
        if (!termsAccepted) {
            showMessageModal("Error", "You must accept the terms and privacy policy.", 'error');
            return;
        }

        try {
            await createUserWithEmailAndPassword(auth, email, password);
            showMessageModal("Success", "Account created successfully! You are now signed in.", 'success');
            signupForm.reset(); // Clear the form after successful signup
        } catch (error) {
            console.error("Sign-up error:", error);
            let errorMessage = "Failed to create account.";
            if (error.code === 'auth/email-already-in-use') {
                errorMessage = "This email is already in use. Please sign in or use a different email.";
            } else if (error.code === 'auth/weak-password') {
                errorMessage = "Password is too weak. Please choose a stronger password (minimum 6 characters).";
            }
            showMessageModal("Sign-up Failed", errorMessage, 'error');
        }
    });
}


/**
 * Handles user sign-out.
 */
if (headerSignOutLink) {
    headerSignOutLink.addEventListener('click', async (event) => {
        event.preventDefault(); // Prevent default link behavior
        try {
            await signOut(auth);
            showMessageModal("Success", "You have been signed out.", 'info');
        } catch (error) {
            console.error("Sign-out error:", error);
            showMessageModal("Sign-out Failed", `Error during sign out: ${error.message}`, 'error');
        }
    });
}


/**
 * Toggles visibility between the sign-in and sign-up forms within the modal.
 */
if (showSignupLink) {
    showSignupLink.addEventListener('click', (event) => {
        event.preventDefault();
        if (signinFormContainer) signinFormContainer.classList.add('hidden');
        if (signupFormContainer) signupFormContainer.classList.remove('hidden');
    });
}

if (showSigninLink) {
    showSigninLink.addEventListener('click', (event) => {
        event.preventDefault();
        if (signupFormContainer) signupFormContainer.classList.add('hidden');
        if (signinFormContainer) signinFormContainer.classList.remove('hidden');
    });
}


/**
 * Handles student registration form submission and saves data to Firestore.
 * This data is stored privately for the logged-in user.
 * @param {Event} event - The form submission event.
 */
if (registrationForm) {
    registrationForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent default form submission

        if (!userId) {
            showMessageModal("Error", "You must be logged in to register.", 'error');
            return;
        }

        const formData = new FormData(registrationForm);
        const registrationData = {};
        for (const [key, value] of formData.entries()) {
            if (key !== 'profile_picture') { // Exclude file input from direct data storage for now
                registrationData[key] = value;
            }
        }

        // Handle profile picture separately. In a real application, you would upload this
        // to Firebase Storage and save the URL in Firestore. Here, we just note its presence.
        const profilePictureFile = registrationForm.elements['profile_picture'].files[0];
        if (profilePictureFile) {
            console.log("Profile picture selected:", profilePictureFile.name);
            registrationData.profilePictureName = profilePictureFile.name; // Store name as a placeholder
            // TODO: Implement actual file upload to Firebase Storage (e.g., using getStorage and uploadBytes)
        }

        // Define the Firestore document reference for the user's registration data
        const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
        // Using the user's UID as part of the path for private data
        const userDocRef = doc(db, `artifacts/${appId}/users/${userId}/studentRegistrations`, 'myRegistration');

        try {
            // Save the registration data to Firestore. `merge: true` ensures existing fields are not overwritten.
            await setDoc(userDocRef, registrationData, { merge: true });
            showMessageModal("Success", "Student registration saved successfully!", 'success');
            console.log("Registration data saved:", registrationData);
        } catch (error) {
            console.error("Error saving registration data:", error);
            showMessageModal("Error", `Failed to save registration: ${error.message}`, 'error');
        }
    });
}


/**
 * Checks if a user has existing registration data in Firestore and loads it into the form.
 * @param {string} currentUserId - The ID of the currently logged-in user.
 */
async function checkAndLoadRegistrationData(currentUserId) {
    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
    const userDocRef = doc(db, `artifacts/${appId}/users/${currentUserId}/studentRegistrations`, 'myRegistration');

    try {
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            console.log("Existing registration data found:", data);
            // Populate the form fields with the retrieved data
            for (const key in data) {
                const element = registrationForm.elements[key];
                if (element) {
                    if (element.type === 'radio') {
                        // For radio buttons, find the one with the matching value and check it
                        const radioButtons = document.querySelectorAll(`input[name="${key}"]`);
                        radioButtons.forEach(radio => {
                            if (radio.value === data[key]) {
                                radio.checked = true;
                            }
                        });
                    } else if (element.type === 'checkbox') {
                        element.checked = data[key];
                    } else {
                        element.value = data[key];
                    }
                }
            }
            showMessageModal("Welcome Back!", "Your previous registration data has been loaded.", 'info');
        } else {
            console.log("No existing registration data for this user.");
            // Reset the form if no data is found for the current user (e.g., first-time registration)
            if (registrationForm) registrationForm.reset();
        }
    } catch (error) {
        console.error("Error loading registration data:", error);
        showMessageModal("Error", `Failed to load existing registration: ${error.message}`, 'error');
    }
}

// --- Scroll to Top Button Logic ---
if (scrollTopBtn && formTop) {
    window.addEventListener('scroll', function() {
        if (window.scrollY > 200) { // Show button after scrolling down 200px
            scrollTopBtn.style.display = 'block';
        } else {
            scrollTopBtn.style.display = 'none';
        }
    });

    scrollTopBtn.addEventListener('click', function(e) {
        e.preventDefault(); // Prevent default anchor behavior
        formTop.scrollIntoView({ behavior: 'smooth' }); // Smoothly scroll to the top element
    });
}

// Initialize Firebase and all other functionalities when the window finishes loading
window.onload = initializeFirebase;