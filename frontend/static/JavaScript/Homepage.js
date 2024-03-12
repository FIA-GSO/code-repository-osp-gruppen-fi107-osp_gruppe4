// Constants
const BASE_URL = "https://lbv.digital";
const container = document.getElementById('gruppen-container');

// Helper functions
const redirectToLoginIfUnauthorized = () => {
    const jwtToken = localStorage.getItem('jwtToken');
    if (!jwtToken) {
        window.location.href = '/login';
        throw new Error('JwtToken nicht gefunden im Local Storage');
    }
    return jwtToken;
};

const fetchWithAuth = async (url, options = {}) => {
    const jwtToken = localStorage.getItem('jwtToken');
    const headers = new Headers({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`,
        ...options.headers,
    });

    const response = await fetch(url, { ...options, headers });
    if (!response.ok) {
        throw new Error('Network response was not ok.');
    }
    return response.json();
};

const displayGroups = async (groups, groupsOfUser, userId) => {
    let currentPath = window.location.pathname;
    for (const gruppe of groups) {
        if ((currentPath === '/my-groups' && (groupsOfUser.includes(gruppe.groupID) || userId === gruppe.ownerID)) ||
            currentPath === '/') {
            const gruppenInfo = await createGroupElement(gruppe, groupsOfUser, userId); // Use await here
            container.appendChild(gruppenInfo);
        }
    }
};

const createGroupElement = async (gruppe, groupsOfUser, userId) => {
    const gruppenInfo = document.createElement("div");
    gruppenInfo.classList.add("gruppen-info");
    gruppenInfo.dataset.groupId = gruppe.groupID;
    gruppenInfo.dataset.ownerId = gruppe.ownerID;
    gruppenInfo.dataset.title = gruppe.title;
    gruppenInfo.dataset.description = gruppe.description;

    gruppenInfo.appendChild(createElementWithText('h3', gruppe.title));
    gruppenInfo.appendChild(createElementWithText('p', gruppe.description));
    // Wait for the user count container to be ready before appending
    const userCountContainer = await createUserCountContainer(gruppe, userId);
    gruppenInfo.appendChild(userCountContainer); // This now waits for the promise to resolve
    gruppenInfo.appendChild(createElementWithText('p', gruppe.termin));
    const actionButton = await createActionButton(gruppe, groupsOfUser, userId); // Make sure createActionButton is async if it needs to be
    gruppenInfo.appendChild(actionButton);

    gruppenInfo.addEventListener('click', showGroupInfoModal);

    return gruppenInfo;
};

const createElementWithText = (tag, text) => {
    const element = document.createElement(tag);
    element.textContent = text;
    return element;
};

const createUserCountContainer = async (gruppe, userId) => {
    const userCountContainer = document.createElement("div");
    userCountContainer.className = "user-count-container";

    const iconContainer = document.createElement("div");
    iconContainer.className = "icon-container";

    const icon = document.createElement("i");
    icon.className = "bi bi-people icon";
    iconContainer.appendChild(icon);
    userCountContainer.appendChild(iconContainer);

    const progressBar = document.createElement("div");
    progressBar.className = "progress-bar";
    userCountContainer.appendChild(progressBar);

    $(userCountContainer).attr({
        'data-bs-toggle': 'tooltip',
        'data-bs-placement': 'top',
        'title': 'Loading...'
    });

    try {
        const response = await fetch(`${BASE_URL}/groups/${gruppe.groupID}/members`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('jwtToken')}` }
        });

        if (response.ok) {
            const data = await response.json();
            const percentage = (data.length / gruppe.maxUsers) * 100;
            progressBar.style.width = `${percentage}%`;
            progressBar.style.backgroundColor = percentage < 50 ? '#347bfa' : percentage < 75 ? '#ffa500' : '#f44336';

            $(userCountContainer).attr('title', `${data.length}/${gruppe.maxUsers} Mitglieder`).tooltip('_fixTitle');
        } else {
            throw new Error('Nutzer der Gruppe konnten nicht gelesen werden.');
        }
    } catch (error) {
        console.error(error);
    }

    $('[data-bs-toggle="tooltip"]').tooltip(); // Re-initialize tooltips globally might not be necessary each time

    return userCountContainer;
};


const createActionButton = (gruppe, groupsOfUser, userId) => {
    // Implementation of action button creation
    const actionButton = document.createElement("button");
    // Further implementation here...
    if (groupsOfUser.includes(gruppe.groupID) && userId != gruppe.ownerID) {
        actionButton.innerHTML = '<i class="bi bi-box-arrow-right"></i> Verlassen';
        actionButton.classList.add("button-verlassen");
        actionButton.addEventListener('click', () => {
            event.stopPropagation(); // Prevent click event from bubbling to the parent elements
            leaveGroup(gruppe.groupID);
        });
    } else if (!groupsOfUser.includes(gruppe.groupID) && userId != gruppe.ownerID) {
        actionButton.innerHTML = '<i class="bi bi-box-arrow-in-right"></i> Beitreten';
        actionButton.classList.add("button-beitreten");
        actionButton.addEventListener('click', () => {
            event.stopPropagation(); // Prevent click event from bubbling to the parent elements

            joinGroup(gruppe.groupID);
        });
    } else if (userId == gruppe.ownerID) {
        actionButton.innerHTML = '<i class="bi bi-x-lg"></i> Auflösen';
        actionButton.classList.add("button-aufloesen");
    }
    return actionButton;
};



const fetchAndDisplayUserGroups = async (userId) => {
    const groupsOfUser = await fetchWithAuth(`${BASE_URL}/users_in_groups/${userId}/`);
    return groupsOfUser.map(group => group.groupID);
};

const fetchAndDisplayAllGroups = async (userId, groupsOfUser) => {
    const allGroups = await fetchWithAuth(`${BASE_URL}/groups`);
    await displayGroups(allGroups, groupsOfUser, userId);
};

const initialize = async () => {
    const jwtToken = redirectToLoginIfUnauthorized();
    const userId = localStorage.getItem('userId');
    const groupsOfUser = await fetchAndDisplayUserGroups(userId);
    await fetchAndDisplayAllGroups(userId, groupsOfUser);
};

document.addEventListener('DOMContentLoaded', initialize);




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

    // Fetch group dates (Termine) and update the modal
    const dates = await fetchGroupDates(groupId);
    const terminList = document.getElementById('terminList');
    terminList.innerHTML = ''; // Clear previous entries
    dates.forEach(date => {
        const dateItem = document.createElement('li');
        dateItem.style.listStyleType = 'none';
        dateItem.style.padding = '10px';
        dateItem.style.borderBottom = '1px solid #eee';
        dateItem.style.display = 'flex';
        dateItem.style.alignItems = 'center';
        dateItem.style.paddingLeft = '0px';

        const dateInfo = document.createElement('span');
        dateInfo.textContent = `${new Date(date.date).toLocaleDateString()} @ ${date.place}`;
        dateInfo.style.fontWeight = 'bold';

        const maxUsers = document.createElement('span');
        maxUsers.textContent = ` Maximale Teilnehmer: ${date.maxUsers}`;
        maxUsers.style.fontSize = '0.8em';
        maxUsers.style.marginLeft = '15px';
        maxUsers.style.color = '#666';

        console.log('date', date);

        // Fügt die erstellten Elemente zum Listenelement hinzu
        dateItem.appendChild(dateInfo);
        dateItem.appendChild(maxUsers);

        // Fügt das Listenelement zur Liste hinzu
        terminList.appendChild(dateItem);
        console.log('terminList', terminList);

        // Only display the last 5 dates
        if (terminList.children.length > 5) {
            terminList.children[0].remove();
        }
    });


    $(document).ready(function () {
        $('[data-toggle="tooltip"]').tooltip(); // Initialisiert alle Tooltips auf der Seite
    });

    // Modal anzeigen
    $('#groupInfoModal').modal('show');
}

async function fetchGroupDates(groupId) {
    try {
        const jwtToken = localStorage.getItem('jwtToken');
        // Adjusted URL to include groupId in the request path
        const response = await fetch(`${BASE_URL}/groups/${groupId}/dates`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${jwtToken}`
            }
        });

        if (!response.ok) {
            throw new Error('Network response was not ok.');
        }

        const dates = await response.json();
        console.log('Fetched group dates:', dates);

        // This now correctly returns only the dates for the specific group
        return dates;


    } catch (error) {
        console.error('Error fetching group dates:', error);
        return [];
    }
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


const joinGroup = async (groupId) => {
    const jwtToken = localStorage.getItem('jwtToken');
    const userId = localStorage.getItem('userId');

    const addUserData = {
        userID: userId,
        groupID: groupId
    };

    try {
        const response = await fetch(`${BASE_URL}/users_in_groups`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwtToken}`
            },
            body: JSON.stringify(addUserData)
        });

        if (response.ok) {
            showSuccessToast('Erfolgreich der Gruppe beigetreten.');
            // Now, refresh the group cards dynamically
            refreshGroupCards();
        } else {
            const errorText = await response.text();
            showErrorToast(`Fehler beim Beitritt zur Gruppe: ${errorText}`);
            console.error('Error joining group:', errorText);
        }
    } catch (error) {
        showErrorToast('Fehler beim Beitritt zur Gruppe');
        console.error('Error joining group:', error);
    }
};

const clearGroupCards = () => {
    // Assuming 'container' is the parent element of your group cards
    container.innerHTML = ''; // This removes all child nodes, effectively clearing the content
};

const refreshGroupCards = async () => {
    const userId = localStorage.getItem('userId');
    clearGroupCards();
    // Assuming you have a function to fetch and display groups, e.g., fetchAndDisplayAllGroups
    const groupsOfUser = await fetchAndDisplayUserGroups(userId);
    await fetchAndDisplayAllGroups(userId, groupsOfUser);
};

const leaveGroup = async (groupId) => {
    try {
        const jwtToken = localStorage.getItem('jwtToken');
        const userId = localStorage.getItem('userId');
        const response = await fetch(`${BASE_URL}/users_in_groups/${userId}/${groupId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${jwtToken}`
            }
        });

        if (response.ok) {
            showSuccessToast('Erfolgreich aus der Gruppe ausgetreten.');
            // Dynamically update the group cards
            refreshGroupCards();
        } else {
            showErrorToast('Fehler beim Austritt aus der Gruppe');
            console.log('Fehler beim Austritt aus der Gruppe:', response.statusText);
        }
    } catch (error) {
        showErrorToast('Fehler beim Austritt aus der Gruppe');
        console.error('Fehler beim Fetchen:', error);
    }
};