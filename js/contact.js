(function($) { "use strict";

	function Selector_Cache() {
		var collection = {};

		function get_from_cache( selector ) {
			if ( undefined === collection[ selector ] ) {
				collection[ selector ] = $( selector );
			}

			return collection[ selector ];
		}

		return { get: get_from_cache };
	}

	var selectors = new Selector_Cache();
	
		jQuery(document).ready(function ($) { // wait until the document is ready
			$('#send').on('click', function(){ // when the button is clicked the code executes
				$('.error').fadeOut('slow'); // reset the error messages (hides them)

				var error = false; // we will set this true if the form isn't valid

				var name = $('input#name').val(); // get the value of the input field
				if(name == "" || name == " ") {
					$('#err-name').fadeIn('slow'); // show the error message
					error = true; // change the error state to true
				}

				var email_compare = /^([a-z0-9_.-]+)@([da-z.-]+).([a-z.]{2,6})$/; // Syntax to compare against input
				var email = $('input#email').val(); // get the value of the input field
				if (email == "" || email == " ") { // check if the field is empty
					$('#err-email').fadeIn('slow'); // error - empty
					error = true;
				}else if (!email_compare.test(email)) { // if it's not empty check the format against our email_compare variable
					$('#err-emailvld').fadeIn('slow'); // error - not right format
					error = true;
				}

				var tel =$('input#tel').val();
				if(tel == "" || tel ==" "){
					$('#err-tel').fadeIn('slow'); // error - empty
					error = true;
				}


				if(error == true) {
					$('#err-form').slideDown('slow');
					return false;
				}

				var data_string = $('#ajax-form').serialize(); // Collect data from form

				$.ajax({
					type: "POST",
					url: $('#ajax-form').attr('action'),
					data: data_string,
					timeout: 6000,
					error: function(request,error) {
						if (error == "timeout") {
							$('#err-timedout').slideDown('slow');
						}
						else {
							$('#err-state').slideDown('slow');
							$("#err-state").html('An error occurred: ' + error + '');
						}
					},
					success: function() {
						$('#ajax-form').slideUp('slow');
						$('#ajaxsuccess').slideDown('slow');
					}
				});

				return false; // stops user browser being directed to the php file
			}); // end click function
	
			// Bind click event to button to trigger validation
			$('button[id="tickit-vld-email"]').on('click', function() {
				validateEmailOrPhone(); // Run the validation when the button is clicked
			});

			// Function to validate the email or phone number
			function validateEmailOrPhone() {
				$('.error').fadeOut('slow'); // Reset error messages
	
				var error = false;
	
				// Validate email or phone number (input field with id #email-otp)
				var email_or_phone = $('#email-otp').val(); 
				var email_compare = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
				var phone_compare = /^[0-9]{10}$/; // Assuming phone number should be 10 digits
	
				if (email_or_phone == "" || email_or_phone == " ") {
					$('#err-email-otp').fadeIn('slow'); // Show error message if empty
					error = true;
				} else if (!email_compare.test(email_or_phone) && !phone_compare.test(email_or_phone)) {
					$('#err-emailvld-otp').fadeIn('slow'); // Show error if it's neither valid email nor phone number
					error = true;
				}
	
				// If there's any error, prevent further actions
				if (error == true) {
					return false; // Prevent further actions if validation fails
				}
	
				// Optionally, you can show a success message if validation passes
				alert("Validation successful!");
			}

			$('button[id="otp-vld"]').on('click', function() {
				validateOtp(); // Run the validation when the button is clicked
			});

			function validateOtp() {
				$('.error').fadeOut('slow'); // Reset error messages
			
				var error = false;
			
				var otp = $('#otp').val();
				if (otp == "" || otp == " ") {
					$('#err-otp').fadeIn('slow'); // Show error if empty
					error = true;
				}
			
				// If there's any error, show the general form error
				if (error == true) {
					return false; // Prevent further action if validation fails
				}
			
				// If validation is successful, show the ticket
				$(".ticket-container").fadeIn('slow');
			}
			
		});
		
  })(jQuery); 

