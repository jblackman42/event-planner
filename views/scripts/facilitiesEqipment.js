const facilitiesEquipmentContainer = document.getElementById('facilities-equipment-container');
const equipmentItemsContainer = document.querySelector('.equipment-items-container');
let equipment = [];

const facilitiesPopupShow = () => {
    facilitiesEquipmentContainer.classList.add('open')
}
const facilitiesPopupHide = () => {
    facilitiesEquipmentContainer.classList.remove('open')
}

const loadEquipment = async () => {
    equipment = await getEquipment();

    const equipmentItemsHTML = equipment.map(equipmentItem => {
        const {Bookable, Equipment_Name, Quantity, Equipment_ID} = equipmentItem;
        return `
            <div class="equipment-item">
                <input type="checkbox" id="${Equipment_ID}-checkbox" class="equipment-checkbox" onclick="handleCheckbox(event, ${Equipment_ID})">
                <label for="${Equipment_ID}-checkbox">${Equipment_Name}</label>
                <input type="number" id="input-${Equipment_ID}" class="equipment-value-input" value="0" min="0" max="${Quantity}" disabled>
            </div>
        `
    }).join('');
    equipmentItemsContainer.innerHTML = equipmentItemsHTML;
}
loadEquipment();

const handleCheckbox = (e, id) => {
    const {checked} = e.target;

    const inputElem = document.getElementById(`input-${id}`);
    inputElem.disabled = !checked;
}

const equipmentHandleSave = () => {
    selecedEquipment.length = 0;
    equipment.forEach(equipmentItem => {
        const {Equipment_ID} = equipmentItem;

        const equipmentCheckbox = document.getElementById(`${Equipment_ID}-checkbox`);
        const equipmentInput = document.getElementById(`input-${Equipment_ID}`);

        const equipmentQuantity = parseInt(equipmentInput.value) > equipmentInput.max ? parseInt(equipmentInput.max) : parseInt(equipmentInput.value) < equipmentInput.min ? parseInt(equipmentInput.min) : parseInt(equipmentInput.value);

        if (equipmentCheckbox.checked) {
            selecedEquipment.push({
                Equipment_ID: Equipment_ID,
                Quantity: equipmentQuantity
            })
        }
    })

    facilitiesPopupHide();
}