export default function(data) {
    const monthList= ["Jan", "Feb", "March", "April", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"];
    let d = new Date(data);
    let day = d.getDate();
    let year = d.getFullYear();
    let month = d.getMonth();
    let localTime = d.toLocaleTimeString();
    localTime = localTime.slice(0, localTime.length-6) + ' ' + localTime.slice(localTime.length-2);
    return `${monthList[month]} ${day}, ${year} ${localTime}`;
}