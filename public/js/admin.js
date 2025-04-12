// Admin Dashboard JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Toggle sidebar
    const sidebarToggle = document.getElementById('sidebarToggle');
    if (sidebarToggle) {
      sidebarToggle.addEventListener('click', function() {
        document.querySelector('#wrapper').classList.toggle('toggled');
      });
    }
  
    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function(tooltipTriggerEl) {
      return new bootstrap.Tooltip(tooltipTriggerEl);
    });
  
    // Add active class to current sidebar link
    const currentPath = window.location.pathname;
    const sidebarLinks = document.querySelectorAll('#sidebar-wrapper .list-group-item');
    
    sidebarLinks.forEach(function(link) {
      const href = link.getAttribute('href');
      if (href && (href === currentPath || (href !== '/' && currentPath.startsWith(href)))) {
        link.classList.add('active');
      }
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
  
    // Confirm delete actions
    const deleteButtons = document.querySelectorAll('.btn-delete');
    deleteButtons.forEach(function(button) {
      button.addEventListener('click', function(e) {
        if (!confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
          e.preventDefault();
        }
      });
    });
  
    // Form validation
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
  
    // Date range picker initialization
    const dateRangePickers = document.querySelectorAll('.daterangepicker-input');
    if (dateRangePickers.length > 0) {
      dateRangePickers.forEach(function(picker) {
        $(picker).daterangepicker({
          opens: 'left',
          autoUpdateInput: false,
          locale: {
            cancelLabel: 'Clear',
            format: 'YYYY-MM-DD'
          }
        });
  
        $(picker).on('apply.daterangepicker', function(ev, picker) {
          $(this).val(picker.startDate.format('YYYY-MM-DD') + ' - ' + picker.endDate.format('YYYY-MM-DD'));
        });
  
        $(picker).on('cancel.daterangepicker', function(ev, picker) {
          $(this).val('');
        });
      });
    }
  
    // File input preview
    const fileInputs = document.querySelectorAll('input[type="file"]');
    fileInputs.forEach(function(input) {
      input.addEventListener('change', function(e) {
        const fileLabel = input.nextElementSibling;
        if (fileLabel && fileLabel.classList.contains('custom-file-label')) {
          fileLabel.textContent = input.files.length > 0 ? input.files[0].name : 'Choose file';
        }
      });
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
  
  // Print report
  function printReport() {
    window.print();
  }