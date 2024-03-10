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

