class PrayerWall extends HTMLElement {
    constructor() {
        super();
        this.prayerRequests = [];
        this.requestURL = 'https://phc.events'

        this.draw();
    }
    draw = () => {
        this.prayerRequests = [];
        this.innerHTML = '';
        const prayerFormContainer = document.createElement('div');
            prayerFormContainer.id = 'prayer-form-container';
            prayerFormContainer.innerHTML = `
                <div id="popup-container">
                    <div id="popup">
                        <div id="popup-header">
                            <p>Prayer Submitted</p>
                            <button id="popup-close"><i class='fas fa-times'></i></button>
                        </div>
                        <div id="popup-body">
                            <p>Thank you for your prayer. Our team will review and share it on our prayer wall if approved. We appreciate your trust and support.</p>
                        </div>
                        <div id="popup-btn-container">
                            <button id="popup-confirm">Confirm</button>
                        </div>
                    </div>
                </div>

                <div id="tos-container">
                    <div id="tos-header">
                        <h2>Prayer Wall Terms of Use</h2>
                        <i id="dropdown-icon" class='fas fa-angle-down' style="font-size: 24px;"></i>
                    </div>
                    <div id="dropdown" class="closed">
                        <p>You are about to post a prayer request on the Pure Heart Prayer Wall. Doing so will make public the information shared. Please be careful and respectful in how you share other's information. Only use names when it is pertinent or helpful, Be careful not to slander, accuse, or defame anyone. No soliciting from people on the Prayer Wall.</p>

                        <p>Matt 7:12 - Therefore, whatever you want men to do to you, do also to them, for this is the Law and the Prophets. NKJV</p>
                        
                        <p>The opinions expressed on this site are the opinions of the participating user.  Pure Heart Church expressly DOES NOT endorse any user-submitted material, content, and/or links provided by the participating user or assume any liability for any actions of the participating user.</p>
                        
                        <p>E-mail addresses will not appear on the prayer wall, however they are required to submit a request. This helps us cut down on spam. Your email address will be visible to the Pure Heart Prayer Team. Our prayer team may contact you by email if they feel led to respond directly to you about your prayer request.</p>
                    </div>
                </div>

                <form id="prayer-form">
                    <p>You may add your prayer request to our prayer wall using the form below. Once your prayer request is received, we will share it according to your instructions. Before your request can be shared <strong>it will be moderated by our prayer team to check for inappropriate content.</strong> Feel free to submit as many prayer requests as you like! Please limit your prayer request to 250 characters.</p>    

                    <div class="input-container required">
                        <input type="text" name="Author_Name" id="Author_Name" placeholder="Name" required>
                    </div>
                    
                    <div class="input-container required">
                        <input type="email" name="Author_Email" id="Author_Email" placeholder="Email" required>
                    </div>

                    <div class="input-container">
                        <input type="tel" name="Author_Phone" id="Author_Phone" placeholder="Phone Number">
                    </div>

                    <div class="input-container required">
                        <textarea name="Prayer_Body" id="Prayer_Body" placeholder="Prayer Request" maxlength="250" required></textarea>
                    </div>

                    <div class="checkbox-container">
                        <input type="checkbox" name="Private" id="Private">
                        <label for="Private">Share Anonymously</label>
                    </div>

                    <div class="checkbox-container">
                        <input type="checkbox" name="Notify" id="Notify">
                        <label for="Notify"> Email Me When Someone Prays</label>
                    </div>

                    <div class="g-recaptcha" id="captcha-container" data-sitekey="6LebiLQjAAAAAOR3XFrxo5wfjw1Ob73WbZKy9d2D" render="explicit"></div>
                    <button type="submit">submit</button>

                    <p id="error-msg">Please Complete reCAPTCHA</p>
                </form>
            `

        const loadingIconDOM = document.createElement('div');
            loadingIconDOM.classList.add('loading');
            loadingIconDOM.innerHTML = '<div class="lds-spinner"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>'

        this.prayersContainer = document.createElement('div');
        this.prayersContainer.id = 'prayers-container';

        this.appendChild(prayerFormContainer)
        this.appendChild(this.prayersContainer)
        this.appendChild(loadingIconDOM)

        const tosContainerHeaderDOM = document.getElementById('tos-header');
            tosContainerHeaderDOM.onclick = this.toggleTOS

        const prayerFormDOM = document.getElementById('prayer-form');
            prayerFormDOM.onsubmit = this.handleSubmit

        const popupClose = document.getElementById('popup-close');
            popupClose.onclick = this.hidePopup;
        const popupConfirm = document.getElementById('popup-confirm');
            popupConfirm.onclick = this.hidePopup;
            
        this.update();
    }

    handleScroll = () => {
        const container = document.getElementById('prayers-container')
        const bottom = container.offsetHeight - window.innerHeight;
        if (window.scrollY < bottom) return;
        //checks if user has scrolled to the bottom of the prayer widget
        //disabled load more so it doesn't run multiple times

        document.removeEventListener('scroll', this.handleScroll)

        //updates and loads more prayers
        this.update();
    }

    toggleTOS = () => {
        const dropdownDOM = document.getElementById('dropdown');
        const dropdownIconDOM = document.getElementById('dropdown-icon');

        dropdownIconDOM.classList.toggle('fa-angle-down')
        dropdownIconDOM.classList.toggle('fa-angle-up')
        dropdownDOM.classList.toggle('closed')
    }

    update = async () => {
        // prayers.length = 3;
        // for (let i = 0; i < prayers.length; i++) {
        //     const {Author_Name, Author_Email, Author_Phone, Date_Created, Prayer_Body} = prayers[i];
        //     const currPrayer = {
        //         Author_Name: Author_Name,
        //         Author_Email: Author_Email,
        //         Author_Phone: Author_Phone,
        //         Date_Created: new Date(Date_Created).toISOString(),
        //         Prayer_Title: null,
        //         Prayer_Body: Prayer_Body,
        //         Prayer_Status_ID: 1,
        //         Prayer_Count: 1,
        //         Private: false
        //     }
        //     console.log(`sending prayer by: ${Author_Name}`)
        //     await this.post(currPrayer)
        // }
        const data = await axios({
            method: 'get',
            url: `${this.requestURL}/api/prayer-wall?skip=${this.prayerRequests.length}`
        })
            .then(response => response.data)
        const {prayer_requests} = data;
        this.prayerRequests = this.prayerRequests.concat(prayer_requests);
        if (!prayer_requests.length) {
            const loader = document.querySelector('.loading');
            loader.style.display = 'none';
            loader.style.visibility = 'hidden';
            return;
        } else if (prayer_requests.length <  18) {
            const loader = document.querySelector('.loading');
            loader.style.display = 'none';
            loader.style.visibility = 'hidden';
        }
        

        for (let i = 0; i < prayer_requests.length; i ++) {
            const {Author_Name, Date_Created, Prayer_Title, Prayer_Body, Prayer_Count, Prayer_Request_ID} = prayer_requests[i];
            
            const prayerCard = document.createElement('div');
                prayerCard.id = `prayer-${Prayer_Request_ID}`;
                prayerCard.classList.add('prayer-card')
                prayerCard.innerHTML = `
                    <h2 class="name">${Author_Name || 'Anonymous'}</h2>
                    <p class="date">${new Date(Date_Created).toLocaleDateString('en-us', {weekday:"long", year:"numeric", month:"short", day:"numeric"})}</p>
                    <div class="prayer-body">
                        ${Prayer_Title ? `<p class="prayer-title">${Prayer_Title}</p>` : ''}
                        <p class="prayer">${Prayer_Body.replace('\n', '</br>')}</p>
                    </div>
                    <p class="prayer-count" ${!Prayer_Count ? 'style="visibility: hidden;"' : ''}>prayed for ${Prayer_Count} ${Prayer_Count == 1 ? 'time' : 'times'}</p>
                    <button id="pray-btn-${Prayer_Request_ID}" class="pray-btn">I prayed for this</button>
                `
            this.prayersContainer.appendChild(prayerCard)
            const prayBtn = document.getElementById(`pray-btn-${Prayer_Request_ID}`)

            prayBtn.onclick = () => this.prayed(Prayer_Request_ID)

            //enabled load more when user reaches page bottom
            document.addEventListener('scroll', this.handleScroll)
        }
    }
    prayed = async (id) => {
        const prayBtn = document.getElementById(`pray-btn-${id}`)
        prayBtn.innerText = 'Thanks for Praying!'
        prayBtn.disabled = true
        const data = await axios({
            method: 'get',
            url: `${this.requestURL}/api/prayer-wall/${id}`
        })
        .then(response => response.data)
        const {prayer_request: prayerRequest} = data;
        const {Prayer_Notify} = prayerRequest;

        prayerRequest.Prayer_Count ++;
        if (Prayer_Notify) prayerRequest.Notification_Scheduled = 1;

        await axios({
            method: 'put',
            url: `${this.requestURL}/api/prayer-wall`,
            data: {
                "Prayer_Request_ID": prayerRequest.Prayer_Request_ID,
                "Prayer_Count": prayerRequest.Prayer_Count,
                "Notification_Scheduled": Prayer_Notify
            }
        })
        .then(response => response.data)
        .catch(err => console.error(err))

        const {Author_Name, Author_Email, Date_Created, Prayer_Title, Prayer_Body, Prayer_Count, Prayer_Request_ID} = prayerRequest;

        // console.log(Author_Email)
        // await axios({
        //     method: 'post',
        //     url: 'http://localhost:3000/api/prayer-wall/send-email',
        //     headers: {
        //         'content-type': 'application/json',
        //         'authCode': 'bowling-pins-are-cool'
        //     },
        //     data: {
        //         recipientName: Author_Name,
        //         recipientEmail: 'JBlackman@pureheart.org',
        //         // recipientEmail: Author_Email,
        //         Prayer_Count: Prayer_Count
        //     }
        // })
        const currPrayerCard = document.getElementById(`prayer-${id}`);
        currPrayerCard.innerHTML = `
            <h2 class="name">${Author_Name}</h2>
            <p class="date">${new Date(Date_Created).toLocaleDateString('en-us', {weekday:"long", year:"numeric", month:"short", day:"numeric"})}</p>
            <div class="prayer-body">
                ${Prayer_Title ? `<p class="prayer-title">${Prayer_Title}</p>` : ''}
                <p class="prayer">${Prayer_Body.replace('\n', '</br>')}</p>
            </div>
            <p class="prayer-count" ${!Prayer_Count ? 'style="visibility: hidden;"' : ''}>prayed for ${Prayer_Count} ${Prayer_Count == 1 ? 'time' : 'times'}</p>
            <button disabled id="pray-btn-${Prayer_Request_ID}" class="pray-btn">Thanks for Praying!</button>
        `
    }
    handleSubmit = async (e) => {
        e.preventDefault();

        const recaptchaResponse = document.getElementById('g-recaptcha-response');
        const errorMsgDOM = document.getElementById('error-msg');
        if (!recaptchaResponse.value) {
            errorMsgDOM.style.display = 'block';
            errorMsgDOM.style.visibility = 'visible';
            return
        } else {
            errorMsgDOM.style.display = 'none';
            errorMsgDOM.style.visibility = 'hidden';
        }

        const authorNameDOM = document.getElementById('Author_Name');
        const authorEmailDOM = document.getElementById('Author_Email');
        const authorPhoneDOM = document.getElementById('Author_Phone');
        // const prayerTitleDOM = document.getElementById('Prayer_Title');
        const prayerBodyDOM = document.getElementById('Prayer_Body');
        const privateDOM = document.getElementById('Private');
        const notifyDOM = document.getElementById('Notify');

        const prayer = {
            Author_Name: authorNameDOM.value,
            Author_Email: authorEmailDOM.value,
            Author_Phone: authorPhoneDOM.value,
            Date_Created: new Date().toUTCString(),
            // Prayer_Title: prayerTitleDOM.value,
            Prayer_Body: prayerBodyDOM.value,
            Prayer_Status_ID: 1,
            Prayer_Count: 0,
            Private: privateDOM.checked,
            Prayer_Notify: notifyDOM.checked
        }

        try {
            await this.post(prayer)
            this.draw();            
        } catch (err) {
            errorMsgDOM.innerText = 'Something Went Wrong - Try Again Later'
            errorMsgDOM.style.display = 'block';
            errorMsgDOM.style.visibility = 'visible';

            console.error(err)
        }

        this.showPopup();
    }
    post = async (prayer) => {
        await axios({
            method: 'post',
            url: `${this.requestURL}/api/prayer-wall`,
            data: prayer
        })
        .then(response => response)
        .catch(err => console.error(err))
    }

    showPopup = () => {
        const popupContainer = document.getElementById('popup-container');
        popupContainer.style.display = 'grid';
        popupContainer.style.visibility = 'visible';
    }

    hidePopup = () => {
        const popupContainer = document.getElementById('popup-container');
        popupContainer.style.display = 'none';
        popupContainer.style.visibility = 'hidden';
    }
}

customElements.define("prayer-wall", PrayerWall);