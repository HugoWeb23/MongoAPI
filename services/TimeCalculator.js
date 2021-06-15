const TimeCalculator = (date1, date2) => {
    const diff = date2 - date1;
    let seconds = diff / 1000;
    seconds = Number(seconds);
    let d = Math.floor(seconds / (3600*24));
    let h = Math.floor(seconds % (3600*24) / 3600);
    let m = Math.floor(seconds % 3600 / 60);
    let s = Math.floor(seconds % 60);
    
    let days = d > 0 ? d + (d == 1 ? " jour, " : " jours, ") : "";
    let hours = h > 0 ? h + (h == 1 ? " heure, " : " heures, ") : "";
    let minutes = m > 0 ? m + (m == 1 ? " minute, " : " minutes et ") : "";
    let second = s > 0 ? s + (s == 1 ? " seconde" : " secondes") : "";
    if(d > 7) {
        return "Plus de 7 jours"
    }
    return days + hours + minutes + (d > 0 ? "" : second);
    }

module.exports = TimeCalculator