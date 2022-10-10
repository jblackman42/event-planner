const searchInput = document.getElementById('search');
const searchResultsContainer = document.querySelector('.search-results')

let currentFocusIndex = -1;

searchInput.addEventListener('input', (e) => {
    // if (e.key == "Enter") e.preventDefault();
    currentFocusIndex = -1;

    const value = e.target.value.toLowerCase();

    if (!value) {
        searchResultsContainer.style.display = 'none';
        searchResultsContainer.style.visibility = 'hidden';
        return;
    }
    
    //get all events with a title that contains search input
    const filteredEvents = events.filter(event => event.Event_Title.toLowerCase().includes(value));
    
    //trim results down to 10
    if (filteredEvents.length > 10) filteredEvents.length = 10;
    
    const searchResultsHTML = filteredEvents.map(event => {
        const {Event_Title, Event_Start_Date, Event_ID} = event;
        return `
            <button class="result" id="result-${Event_ID}" onclick="handleSearchResult(${Event_ID}, '${new Date(Event_Start_Date).toDateString()}')">
                <div class="event-title">${Event_Title}</div>
                <div class="event-date">${new Date(Event_Start_Date).toDateString()}</div>
            </button>
        `
    }).join('')

    if (filteredEvents.length) {
        searchResultsContainer.innerHTML = searchResultsHTML;
    } else {
        searchResultsContainer.innerHTML = `
        <div class="result no-results">
            <div class="event-title">No Results</div>
        </div>
        `
    }

    searchResultsContainer.style.display = 'flex';
    searchResultsContainer.style.visibility = 'visible';
})

const handleSearchResult = (eventId, day) => {
    searchInput.value = '';
    searchResultsContainer.innerHTML = '';
    searchResultsContainer.style.display = 'none';
    searchResultsContainer.style.visibility = 'hidden';

    console.log(eventId)
    popup(day, eventId)
}

document.addEventListener('keydown', (e) => {
    // console.log(e.key != 'ArrowDown', e.key != 'ArrowUp', searchResultsContainer.children.length)
    // console.log(searchResultsContainer.children)
    // if ((e.key != 'ArrowDown' || e.key != 'ArrowUp') && searchResultsContainer.children.length) return;
    // e.preventDefault();

    if (e.key == 'ArrowDown') {
        e.preventDefault();
        currentFocusIndex ++;
        if (currentFocusIndex > searchResultsContainer.children.length - 1) currentFocusIndex = 0;
        searchResultsContainer.children[currentFocusIndex].focus();
    } else if (e.key == 'ArrowUp') {
        e.preventDefault();
        currentFocusIndex --;
        if (currentFocusIndex < 0) currentFocusIndex = searchResultsContainer.children.length - 1;
        searchResultsContainer.children[currentFocusIndex].focus();
        
    }


})