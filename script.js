// Responsive Design Helper
function adjustForDevice() {
    const viewportWidth = window.innerWidth;
    if (viewportWidth < 768) {
        document.body.classList.add('mobile');
    } else {
        document.body.classList.remove('mobile');
    }
}

window.addEventListener('resize', adjustForDevice);
window.addEventListener('load', adjustForDevice);

// Smooth Login and Signup Process
const users = []; // Array to store user data (for demonstration purposes)

function login(username, password) {
    const user = users.find(user => user.username === username && user.password === password);
    if (user) {
        alert('Login successful!');
        // Redirect or perform post-login actions
    } else {
        alert('Invalid username or password.');
    }
}

function signup(username, password) {
    const userExists = users.some(user => user.username === username);
    if (userExists) {
        alert('Username already exists.');
    } else {
        users.push({ username, password });
        alert('Signup successful! You can now log in.');
    }
}

// Example usage (replace with actual form handling logic)
document.getElementById('loginForm')?.addEventListener('submit', function (e) {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    login(username, password);
});

document.getElementById('signupForm')?.addEventListener('submit', function (e) {
    e.preventDefault();
    const username = document.getElementById('signupUsername').value;
    const password = document.getElementById('signupPassword').value;
    signup(username, password);
});

document.addEventListener('DOMContentLoaded', function() {
    // Add image loading animations
    const images = document.querySelectorAll('img:not(.logo-image)');
    
    function handleImageLoad(img) {
        img.classList.add('loaded');
    }

    images.forEach(img => {
        if (img.complete) {
            handleImageLoad(img);
        } else {
            img.addEventListener('load', () => handleImageLoad(img));
        }
    });
});