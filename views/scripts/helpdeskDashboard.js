class Dashboard extends HTMLElement {
  constructor() {
    super();
    this.colors = ["#1abc9c", "#f1c40f","#3498db","#e67e22","#e74c3c", "#9b59b6", "#34495e"];
    this.titleSize = 24;
    this.charts = [];
    this.timeId = 0;
    this.webSocket;
    this.currTickets = 0;

    this.daysBack = 30;
    this.minDate = new Date().setDate(new Date().getDate() - this.daysBack);
    this.timeLabel = `(Last ${this.daysBack} Days)`

    // notification settings
    this.numOfNotificationSounds = 24;
    this.lastNotification;

    this.getTickets();
    this.createWebsocket();
  }

  getTickets = async () => {
    this.tickets = await axios({
      method: 'get',
      url: '/api/helpdesk/tickets'
    })
      .then(response => response.data)
      .catch(err => console.error(err))

    this.getTodaysStatsData();
    this.getMonthsStatsData();
    this.createRequestorChart();
    this.createAgentChartMonth();
    this.createResolvedMonthChart();
    this.createTagsPieChart();
    this.createMonthsTicketsGraph();
  }

  createWebsocket = () => {
    this.webSocket = new WebSocket(`wss://phc.events/websocket`);
    // this.webSocket = new WebSocket(`ws://localhost:3000/websocket`);
    this.webSocketKeepAlive(30000)
    
    this.webSocket.addEventListener("open", () => {
      console.log("We are connected");
    });
    
    this.webSocket.onmessage = (event) => {
      const { data } = event;
      console.log(data)

      if (data == 'update') {
        this.charts.forEach(chart => {
          chart.destroy();
        })
        const profilePicsContainer = document.getElementById('profile-pics-container');
          profilePicsContainer.innerHTML = '';
        this.getTickets();
      } else if (data == 'notify') {
        this.handleNewTicket();
      }
    };

    this.webSocket.onclose = (event) => {
      this.createWebsocket();
    }
  }

  webSocketKeepAlive = (timeout) => {
    console.log(this.webSocket)
    if (this.webSocket.readyState == this.webSocket.OPEN) {
      console.log('ping');
      this.webSocket.send('');
    }
    this.timeId = setTimeout(() => this.webSocketKeepAlive(timeout), timeout);
  }

  getTodaysStatsData = () => {
    // html elements
    const todaysTicketsDOM = document.getElementById('tickets-opened-today');
    const todaysResolvedTicketsDOM = document.getElementById('tickets-resolved-today');
    const topResolverDOM = document.getElementById('top-resolver');

    // get today's total tickets and resolved tickets
    const today = new Date();
    const todaysTickets = this.tickets.filter(ticket => new Date(ticket.Request_Date).toLocaleDateString() == today.toLocaleDateString())

    if (todaysTickets.length > this.todaysTickets) {
      this.handleNewTicket();
    }
    this.todaysTickets = todaysTickets.length;

    const todaysResolvedTickets = this.tickets.filter(ticket => new Date(ticket.Resolve_Date).toLocaleDateString() == today.toLocaleDateString() && ticket.Status == 3)
    console.log(todaysResolvedTickets)
    // get agents and number of resolved tickets by those agents
    
    const agents = [...new Set(this.tickets.map(ticket => ticket.Agent))]

    const agentsTickets = agents.map(agent => todaysResolvedTickets.filter(ticket => ticket.Agent == agent).length);

    const hightestResolvedTickets = [...agentsTickets].sort((a,b) => b-a)[0]
    const bestAgent = agents[agentsTickets.indexOf(hightestResolvedTickets)]
    
    todaysTicketsDOM.innerHTML = todaysTickets.length;
    todaysResolvedTicketsDOM.innerHTML = todaysResolvedTickets.length;
    topResolverDOM.innerHTML = hightestResolvedTickets == 0 ? 'Nobody' : bestAgent;
  }

  handleNewTicket = () => {
    if (this.getRandomInt(1,100) == 100) {
      const audio = new Audio(`/assets/notifications/notification-24.mp3`);
      audio.play();
      return;
    }


    const newRandomNotificationSound = this.getRandomInt(1, this.numOfNotificationSounds);
    if (newRandomNotificationSound == this.lastNotification) {
      return this.handleNewTicket();
    }
    this.lastNotification = newRandomNotificationSound
    const audio = new Audio(`/assets/notifications/notification-${newRandomNotificationSound}.mp3`);
    audio.play();
  }

  getMonthsStatsData = () => {
    // html elements
    const monthsTicketsDOM = document.getElementById('tickets-opened-month');
    const monthsResolvedTicketsDOM = document.getElementById('tickets-resolved-month');
    const topResolverMonthDOM = document.getElementById('top-resolver-month');

    // get today's total tickets and resolved tickets
    const day = new Date();
      day.setDate(day.getDate() - 30);
    const monthsTickets = this.tickets.filter(ticket => new Date(ticket.Request_Date) >= this.minDate)
    const monthsResolvedTickets = this.tickets.filter(ticket => new Date(ticket.Resolve_Date) >= this.minDate && ticket.Status == 3)

    // get agents and number of resolved tickets by those agents
    
    const agents = [...new Set(this.tickets.map(ticket => ticket.Agent))]

    const agentsTickets = agents.map(agent => monthsResolvedTickets.filter(ticket => ticket.Agent == agent).length);

    const hightestResolvedTickets = [...agentsTickets].sort((a,b) => b-a)[0]
    const bestAgent = agents[agentsTickets.indexOf(hightestResolvedTickets)]
    
    monthsTicketsDOM.innerHTML = monthsTickets.length;
    monthsResolvedTicketsDOM.innerHTML = monthsResolvedTickets.length;
    topResolverMonthDOM.innerHTML = bestAgent;
  }

  createRequestorChart = () => {
    // get a list of all types of tickets
    const tags = [...new Set(this.tickets.map(ticket => ticket.Tag))]
    tags[tags.indexOf(null)] = 'Unknown'

    // get all open tickets
    const openTickets = this.tickets.filter(ticket => new Date(ticket.Request_Date) > this.minDate && ticket.Status == 3);
    
    // get list of everyone who has opened tickets and how many they have opened
    const requestorsList = this.countValuesByKey(openTickets, 'Requestor')

    const sortedRequestors = Object.entries(requestorsList).sort(([nameA,valA],[nameB,valB]) => valB-valA).map(requestor => requestor[0]);
    // get top 3 and just their names in order of most tickets opened
      sortedRequestors.length = 3;

    const tagRequestorData = tags.map((tag, i) => {
      return sortedRequestors.map((requestor, j) => {
        // return how many tickets from requestor are this tag
        const requestorsTickets = openTickets.filter(ticket => ticket.Requestor == requestor);
        return requestorsTickets.filter(ticket => ticket.Tag == tag || (ticket.Tag == null && tag == 'Unknown')).length;
      })
    })

    const chartDatasets = tags.map((tag, i) => {
      return {
        label: tag,
        data: tagRequestorData[i],
        backgroundColor: this.colors[i]
      }
    })

    const requestorLeaderboardChart = new Chart(document.getElementById('requestor-leaderboard'), {
      type: 'bar',
      data: {
        labels: sortedRequestors,
        datasets: chartDatasets
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: 'Tickets Opened ' + this.timeLabel,
            font: {
              size: this.titleSize
            }
          },
          legend: {
            display: false
          }
        },
        responsive: true,
        scales: {
          x: {
            stacked: true,
          },
          y: {
            stacked: true,
            ticks: {
              stepSize: 1
            }
          }
        },
        responsive:true
      }
    });
    this.charts.push(requestorLeaderboardChart)

    const profilePicsContainer = document.getElementById('profile-pics-container');
    profilePicsContainer.innerHTML = sortedRequestors.map((requestor, i) => {
      const {File_ID, Requestor} = this.tickets.filter(ticket => ticket.Requestor == requestor)[0];
      
      const placement = i == 0 ? '1st' : i == 1 ? '2nd' : '3rd';
      
      return `
        <div class="img-container" data-placement="${placement}">
          <img src="https://my.pureheart.org/ministryplatformapi/files/${File_ID}" alt="${Requestor}" title="${Requestor}">
        </div>
      `
    }).join('')
  }

  createAgentChartMonth = () => {
    // get a list of all types of tickets
    const tags = [...new Set(this.tickets.map(ticket => ticket.Tag))]
    tags[tags.indexOf(null)] = 'Unknown';

    const openTickets = this.tickets.filter(ticket => ticket.Status != 3)
    
    const agents = [...new Set(this.tickets.map(ticket => ticket.Agent))].filter(agent => agent != null)

    const tagAgentData = tags.map((tag, i) => {
      return agents.map((agent, j) => {
        // return how many tickets for agent are this tag
        const agentsTickets = openTickets.filter(ticket => ticket.Agent == agent);
        return agentsTickets.filter(ticket => ticket.Tag == tag || (ticket.Tag == null && tag == 'Unknown')).length;
      })
    })

    const chartDatasets = tags.map((tag, i) => {
      return {
        label: tag,
        data: tagAgentData[i],
        backgroundColor: this.colors[i]
      }
    })

    const agentLeaderboardChart = new Chart(document.getElementById('agent-leaderboard'), {
      type: 'bar',
      data: {
        labels: agents,
        datasets: chartDatasets
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: 'Open Tickets',
            font: {
              size: this.titleSize
            }
          },
          legend: {
            display: false
          }
        },
        responsive: true,
        scales: {
          x: {
            stacked: true,
          },
          y: {
            stacked: true,
            ticks: {
              stepSize: 1
            }
          }
        },
        responsive:true
      }
    });
    this.charts.push(agentLeaderboardChart);
  }

  createResolvedMonthChart = () => {
    // get a list of all types of tickets
    const tags = [...new Set(this.tickets.map(ticket => ticket.Tag))]
    tags[tags.indexOf(null)] = 'Unknown';

    const resolvedTickets = this.tickets.filter(ticket => ticket.Status == 3 && new Date(ticket.Request_Date) > this.minDate)
    
    const agents = [...new Set(this.tickets.map(ticket => ticket.Agent))].filter(agent => agent != null)

    const tagAgentData = tags.map((tag, i) => {
      return agents.map((agent, j) => {
        // return how many tickets for agent are this tag
        const agentsTickets = resolvedTickets.filter(ticket => ticket.Agent == agent);
        return agentsTickets.filter(ticket => ticket.Tag == tag || (ticket.Tag == null && tag == 'Unknown')).length;
      })
    })

    const chartDatasets = tags.map((tag, i) => {
      return {
        label: tag,
        data: tagAgentData[i],
        backgroundColor: this.colors[i]
      }
    })

    const resolvedLeaderboardChart = new Chart(document.getElementById('resolved-leaderboard'), {
      type: 'bar',
      data: {
        labels: agents,
        datasets: chartDatasets
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: 'Tickets Resolved ' + this.timeLabel,
            font: {
              size: this.titleSize
            }
          },
          legend: {
            display: false
          }
        },
        responsive: true,
        scales: {
          x: {
            stacked: true,
          },
          y: {
            stacked: true,
            title: "Tickets Resolved",
            ticks: {
              stepSize: 1
            }
          }
        },
        responsive:true
      }
    });
    this.charts.push(resolvedLeaderboardChart);
  }

  createTagsPieChart = () => {
    const tags = [...new Set(this.tickets.map(ticket => ticket.Tag))]
    tags[tags.indexOf(null)] = 'Unknown'
    const ticketTags = tags.map(tag => this.tickets.filter(ticket => ticket.Tag == tag && new Date(ticket.Request_Date) > this.minDate).length);
    // find tickets with no tag
    ticketTags[ticketTags.length-1] = this.tickets.filter(ticket => ticket.Tag == null && new Date(ticket.Request_Date) > this.minDate).length

    const tagsPieChart = new Chart(document.getElementById("tags-pie-chart"), {
      type: 'pie',
      data: {
        labels: tags,
        datasets: [{
          label: "# of Tickets",
          backgroundColor: this.colors,
          data: ticketTags
        }]
      },
      options: {
        plugins: {
            title: {
              display: true,
              text: 'Ticket Types ' + this.timeLabel,
              font: {
                size: this.titleSize
              }
            }
        },
        responsive:true
      }
    });
    this.charts.push(tagsPieChart);
  }

  createMonthsTicketsGraph = () => {
    const daysList = [];

    const date = new Date();
      date.setDate(date.getDate() - 29);

    for (let i = 0; i < 30; i ++) {
        daysList.push(date.toLocaleDateString());
        date.setDate(date.getDate() + 1);
    }
    
    const daysOpenTickets = daysList.map(day => this.tickets.filter(ticket => new Date(ticket.Request_Date).toLocaleDateString() == day).length)

    const daysResolvedTickets = daysList.map(day => this.tickets.filter(ticket => new Date(ticket.Resolve_Date).toLocaleDateString() == day && ticket.Status == 3).length)
    
    const monthsTicketsChart = new Chart(document.getElementById("months-tickets"), {
      type: 'line',
      data: {
        labels: daysList.map(day => new Date(day).toLocaleDateString('en-us', {month: 'short', day: 'numeric'})),
        datasets: [
          { 
            data: daysOpenTickets,
            label: "Tickets Opened",
            borderColor: "#3e95cd",
            fill: false
          },
          {
            data: daysResolvedTickets,
            label: "Tickets Resolved",
            borderColor: "#2ecc71",
            fill: false 
          }
        ]
      },
      options: {
        scales: {
          y: {
            ticks: {
              stepSize: 1
            },
            beginAtZero: true
          }
        },
        plugins: {
            legend: {
                display: true
            },
            title: {
              display: true,
              text: 'Ticket Opened ' + this.timeLabel,
              font: {
                size: this.titleSize
              }
            }
        },
        responsive:true
      }
    });
    this.charts.push(monthsTicketsChart);
  }

  countValuesByKey = (arr, key) => arr.reduce((r, c) => {
    r[c[key]] = (r[c[key]] || 0) + 1
    return r
  }, {})

  getRandomInt = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
  }
}

customElements.define('helpdesk-dashboard', Dashboard);