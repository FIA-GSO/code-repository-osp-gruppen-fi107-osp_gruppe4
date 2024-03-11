
// Function to fetch and display the profile picture
function fetchProfilePicture() {
    // Get the user ID from the JWT token
    let adminToken = localStorage.getItem('jwtToken');

    // Get the user ID from localStorage
    let userId = localStorage.getItem('userId');

    // API endpoint to fetch the profile picture
    let profilePictureUrl = `https://lbv.digital/profile_picture/${userId}`;

    // Fetch the profile picture
    fetch(profilePictureUrl, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
    })
        .then(response => {
            if (response.ok) {
                console.log("Profile picture found");
                return response.blob(); // If image is found, response will be a blob
            } else {
                throw new Error('Profilbild nicht gefunden');
            }
        })
        .then(imageBlob => {
            // Convert the blob to a URL and set it as the src of the image element
            let imageUrl = URL.createObjectURL(imageBlob);
            document.getElementById('profilePicture').src = imageUrl;
        })
        .catch(error => {
            console.error('Error:', error.message);
        });
}

// Call the function on page load or at a suitable time
fetchProfilePicture();
