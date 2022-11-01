const getDonations = async (year, month) => {
    if (!year || !month) {
        year = new Date().getFullYear();
        month = new Date().getMonth() + 2;
    }
    let donations = [];
    let skip = 0;
    const addDonations = () => axios({
        method: 'get',
        url: `https://my.pureheart.org/ministryplatformapi/tables/Batches?$filter=YEAR(Setup_Date) = ${year}&$skip=${skip}`,
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${access_token}`
        }
    })
    .then(response => response.data)
    .catch(err => {console.error(err)})

    let prevDonationPullLength = 9999;
    while (prevDonationPullLength >= 1000) {
        const currDonations = await addDonations();
        prevDonationPullLength = currDonations.length;
        skip = prevDonationPullLength;
        donations = donations.concat(currDonations);
    }
    return donations;
}