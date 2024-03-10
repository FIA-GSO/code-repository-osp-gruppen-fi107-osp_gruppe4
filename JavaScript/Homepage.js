const BASE_URL = 'https://lbv.digital';

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
                        aktionButton.innerHTML = '<i class="bi bi-box-arrow-right"></i> Verlassen';
                        aktionButton.classList.add("button-verlassen");
                        aktionButton.addEventListener('click', () => {
                            leaveGroup(gruppe.groupID);
                        });
                    } else if (!groupsOfUser.includes(gruppe.groupID) && userId != gruppe.ownerID) {
                        aktionButton.innerHTML = '<i class="bi bi-box-arrow-in-right"></i> Beitreten';
                        aktionButton.classList.add("button-beitreten");
                        aktionButton.addEventListener('click', () => {
                            joinGroup(gruppe.groupID);
                        });
                    } else if (userId == gruppe.ownerID) {
                        aktionButton.innerHTML = '<i class="bi bi-x-lg"></i> Auflösen';
                        aktionButton.classList.add("button-aufloesen");
                    }
                    // "Backend Daten" in HTML-Elemente speichern
                    gruppenInfo.dataset.groupId = gruppe.groupID; // This adds a data-group-id attribute to the div
                    gruppenInfo.dataset.ownerId = gruppe.ownerID; // This adds a data-owner-id attribute to the div
                    gruppenInfo.dataset.title = gruppe.title; // This adds a data-title attribute to the div
                    gruppenInfo.dataset.description = gruppe.description; // This adds a data-description attribute to the div

                    gruppenInfo.addEventListener('click', showGroupInfoModal);

                    // HTML-Elemente anhängen (usersided)
                    gruppenInfo.appendChild(heading);
                    gruppenInfo.appendChild(beschreibung);
                    gruppenInfo.appendChild(nutzer);
                    gruppenInfo.appendChild(termin);
                    gruppenInfo.appendChild(aktionButton);

                    container.appendChild(gruppenInfo);
                }
            }
        })



        async function showGroupInfoModal(event) {
            // Retrieve data from the clicked group
            const title = this.dataset.title;
            const description = this.dataset.description;
            const ownerId = this.dataset.ownerId;
            const groupId = this.dataset.groupId; // Make sure this is set correctly
        
            // Show preliminary data in the modal
            document.getElementById('groupInfoModalLabel').textContent = title;
            document.getElementById('groupDescription').textContent = description;
            document.getElementById('groupOwner').textContent = 'Loading...';
        
            // Fetch the owner's name using ownerId and update the modal
            const ownerName = await fetchOwnerName(ownerId);
            document.getElementById('groupOwner').textContent = `Owner: ${ownerName}`;
        
            // Fetch group members and update the modal
            const members = await fetchGroupMembers(groupId);
            const membersList = document.getElementById('groupMembersList');
            membersList.innerHTML = ''; // Clear previous member list entries
            members.forEach(member => {
                const memberItem = document.createElement('li');
                memberItem.textContent = `User ID: ${member.userID}, Joined: ${member.startingDate}`;
                membersList.appendChild(memberItem);
            });
        
            // Finally, show the modal
            $('#groupInfoModal').modal('show');
        }
        
        
        async function fetchGroupMembers(groupId) {
            try {
                const response = await fetch(`${BASE_URL}/members_of_group/${groupId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        // Include your authorization header here if needed
                        // 'Authorization': 'Bearer ' + YOUR_TOKEN_HERE
                    }
                });
        
                if (response.ok) {
                    const members = await response.json();
                    return members; // Returns the array of members
                } else {
                    console.error('Failed to fetch group members');
                    return []; // Return an empty array or handle accordingly
                }
            } catch (error) {
                console.error('Error fetching group members', error);
                return []; // Return an empty array as a fallback
            }
        }
        

        async function fetchOwnerName(ownerId) {
            try {
                const response = await fetch(`${BASE_URL}/users/${ownerId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });
        
                if (response.ok) {
                    const data = await response.json();
                    return `${data.firstName}`; // Assuming you just want the first name
                } else {
                    console.error('Owner not found');
                    return 'Owner not found'; // Return a default message or handle accordingly
                }
            } catch (error) {
                console.error('Failed to fetch owner', error);
                return 'Failed to load owner'; // Return a default error message
            }
        }
        

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

