const getDonations = async (start_date, end_date) => {
    if (!start_date || !end_date) {
        return
    }
    let donations = [];
    let skip = 0;
    const addDonations = async () => await axios({
        url: `https://my.pureheart.org/ministryplatformapi/tables/Donations?%24filter=Donation_Date BETWEEN '${start_date}' AND '${end_date}'&$skip=${skip}`,
        method: 'get',
        headers: {
            'Content-type': 'application/json',
            'Authorization': `Bearer ${access_token}`, // notice the Bearer before your token
        }
    })
    .then(response => response.data)
    .catch(err => {console.error(err)})

    let prevDonationPullLength = 9999;
    while (prevDonationPullLength >= 1000) {
        const currDonations = await addDonations();
        prevDonationPullLength = currDonations.length;
        skip += prevDonationPullLength;
        donations = donations.concat(currDonations);
    }
    return donations;
}