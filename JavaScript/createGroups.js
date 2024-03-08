const userId = localStorage.getItem('userId');

async function neueGruppeErstellen() {
    try {
        var gruppennameInput = document.getElementById("gruppenname");
        var beschreibungInput = document.getElementById("beschreibung");
        var maxMitgliederInput = document.getElementById("maxMitglieder");
        var terminInput = document.getElementById("termin");
      
        var gruppenname = gruppennameInput.value.trim();
        var beschreibung = beschreibungInput.value.trim();
        var maxMitglieder = parseInt(maxMitgliederInput.value);
        var terminAuswahl = terminInput.value.trim();
      
        if (gruppenname !== "" && beschreibung !== "" && !isNaN(maxMitglieder) && maxMitglieder > 0) {
            // Daten der neuen Gruppe
            var neueGruppe = {
                title: gruppenname,
                description: beschreibung,
                groupID: 0,
                maxUsers: maxMitglieder,
                ownerID: userId, 
            };
      
            var jwtToken = localStorage.getItem('jwtToken');
            if (!jwtToken) {
                throw new Error('JwtToken nicht gefunden im Local Storage');
            }
            console.log(neueGruppe)
            const response = await fetch('https://lbv.digital/groups', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${jwtToken}`
                },
                body: JSON.stringify(neueGruppe)
            });

            if (!response.ok) {
                throw new Error('Fehler beim Erstellen der Gruppe');
            }

            console.log('Neue Gruppe erfolgreich erstellt');

            gruppennameInput.value = "";
            beschreibungInput.value = "";
            maxMitgliederInput.value = "";
            fterminInput.value = "";

        } else {
            alert("Bitte füllen Sie alle Felder aus und geben Sie eine gültige maximale Anzahl von Mitgliedern an.");
        }
    } catch (error) {
        console.error('Fehler beim Erstellen der Gruppe:', error);
    }
}

function deleteGruppe(index) {
    try {
        var currentUser = getLoggedInUser(); 

        var gespeicherteGruppen = JSON.parse(localStorage.getItem("gruppen")) || [];
        var gruppe = gespeicherteGruppen[index];

        if (gruppe.owner === currentUser) {
            gespeicherteGruppen.splice(index, 1);
            localStorage.setItem("gruppen", JSON.stringify(gespeicherteGruppen));
            anzeigenGruppen();
        } else {
            alert("Sie haben keine Berechtigung, diese Gruppe zu löschen.");
        }
    } catch (error) {
        console.error('Fehler beim Löschen der Gruppe:', error);
    }
}

// Event-Listener für den Button "Gruppe erstellen"
document.getElementById("neueGruppeErstellenButton").addEventListener("click", neueGruppeErstellen);

// Event-Listener für die Buttons zum Löschen einer Gruppe (mit der Klasse "delete-button")
var deleteButtons = document.querySelectorAll(".delete-button");
deleteButtons.forEach(function(button, index) {
    button.addEventListener("click", function() {
        deleteGruppe(index);
    });
});