document.addEventListener('DOMContentLoaded', () => {
//const userData = JSON.parse(localStorage.getItem('currentUser'));
const token = JSON.parse(localStorage.getItem('jwtToken'));
//const BenutzerID = userData.benutzerId;
//const Vorname = userData.Vorname;
//const EMail = userData.email;
//const Admin = userData.admin;
const JWTToken = token.jwttoken;
//const BASE_URL = "https://lbv.digital";
const BASE_URL = "http://127.0.0.1:5000";
const auth = {'Authorization': `Bearer ${JWTToken}`};

// Alle Gruppen auslesen und auf der Webseite anzeigen

const fetch = require('node-fetch');
fetch(`${BASE_URL}/groups`,{
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
        auth 
    },
    body: JSON.stringify({
        groupID: groupID,
        ownerID: ownerID,
        title: title,
        description: description,
        maxUsers: maxUsers
    })
    })
    .then(response => {
        if (response.ok) {
            var alleGruppen = response.json();
            alleGruppen.forEach(function(gruppe, index) {
                var gruppenInfo = document.createElement("div");
                gruppenInfo.classList.add("gruppen-info");
            
                var heading = document.createElement("h3");
                heading.textContent = gruppe.name;
            
                var beschreibung = document.createElement("p");
                beschreibung.textContent = gruppe.beschreibung;
            
                var nutzer = document.createElement("p");
                nutzer.textContent = "Nutzer: " + gruppe.nutzer;
            
                // Erstellen des Lösch-Buttons für jede Gruppe
                var deleteButton = document.createElement("button");
                deleteButton.classList.add("delete-button");
                deleteButton.textContent = "L";
                deleteButton.onclick = function() {
                  deleteGruppe(index);
                };
            
                gruppenInfo.appendChild(heading);
                gruppenInfo.appendChild(beschreibung);
                gruppenInfo.appendChild(nutzer);
                gruppenInfo.appendChild(deleteButton); // Hinzufügen des Lösch-Buttons zur Gruppe
                gruppenContainer.appendChild(gruppenInfo);
              });
        //    return response.json();
        } else {
            throw new Error('Gruppen konnten nicht gelesen werden.');
        }
    })


// In Gruppe beitreten
let beitreten_button = document.getElementById('beitreten_button')
beitreten_button.addEventListener('click', function (auth) {
    console.log('in der funktion')
    var gruppenID = this.parentElement.getAttribute('data-gruppenid'); 

    const fetch = require('node-fetch');

    

    // Function to add a user to a group
    async function addUserToGroup(auth, BenutzerID, gruppenID) {
        const data = {"userID": BenutzerID, "groupID": gruppenID};     
        const response = await fetch(`${BASE_URL}/users_in_groups`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                auth
            },
            body: JSON.stringify(data)
        });
        return response;
    }
    
    addUserToGroup(auth,JWTToken, BenutzerID, gruppenID).then(response => {
        console.log(`Response Status Code: ${response.status}, Response: `, response.json());
    })
    .catch(error => console.error('Error:', error));
    
  

} )
})