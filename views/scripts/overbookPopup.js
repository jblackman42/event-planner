const hideOverbookPopup = () => {
    const popupContainer = document.querySelector('.overbook-popup-container');
    popupContainer.classList.remove('open')
}
const showOverbookPopup = (Room_ID, Room_Name) => {
    const popupContainer = document.querySelector('.overbook-popup-container');
    popupContainer.classList.add('open')

    popupTitleDOM = document.getElementById('overbook-popup-title');
    popupContentDOM = document.querySelector('.overbook-content');

    popupTitleDOM.innerText = `${Room_Name} Blocked:`;
    const currOverlappingRooms = overlappingEventRooms.filter(eventRooms => eventRooms.room == Room_ID);
    popupContentDOM.innerHTML = currOverlappingRooms.map(eventRooms => {
        return `
            <p><span>${eventRooms.title}</span> <span>${new Date(eventRooms.day).toLocaleDateString()}</span></p>
        `
    }).join('');
}