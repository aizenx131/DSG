const loginForm = document.getElementById('login-form');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('login-btn');
const togglePasswordBtn = document.getElementById('toggle-password');

const credentialsSection = document.getElementById('credentials-section');
const twoFactorSection = document.getElementById('two-factor-section');
const otpCodeInput = document.getElementById('otp-code');
const loadingSpinner = document.getElementById('loading-spinner');

let waitingFor2FA = false;

function checkInputs() {
    if (!waitingFor2FA) {
        if (usernameInput.value.trim() !== '' && passwordInput.value.trim() !== '') {
            loginBtn.disabled = false;
        } else {
            loginBtn.disabled = true;
        }
    } else {
        if (otpCodeInput.value.trim().length >= 3) {
            loginBtn.disabled = false;
        } else {
            loginBtn.disabled = true;
        }
    }
}

passwordInput.addEventListener('input', () => {
    checkInputs();
    togglePasswordBtn.style.display = passwordInput.value.length > 0 ? 'block' : 'none';
});

usernameInput.addEventListener('input', checkInputs);
otpCodeInput.addEventListener('input', checkInputs);

togglePasswordBtn.addEventListener('click', () => {
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        togglePasswordBtn.textContent = 'إخفاء';
    } else {
        passwordInput.type = 'password';
        togglePasswordBtn.textContent = 'إظهار';
    }
});

// التعامل مع إرسال النموذج للسيرفر
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const requestData = {
        username: usernameInput.value,
        password: passwordInput.value
    };

    if (waitingFor2FA) {
        requestData.otp_code = otpCodeInput.value;
    }

    // إظهار شاشة التحميل وإخفاء حقول الإدخال مؤقتاً
    loadingSpinner.style.display = 'block';
    credentialsSection.style.display = 'none';
    twoFactorSection.style.display = 'none';
    loginBtn.style.display = 'none';

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestData)
        });

        const result = await response.json();

        if (response.ok) {
            if (result.status === 'needs_2fa') {
                waitingFor2FA = true;
                twoFactorSection.style.display = 'block';
                loginBtn.textContent = 'تحقق من الرمز';
                loginBtn.disabled = true;
                alert(result.message);
            } else if (result.status === 'success') {
                alert('✅ ' + result.message);
                // الانتقال السلس إلى الصفحة الثالثة (page2.html)
                window.location.href = '/page2';
            }
        } else {
            alert('❌ ' + result.message);
            // إعادة ضبط الحقول في حال تم رفض المعلومات
            if (waitingFor2FA) {
                twoFactorSection.style.display = 'block';
                otpCodeInput.value = '';
            } else {
                credentialsSection.style.display = 'block';
                passwordInput.value = '';
            }
            checkInputs();
        }
    } catch (error) {
        console.error('خطأ في الاتصال:', error);
        alert('حدث خطأ في الاتصال بالسيرفر.');
        credentialsSection.style.display = 'block';
    } finally {
        // إخفاء شاشة التحميل وإعادة زر الدخول
        loadingSpinner.style.display = 'none';
        loginBtn.style.display = 'block';
    }
});