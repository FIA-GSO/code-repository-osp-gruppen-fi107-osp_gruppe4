// Header Stuff
// Get the isAdmin value from localStorage
let isAdmin = localStorage.getItem('isAdmin');

// If the user is not an admin, hide the admin panel
if (isAdmin = false) {
    document.getElementById('adminPanel').style.display = 'none';
}

var ausloggenbtn = document.getElementById('logoutButton');
ausloggenbtn.addEventListener('click', () => {
    localStorage.removeItem('email');
    localStorage.removeItem('firstName');
    localStorage.removeItem('userId');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('jwtToken');
    window.location.href = '/login';
})

const footer = document.getElementById('footer');
const footerContainer = document.createElement('div');
footerContainer.classList.add('container');
const flexWrap = document.createElement('div');
flexWrap.classList.add('d-flex', 'flex-wrap', 'align-items-center', 'justify-content-center', 'justify-content-lg-start')
const links = document.createElement('ul');
links.classList.add('nav', 'col-12', 'col-lg-auto', 'me-lg-auto', 'mb-2', 'justify-content-start', 'mb-md-0');
const linkList1 = document.createElement('li');
const linkList2 = document.createElement('li');
const linkList3 = document.createElement('li');
const linkList4 = document.createElement('li');
const link1 = document.createElement('a');
const link2 = document.createElement('a');
const link3 = document.createElement('a');
const link4 = document.createElement('a');
link1.classList.add('nav-link', 'px-2', 'text-muted')
link2.classList.add('nav-link', 'px-2', 'text-muted')
link3.classList.add('nav-link', 'px-2', 'text-muted')
link4.classList.add('nav-link', 'px-2', 'text-muted')
link1.innerHTML = 'Impressum';
link2.innerHTML = 'Datenschutz';
link3.innerHTML = 'link3';
link4.innerHTML = 'link4';
link1.href = '/impressum';
const copyrightContainer = document.createElement('ul');
const linkList5 = document.createElement('li');
copyrightContainer.classList.add('nav', 'col-12', 'col-lg-auto', 'justify-content-end');
const copyrightText = document.createElement('p');
copyrightText.classList.add('mb-0', 'text-muted');
copyrightText.innerHTML = '© Georg-Simon-Ohm Berufsschule';
linkList5.appendChild(copyrightText);
copyrightContainer.appendChild(linkList5);
linkList1.appendChild(link1);
linkList2.appendChild(link2);
linkList3.appendChild(link3);
linkList4.appendChild(link4);
links.appendChild(linkList1);
links.appendChild(linkList2);
links.appendChild(linkList3);
links.appendChild(linkList4);
flexWrap.appendChild(links);
flexWrap.appendChild(copyrightContainer)
footerContainer.appendChild(flexWrap);
footer.appendChild(footerContainer);
