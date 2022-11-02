## Ministry Platform Event Manager
### Description
#### This is a web based application build to be used with Ministry Platform for the purpose of managing church-wide events.

>Created By: JD BLackman

>Owned By: Pure Heart Church

>Features include:
>- viewing all events and event details on a user friendly calendar
>- searching events by their name, location, building, and room
>- event print option for displaying all relavant informatin on a single sheet of paper
>- designating specific people the ability to create new events
>- sending certain tasks to employees/volunteers as needed for events. Examples: Registration, Facilities, Childcare, and more..
>- preventing overbooking of rooms, an event will not be allowed to be created if it interferes with another event's time and location
>- simple viewing of Ministry Platform tasks with simple user interface for marking tasks as completed
>- frequent updates as needed

### Prerequisites
>- Ministry Platform
>- The following tables must store accurate data:
>   - Events (Most Important)
>   - Locations
>   - Buildings
>   - Rooms
>   - Users
>   - Security Roles
>   - Event Types
>   - Congregations

# User Guide

## Login Page
>Login uses the exact same credentials that are used to log into Ministry Platform. Here is the list of errors you can run into:

>"Internal Server Error"
>   - this means something really bad went wrong and your best bet is to restart or contact the nearest IT person.

>"Insufficient Security Roles"
>   - this means you do not sufficient permisions to use the event manager. If you believe this is a mistake contact your IT Director or me at JBlackman@pureheart.org

>"Incorrect Username or Password"
>   - this means you have typed in your username or password incorrectly. If you do not remember either of them, changing them can be done by your IT Director

## Calendar Page

### Calendar:
![calendar view for November 2022](/assets/calendar.PNG)
>The calendar is the primary component of the Calendar Page; it is located in the center of the screen. The calendar contains a grid of the days in the selected month. Days of the week are identified by the grid columns, days of the month are labeled on each grid tile. Each tile displays how many events are occuring on that specific day, with a red bar that fills up as the day fill up with events.

>To use the calendar, find the day you would like to view the events for and click on it. This will open up the Event Day Popup; more information on this popup is in the next section.

### Event Day Popup:
![calendar day popup for Saturday, November 19](/assets/event-day-popup.PNG)

### Date Selector:
![example date selector view for November 2022](/assets/date-selector.PNG)
>The date selector is located at the top left of the calendar. It has left and right arrows, and the current month and year.

>Clicking the left or right arrow buttons will move the Calendar view backward or forward 1 month.

>Clicking on the month or year will open an expanded date selector with more option

![example date selector expanded view for November 2022](/assets/date-selector-2.PNG)

>this gives a faster way to switch between several month and several years. Simply click on the month and year you want to view, then click the submit button located at the top left of the popup.

### Search Bar:
![search bar](/assets/search.PNG)
>the search bar is located at the top right of the calendar. Clicking on the blank section will prompt you to type in your search query. The search bar searches by event title, and only shows results that are during the month displayed on the calendar. A maximum of 10 results will be shown, if no results are shown a dropdown will read "No Results".

>arrow keys and the tab key can be used to navigate search results, hitting enter or clicking on a search result will open the Event Day Popup and briefly highlight the selected event.

### Filter Options:
![filter options - location, building, room](/assets/filter-options.PNG)
>the filter options are located near the top of the calendar, including a location dropdown, building dropdown, room dropdown, and submit button. These filters allow the user to view a month's events specified by event location, building, and room. Example: Central Campus, Building 700, Main Auditorium.

>To begin using the filters, click on the location dropdown and select the desired location. That will populate the building dropdown with the buildings at the selected location. If you wish to filter further by building, repeat this process for the building dropdown and the room dropdown. After you have the filters you desire, click the green submit button and the calendar will update with the filtered events. To reset the calendar and remove any applied filters, click the red reset button.