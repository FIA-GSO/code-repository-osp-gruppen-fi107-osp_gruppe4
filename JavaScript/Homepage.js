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
                    var userCountContainer = document.createElement("div");
                    userCountContainer.style.width = '20%'; // Assuming you want the container to be full width
                    userCountContainer.style.backgroundColor = '#e0e0e0';
                    userCountContainer.style.borderRadius = '5px';
                    userCountContainer.style.overflow = 'hidden';
                    userCountContainer.style.position = 'relative';
                    userCountContainer.style.display = 'flex'; // Use flexbox to align icon and progress bar
                    userCountContainer.style.alignItems = 'center'; // Align items vertically in the center

                    var iconContainer = document.createElement("div");
                    iconContainer.style.backgroundColor = 'white'; // Set the background color to white
                    iconContainer.style.borderRadius = '5px 0 0 5px'; // Rounded corners on the left side to match the userCountContainer
                    iconContainer.style.display = 'flex';
                    iconContainer.style.alignItems = 'center';
                    iconContainer.style.justifyContent = 'center';
                    iconContainer.style.padding = '0 4px'; // Padding to ensure the icon is not sticking to the edges
                    iconContainer.style.height = '20px'; // Match the height of the progressBar

                    // Create the icon element and set its classes
                    var icon = document.createElement("i");
                    icon.className = "bi bi-people";
                    icon.style.webkitTextStroke = '0.5px'; // Add a 1px stroke to the icon
                    icon.style.fontSize = '1.3em'; // Set the font size to 1.2em

                    iconContainer.appendChild(icon); // Append the icon to the icon container
                    userCountContainer.appendChild(iconContainer); // Append the icon container to the user count container

                    var progressBar = document.createElement("div");
                    progressBar.style.height = '20px'; // Set a fixed height for the progress bar
                    progressBar.style.borderRadius = '0 5px 5px 0'; // Rounded corners on the right side
                    progressBar.style.transition = 'width 0.5s ease-in-out'; // Smooth transition for loading

                    userCountContainer.appendChild(progressBar); // Append the progress bar to the container


                    $(userCountContainer).attr({
                        'data-bs-toggle': 'tooltip',
                        'data-bs-placement': 'top',
                        'title': 'Loading...'
                    });

                    // Set the tooltip text after fetching the member count
                    try {
                        const response = await fetch(`${BASE_URL}/groups/${gruppe.groupID}/members`, {
                            method: 'GET',
                            headers: { 'Authorization': 'Bearer ' + jwtToken }
                        });

                        if (response.ok) {
                            const data = await response.json();
                            const percentage = (data.length / gruppe.maxUsers) * 100;
                            progressBar.style.width = `${percentage}%`;
                            progressBar.style.backgroundColor = percentage < 50 ? '#347bfa' : percentage < 75 ? '#ffa500' : '#f44336'; // Blue, Orange, Red based on percentage
                            // Update the tooltip title with the member count
                            $(userCountContainer).attr('title', `${data.length}/${gruppe.maxUsers} Mitglieder`).tooltip('_fixTitle');
                        } else {
                            throw new Error('Nutzer der Gruppe konnten nicht gelesen werden.');
                        }
                    } catch (error) {
                        console.error(error);
                    }

                    // Initialize all tooltips on the page
                    $(function () {
                        $('[data-bs-toggle="tooltip"]').tooltip();
                    });







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
                    // gruppenInfo.appendChild(nutzer);
                    gruppenInfo.appendChild(userCountContainer);
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

        // Fetch group members and update the modal
        const members = await fetchGroupMembers(groupId);
        const membersList = document.getElementById('groupMembersList');
        membersList.innerHTML = ''; // Vorherige Einträge löschen
        members.forEach(member => {
            const memberItem = document.createElement('li');
            memberItem.style.listStyleType = 'none';
            memberItem.style.padding = '10px';
            memberItem.style.borderBottom = '1px solid #eee';
            memberItem.style.display = 'flex';
            memberItem.style.alignItems = 'center';
            memberItem.style.paddingLeft = '0px';

            // Bild des Mitglieds hinzufügen
            const memberImage = new Image();
            memberImage.src = member.profilePicture;
            memberImage.style.width = '40px';
            memberImage.style.height = '40px';
            memberImage.style.borderRadius = '50%';
            memberImage.style.marginRight = '15px';

            // Neuen Mechanismus für Badges vorbereiten
            const badgesContainer = document.createElement('div');
            badgesContainer.style.display = 'flex';
            badgesContainer.style.flexDirection = 'row';
            badgesContainer.style.alignItems = 'center';
            badgesContainer.style.flexWrap = 'wrap';

            // Eigentümer- und Neu-Badge Bedingungen
            const now = new Date();
            const joinedDate = new Date(member.startingDate);
            const hoursSinceJoined = Math.abs(now - joinedDate) / 36e5;

            console.log('groupId', groupId);
            console.log('ownerId', ownerId);
            console.log('member.userID', member.userID);



            if (String(member.userID) === String(ownerId)) {
                const ownerBadge = createBadge('Eigentümer', 'bg-primary');
                badgesContainer.appendChild(ownerBadge);
            }
            if (hoursSinceJoined <= 72) {
                const newMemberBadge = createBadge('Neu', 'bg-secondary');
                badgesContainer.appendChild(newMemberBadge);
            }

            const memberName = document.createElement('span');
            memberName.textContent = member.name;
            memberName.style.fontWeight = 'bold';

            const placeholder = document.createElement('span');
            placeholder.style.flexGrow = '1';

            const memberJoinedDate = document.createElement('span');
            memberJoinedDate.textContent = joinedDate.toLocaleDateString();
            memberJoinedDate.style.fontSize = '0.8em';
            memberJoinedDate.style.color = '#666';
            memberJoinedDate.setAttribute('title', `Beigetreten am ${joinedDate.toLocaleDateString()} ${joinedDate.toLocaleTimeString()}`);
            memberJoinedDate.setAttribute('data-toggle', 'tooltip');

            // Fügt die erstellten Elemente zum Listenelement hinzu
            memberItem.appendChild(memberImage);
            memberItem.appendChild(memberName);
            memberItem.appendChild(badgesContainer); // Fügt den Container für Badges hinzu
            memberItem.appendChild(placeholder);
            memberItem.appendChild(memberJoinedDate);

            memberItem.classList.add('no-padding');

            // Fügt das Listenelement zur Liste hinzu
            membersList.appendChild(memberItem);
        });




        $(document).ready(function () {
            $('[data-toggle="tooltip"]').tooltip(); // Initialisiert alle Tooltips auf der Seite
        });

        // Modal anzeigen
        $('#groupInfoModal').modal('show');
    }

    function createBadge(text, className) {
        const badge = document.createElement('span');
        badge.classList.add('badge', className);
        badge.textContent = text;
        badge.style.marginLeft = '5px';
        return badge;
    }

    async function fetchGroupMembers(groupId) {
        try {
            const response = await fetch(`${BASE_URL}/members_of_group/${groupId}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.ok) {
                const members = await response.json();
                const memberDetails = await Promise.all(members.map(async (member) => {
                    const name = await fetchUserName(member.userID);
                    const profilePicture = await fetchProfilePictureUrl(member.userID); // Angenommen, diese Funktion ist definiert
                    return { ...member, name, profilePicture };
                }));
                return memberDetails;
            } else {
                console.error('Failed to fetch group members');
                return [];
            }
        } catch (error) {
            console.error('Error fetching group members', error);
            return [];
        }
    }

    async function fetchProfilePictureUrl(userId) {
        let adminToken = localStorage.getItem('jwtToken');
        let profilePictureUrl = `https://lbv.digital/profile_picture/${userId}`;
        try {
            const response = await fetch(profilePictureUrl, {
                headers: { 'Authorization': `Bearer ${adminToken}` }
            });
            if (response.ok) {
                const imageBlob = await response.blob();
                return URL.createObjectURL(imageBlob);
            } else {
                return 'default-profile-picture-url'; // URL zu einem Standardprofilbild
            }
        } catch (error) {
            console.error('Error fetching profile picture:', error);
            return 'default-profile-picture-url';
        }
    }



    async function fetchUserName(userId) {
        try {
            const response = await fetch(`${BASE_URL}/users/${userId}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            if (response.ok) {
                const data = await response.json();
                return data.firstName; // oder fullName, falls verfügbar
            } else {
                console.error('Failed to fetch user');
                return 'Unknown User';
            }
        } catch (error) {
            console.error('Error fetching user', error);
            return 'Unknown User';
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

