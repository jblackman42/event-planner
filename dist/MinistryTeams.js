const toggleOpen = (elem) => {
  // get parent of button clicked
  const containerElem = elem.closest('.ministry-team-container');

  // close all containers
  for (const container of document.querySelectorAll('.ministry-team-container')) {
    if (container != containerElem) container.classList.remove('open');

    // grab the children (this sounds so weird out of context)
    const ministryTeamListElem = container.children[1];
    
    ministryTeamListElem.style.height = '0';

    for (const btnElem of ministryTeamListElem.querySelectorAll('button')) btnElem.disabled = true;
  }

  // toggle open class to do animation in css
  containerElem.classList.toggle('open');


  const ministryTeamListElem = containerElem.children[1];
  // if the container is opening
  if (containerElem.classList.value.includes('open')) {
    ministryTeamListElem.style.height = `${ministryTeamListElem.scrollHeight}px`;

    for (const btnElem of ministryTeamListElem.querySelectorAll('button')) btnElem.disabled = false;
  }
}

class MinistryTeams extends HTMLElement {
  constructor() {
    super();

    this.classList.add('ministry-team-row');

    this.staff = [];
    // this.requestURL = 'http://localhost:3000/api/widgets/staff-ministries';
    this.requestURL = 'https://phc.events/api/widgets/staff-ministries';
    this.updateStaff();
  }


  updateStaff = async () => {
    this.staff = await axios({
      method: 'get',
      url: this.requestURL
    })
      .then(response => response.data)

    this.draw();
  }

  draw = () => {
    const ministries = [...new Set(this.staff.map(staff => staff.Team_Name))]

    for (const ministry of ministries) {
      const currTeam = this.staff.filter(staff => staff.Team_Name == ministry);
      this.innerHTML += `
        <div class="ministry-team-container">
          <button class="ministry-team-label" onclick="toggleOpen(this)">
            <h1>${ministry}</h1>
          </button>
          <div class="ministry-team-list">
          <team-widget>
            ${currTeam.map(staff => {
              const { Nickname, Last_Name, Email_Address, Contact_ID, Job_Title, Unique_Name } = staff;
              const Display_Name = `${Nickname} ${Last_Name}`
              const Bio = null;
              return `
                <div class="staff-member">
                    <div class="image-container">
                        <img src="https://my.pureheart.org/ministryplatformapi/files/${Unique_Name}" alt="${Display_Name}" title="${Display_Name}">
                        ${Bio ? `<button class="more-info" id="info-${Contact_ID}" title="More Info"><i class='fas fa-info'></i></button>` : ''}
                    </div>
                    <div class="staff-content">
                        <h1>${Display_Name}</h1>
                        <p>${Job_Title || ''}</p>
                    </div>
                </div>
              `
            }).join('')}
          </team-widget>
          </div>
        </div>
      `
    }
  }
}

customElements.define('ministry-teams', MinistryTeams);