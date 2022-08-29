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