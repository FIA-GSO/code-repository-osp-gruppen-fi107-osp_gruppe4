document.addEventListener('DOMContentLoaded', () => {
//const userData = JSON.parse(localStorage.getItem('currentUser'));
var jwtToken = localStorage.getItem('jwtToken');
            if (!jwtToken) {
                throw new Error('JwtToken nicht gefunden im Local Storage');
            }
//console.log(token)
//const userID = userData.benutzerId;
//const Vorname = userData.Vorname;
//const EMail = userData.email;
//const Admin = userData.admin;
const BASE_URL = "https://lbv.digital";

const auth = {'Authorization': `Bearer ${jwtToken}`};

// Alle Gruppen auslesen und auf der Webseite anzeigen


//const fetch = require('node-fetch');
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
        
            // Erstellen des Beitreten-Buttons für jede Gruppe
            var BeitretenButton = document.createElement("button");
            BeitretenButton.classList.add("delete-button");
            BeitretenButton.textContent = "Beitreten";
            BeitretenButton.addEventListener('click', () => {
                console.log('angeklickt')
                joinGroup(gruppe.groupID, auth);
            })
        
            gruppenInfo.appendChild(heading);
            gruppenInfo.appendChild(beschreibung);
            gruppenInfo.appendChild(nutzer);
            gruppenInfo.appendChild(BeitretenButton); // Hinzufügen des Lösch-Buttons zur Gruppe
            container.appendChild(gruppenInfo);
          });
    })

    function joinGroup(groupId, auth) { //in die function muss userid übergeben werden
        // Daten für den Beitritt zur Gruppe vorbereiten
        console.log('group: ',groupId)
        console.log('auth: ',auth)
        let startDate = getFormattedTimestamp()
        const data = {
            groupId: groupId,
            startingDate: startDate,
            userID: 2      // hier muss auch eine Variable mit userid hin            
            
        };
    
        fetch(`${BASE_URL}/users_in_groups`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': auth
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (response.ok) {
                // Erfolgreich beigetreten
                console.log('Erfolgreich der Gruppe beigetreten.');
            } else {
                // Fehler beim Beitritt
                console.error('Fehler beim Beitritt zur Gruppe:', response.statusText);
            }
        })
        .catch(error => {
            console.error('Fehler beim Fetchen:', error);
        });
    }    


    function getFormattedTimestamp() {
        var date = new Date();
        var days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
        var dayOfWeek = days[date.getUTCDay()];
        var dayOfMonth = date.getUTCDate();
        var month = months[date.getUTCMonth()];
        var year = date.getUTCFullYear();
        var hours = date.getUTCHours();
        var minutes = date.getUTCMinutes();
        var seconds = date.getUTCSeconds();
    
        var timestamp = dayOfWeek + ', ' + dayOfMonth + ' ' + month + ' ' + year + ' ' + hours + ':' + minutes + ':' + seconds + ' GMT';
    
        return timestamp;
    }

})