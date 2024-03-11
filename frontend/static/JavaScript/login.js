let adminToken = localStorage.getItem('jwtToken');
// Check if the token exists
let globaleMail = localStorage.getItem('email');
if (globaleMail) {
    localStorage.removeItem('email');
}

let globalName = localStorage.getItem('firstName');
if (globalName) {
    localStorage.removeItem('firstName');
}

let globaleId = localStorage.getItem('userId');
if (globaleId) {
    localStorage.removeItem('userId');
}

let globaleAdmin = localStorage.getItem('isAdmin');
if (globaleAdmin) {
    localStorage.removeItem('isAdmin');
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

        fetch(`https://lbv.digital/users/email/${encodeURIComponent(email)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            } 
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Login fehlgeschlagen');
            }
        })
        .then(data => {
            localStorage.setItem('email',data.email);
            localStorage.setItem('userId', data.userID);
            localStorage.setItem('firstName',data.firstName);
            localStorage.setItem('isAdmin',data.isAdmin);

            // Weiterleitung zum Dashboard oder zur nächsten Seite
            window.location.href = '/';
        })
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Login fehlgeschlagen: ' + error.message);
    });
});