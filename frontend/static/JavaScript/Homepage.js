// Constants
const BASE_URL = "https://lbv.digital";
const container = document.getElementById('gruppen-container');


// Depending on if were on /my-groups or /, we need to make the navbar link bold
const currentPath = window.location.pathname;
if (currentPath === '/my-groups') {
    document.getElementById('myGroupsLink').classList.add('active');
    // Make myGroupsLink not clickable
    document.getElementById('myGroupsLink').classList.add('disabled');
} if (currentPath === '/') {
    document.getElementById('allGroupsLink').classList.add('active');
    // Make allGroupsLink not clickable
    document.getElementById('allGroupsLink').classList.add('disabled');
}


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

    const actionButton = createActionButton(gruppe, groupsOfUser, userId, userCountContainer);
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

            // Save as a data attribute of gruppenInfo
            userCountContainer.dataset.userCount = data.length;
            userCountContainer.dataset.maxUsers = gruppe.maxUsers;

            progressBar.style.width = '0%'; // Reset before animation
            setTimeout(() => { // Start animation after reset
                progressBar.style.width = `${percentage}%`;
                progressBar.style.backgroundColor = percentage < 50 ? '#28a745' : percentage < 75 ? '#ffa500' : '#f44336';
            }, 10); // Minimal delay for CSS transition to take effect

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

const createActionButton = (gruppe, groupsOfUser, userId, userCountContainer) => {
    const actionButton = document.createElement("button");
    // Retrieve user count and max users from the userCountContainer data attributes
    const userCount = parseInt(userCountContainer.dataset.userCount);
    const maxUsers = parseInt(userCountContainer.dataset.maxUsers);
    const isFull = userCount >= maxUsers;

    if (groupsOfUser.includes(gruppe.groupID) && userId != gruppe.ownerID) {
        actionButton.innerHTML = '<i class="bi bi-box-arrow-right"></i> Verlassen';
        actionButton.classList.add("button-verlassen");
        actionButton.addEventListener('click', (event) => {
            event.stopPropagation();
            leaveGroup(gruppe.groupID);
        });
    } else if (!groupsOfUser.includes(gruppe.groupID) && userId != gruppe.ownerID && !isFull) {
        actionButton.innerHTML = '<i class="bi bi-box-arrow-in-right"></i> Beitreten';
        actionButton.classList.add("button-beitreten");
        actionButton.addEventListener('click', (event) => {
            event.stopPropagation();
            joinGroup(gruppe.groupID);
        });
    } else if (!groupsOfUser.includes(gruppe.groupID) && userId != gruppe.ownerID && isFull) {
        actionButton.disabled = true;
        actionButton.innerHTML = '<i class="bi bi-box-arrow-in-right"></i> Beitreten';
        actionButton.classList.add("button-beitreten", "disabled");
        // Hide the button if the group is full 
        actionButton.style.display = 'none';
    } else if (userId == gruppe.ownerID) {
        actionButton.innerHTML = '<i class="bi bi-x-lg"></i> Auflösen';
        actionButton.classList.add("button-aufloesen");
        actionButton.addEventListener('click', (event) => {
            event.stopPropagation();
            deleteGroup(gruppe.groupID);
        });
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

    // Set ownerId in local storage (Hack but works)
    localStorage.setItem('ownerId', ownerId);

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

        // Get the user ID from the local storage
        const userId = localStorage.getItem('userId');

        // Only the group owner sees the remove option and cannot remove themselves
        if (String(userId) === String(ownerId) && String(member.userID) !== String(ownerId)) {
            const removeIcon = document.createElement('i');
            removeIcon.className = 'bi bi-x-circle';
            removeIcon.style.color = 'red';
            removeIcon.style.marginLeft = '5px';
            removeIcon.style.cursor = 'pointer';

            removeIcon.addEventListener('click', function () {
                const isConfirmed = confirm("Sind Sie sicher, dass Sie " + member.name + " aus der Gruppe entfernen möchten?");
                if (!isConfirmed) {
                    // User clicked 'Cancel', abort the function
                    return;
                }

                // Assuming the structure is: li > (other elements) > button (this)
                const listItem = this.closest('li');

                // Fetch API to call the endpoint for deleting a user from a group
                const jwtToken = localStorage.getItem('jwtToken'); // Assuming you store your JWT in localStorage
                fetch(`${BASE_URL}/users_in_groups/${member.userID}/${groupId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${jwtToken}`, // Send the JWT in the Authorization header
                    }
                })
                    .then(response => {
                        if (response.ok) {
                            // The user was successfully removed from the group
                            showSuccessToast('Mitglied erfolgreich aus der Gruppe entfernt');
                            // Remove the list item from the DOM
                            listItem.remove();
                        } else {
                            // Handle non-OK responses
                            response.text().then(text => {
                                console.error('Error removing member from group:', text);
                                showErrorToast('Fehler beim Entfernen des Mitglieds aus der Gruppe');
                            });
                        }
                    })
                    .catch(error => {
                        // Handle network errors
                        console.error('Network error when trying to remove member:', error);
                        showErrorToast('Netzwerkfehler beim Versuch, ein Mitglied zu entfernen');
                    });
            });

            memberItem.appendChild(removeIcon);
        }

        memberItem.classList.add('no-padding');

        // Fügt das Listenelement zur Liste hinzu
        membersList.appendChild(memberItem);

    });

    // Get the user ID from the local storage
    const userId = localStorage.getItem('userId');

    const isOwner = String(userId) === String(ownerId);

    // Fetch group dates (Termine) and update the modal
    const dates = await fetchGroupDates(groupId);
    const terminList = document.getElementById('terminList');
    terminList.innerHTML = ''; // Clear previous entries

    // Sort the dates by date so the upcoming ones are first
    dates.sort((a, b) => new Date(a.date) - new Date(b.date));

    dates.forEach(date => {

        console.log('date', date);

        const dateItem = document.createElement('li');
        dateItem.style.listStyleType = 'none';
        dateItem.style.padding = '10px';
        dateItem.style.borderBottom = '1px solid #eee';
        dateItem.style.display = 'flex';
        dateItem.style.alignItems = 'center';
        dateItem.style.paddingLeft = '0px';
        dateItem.style.paddingRight = '0px';

        const dateInfo = document.createElement('span');
        dateInfo.textContent = `${new Date(date.date).toLocaleDateString()} @ ${date.place}`;
        dateInfo.style.fontWeight = 'bold';

        // Fügt die erstellten Elemente zum Listenelement hinzu
        dateItem.appendChild(dateInfo);

        // if maxUsers is not set, the span will not be created




        // Assuming 'userId' is the current user's ID and 'ownerId' is the group owner's ID
        if (String(userId) === String(ownerId)) {
            const editIcon = document.createElement('i');
            editIcon.className = 'bi bi-pencil-square';
            editIcon.style.color = '#316ff8';
            editIcon.style.marginLeft = '5px';
            editIcon.style.marginRight = '0px';
            editIcon.style.cursor = 'pointer';
            editIcon.addEventListener('click', function () {
                // Open the modal for editing
                const editModal = document.getElementById('editDateModal');
                // Populate modal fields with date information
                document.getElementById('editDateInput').value = new Date(date.date).toISOString().substring(0, 10); // Assuming YYYY-MM-DD format
                document.getElementById('editPlaceInput').value = date.place;
                document.getElementById('editMaxUsersInput').value = date.maxUsers;
                document.getElementById('editDateId').value = date.id; // Ensure this is the correct property for the date ID
                // Show the modal
                $('#editDateModal').modal('show');
            });

            // Append the edit icon only if the current user is the owner
            dateItem.appendChild(editIcon);
        }



        if (date.maxUsers) {
            const maxUsers = document.createElement('span');
            maxUsers.textContent = ` Maximale Teilnehmer: ${date.maxUsers}`;
            maxUsers.style.fontSize = '0.8em';
            maxUsers.style.marginLeft = '5px';
            // Set data-date-id attribute to the date's ID
            dateItem.setAttribute('data-date-id', date.id);

            // Set a class for easier identification (.max-users)
            maxUsers.className = 'max-users';

            maxUsers.style.color = '#666';
            dateItem.appendChild(maxUsers);
        }

        if (isOwner) {
            const removeIcon = document.createElement('i');
            removeIcon.className = 'bi bi-x-circle';
            removeIcon.style.color = 'red';

            removeIcon.style.cursor = 'pointer';

            removeIcon.addEventListener('click', function () {
                const isConfirmed = confirm("Sind Sie sicher, dass Sie den Termin am " + new Date(date.date).toLocaleDateString() + " entfernen möchten?");
                if (!isConfirmed) {
                    // User clicked 'Cancel', abort the function
                    return;
                }

                fetch(`${BASE_URL}/dates/${date.id}`, { // Ensure date.dateId is the correct property name for your date's unique ID
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`, // Correctly setting the Authorization header
                    }
                })
                    .then(response => {
                        if (response.ok) {
                            showSuccessToast('Termin erfolgreich entfernt');
                            dateItem.remove(); // Remove the date from the list
                        } else {
                            response.text().then(text => {
                                console.error('Fehler beim Entfernen des Termins:', text);
                                showErrorToast('Fehler beim Entfernen des Termins');
                            });
                        }
                    })
                    .catch(error => {
                        console.error('Netzwerkfehler beim Versuch, einen Termin zu entfernen:', error);
                        showErrorToast('Netzwerkfehler beim Versuch, einen Termin zu entfernen');
                    });

            });

            const placeholder = document.createElement('span');
            placeholder.style.flexGrow = '1';

            dateItem.appendChild(placeholder);

            dateItem.appendChild(removeIcon);
        }

        // Fügt das Listenelement zur Liste hinzu
        terminList.appendChild(dateItem);


        // Only display the last 5 dates
        // if (terminList.children.length > 5) {
        //     terminList.children[0].remove();
        // }
    });
    
    adjustAddDateIconVisibility(userId, ownerId);

    document.addEventListener('DOMContentLoaded', function() {
        const plusIcon = document.querySelector('.bi-plus-circle');
        if (plusIcon) { // Check if the element exists
            plusIcon.addEventListener('click', function () {
                openAddDateModal(groupId); // Ensure groupId is accessible here
            });
        } else {
            console.log('Plus icon not found');
        }
    });
    

    $(document).ready(function () {
        $('[data-toggle="tooltip"]').tooltip(); // Initialisiert alle Tooltips auf der Seite
    });

    // Modal anzeigen
    $('#groupInfoModal').modal('show');
}

function adjustAddDateIconVisibility(userId, ownerId) {
    const terminContainer = document.getElementById('terminContainer');
    // Attempt to find an existing .add-date-icon-container within terminContainer
    let addDateIconContainer = terminContainer.querySelector('.add-date-icon-container');

    if (String(userId) === String(ownerId)) {
        // If the user is the owner but the icon container doesn't exist, create and append it
        if (!addDateIconContainer) {
            addDateIconContainer = document.createElement('div');
            addDateIconContainer.className = 'add-date-icon-container';
            addDateIconContainer.setAttribute('onclick', 'openAddDateModal()');
            addDateIconContainer.innerHTML = `<i class="bi bi-plus-circle" style="cursor: pointer; color: #477cf5; font-size: 2rem;"></i>`;
            terminContainer.appendChild(addDateIconContainer);
        }
    } else {
        // If the user is not the owner and the icon container exists, remove it
        if (addDateIconContainer) {
            addDateIconContainer.remove();
        }
    }
}

function openAddDateModal() {
    const groupId = localStorage.getItem('groupId');
    document.getElementById('addGroupId').value = groupId; // Assuming you have an input field with id="addGroupId" within the modal
    $('#addDateModal').modal('show');
}


async function addDate() {
    const dateValue = document.getElementById('dateInput').value;
    const placeValue = document.getElementById('placeInput').value;
    const maxUsersValue = document.getElementById('maxUsersInput').value;
    const groupID = document.getElementById('addGroupId').value; // Ensure this hidden input exists

    const newDate = {
        date: dateValue,
        place: placeValue,
        maxUsers: maxUsersValue,
        groupID: groupID // Use the correct groupID
    };

    const jwtToken = localStorage.getItem('jwtToken'); // Assuming JWT is stored in localStorage

    try {
        const response = await fetch(`${BASE_URL}/dates`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newDate)
        });

        if (response.ok) {
            const responseData = await response.json(); // Parse JSON response
            showSuccessToast('Neuer Termin erfolgreich erstellt');
            $('#addDateModal').modal('hide'); // Hide the modal

            // Append the new date to the list using the dateID from the response
            const newDateDetails = {
                id: responseData.dateID, // Use the dateID from the server response
                date: dateValue,
                place: placeValue,
                maxUsers: maxUsersValue
            };

            showSuccessToast('Neuer Termin erfolgreich erstellt');
            $('#addDateModal').modal('hide');


            // Now create and append the new date item
            const newDateItem = document.createElement('li');
            newDateItem.style.listStyleType = 'none';
            newDateItem.style.padding = '10px';
            newDateItem.style.borderBottom = '1px solid #eee';
            newDateItem.style.display = 'flex';
            newDateItem.style.alignItems = 'center';
            newDateItem.style.paddingLeft = '0px';
            newDateItem.style.paddingRight = '0px';
            newDateItem.setAttribute('data-date-id', newDateDetails.id);

            const dateInfo = document.createElement('span');
            dateInfo.textContent = `${new Date(newDateDetails.date).toLocaleDateString()} @ ${newDateDetails.place}`;
            dateInfo.style.fontWeight = 'bold';
            newDateItem.appendChild(dateInfo);

            // Create "Neu" Badge
            const now = new Date();
            const joinedDate = new Date(newDateDetails.date);
            const hoursSinceJoined = Math.abs(now - joinedDate) / 36e5;
            if (hoursSinceJoined <= 72) {
                const newBadge = createBadge('Neu', 'bg-secondary');
                newDateItem.appendChild(newBadge);
            }


            isOwner = String(localStorage.getItem('userId')) === String(newDateDetails.ownerID);

            // Append maxUsers if available
            if (newDateDetails.maxUsers) {
                const maxUsersSpan = document.createElement('span');
                maxUsersSpan.textContent = ` Maximale Teilnehmer: ${newDateDetails.maxUsers}`;
                maxUsersSpan.className = 'max-users';
                maxUsersSpan.style.fontSize = '0.8em';
                maxUsersSpan.style.marginLeft = '5px';
                maxUsersSpan.style.color = '#666';
                newDateItem.appendChild(maxUsersSpan);
            }

            if (isOwner) {
                const removeIcon = document.createElement('i');
                removeIcon.className = 'bi bi-x-circle';
                removeIcon.style.color = 'red';

                removeIcon.style.cursor = 'pointer';

                removeIcon.addEventListener('click', function () {
                    const isConfirmed = confirm("Sind Sie sicher, dass Sie den Termin am " + new Date(date.date).toLocaleDateString() + " entfernen möchten?");
                    if (!isConfirmed) {
                        // User clicked 'Cancel', abort the function
                        return;
                    }

                    fetch(`${BASE_URL}/dates/${date.id}`, { // Ensure date.dateId is the correct property name for your date's unique ID
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`, // Correctly setting the Authorization header
                        }
                    })
                        .then(response => {
                            if (response.ok) {
                                showSuccessToast('Termin erfolgreich entfernt');
                                dateItem.remove(); // Remove the date from the list
                            } else {
                                response.text().then(text => {
                                    console.error('Fehler beim Entfernen des Termins:', text);
                                    showErrorToast('Fehler beim Entfernen des Termins');
                                });
                            }
                        })
                        .catch(error => {
                            console.error('Netzwerkfehler beim Versuch, einen Termin zu entfernen:', error);
                            showErrorToast('Netzwerkfehler beim Versuch, einen Termin zu entfernen');
                        });

                });

                const placeholder = document.createElement('span');
                placeholder.style.flexGrow = '1';

                dateItem.appendChild(placeholder);

                dateItem.appendChild(removeIcon);
            }

            // Finally, append the new date item to the list
            document.getElementById('terminList').appendChild(newDateItem);

            // Optionally, you might want to clear the input fields after adding
            document.getElementById('dateInput').value = '';
            document.getElementById('placeInput').value = '';
            document.getElementById('maxUsersInput').value = '';

        } else {
            const errorText = await response.text();
            console.error('Error creating new date:', errorText);
            showErrorToast('Fehler beim Erstellen des neuen Termins');
        }
    } catch (error) {
        console.error('Network error when trying to create new date:', error);
        showErrorToast('Netzwerkfehler beim Versuch, einen neuen Termin zu erstellen');
    }
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

async function updateDate() {
    const dateId = document.getElementById('editDateId').value;
    const dateValue = document.getElementById('editDateInput').value;
    const placeValue = document.getElementById('editPlaceInput').value;
    const maxUsersValue = document.getElementById('editMaxUsersInput').value;

    const updatedDate = {
        date: dateValue,
        place: placeValue,
        maxUsers: maxUsersValue
    };

    const jwtToken = localStorage.getItem('jwtToken'); // Assuming JWT is stored in localStorage

    try {
        const response = await fetch(`${BASE_URL}/dates/${dateId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedDate)
        });

        if (response.ok) {
            showSuccessToast('Termin erfolgreich aktualisiert');
            $('#editDateModal').modal('hide'); // Hide the modal

            // Find the dateItem in the DOM using its data-date-id attribute
            const dateItemToUpdate = document.querySelector(`[data-date-id="${dateId}"]`);
            if (dateItemToUpdate) {
                // Find the maxUsers span within this dateItem
                const maxUsersSpan = dateItemToUpdate.querySelector('.max-users');
                if (maxUsersSpan) {
                    maxUsersSpan.textContent = ` Maximale Teilnehmer: ${maxUsersValue}`;
                } else {
                    // If for some reason the span wasn't found, create and append it
                    const newMaxUsersSpan = document.createElement('span');
                    newMaxUsersSpan.className = 'max-users'; // Add a class for easier identification
                    newMaxUsersSpan.textContent = ` Maximale Teilnehmer: ${maxUsersValue}`;
                    newMaxUsersSpan.style.fontSize = '0.8em';
                    newMaxUsersSpan.style.color = '#666';
                    dateItemToUpdate.appendChild(newMaxUsersSpan);
                }
            }
        } else {
            const errorText = await response.text();
            console.error('Error updating date:', errorText);
            showErrorToast('Fehler beim Aktualisieren des Termins');
        }
    } catch (error) {
        console.error('Network error when trying to update date:', error);
        showErrorToast('Netzwerkfehler beim Versuch, einen Termin zu aktualisieren');
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



function getQueryParams() {
    const params = {};
    const queryString = window.location.search.substring(1);
    const regex = /([^&=]+)=([^&]*)/g;
    let m;

    while (m = regex.exec(queryString)) {
        params[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
    }

    return params;
}

document.addEventListener("DOMContentLoaded", function () {
    const container = document.querySelector('#gruppen-container'); // Adjust selector to your actual container


    if (!container) {
        return;
    }

    const observer = new MutationObserver(function (mutationsList, observer) {
        // Check if the highlightedGroup element is now present
        const queryParams = getQueryParams();
        const highlightedGroup = queryParams['highlightedGroup'];
        const targetElement = document.querySelector(`[data-group-id="${highlightedGroup}"]`);

        if (targetElement) {
            observer.disconnect(); // Stop observing once we've found our element
            const boundShowGroupInfoModal = showGroupInfoModal.bind(targetElement);
            boundShowGroupInfoModal();
        }
    });

    // Configuration of the observer:
    const config = { childList: true, subtree: true };

    // Start observing the target node for configured mutations
    observer.observe(container, config);
});


const deleteGroup = async (groupId) => {
    const jwtToken = localStorage.getItem('jwtToken');


    // Pop-up to confirm the deletion
    const confirmation = confirm('Sind Sie sicher, dass Sie diese Gruppe auflösen möchten?');
    if (!confirmation) {
        return;
    }

    try {
        const response = await fetch(`${BASE_URL}/groups/${groupId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${jwtToken}`
            }
        });

        if (response.ok) {
            showSuccessToast('Gruppe erfolgreich gelöscht.');
            // Refresh the group cards to reflect the deletion
            refreshGroupCards();
        } else {
            const errorText = await response.text();
            showErrorToast(`Fehler beim Löschen der Gruppe: ${errorText}`);
            console.error('Error deleting group:', errorText);
        }
    } catch (error) {
        showErrorToast('Fehler beim Löschen der Gruppe');
        console.error('Error deleting group:', error);
    }
};

let cookieBanner = document.getElementById("cb-cookie-banner");
function checkCookieConsent() {
    var consent = localStorage.getItem('cookieConsentLBV');
    console.log(consent)
        if (consent !== 'true') {
        cookieBanner.classList.add("alert", "alert-dark", "text-center", "mb-0");
        const Datenschutzlink = document.createElement('a');
        Datenschutzlink.href = "/datenschutz";
        Datenschutzlink.innerHTML = 'Datenschutzerklärung';
        const okButton = document.createElement("button");
        okButton.classList.add("btn", "btn-primary", "btn-sm", "ms-3");
        okButton.innerHTML = "Alles klar!";
        okButton.addEventListener('click', function() {
            window.cb_hideCookieBanner();
        })
        cookieBanner.innerHTML = "🍪🛠️ Diese Webseite nutzt ausschließlich technisch notwendige Cookies. Weitere Informationen finden Sie in unserer ";
        cookieBanner.appendChild(Datenschutzlink);
        cookieBanner.appendChild(okButton);
        }
}


function hideCookieBanner() {
    localStorage.setItem("cookieConsentLBV", true);
    cookieBanner.style.display = "none";
}

window.cb_hideCookieBanner = hideCookieBanner;