// Header Stuff
// Get the isAdmin value from localStorage
let isAdmin = localStorage.getItem('isAdmin');

// If the user is not an admin, hide the admin panel
if (isAdmin = false) {
    document.getElementById('adminPanel').style.display = 'none';
}

var ausloggenbtn = document.getElementById('logoutButton');
ausloggenbtn.addEventListener('click', () => {
    localStorage.removeItem('email');
    localStorage.removeItem('firstName');
    localStorage.removeItem('userId');
    localStorage.removeItem('isAdmin');
    window.location.href = '/Views/login.html';
})