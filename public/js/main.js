// Global JavaScript for all pages

// Initialize tooltips
document.addEventListener('DOMContentLoaded', function() {
  // Initialize tooltips
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.map(function(tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });

  // Auto-hide flash messages after 5 seconds
  const flashMessages = document.querySelectorAll('.alert.alert-dismissible');
  if (flashMessages.length > 0) {
    setTimeout(function() {
      flashMessages.forEach(function(message) {
        const bsAlert = new bootstrap.Alert(message);
        bsAlert.close();
      });
    }, 5000);
  }

  // Add active class to current nav item
  const currentLocation = window.location.pathname;
  const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
  
  navLinks.forEach(function(link) {
    const href = link.getAttribute('href');
    if (href === currentLocation || (href !== '/' && currentLocation.startsWith(href))) {
      link.classList.add('active');
    }
  });

  // Smooth scroll to anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      if (this.getAttribute('href') !== '#') {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
          targetElement.scrollIntoView({
            behavior: 'smooth'
          });
        }
      }
    });
  });

  // Form validation styles
  const forms = document.querySelectorAll('.needs-validation');
  
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
      }
      
      form.classList.add('was-validated');
    }, false);
  });
});

// Format currency
function formatCurrency(amount) {
  return '$' + parseFloat(amount);
}

// Format date
function formatDate(dateString) {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

// Format datetime
function formatDateTime(dateString) {
  const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString(undefined, options);
}