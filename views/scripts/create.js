const eventCreatorDOM = document.querySelector('#event-creator');
const primaryContactDOM = document.querySelector('#primary-contact');

let user;
const loadForm = async () => {
    user = await getUser();
    let allUsers = await getAllUsers();
    const blockedUserIDs = [14881,14746,10925,9709,9504,9429,9229,9092,6908,6580,5,2,1]
    allUsers = allUsers.filter(user => !blockedUserIDs.includes(user.Id))

    primaryContactDOM.innerHTML = allUsers.map(userInfo => {
        return `
            <option value='${userInfo.Id}'>
                ${userInfo.Name}
            </option>
        `
    })
    primaryContactDOM.value = user.UserId;

    eventCreatorDOM.innerText = user.DisplayName.split(', ').reverse().join(' ');
    console.log(allUsers)
}
loadForm();

const handleSubmit = async (e) => {
    e.preventDefault();
}