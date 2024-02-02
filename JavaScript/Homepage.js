async function AlleNutzer() {
    console.log('in der funktion')
    const apiUrl = 'https://lbv.digital/users';

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const usersData = await response.json();

        // Hier könntest du die erhaltenen Benutzerdaten weiterverarbeiten, z.B. ausgeben oder speichern
        console.log('Erhaltene Benutzerdaten:', usersData);

        // Speichern der Benutzerdaten in einer JSON-Datei
        const fs = require('fs'); // Falls im Node.js-Umfeld verwendet wird
        const jsonData = JSON.stringify(usersData, null, 2);
        fs.writeFileSync('usersData.json', jsonData);
        console.log('Benutzerdaten wurden erfolgreich in usersData.json gespeichert.');
    } catch (error) {
        console.error('Beim Abrufen und Speichern der Benutzerdaten ist ein Fehler aufgetreten:', error);
    }
}

let beitreten_button = document.getElementById('beitreten_button')
beitreten_button.addEventListener('click', () => {
    console.log('in der funktion')
    let userdata = AlleNutzer()
    console.log(userdata)
} )