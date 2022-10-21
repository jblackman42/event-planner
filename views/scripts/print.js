const url = document.location.search
const eventId = new URLSearchParams(url).get('id');

const generalSectionDOM = document.getElementById('general');
const roomsSectionDOM = document.getElementById('rooms');
const equipmentSectionDOM = document.getElementById('equipment');
const servicesSectionDOM = document.getElementById('services')

const showEvent = async () => {
    loading();

    const event = await getEvent(eventId)
    const {Cancelled, Congregation_ID, Description, Event_End_Date, Event_ID, Event_Start_Date, Event_Title, Event_Type_ID, Location_ID, Meeting_Instructions, Minutes_for_Cleanup, Minutes_for_Setup, Participants_Expected, Primary_Contact, Program_ID} = event;

    const eventTypes = await getEventTypes();
    const congregations = await getCongregations();
    const locations = await getLocations();
    const programs = await getPrograms();
    const user = await getContactFromID(Primary_Contact);
    const allEquipment = await getEquipment();
    const eventEquipment = await getEquipmentReservations(Event_ID);
    const eventServices = await getServiceReservations(Event_ID);

    const roomIds = await getEventRoomIDs(Event_ID);
    const rooms = [];
    for (id of roomIds) {
        rooms.push(await getRoom(id))
    }
    const buildingIds = [... new Set(rooms.map(room => room.Building_ID))]
    const buildings = [];
    for (id of buildingIds) {
        buildings.push(await getBuilding(id))
    }
    const eventServiceIds = [... new Set(eventServices.map(service => service.Service_ID))]
    const services = [];
    for (id of eventServiceIds) {
        services.push(await getService(id))
    }

    generalSectionDOM.innerHTML = `
        <h1>General:</h1>
        
        <div class="field">
            <p class="label">Event Title:</p>
            <p class="value">${Event_Title}</p>
        </div>
        <div class="field">
            <p class="label">Event Type:</p>
            <p class="value">${eventTypes.filter(eventType => eventType.Event_Type_ID == Event_Type_ID)[0].Event_Type }</p>
        </div>
        <div class="field">
            <p class="label">Congregation:</p>
            <p class="value">${congregations.filter(congregation => congregation.Congregation_ID == Congregation_ID)[0].Congregation_Name}</p>
        </div>
        <div class="field">
            <p class="label">Location:</p>
            <p class="value">${locations.filter(location => location.Location_ID == Location_ID)[0].Location_Name}</p>
        </div>
        <div class="field">
            <p class="label">Meeting Instructions:</p>
            <p class="value">${Meeting_Instructions}</p>
        </div>
        <div class="field">
            <p class="label">Description:</p>
            <p class="value">${Description}</p>
        </div>
        <div class="field">
            <p class="label">Program:</p>
            <p class="value">${programs.filter(program => program.Program_ID == Program_ID)[0].Program_Name}</p>
        </div>
        <div class="field">
            <p class="label">Participants Expected:</p>
            <p class="value">${Participants_Expected}</p>
        </div>
        <div class="field">
            <p class="label">Minutes For Setup:</p>
            <p class="value">${Minutes_for_Setup}</p>
        </div>
        <div class="field">
            <p class="label">Minutes For Cleanup:</p>
            <p class="value">${Minutes_for_Cleanup}</p>
        </div>
        <div class="field">
            <p class="label">Event Start Date:</p>
            <p class="value">${new Date(Event_Start_Date).toLocaleDateString()} @ ${new Date(Event_Start_Date).toLocaleTimeString()}</p>
        </div>
        <div class="field">
            <p class="label">Event End Date:</p>
            <p class="value">${new Date(Event_End_Date).toLocaleDateString()} @ ${new Date(Event_End_Date).toLocaleTimeString()}</p>
        </div>
        <div class="field">
            <p class="label">Cancelled:</p>
            <p class="value">${Cancelled}</p>
        </div>
        <div class="field">
            <p class="label">Primary Contact:</p>
            <p class="value">${user.Display_Name}</p>
        </div>
    `
    const roomsSectionHTML = buildings.map(building => {
        const {Building_Name, Building_ID} = building;
        return `
            <div class="field">
                <p class="label">Building ${Building_Name}:</p>
                <p class="value">${rooms.filter(room => room.Building_ID == Building_ID).map(room => room.Room_Name).join(', ')}</p>
            </div>
        `
    }).join('')
    
    roomsSectionDOM ? roomsSectionDOM.innerHTML = `
        <h1>Rooms:</h1>
        ${roomsSectionHTML}
    ` : ''

    const equipmentSectionHTML = eventEquipment.map(equipment => {
        const {Cancelled, Equipment_ID, Quantity} = equipment;
        return `
            <div class="field">
                <p class="label">${allEquipment.filter(equipment => equipment.Equipment_ID == Equipment_ID)[0].Equipment_Name}:</p>
                <p class="value">${Quantity}</p>
            </div>
        `
    }).join('')

    equipmentSectionHTML ? equipmentSectionDOM.innerHTML = `
        <h1>Equipment:</h1>
        ${equipmentSectionHTML}
    ` : ''

    const servicesSectionHTML = services.map(service => {
        const {Service_Name, Description} = service;
        return `
            <div class="field">
                <p class="label">${Service_Name}:</p>
                <p class="value">${Description}</p>
            </div>
        `
    }).join('')

    servicesSectionHTML ? servicesSectionDOM.innerHTML = `
        <h1>Services:</h1>
        ${servicesSectionHTML}
    ` : ''

    doneLoading();
}
showEvent();