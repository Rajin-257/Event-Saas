// Main JavaScript file for Event Management System

document.addEventListener('DOMContentLoaded', function() {
    // Auto-close alerts after 5 seconds
    setTimeout(function() {
      const alerts = document.querySelectorAll('.alert');
      alerts.forEach(function(alert) {
        const bsAlert = new bootstrap.Alert(alert);
        bsAlert.close();
      });
    }, 5000);
  
    // Apply coupon code functionality
    const couponForm = document.getElementById('coupon-form');
    if (couponForm) {
      couponForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const couponCode = document.getElementById('coupon-code').value;
        const eventId = document.getElementById('event-id').value;
        const ticketTypeId = document.getElementById('ticket-type-id').value;
        const quantity = document.getElementById('quantity').value;
        
        // Show loading state
        document.getElementById('apply-coupon-btn').innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Applying...';
        
        // Send AJAX request to validate coupon
        fetch('/apply-coupon', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            couponCode,
            eventId,
            ticketTypeId,
            quantity
          }),
        })
        .then(response => response.json())
        .then(data => {
          // Reset button state
          document.getElementById('apply-coupon-btn').innerHTML = 'Apply Coupon';
          
          // Show result
          const resultDiv = document.getElementById('coupon-result');
          
          if (data.success) {
            // Update price display
            document.getElementById('basePrice').textContent = data.basePrice.toFixed(2);
            document.getElementById('discountAmount').textContent = data.discountAmount.toFixed(2);
            document.getElementById('finalPrice').textContent = data.finalPrice.toFixed(2);
            document.getElementById('finalPriceInput').value = data.finalPrice;
            document.getElementById('couponCodeInput').value = data.couponCode;
            
            // Show success message
            resultDiv.innerHTML = `<div class="alert alert-success">${data.message}</div>`;
            
            // Show discount section
            document.getElementById('discount-section').classList.remove('d-none');
          } else {
            // Show error message
            resultDiv.innerHTML = `<div class="alert alert-danger">${data.message}</div>`;
          }
        })
        .catch(error => {
          console.error('Error:', error);
          document.getElementById('apply-coupon-btn').innerHTML = 'Apply Coupon';
          document.getElementById('coupon-result').innerHTML = '<div class="alert alert-danger">An error occurred. Please try again.</div>';
        });
      });
    }
  
    // QR code scanner functionality for check-in
    const qrScanner = document.getElementById('qr-scanner');
    if (qrScanner) {
      // This is a placeholder for QR scanner integration
      // In a real implementation, you would use a library like instascan or html5-qrcode
      console.log('QR scanner element found. Integration would go here.');
      
      // Simulate a successful scan for demo purposes
      const scanButton = document.getElementById('scan-btn');
      if (scanButton) {
        scanButton.addEventListener('click', function() {
          const eventId = document.getElementById('event-id').value;
          
          // Simulate scanning a QR code
          const simulatedTicketNumber = 'TKT-' + Math.random().toString(36).substring(2, 10).toUpperCase();
          
          // Show loading state
          scanButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Scanning...';
          
          // Send check-in request
          fetch(`/events/${eventId}/check-in`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              ticketNumber: simulatedTicketNumber,
              method: 'qr_code'
            }),
          })
          .then(response => response.json())
          .then(data => {
            // Reset button state
            scanButton.innerHTML = 'Scan QR Code';
            
            // Show result
            const resultDiv = document.getElementById('check-in-result');
            
            if (data.success) {
              resultDiv.innerHTML = `
                <div class="alert alert-success">
                  <h5>Check-in Successful!</h5>
                  <p><strong>Attendee:</strong> ${data.ticketData.attendeeName}</p>
                  <p><strong>Ticket:</strong> ${data.ticketData.ticketNumber}</p>
                  <p><strong>Event:</strong> ${data.ticketData.eventName}</p>
                </div>
              `;
            } else {
              resultDiv.innerHTML = `<div class="alert alert-danger">${data.message}</div>`;
            }
          })
          .catch(error => {
            console.error('Error:', error);
            scanButton.innerHTML = 'Scan QR Code';
            document.getElementById('check-in-result').innerHTML = '<div class="alert alert-danger">An error occurred. Please try again.</div>';
          });
        });
      }
    }
  
    // Manual check-in form handling
    const manualCheckInForm = document.getElementById('manual-check-in-form');
    if (manualCheckInForm) {
      manualCheckInForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const eventId = document.getElementById('event-id').value;
        const ticketNumber = document.getElementById('ticket-number').value;
        
        // Show loading state
        document.getElementById('check-in-btn').innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Checking in...';
        
        // Create form data to handle file upload
        const formData = new FormData(manualCheckInForm);
        
        // Send check-in request
        fetch(`/events/${eventId}/manual-check-in`, {
          method: 'POST',
          body: formData
        })
        .then(response => response.json())
        .then(data => {
          // Reset button state
          document.getElementById('check-in-btn').innerHTML = 'Check In';
          
          // Show result
          const resultDiv = document.getElementById('manual-check-in-result');
          
          if (data.success) {
            // Clear form
            document.getElementById('ticket-number').value = '';
            document.getElementById('attendee-photo').value = '';
            
            resultDiv.innerHTML = `
              <div class="alert alert-success">
                <h5>Check-in Successful!</h5>
                <p><strong>Attendee:</strong> ${data.ticketData.attendeeName}</p>
                <p><strong>Ticket:</strong> ${data.ticketData.ticketNumber}</p>
                <p><strong>Event:</strong> ${data.ticketData.eventName}</p>
              </div>
            `;
          } else {
            resultDiv.innerHTML = `<div class="alert alert-danger">${data.message}</div>`;
          }
        })
        .catch(error => {
          console.error('Error:', error);
          document.getElementById('check-in-btn').innerHTML = 'Check In';
          document.getElementById('manual-check-in-result').innerHTML = '<div class="alert alert-danger">An error occurred. Please try again.</div>';
        });
      });
    }
  
    // Copy referral link to clipboard
    const referralLinkBtn = document.getElementById('copy-referral-link');
    if (referralLinkBtn) {
      referralLinkBtn.addEventListener('click', function() {
        const referralLink = document.getElementById('referral-link').value;
        
        navigator.clipboard.writeText(referralLink).then(function() {
          // Success message
          const originalText = referralLinkBtn.innerHTML;
          referralLinkBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
          
          setTimeout(function() {
            referralLinkBtn.innerHTML = originalText;
          }, 2000);
        }, function(err) {
          console.error('Could not copy text: ', err);
        });
      });
    }
  
    // Dashboard chart initialization
    const salesChartCanvas = document.getElementById('sales-chart');
    if (salesChartCanvas) {
      // This is a placeholder for chart integration
      // In a real implementation, you would use a library like Chart.js
      console.log('Sales chart canvas found. Chart integration would go here.');
    }
  });