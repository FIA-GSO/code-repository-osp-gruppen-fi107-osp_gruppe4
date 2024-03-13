const userId = localStorage.getItem('userId');
var ausloggenbtn = document.getElementById('logoutButton')
ausloggenbtn.addEventListener('click', () => {
    localStorage.removeItem('email');
    localStorage.removeItem('firstName');
    localStorage.removeItem('userId');
    localStorage.removeItem('isAdmin');
    window.location.href = '/Views/login.html';
})

async function neueGruppeErstellen() {
    try {
        var gruppennameInput = document.getElementById("gruppenname");
        var beschreibungInput = document.getElementById("beschreibung");
        var maxMitgliederInput = document.getElementById("maxMitglieder");

        var gruppenname = gruppennameInput.value.trim();
        var beschreibung = beschreibungInput.value.trim();
        var maxMitglieder = parseInt(maxMitgliederInput.value);

        if (gruppenname !== "" && beschreibung !== "" && !isNaN(maxMitglieder) && maxMitglieder > 0) {
            var neueGruppe = {
                title: gruppenname,
                description: beschreibung,
                maxUsers: maxMitglieder,
                ownerID: userId,
            };

            var jwtToken = localStorage.getItem('jwtToken');
            const response = await fetch('https://lbv.digital/groups', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${jwtToken}`
                },
                body: JSON.stringify(neueGruppe)
            });

            if (!response.ok) {
                showErrorToast('Fehler beim Erstellen der Gruppe');
                throw new Error('Fehler beim Erstellen der Gruppe');
            }

            gruppennameInput.value = "";
            beschreibungInput.value = "";
            maxMitgliederInput.value = "";

            if (response.ok) {
                const groupData = await response.json(); // Assuming the response includes the group data with a groupID
                const groupID = groupData.groupID; // Replace with the correct property if different
                showSuccessToast('Gruppe erfolgreich erstellt');
                window.location.href = `/my-groups?highlightedGroup=${groupID}`; // Redirect and pass the groupID as a query parameter
            }


        } else {
            showErrorToast('Bitte füllen Sie alle Felder aus und geben Sie eine gültige maximale Anzahl von Mitgliedern an.');
        }
    } catch (error) {
        showErrorToast('Fehler beim Erstellen der Gruppe');
        showErrorToast(error.toString());
    }
}


// Event-Listener für den Button "Gruppe erstellen"
document.getElementById("neueGruppeErstellenButton").addEventListener("click", neueGruppeErstellen);

// Event-Listener für die Buttons zum Löschen einer Gruppe (mit der Klasse "delete-button")
var deleteButtons = document.querySelectorAll(".delete-button");
deleteButtons.forEach(function (button, index) {
    button.addEventListener("click", function () {
        deleteGruppe(index);
    });
});