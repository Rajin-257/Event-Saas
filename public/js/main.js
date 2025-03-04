/* Main JavaScript file for the Auth App */

document.addEventListener('DOMContentLoaded', function() {
  
  // Auto-hide flash messages after 5 seconds
  const flashMessages = document.querySelectorAll('.alert');
  if (flashMessages.length > 0) {
    setTimeout(() => {
      flashMessages.forEach(message => {
        const alert = new bootstrap.Alert(message);
        alert.close();
      });
    }, 5000);
  }
  
  // Activate Bootstrap tooltips
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });
  
  // File input preview (for avatar uploads)
  const fileInput = document.getElementById('avatar');
  if (fileInput) {
    fileInput.addEventListener('change', function() {
      const file = this.files[0];
      if (file) {
        const reader = new FileReader();
        const avatarPreview = document.querySelector('.avatar-xl') || document.querySelector('.avatar-placeholder');
        
        reader.onload = function(e) {
          if (avatarPreview.tagName === 'IMG') {
            avatarPreview.src = e.target.result;
          } else {
            // Create an image if avatar placeholder is a div
            const img = document.createElement('img');
            img.src = e.target.result;
            img.className = 'avatar-xl rounded-circle mb-3';
            img.alt = 'Avatar Preview';
            
            // Replace placeholder with image
            avatarPreview.parentNode.replaceChild(img, avatarPreview);
          }
        };
        
        reader.readAsDataURL(file);
      }
    });
  }
  
  // Password strength meter
  const passwordInputs = document.querySelectorAll('input[type="password"]');
  passwordInputs.forEach(input => {
    if (input.id === 'password' || input.id === 'newPassword') {
      input.addEventListener('input', function() {
        const password = this.value;
        
        // Find or create strength meter
        let strengthMeter = this.parentNode.parentNode.querySelector('.password-strength');
        if (!strengthMeter) {
          strengthMeter = document.createElement('div');
          strengthMeter.className = 'password-strength progress mt-2';
          strengthMeter.style.height = '5px';
          strengthMeter.innerHTML = '<div class="progress-bar" role="progressbar" style="width: 0%"></div>';
          this.parentNode.parentNode.appendChild(strengthMeter);
        }
        
        const progressBar = strengthMeter.querySelector('.progress-bar');
        
        // Calculate password strength
        let strength = 0;
        
        // Length check
        if (password.length >= 6) strength += 1;
        if (password.length >= 10) strength += 1;
        
        // Character type checks
        if (/[A-Z]/.test(password)) strength += 1;
        if (/[a-z]/.test(password)) strength += 1;
        if (/[0-9]/.test(password)) strength += 1;
        if (/[^A-Za-z0-9]/.test(password)) strength += 1;
        
        // Update progress bar
        const percentage = (strength / 6) * 100;
        progressBar.style.width = `${percentage}%`;
        
        // Update color based on strength
        if (percentage < 33) {
          progressBar.className = 'progress-bar bg-danger';
        } else if (percentage < 66) {
          progressBar.className = 'progress-bar bg-warning';
        } else {
          progressBar.className = 'progress-bar bg-success';
        }
      });
    }
  });
});