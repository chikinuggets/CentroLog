const authConfig = {
    email: 'schoolpurposes@gmail.com',
    password: 'parasumakses'
};

document.addEventListener('DOMContentLoaded', () => {
    if (sessionStorage.getItem('isAuthenticated') === 'true') {
        window.location.href = '../index.html';
        return;
    }

    const splashScreen = document.getElementById('splashScreen');
    const loginScreen = document.getElementById('loginScreen');
    const loginForm = document.getElementById('loginForm');
    const loginButton = document.getElementById('loginButton');
    const emailInput = document.getElementById('loginEmail');
    const passwordInput = document.getElementById('loginPassword');
    const authForms = document.querySelectorAll('.auth-form');

    const startLogin = () => {
        if (!splashScreen || !loginScreen) return;
        if (splashScreen.classList.contains('hidden')) return;

        setTimeout(() => {
            splashScreen.classList.add('hidden');
            setTimeout(() => {
                loginScreen.classList.remove('login-hidden');
            }, 400);
        }, 1200);
    };

    if (splashScreen) {
        const splashLogo = splashScreen.querySelector('img');
        if (splashLogo && !splashLogo.complete) {
            splashLogo.addEventListener('load', startLogin);
            splashLogo.addEventListener('error', startLogin);
        } else {
            startLogin();
        }
    }

    if (emailInput) {
        emailInput.addEventListener('input', () => emailInput.classList.remove('input-error'));
    }
    if (passwordInput) {
        passwordInput.addEventListener('input', () => passwordInput.classList.remove('input-error'));
    }

    if (loginForm) {
        loginForm.addEventListener('submit', event => {
            event.preventDefault();
            if (!emailInput || !passwordInput || !loginButton) return;

            const email = emailInput.value.trim();
            const password = passwordInput.value.trim();

            loginButton.disabled = true;
            loginButton.textContent = 'Signing In...';

            setTimeout(() => {
                const isValid = email === authConfig.email && password === authConfig.password;
                if (isValid) {
                    sessionStorage.setItem('isAuthenticated', 'true');
                    loginButton.textContent = 'Redirecting...';
                    window.location.href = '../index.html';
                } else {
                    emailInput.classList.add('input-error');
                    passwordInput.classList.add('input-error');
                    loginButton.disabled = false;
                    loginButton.textContent = 'Sign In';
                    openModal('loginErrorModal');
                }
            }, 400);
        });
    }

    document.querySelectorAll('.link-btn').forEach(button => {
        button.addEventListener('click', () => {
            const targetId = button.getAttribute('data-target');
            if (!targetId) return;
            authForms.forEach(form => form.classList.remove('active'));
            const targetForm = document.getElementById(targetId);
            if (targetForm) {
                targetForm.classList.add('active');
                targetForm.querySelector('input')?.focus();
            }
        });
    });

    document.querySelectorAll('[data-close-modal]').forEach(button => {
        button.addEventListener('click', () => closeModal(button.closest('.modal').id));
    });

    document.addEventListener('click', event => {
        if (event.target.classList.contains('modal')) {
            closeModal(event.target.id);
        }
    });
});

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
    }
}

