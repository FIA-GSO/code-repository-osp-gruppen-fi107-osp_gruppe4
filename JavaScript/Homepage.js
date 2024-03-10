// Header Stuff
// Get the isAdmin value from localStorage
let isAdmin = localStorage.getItem('isAdmin');

// If the user is not an admin, hide the admin panel
if (isAdmin = false) {
    document.getElementById('adminPanel').style.display = 'none';
}

// Function to fetch and display the profile picture
function fetchProfilePicture() {
    // Get the user ID from the JWT token
    let adminToken = localStorage.getItem('jwtToken');

    // Get the user ID from localStorage
    let userId = localStorage.getItem('userId');

    // API endpoint to fetch the profile picture
    let profilePictureUrl = `https://lbv.digital/profile_picture/${userId}`;

    // Fetch the profile picture
    fetch(profilePictureUrl, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
    })
        .then(response => {
            if (response.ok) {
                console.log("Profile picture found");
                return response.blob(); // If image is found, response will be a blob
            } else {
                throw new Error('Profilbild nicht gefunden');
            }
        })
        .then(imageBlob => {
            // Convert the blob to a URL and set it as the src of the image element
            let imageUrl = URL.createObjectURL(imageBlob);
            document.getElementById('profilePicture').src = imageUrl;
        })
        .catch(error => {
            console.error('Error:', error.message);
        });
}

// Call the function on page load or at a suitable time
fetchProfilePicture();



// Gruppen Stuff
document.addEventListener('DOMContentLoaded', () => {
    const jwtToken = localStorage.getItem('jwtToken');
    if (!jwtToken) {
        window.location.href = '/Views/login.html';
        throw new Error('JwtToken nicht gefunden im Local Storage');
    }
    const userId = localStorage.getItem('userId');
    const BASE_URL = "https://lbv.digital";
    const auth = { 'Authorization': `Bearer ${jwtToken}` };

    var ausloggenbtn = document.getElementById('logoutButton');
    ausloggenbtn.addEventListener('click', () => {
        localStorage.removeItem('email');
        localStorage.removeItem('firstName');
        localStorage.removeItem('userId');
        localStorage.removeItem('isAdmin');
        window.location.href = '/Views/login.html';
    })

    // Auslesen der Gruppen in welchen der aktuelle Nutzer bereits eingeschrieben ist
    const groupsOfUser = []
    fetch(`${BASE_URL}/users_in_groups/${userId}/`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + jwtToken
        },
    })
        .then(response => {
            if (response.ok) {

                return response.json();
            } else {
                throw Error('Gruppen des Nutzers konnten nicht gelesen werden.');
            }
        })
        .then(data => {
            for (let i = 0; i < data.length; i++) {
                groupsOfUser.push(data[i].groupID)
            }
        })
    console.log('1.groupsofuser', groupsOfUser);

    // Alle Gruppen auslesen und auf der Webseite anzeigen
    fetch(`${BASE_URL}/groups`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            auth
        }
    })
        .then(response => {
            if (response.ok) {
                //   console.log(response.json())

                return response.json();
            } else {
                throw new Error('Gruppen konnten nicht gelesen werden.');
            }
        })
        .then(async data => {
            var alleGruppen = data;
            let currentPath = window.location.pathname;
            const container = document.getElementById('gruppen-container');
            for (const gruppe of alleGruppen) {
                if ((currentPath == '/Views/myGroups.html' && (groupsOfUser.includes(gruppe.groupID) || userId == gruppe.ownerID)) ||
                    currentPath == '/Views/Homepage.html') {
        
                    var gruppenInfo = document.createElement("div");
                    gruppenInfo.classList.add("gruppen-info");
        
                    var heading = document.createElement("h3");
                    heading.textContent = gruppe.title;
        
                    var beschreibung = document.createElement("p");
                    beschreibung.textContent = gruppe.description;
        
                    var termin = document.createElement("p");
                    termin.textContent = gruppe.termin;
        
                    var nutzer = document.createElement("p");
        
                    try {
                        const response = await fetch(`${BASE_URL}/groups/${gruppe.groupID}/members`, {
                            method: 'GET',
                            headers: { 'Authorization': 'Bearer ' + jwtToken }
                        });
        
                        if (response.ok) {
                            const data = await response.json();
                            nutzer.textContent = `${data.length}/${gruppe.maxUsers}`;
                        } else {
                            throw new Error('Nutzer der Gruppe konnten nicht gelesen werden.');
                        }
                    } catch (error) {
                        console.error(error);
                    }
        
                    var aktionButton = document.createElement("button");
                    if (groupsOfUser.includes(gruppe.groupID) && userId != gruppe.ownerID) {
                        aktionButton.textContent = "Verlassen";
                        aktionButton.style.backgroundColor = "#ffc107";
                        aktionButton.addEventListener('click', () => {
                            leaveGroup(gruppe.groupID);
                        });
                    } else if (!groupsOfUser.includes(gruppe.groupID) && userId != gruppe.ownerID) {
                        aktionButton.textContent = "Beitreten";
                        aktionButton.addEventListener('click', () => {
                            joinGroup(gruppe.groupID);
                        });
                    } else if (userId == gruppe.ownerID) {
                        aktionButton.textContent = "Auflösen";
                        aktionButton.style.backgroundColor = "#DC3545";
                    }
        
                    gruppenInfo.appendChild(heading);
                    gruppenInfo.appendChild(beschreibung);
                    gruppenInfo.appendChild(nutzer);
                    gruppenInfo.appendChild(termin);
                    gruppenInfo.appendChild(aktionButton);
                    container.appendChild(gruppenInfo);
                }
            }
        })
        
        
        



    function joinGroup(groupId) {
        // Daten für den Beitritt zur Gruppe vorbereiten
        let addUserData = {
            userID: userId,
            groupID: groupId
        };
        fetch(`${BASE_URL}/users_in_groups`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + jwtToken
            },
            body: JSON.stringify(addUserData)
        })
            .then(response => {
                if (response.ok) {
                    // Erfolgreich beigetreten
                    window.alert('Erfolgreich der Gruppe beigetreten.');
                    location.reload()
                } else {
                    // Fehler beim Beitritt
                    window.alert('Fehler beim Beitritt zur Gruppe:', response.statusText);
                }
            })
            .catch(error => {
                console.error('Fehler beim Fetchen:', error);
            });
    }

    function leaveGroup(groupId) {
        fetch(`${BASE_URL}/users_in_groups/${userId}/${groupId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': 'Bearer ' + jwtToken
            }
        })
            .then(response => {
                if (response.ok) {
                    // Erfolgreich beigetreten
                    console.log('Erfolgreich der Gruppe ausgetreten.');
                    location.reload()
                } else {
                    // Fehler beim Beitritt
                    console.log('Fehler beim Austritt aus der Gruppe:', response.statusText);
                }
            })

    }
})

