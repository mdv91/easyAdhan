const adhanService = require('./service/adhan');

adhan = new adhanService.Mdv91Adhan();
adhan.loadTodaySalat();
const nextSalat = adhan.getNextSalat();
html = adhan.getTodaySalat();

console.log(html);




