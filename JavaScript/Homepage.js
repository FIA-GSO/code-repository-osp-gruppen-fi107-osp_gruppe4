document.addEventListener('DOMContentLoaded', () => {
//const userData = JSON.parse(localStorage.getItem('currentUser'));
const jwtToken = localStorage.getItem('jwtToken');
            if (!jwtToken) {
                throw new Error('JwtToken nicht gefunden im Local Storage');
            }
//console.log(token)
const userId = 2//userData.benutzerId;
//const Vorname = userData.Vorname;
//const EMail = userData.email;
//const Admin = userData.admin;
const BASE_URL = "https://lbv.digital";

const auth = {'Authorization': `Bearer ${jwtToken}`};

// Auslesen der Gruppen in welchen der aktuelle Nutzer bereits eingeschrieben ist
const groupsOfUser = []
fetch(`${BASE_URL}/users_in_groups/${userId}/`,{
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
        for (let i = 0 ; i < data.length; i++){
            groupsOfUser.push(data[i].groupID)
        } 
    })


// Alle Gruppen auslesen und auf der Webseite anzeigen
fetch(`${BASE_URL}/groups`,{
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
    .then(data => {
        var alleGruppen = data;
        let currentPath = window.location.pathname
        console.log(data)
        const container = document.getElementById('gruppen-container');
        alleGruppen.forEach(function(gruppe) {
            var gruppenInfo = document.createElement("div");
            gruppenInfo.classList.add("gruppen-info");
        
            var heading = document.createElement("h3");
            heading.textContent = gruppe.title;
        
            var beschreibung = document.createElement("p");
            beschreibung.textContent = gruppe.description;
        
            var nutzer = document.createElement("p");
            nutzer.textContent = "MaxNutzer: " + gruppe.maxUsers;
            //console.log(gruppe.groupID);
            //console.log(groupsOfUser);
            var aktionButton = document.createElement("button");
                aktionButton.classList.add("delete-button");
            if (groupsOfUser.includes(gruppe.groupID)){
                // Erstellen des Verlassen-Buttons für jede Gruppe
                console.log('leave')
                aktionButton.textContent = "Verlassen";
                aktionButton.addEventListener('click', () => {
                    console.log('angeklickt')
                    leaveGroup(gruppe.groupID);
                })
            } else
            {
                // Erstellen des Beitreten-Buttons für jede Gruppe
                aktionButton.textContent = "Beitreten";
                aktionButton.addEventListener('click', () => {
                    joinGroup(gruppe.groupID);
                })
            }
            gruppenInfo.appendChild(heading);
            gruppenInfo.appendChild(beschreibung);
            gruppenInfo.appendChild(nutzer);
            gruppenInfo.appendChild(aktionButton); // Hinzufügen des Lösch-Buttons zur Gruppe
            container.appendChild(gruppenInfo);
          });
    })

    function joinGroup(groupId) {
        // Daten für den Beitritt zur Gruppe vorbereiten
        console.log('group: ',groupId)
        console.log('auth: ',jwtToken)

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
            } else {
                // Fehler beim Beitritt
                window.alert('Fehler beim Beitritt zur Gruppe:', response.statusText);
            }
        })
        .catch(error => {
            console.error('Fehler beim Fetchen:', error);
        });
    }    

    function leaveGroup(groupId){
        fetch(`${BASE_URL}/users_in_groups/${userId}/${groupId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': 'Bearer ' + adminToken
            }
        })
        .then(response => {
            if (response.ok) {
                // Erfolgreich beigetreten
                console.log('Erfolgreich der Gruppe ausgetreten.');
            } else {
                // Fehler beim Beitritt
                console.log('Fehler beim Austritt aus der Gruppe:', response.statusText);
            }
        })

    }
})