const adhanService = require('./service/adhan');

adhan = new adhanService.Mdv91Adhan();
adhan.loadTodaySalat();
adhan.printTodaySalat();
adhan.highLightNextSalat();





