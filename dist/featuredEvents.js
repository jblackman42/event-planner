class FeaturedEvents extends HTMLElement {
  constructor() {
    super();

    this.requestURL = 'https://phc.events';
    // this.requestURL = 'http://localhost:3000';
    this.targetURL = this.getAttribute('target-url');

    this.events = []
    this.update();
  }

  getEvents = async () => {
    this.events = await axios({
      method: 'get',
      url: `${this.requestURL}/api/widgets/featured-events`
    })
      .then(response => response.data)
      .catch(err => console.error(err))
  }

  update = async () => {
    await this.getEvents();
    const eventsContainer = document.createElement('div');
      eventsContainer.id = 'events-container';

    eventsContainer.innerHTML = this.events.map(event => {
        const eventMonth = new Date(event.Event_Start_Date).toLocaleDateString('en-us', {month: 'short'});
        const eventDate = new Date(event.Event_Start_Date).getDate();
        return `
          <a class="event-card" href="${this.targetURL}/?id=${event.Record_ID}">
            <div class="event-card-img-container">
              <img src="https://my.pureheart.org/ministryplatformapi/files/${event.Unique_Name}" alt="${event.Event_Title}"/>
            </div>
            <div class="event-card-date-label">
              <p class="date-label-month">${eventMonth}</p>
              <p class="date-label-day">${eventDate}</p>  
            </div>
            <div class="event-card-title-label">
              <p class="event-card-title">${event.Event_Title}</p>
            </div>
          </a>
        `
    }).join('')
    

    this.append(eventsContainer)
  }
}

customElements.define('featured-events', FeaturedEvents);