let adminToken = localStorage.getItem('jwtToken');

// Check if the token exists
if (adminToken) {
    // Redirect to /login if there is no token
    window.location.href = '/Views/login.html';
}

document.querySelector('.form-signin').addEventListener('submit', function(event) {
    event.preventDefault();

    var email = document.getElementById('inputEmail').value;
    var password = document.getElementById('inputPassword').value;

    fetch('https://lbv.digital/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: email,
            password: password
        })
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error('Login fehlgeschlagen');
        }
    })
    .then(data => {
        // Speichern des JWT-Tokens im lokalen Speicher oder in einer Variablen
        localStorage.setItem('jwtToken', data.access_token); // oder eine andere Speichermethode

        // Weiterleitung zum Dashboard oder zur nächsten Seite
        window.location.href = '/Views/Homepage.html'; // URL anpassen
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Login fehlgeschlagen: ' + error.message);
    });
});