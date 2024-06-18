document.addEventListener('DOMContentLoaded', function() {
    // Handle the login form submission
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();

        var username = document.getElementById('loginUsername').value;
        var password = document.getElementById('loginPassword').value;
        
        var loginFormData = {
			'username': username,
			'password': password
		}
        
        // Send the data to the LoginServlet using fetch
        fetch('/vedantj_CSCI201_Assignment4/LoginServlet', {
            method: 'POST',
            body: JSON.stringify(loginFormData)
        })
        .then(response => response.json())
        .then(data => {
            if (data === "User authenticated successfully.") {
                // Set a flag in localStorage
                localStorage.setItem('isLoggedIn', true);
                localStorage.setItem('username', username); // Optionally store the username
                
                
                alert("Login successful!");
                // Redirect to the home page or dashboard
                window.location.href = 'index.html';
            } else {
                // Show error message to user
                alert(data);
            }
        })
        .catch(error => {
            console.error('Login failed:', error);
        });
    });

    // Handle the signup form submission
    document.getElementById('signupForm').addEventListener('submit', function(e) {
        e.preventDefault();

        var email = document.getElementById('signupEmail').value;
        var username = document.getElementById('signupUsername').value;
        var password = document.getElementById('signupPassword').value;
        var confirmPassword = document.getElementById('confirmPassword').value;

        // Basic front-end validation
        if(password !== confirmPassword) {
            alert("Passwords do not match!");
            return; // Stop the form submission
        }
        
        var signupFormData = {
			'email': email,
			'username': username,
			'password': password
		}
		
        // Send the data to the RegisterServlet using fetch
        fetch('/vedantj_CSCI201_Assignment4/RegisterServlet', {
            method: 'POST',
            body: JSON.stringify(signupFormData)
        })
        .then(response => response.json())
        .then(data => {
            if (data === "User registered successfully") {

                
                localStorage.setItem('isLoggedIn', true);
			    localStorage.setItem('username', username); // Store the username
			    
			    alert("Registration successful! You are now logged in.");
			    // Redirect to the home page or dashboard
			    window.location.href = 'index.html';
                // Redirect to login or home page
                //window.location.href = 'index.html';
            } else {
                // Show error message to user
                alert(data);
            }
        })
        .catch(error => {
            console.error('Registration failed:', error);
        });
    });
});
