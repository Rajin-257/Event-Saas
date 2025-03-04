document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("passwordForm");
  const newPasswordInput = document.getElementById("newPassword");
  const confirmPasswordInput = document.getElementById("confirmPassword");
  const passwordError = document.getElementById("passwordError");
  const confirmError = document.getElementById("confirmError");

  function validatePasswordMatch() {
    if (confirmPasswordInput.value !== newPasswordInput.value) {
      confirmPasswordInput.classList.add("is-invalid");
      confirmError.textContent = "Passwords do not match";
      return false;
    } else {
      confirmPasswordInput.classList.remove("is-invalid");
      if (confirmPasswordInput.value) {
        confirmPasswordInput.classList.add("is-valid");
      }
      confirmError.textContent = "";
      return true;
    }
  }

  function validatePasswordComplexity() {
    const password = newPasswordInput.value;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const isLongEnough = password.length >= 6;

    if (!isLongEnough || !hasUpperCase || !hasLowerCase || !hasNumbers) {
      newPasswordInput.classList.add("is-invalid");
      passwordError.textContent =
        "Password must be at least 6 characters and include uppercase, lowercase, and numbers";
      return false;
    } else {
      newPasswordInput.classList.remove("is-invalid");
      newPasswordInput.classList.add("is-valid");
      passwordError.textContent = "";
      return true;
    }
  }

  newPasswordInput.addEventListener("input", function () {
    validatePasswordComplexity();
    if (confirmPasswordInput.value) {
      validatePasswordMatch();
    }
  });

  confirmPasswordInput.addEventListener("input", validatePasswordMatch);

  form.addEventListener("submit", function (event) {
    const isPasswordValid = validatePasswordComplexity();
    const isPasswordMatch = validatePasswordMatch();

    if (!isPasswordValid || !isPasswordMatch) {
      event.preventDefault();
    }
  });
});
