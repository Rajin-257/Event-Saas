document.addEventListener("DOMContentLoaded", function () {
  const userModal = document.getElementById("user-modal");
  const userForm = document.getElementById("user-form");
  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const mobileInput = document.getElementById("user-mobile");
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirmPassword");
  const roleSelect = document.getElementById("user-role");
  const saveButton = document.getElementById("btn-save-event");
  const deleteButton = document.getElementById("btn-delete-event");
  const openModalBtn = document.getElementById("btn-add-user");
  const openRoleModalBtn = document.getElementById("btn-edit-role");
  const roleModal = document.getElementById("role-modal");
  const deleteModel = document.getElementById("delete-modal");

  // Validation regexes
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const mobileRegex = /^(\+)?[0-9]{11}$/;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;

  // Add event listener for the role edit button
  document.addEventListener("click", function (e) {
    if (e.target.closest(".btn-edit-role")) {
      console.log("Button Clicked");
      // Get the user ID from the data attribute
      const userId = e.target.closest(".btn-edit-role").dataset.userId;

      // You can use userId to fetch user data if needed
      console.log("User ID:", userId);
      const userIdInput = roleModal.querySelector('input[name="userId"]');

      // Set the user ID in the form
      userIdInput.value = userId;

      // Open the role modal
      const roleModalInstance = new bootstrap.Modal(roleModal);
      roleModalInstance.show();
    }
  });

  document.addEventListener("click", function (e) {
    if (e.target.closest(".btn-user-delete")) {
      console.log("Button Clicked");
      // Get the user ID from the data attribute
      const userId = e.target.closest(".btn-user-delete").dataset.userId;
      const userIdInput = deleteModel.querySelector('input[name="userID"]');

      // Set the user ID in the form
      userIdInput.value = userId;

      // You can use userId to fetch user data if needed
      console.log("User ID:", userId);

      // Open the role modal
      const roleModalInstance = new bootstrap.Modal(deleteModel);
      roleModalInstance.show();
    }
  });

  // Auto-generate password based on email and mobile
  function autoGeneratePassword() {
    const email = emailInput.value.trim();
    const mobile = mobileInput.value.trim();

    // Only generate if both email and mobile have values
    if (email && mobile && email.includes("@") && mobile.length >= 4) {
      // Get username part of email (up to and including @)
      const atIndex = email.indexOf("@");
      const emailPart = email.substring(0, atIndex + 1); // Include the @ symbol

      // Get last 4 digits of mobile
      const mobileLast4 = mobile.slice(-4);

      // Combine parts and capitalize first letter
      let generatedPassword = emailPart + mobileLast4;
      generatedPassword =
        generatedPassword.charAt(0).toUpperCase() + generatedPassword.slice(1);

      // Set password fields
      passwordInput.value = generatedPassword;
      confirmPasswordInput.value = generatedPassword;

      // Validate password fields
      validateInput(passwordInput);
      validateInput(confirmPasswordInput);
    }
  }

  // Function to validate a single input field
  function validateInput(inputElement) {
    const value = inputElement.value.trim();
    let isValid = true;
    let errorMessage = "";

    // Validate based on input type
    if (inputElement === nameInput) {
      if (value === "") {
        isValid = false;
        errorMessage = "Name is required";
      }
    } else if (inputElement === emailInput) {
      if (value === "") {
        isValid = false;
        errorMessage = "Email is required";
      } else if (!emailRegex.test(value)) {
        isValid = false;
        errorMessage = "Please enter a valid email address";
      }
    } else if (inputElement === mobileInput) {
      if (value === "") {
        isValid = false;
        errorMessage = "Mobile number is required";
      } else if (!mobileRegex.test(value)) {
        isValid = false;
        errorMessage = "Please enter exactly 11 digits for mobile number";
      }
    } else if (inputElement === passwordInput) {
      if (value === "") {
        isValid = false;
        errorMessage = "Password is required";
      } else if (!passwordRegex.test(value)) {
        isValid = false;
        errorMessage =
          "Password must be at least 6 characters with uppercase, lowercase, and numbers";
      }
    } else if (inputElement === confirmPasswordInput) {
      if (value === "") {
        isValid = false;
        errorMessage = "Please confirm your password";
      } else if (value !== passwordInput.value) {
        isValid = false;
        errorMessage = "Passwords do not match";
      }
    } else if (inputElement === roleSelect) {
      if (value === "") {
        isValid = false;
        errorMessage = "Please select a role";
      }
    }

    // Update UI based on validation result
    if (isValid) {
      setValidInput(inputElement);
    } else {
      setInvalidInput(inputElement, errorMessage);
    }

    return isValid;
  }

  // Function to validate the entire form
  function validateForm() {
    let isValid = true;

    // Validate all inputs
    if (!validateInput(nameInput)) isValid = false;
    if (!validateInput(emailInput)) isValid = false;
    if (!validateInput(mobileInput)) isValid = false;
    if (!validateInput(passwordInput)) isValid = false;
    if (!validateInput(confirmPasswordInput)) isValid = false;
    if (!validateInput(roleSelect)) isValid = false;

    return isValid;
  }

  // Set invalid styling and error message
  function setInvalidInput(inputElement, errorMessage) {
    inputElement.classList.remove("is-valid");
    inputElement.classList.add("is-invalid");

    // Find or create invalid feedback element
    let feedbackElement = inputElement.nextElementSibling;

    // If next element isn't an invalid-feedback div or doesn't exist
    if (
      !feedbackElement ||
      !feedbackElement.classList.contains("invalid-feedback")
    ) {
      // Check if we need to create a new feedback element
      feedbackElement = Array.from(inputElement.parentNode.children).find(
        (el) => el.classList && el.classList.contains("invalid-feedback"),
      );

      // If no feedback element exists, create one
      if (!feedbackElement) {
        feedbackElement = document.createElement("div");
        feedbackElement.classList.add("invalid-feedback");
        // Special case for password which has an input-group
        if (
          inputElement === passwordInput &&
          inputElement.parentNode.classList.contains("input-group")
        ) {
          inputElement.parentNode.parentNode.appendChild(feedbackElement);
        } else if (inputElement === confirmPasswordInput) {
          inputElement.parentNode.appendChild(feedbackElement);
        } else {
          inputElement.parentNode.appendChild(feedbackElement);
        }
      }
    }

    // Update the error message
    feedbackElement.textContent = errorMessage;
  }

  // Set valid styling
  function setValidInput(inputElement) {
    inputElement.classList.remove("is-invalid");
    inputElement.classList.add("is-valid");
  }

  // Reset form validation state
  function resetFormValidation() {
    const inputs = [
      nameInput,
      emailInput,
      mobileInput,
      passwordInput,
      confirmPasswordInput,
      roleSelect,
    ];
    inputs.forEach((input) => {
      input.classList.remove("is-valid", "is-invalid");
    });
  }

  // Add real-time validation listeners
  nameInput.addEventListener("input", () => validateInput(nameInput));

  emailInput.addEventListener("input", () => {
    validateInput(emailInput);
    // Try to auto-generate password when email changes
    autoGeneratePassword();
  });

  mobileInput.addEventListener("input", () => {
    validateInput(mobileInput);
    // Try to auto-generate password when mobile changes
    autoGeneratePassword();
  });

  passwordInput.addEventListener("input", () => {
    validateInput(passwordInput);
    // If confirm password has a value, validate it again as it depends on password
    if (confirmPasswordInput.value) {
      validateInput(confirmPasswordInput);
    }
  });

  confirmPasswordInput.addEventListener("input", () =>
    validateInput(confirmPasswordInput),
  );
  roleSelect.addEventListener("change", () => validateInput(roleSelect));

  // Add blur validation listeners
  nameInput.addEventListener("blur", () => validateInput(nameInput));
  emailInput.addEventListener("blur", () => validateInput(emailInput));
  mobileInput.addEventListener("blur", () => validateInput(mobileInput));
  passwordInput.addEventListener("blur", () => validateInput(passwordInput));
  confirmPasswordInput.addEventListener("blur", () =>
    validateInput(confirmPasswordInput),
  );

  // Form submission handler
  userForm.addEventListener("submit", function (e) {
    e.preventDefault();

    // Validate the whole form
    if (validateForm()) {
      // Form is valid, submit it
      userForm.submit();
    } else {
      // Form is invalid, prevent submission and clear any valid indicators
      e.stopPropagation();

      // Fix: Ensure elements with errors don't show valid indicators
      const invalidInputs = userForm.querySelectorAll(".is-invalid");
      invalidInputs.forEach((input) => {
        input.classList.remove("is-valid");
      });
    }
  });

  // Delete button handler
  deleteButton.addEventListener("click", function () {
    if (confirm("Are you sure you want to delete this user?")) {
      // Add a hidden input to indicate delete action
      const actionInput = document.createElement("input");
      actionInput.type = "hidden";
      actionInput.name = "action";
      actionInput.value = "delete";
      userForm.appendChild(actionInput);

      // Submit the form
      userForm.submit();
    }
  });

  // Open modal button handler (if it exists)
  if (openModalBtn) {
    openModalBtn.addEventListener("click", function () {
      // Reset the form
      userForm.reset();
      resetFormValidation();

      // Set modal title
      document.getElementById("modal-title").textContent = "Add New User";

      // Hide delete button for new users
      deleteButton.style.display = "none";

      // Show modal
      const modalInstance = new bootstrap.Modal(userModal);
      modalInstance.show();
    });
  }

  // Function to open modal for editing existing user
  window.editUserModal = function (userData) {
    // Reset validation state
    resetFormValidation();

    // Populate form fields
    nameInput.value = userData.name || "";
    emailInput.value = userData.email || "";
    mobileInput.value = userData.mobile || "";
    roleSelect.value = userData.role || "";

    // Handle password fields specially
    if (userData.editMode) {
      // For edit mode, might want to hide or mark password fields differently
      passwordInput.required = false;
      confirmPasswordInput.required = false;

      // Or add placeholder text indicating password change is optional
      passwordInput.placeholder = "Leave blank to keep current password";
      confirmPasswordInput.placeholder = "Leave blank to keep current password";
    } else {
      // Reset to original required state for new users
      passwordInput.required = true;
      confirmPasswordInput.required = true;
      passwordInput.placeholder = "Create a password";
      confirmPasswordInput.placeholder = "Confirm your password";

      // Auto-generate password if email and mobile are provided
      if (userData.email && userData.mobile) {
        autoGeneratePassword();
      }
    }

    // Add user ID for update operation
    let userIdInput = document.getElementById("user-id");
    if (!userIdInput && userData.id) {
      userIdInput = document.createElement("input");
      userIdInput.type = "hidden";
      userIdInput.id = "user-id";
      userIdInput.name = "id";
      userForm.appendChild(userIdInput);
    }

    if (userIdInput) {
      userIdInput.value = userData.id || "";
    }

    // Set modal title
    document.getElementById("modal-title").textContent = "Edit User";

    // Show delete button
    deleteButton.style.display = "block";

    // Show modal
    const modalInstance = new bootstrap.Modal(userModal);
    modalInstance.show();
  };
});

// Add event listener using event delegation
