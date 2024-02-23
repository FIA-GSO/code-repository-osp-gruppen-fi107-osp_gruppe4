const userData = JSON.parse(localStorage.getItem('currentUser'));
const BenutzerID = userData.benutzerId;
const Vorname = userData.Vorname;
const EMail = userData.email;
const Admin = userData.admin;
const JWTToken = userData.jwttoken;


let beitreten_button = document.getElementById('beitreten_button')
beitreten_button.addEventListener('click', () => {
    console.log('in der funktion')
    var gruppenID = this.parentElement.getAttribute('data-gruppenid'); 

    const fetch = require('node-fetch');

    const BASE_URL = "https://lbv.digital";

    // Function to add a user to a group
    async function addUserToGroup(JWTToken, BenutzerID, gruppenID) {
        const data = {"userID": BenutzerID, "groupID": gruppenID};
        const headers = {'Authorization': `Bearer ${JWTToken}`};
        const response = await fetch(`${BASE_URL}/users_in_groups`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                headers
            },
            body: JSON.stringify(data)
        });
        return response;
    }
    
    addUserToGroup(JWTToken, BenutzerID, gruppenID).then(response => {
        console.log(`Response Status Code: ${response.status}, Response: `, response.json());
    })
    .catch(error => console.error('Error:', error));
    
  

} )