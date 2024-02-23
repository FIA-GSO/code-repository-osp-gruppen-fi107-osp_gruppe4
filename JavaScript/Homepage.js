const userData = JSON.parse(localStorage.getItem('currentUser'));
const BenutzerID = userData.benutzerId;
const Vorname = userData.Vorname;
const EMail = userData.email;
const Admin = userData.admin;
const JWTToken = userData.jwttoken;



async function beitreten() {
    console.log('in der funktion')
    const fetch = require('node-fetch');

    // Constants
    const BASE_URL = "https://lbv.digital";
    const OWNER_CREDENTIALS = {"email": "test", "password": "test"};
    const GROUP_ID = 14; // Group ID for testing
    
    // Function to get JWT token
//    async function getJwtToken(credentials) {
//        const response = await fetch(`${BASE_URL}/login`, {
//            method: 'POST',
//            headers: {
//                'Content-Type': 'application/json'
//            },
//            body: JSON.stringify(credentials)
//        });
//        const data = await response.json();
//        return data.access_token;
//    }
    
    // Function to add a user to a group
    async function addUserToGroup(token, userId, groupId) {
        const data = {"userID": userId, "groupID": groupId};
        const headers = {'Authorization': `Bearer ${token}`};
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
    
    // Acquire JWT token
    getJwtToken(OWNER_CREDENTIALS)
        .then(token => {
            // Assuming userID 1 for testing - replace with an actual userID from your system
            const userId = 6;
            // Add user to group
            return addUserToGroup(token, userId, GROUP_ID);
        })
        .then(response => {
            console.log(`Response Status Code: ${response.status}, Response: `, response.json());
        })
        .catch(error => console.error('Error:', error));
}

let beitreten_button = document.getElementById('beitreten_button')
beitreten_button.addEventListener('click', () => {
    console.log('in der funktion')
    let userdata = beitreten()
    console.log(userdata)
} )