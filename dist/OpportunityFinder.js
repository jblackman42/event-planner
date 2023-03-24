class OpportunityFinder extends HTMLElement {
  constructor() {
    super();
    this.fetchURL = 'https://phc.events';
    this.opportunities = [];
    this.genericBackgroundURL = this.getAttribute('generic-background-url');

    this.update();
  }

  getOpportunities = async () => {
    let opportunities = await axios({
      method: 'get',
      url: `${this.fetchURL}/api/widgets/opportunities`
    })
      .then(response => response.data)
      .catch(err => console.log(err))

    if (parseInt(this.getAttribute('external'))) {
      opportunities = opportunities.filter(opportunity => opportunity.IsExternal)
    } else {
      opportunities = opportunities.filter(opportunity => !opportunity.IsExternal)
    }
    return opportunities;
  }

  update = async () => {
    this.opportunities = await this.getOpportunities();

    for (let opportunity of this.opportunities) {
      const { Opportunity_ID, Opportunity_Title, Description, Image_ID, IsExternal } = opportunity;

      const opportunityContainer = document.createElement('div');
        opportunityContainer.classList.add('opportunity-container');
        // opportunityContainer.style.backgroundImage = Image_ID ? `url('https://my.pureheart.org/ministryplatformapi/files/${Image_ID}')` : `url('/generic-phc-square.png')`
        opportunityContainer.style.setProperty('--background-url', Image_ID ? `url('https://my.pureheart.org/ministryplatformapi/files/${Image_ID}')` : `url(${this.genericBackgroundURL})`)

      opportunityContainer.innerHTML = `
        <h2>${Opportunity_Title}</h2>
        <hr></hr>
        <p>${Description}</p>
        <a href="${this.getAttribute('opportunity-details-path')}?id=${Opportunity_ID}" class="learn-more-btn">Learn More</a>
      `

      this.appendChild(opportunityContainer)
    }
  }
}


customElements.define('opportunity-finder', OpportunityFinder)