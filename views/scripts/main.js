

function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
        c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
        }
    }
    return "";
}

const user_id = getCookie('user_id');
const access_token = getCookie('access_token');

const getUser = async () => {
    return axios({
        method: 'get',
        url: '/api/oauth/me',
        params: {
            user_id: user_id,
            token: access_token
        }
    })
        .then(response => response.data)
        .then(data => data.user)
}

const loading = () => {
    const loadingScreen = document.getElementById('loadingScreen')
    loadingScreen.style.visibility = 'visible';
    loadingScreen.style.display = 'grid';
}
const doneLoading = () => {
    const loadingScreen = document.getElementById('loadingScreen')
    loadingScreen.style.visibility = 'hidden';
    loadingScreen.style.display = 'none';
}

const toggleColorScheme = () => {
    var colorScheme = localStorage.getItem('colorScheme');  

    if (colorScheme == 'light') {
        localStorage.setItem('colorScheme', 'dark');
    } else {
        localStorage.setItem('colorScheme', 'light');
    }
    updateColorScheme();
}

const root = document.querySelector(':root');

const updateColorScheme = () => {
    var colorScheme = localStorage.getItem('colorScheme');
    if (colorScheme == 'light') {
        root.style.setProperty('--backgroundColor', '#f7f1e3');
        root.style.setProperty('--primary-font-color', '#17161d');
        root.style.setProperty('--secondary-font-color', '#f1f2f6');
        root.style.setProperty('--primary-bg-color', '#e4dccf');
        root.style.setProperty('--secondary-bg-color', '#b2bec3');
        root.style.setProperty('--red-accent-color', '#e74c3c');
        root.style.setProperty('--blue-accent-color', '#3498db');
        root.style.setProperty('--blue-accent-color2', '#2980b9');
        root.style.setProperty('--arrow-button-color', '#b2bec3');
    } else if (colorScheme == 'dark') {
        root.style.setProperty('--backgroundColor', 'hsl(200, 4%, 14%)');
        root.style.setProperty('--primary-font-color', '#f1f2f6');
        root.style.setProperty('--secondary-font-color', '#17161d');
        root.style.setProperty('--primary-bg-color', 'hsl(0, 1%, 21%)');
        root.style.setProperty('--secondary-bg-color', 'hsl(0, 1%, 36%)');
        root.style.setProperty('--red-accent-color', '#e74c3c');
        root.style.setProperty('--blue-accent-color', '#3498db');
        root.style.setProperty('--blue-accent-color2', '#2980b9');
        root.style.setProperty('--arrow-button-color', 'gray');
    }
}
updateColorScheme();