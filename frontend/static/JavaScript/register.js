var email;
var check = false;
function checkEmail() {
    var tempemail = document.getElementById('inputEmail').value;
    var pattern = /^[a-zA-Z0-9._-]+@gso\.schule\.koeln$/;
    var result = pattern.test(tempemail);
    var emailErrorElement = document.getElementById("emailError");
    if (!result) {
        emailErrorElement.innerHTML = "Bitte geben Sie eine gültige E-Mail-Adresse mit @gso.schule.koeln ein.";
            return false;
    } else {
        emailErrorElement.innerHTML = "";
        email = tempemail;
        return true;
    }
}
console.log(email)
document.querySelector('.form-signin').addEventListener('submit', function(event) {
    event.preventDefault();

    checkEmail()
    
    
    var firstname = document.getElementById('inputName').value;
    var password = document.getElementById('inputPassword').value;
    var isAdmin;

    console.log(email)

    fetch(`https://lbv.digital/users/email/${encodeURIComponent(email)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            } 
        })
        .then(response => {
            if (response.ok) {
                throw new Error('Nutzer ist bereits registriert');
            } else {
                fetch('https://lbv.digital/users', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        firstName: firstname,
                        email: email,
                        password: password,
                        isAdmin: isAdmin
                    })
                })
                .then(response => {
                    if (response.ok) {
                        window.location.href = '/login';
                        return response.json();
                    } else {
                        throw new Error('Login fehlgeschlagen');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('Login fehlgeschlagen: ' + error.message);
                });
            }
        })
});