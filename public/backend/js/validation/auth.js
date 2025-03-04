
        document.addEventListener('DOMContentLoaded', function() {
            const form = document.getElementById('resetPasswordForm');
            const otpInput = document.getElementById('otp');
            const passwordInput = document.getElementById('password');
            const confirmPasswordInput = document.getElementById('confirmPassword');
            const otpError = document.getElementById('otpError');
            const passwordError = document.getElementById('passwordError');

            // Function to validate OTP
            function validateOTP() {
                const otpValue = otpInput.value.trim();
                const otpRegex = /^\d{6}$/;
                
                if (!otpRegex.test(otpValue)) {
                    otpError.style.display = 'block';
                    return false;
                } else {
                    otpError.style.display = 'none';
                    return true;
                }
            }

            // Function to validate passwords
            function validatePasswords() {
                if (passwordInput.value !== confirmPasswordInput.value) {
                    passwordError.style.display = 'block';
                    return false;
                } else {
                    passwordError.style.display = 'none';
                    return true;
                }
            }

            // Add real-time validation on input
            otpInput.addEventListener('input', function() {
                // Restrict to numeric input
                this.value = this.value.replace(/[^0-9]/g, '');
                validateOTP();
            });

            confirmPasswordInput.addEventListener('input', validatePasswords);
            passwordInput.addEventListener('input', validatePasswords);

            // Prevent form submission if OTP or passwords are invalid
            form.addEventListener('submit', function(event) {
                const isOTPValid = validateOTP();
                const isPasswordValid = validatePasswords();

                if (!isOTPValid || !isPasswordValid) {
                    event.preventDefault();
                }
            });
        });