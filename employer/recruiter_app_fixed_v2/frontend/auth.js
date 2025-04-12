"""
Frontend authentication JavaScript for the Recruiter Application
Handles login, registration, and user session management
"""

// Authentication module
const Auth = (function() {
    // Private variables
    let currentUser = null;
    const API_URL = '/auth';
    
    // Event listeners for auth-related elements
    function initAuthListeners() {
        // Login form submission
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const email = document.getElementById('login-email').value;
                const password = document.getElementById('login-password').value;
                const rememberMe = document.getElementById('remember-me').checked;
                
                login(email, password, rememberMe);
            });
        }
        
        // Registration form submission
        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const username = document.getElementById('register-username').value;
                const email = document.getElementById('register-email').value;
                const firstName = document.getElementById('register-first-name').value;
                const lastName = document.getElementById('register-last-name').value;
                const password = document.getElementById('register-password').value;
                const confirmPassword = document.getElementById('register-confirm-password').value;
                
                if (password !== confirmPassword) {
                    showToast('Registration Error', 'Passwords do not match', 'error');
                    return;
                }
                
                register(username, email, firstName, lastName, password);
            });
        }
        
        // Logout button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function(e) {
                e.preventDefault();
                logout();
            });
        }
        
        // Language selection in profile
        const languageSelect = document.getElementById('language-preference');
        if (languageSelect) {
            languageSelect.addEventListener('change', function() {
                updateProfile({ language_preference: this.value });
            });
        }
    }
    
    // Initialize authentication state
    function init() {
        // Check if user is already logged in
        checkAuthStatus()
            .then(updateUIForAuthState)
            .catch(error => {
                console.error('Auth initialization error:', error);
            });
        
        // Set up event listeners
        initAuthListeners();
    }
    
    // Check authentication status
    function checkAuthStatus() {
        return fetch(`${API_URL}/check-auth`)
            .then(response => response.json())
            .then(data => {
                if (data.authenticated) {
                    currentUser = data.user;
                    return true;
                } else {
                    currentUser = null;
                    return false;
                }
            });
    }
    
    // Login function
    function login(email, password, rememberMe = false) {
        fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                password: password,
                remember_me: rememberMe
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                currentUser = data.user;
                showToast('Login Successful', 'You have been logged in successfully.', 'success');
                updateUIForAuthState(true);
                
                // Close modal if open
                const loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
                if (loginModal) {
                    loginModal.hide();
                }
                
                // Redirect to home page if on login page
                if (window.location.pathname === '/login') {
                    window.location.href = '/';
                }
            } else {
                showToast('Login Failed', data.error || 'Invalid email or password', 'error');
            }
        })
        .catch(error => {
            console.error('Login error:', error);
            showToast('Login Error', 'An error occurred during login. Please try again.', 'error');
        });
    }
    
    // Register function
    function register(username, email, firstName, lastName, password) {
        fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                email: email,
                first_name: firstName,
                last_name: lastName,
                password: password,
                language_preference: document.documentElement.lang || 'en'
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                currentUser = data.user;
                showToast('Registration Successful', 'Your account has been created successfully.', 'success');
                updateUIForAuthState(true);
                
                // Close modal if open
                const registerModal = bootstrap.Modal.getInstance(document.getElementById('registerModal'));
                if (registerModal) {
                    registerModal.hide();
                }
                
                // Redirect to home page if on register page
                if (window.location.pathname === '/register') {
                    window.location.href = '/';
                }
            } else {
                showToast('Registration Failed', data.error || 'Registration failed. Please try again.', 'error');
            }
        })
        .catch(error => {
            console.error('Registration error:', error);
            showToast('Registration Error', 'An error occurred during registration. Please try again.', 'error');
        });
    }
    
    // Logout function
    function logout() {
        fetch(`${API_URL}/logout`)
            .then(response => response.json())
            .then(data => {
                currentUser = null;
                showToast('Logout Successful', 'You have been logged out successfully.', 'info');
                updateUIForAuthState(false);
                
                // Redirect to home page
                window.location.href = '/';
            })
            .catch(error => {
                console.error('Logout error:', error);
                showToast('Logout Error', 'An error occurred during logout. Please try again.', 'error');
            });
    }
    
    // Update profile function
    function updateProfile(profileData) {
        fetch(`${API_URL}/profile`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(profileData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                currentUser = data.user;
                showToast('Profile Updated', 'Your profile has been updated successfully.', 'success');
                
                // Update language if changed
                if (profileData.language_preference && 
                    profileData.language_preference !== document.documentElement.lang) {
                    window.location.reload();
                }
            } else {
                showToast('Profile Update Failed', data.error || 'Profile update failed. Please try again.', 'error');
            }
        })
        .catch(error => {
            console.error('Profile update error:', error);
            showToast('Profile Update Error', 'An error occurred during profile update. Please try again.', 'error');
        });
    }
    
    // Update UI based on authentication state
    function updateUIForAuthState(isAuthenticated) {
        const userProfileElement = document.querySelector('.user-profile');
        const userDropdownElement = document.getElementById('userDropdown');
        const userDropdownMenu = document.querySelector('.user-profile .dropdown-menu');
        
        if (isAuthenticated && currentUser) {
            // Update user profile display
            if (userDropdownElement) {
                userDropdownElement.innerHTML = `
                    <div class="user-avatar bg-white">
                        <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.first_name + ' ' + currentUser.last_name)}&background=5e72e4&color=fff" alt="User" class="img-fluid">
                    </div>
                    <div class="ms-2">
                        <div class="user-name">${currentUser.first_name} ${currentUser.last_name}</div>
                        <div class="user-role">${currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)}</div>
                    </div>
                `;
            }
            
            // Update dropdown menu
            if (userDropdownMenu) {
                userDropdownMenu.innerHTML = `
                    <li><a class="dropdown-item" href="/profile"><i class="fas fa-user me-2"></i>Profile</a></li>
                    <li><a class="dropdown-item" href="/settings"><i class="fas fa-cog me-2"></i>Settings</a></li>
                    <li><hr class="dropdown-divider"></li>
                    <li><a class="dropdown-item" href="#" id="logout-btn"><i class="fas fa-sign-out-alt me-2"></i>Logout</a></li>
                `;
                
                // Add event listener to new logout button
                document.getElementById('logout-btn').addEventListener('click', function(e) {
                    e.preventDefault();
                    logout();
                });
            }
            
            // Show admin-only elements if user is admin
            const adminElements = document.querySelectorAll('.admin-only');
            adminElements.forEach(el => {
                el.style.display = currentUser.role === 'admin' ? '' : 'none';
            });
            
            // Update language selector to match user preference
            const languageBtn = document.getElementById('languageDropdown');
            const languageItems = document.querySelectorAll('.dropdown-item[data-lang]');
            
            if (languageBtn && currentUser.language_preference) {
                languageBtn.innerHTML = `<i class="fas fa-globe me-1"></i> ${getLangDisplayName(currentUser.language_preference)}`;
                
                languageItems.forEach(item => {
                    if (item.getAttribute('data-lang') === currentUser.language_preference) {
                        item.classList.add('active');
                    } else {
                        item.classList.remove('active');
                    }
                });
            }
        } else {
            // Update for logged out state
            if (userDropdownElement) {
                userDropdownElement.innerHTML = `
                    <div class="user-avatar bg-white">
                        <img src="https://ui-avatars.com/api/?name=Guest&background=8898aa&color=fff" alt="Guest" class="img-fluid">
                    </div>
                    <div class="ms-2">
                        <div class="user-name">Guest User</div>
                        <div class="user-role">Sign in to access all features</div>
                    </div>
                `;
            }
            
            // Update dropdown menu
            if (userDropdownMenu) {
                userDropdownMenu.innerHTML = `
                    <li><a class="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#loginModal"><i class="fas fa-sign-in-alt me-2"></i>Login</a></li>
                    <li><a class="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#registerModal"><i class="fas fa-user-plus me-2"></i>Register</a></li>
                `;
            }
            
            // Hide admin-only elements
            const adminElements = document.querySelectorAll('.admin-only');
            adminElements.forEach(el => {
                el.style.display = 'none';
            });
        }
        
        // Update auth-required elements visibility
        const authRequiredElements = document.querySelectorAll('.auth-required');
        authRequiredElements.forEach(el => {
            el.style.display = isAuthenticated ? '' : 'none';
        });
        
        // Update no-auth elements visibility (shown only when logged out)
        const noAuthElements = document.querySelectorAll('.no-auth');
        noAuthElements.forEach(el => {
            el.style.display = isAuthenticated ? 'none' : '';
        });
    }
    
    // Helper function to get language display name
    function getLangDisplayName(lang) {
        switch(lang) {
            case 'en': return 'English';
            case 'nl': return 'Nederlands';
            case 'fr': return 'Français';
            default: return 'English';
        }
    }
    
    // Public API
    return {
        init: init,
        login: login,
        register: register,
        logout: logout,
        updateProfile: updateProfile,
        getCurrentUser: function() { return currentUser; },
        isAuthenticated: function() { return currentUser !== null; },
        isAdmin: function() { return currentUser && currentUser.role === 'admin'; }
    };
})();

// Initialize authentication when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    Auth.init();
    
    // Update login modal to include social login buttons functionality
    const googleLoginBtn = document.querySelector('.google-btn');
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', function() {
            showToast('Social Login', 'Google login would be implemented in a production environment.', 'info');
        });
    }
    
    const linkedinLoginBtn = document.querySelector('.linkedin-btn');
    if (linkedinLoginBtn) {
        linkedinLoginBtn.addEventListener('click', function() {
            showToast('Social Login', 'LinkedIn login would be implemented in a production environment.', 'info');
        });
    }
});
