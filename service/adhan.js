/**
 * Adhan Main class
 *
 * @author Ben Younes Ousama
 * @date 2018/04/03
 * @type {{csv}|*}
 */
const csvService = require('./csv');
var fs = require('fs');
var XLSX = require('xlsx');

/**
 *
 * @type {{asr: number, isha: number, imsak: number, maghreb: number, dohr: number, fajr: number, churuq: number}}
 */
const salat = {
    imsak: 2,
    fajr: 3,
    chouruq: 4,
    dohr: 5,
    asr: 6,
    maghreb: 7,
    isha: 8
};

const salatString = [];
salatString[3] = 'fajr';
salatString[5] = 'dhor';
salatString[6] = 'asr';
salatString[7] = 'maghreb';
salatString[8] = 'isha';


/**
 *
 * @type {number}
 */
const HOUR = 0;

/**
 *
 * @type {number}
 */
const MIN = 1;


/**
 *
 * @type {string}
 */
const IGNORING = 'IGNORING';

Mdv91Adhan = class Adhan {

    /**
     * Adhan Constructor
     */
    constructor() {
        this.initProperties();
        this.loadDataFromCsvFile();
    }

    /**
     * Load all datas From xlsx file - parse & store month salat only
     */
    loadDataFromCsvFile() {

        let data = fs.readFileSync('horaires.xlsx', 'base64');
        let workbook = XLSX.read(data,{type:"base64"});
        //let workbook = XLSX.readFile('horaires.xlsx');
        let sheet_name_list = workbook.SheetNames;
        let monthData = XLSX.utils.sheet_to_csv(workbook.Sheets[sheet_name_list[this.month]]);

        this.monthData = csvService.csv(monthData, ',');
    }


    /**
     * Refresh datetime and initialize all needed properties
     */
    initProperties() {
        this.refreshDatetime();
        this.nextSalatIndex = salat.isha; // @TODO add next day if current time is greater than isha
        this.monthData = '';
        this.imsak = '';
        this.fajr = '';
        this.chouruq = '';
        this.dohr = '';
        this.asr = '';
        this.maghreb = '';
        this.isha = '';
    }


    /**
     * Set datetime properties to now
     */
    refreshDatetime() {
        var dateObj = new Date();
        this.month = dateObj.getMonth();
        this.day = dateObj.getDate();
        this.year = dateObj.getFullYear();
        this.hour = dateObj.getHours();
        this.min = dateObj.getMinutes();
    }

    /**
     * Search for current day salat from previously stored current month salat
     */
    loadTodaySalat() {
        this.refreshDatetime();
        for (var i = 0; this.monthData[i]; i++) {
            if (this.day === i) {
                this.imsak = this.monthData[i][salat.imsak];
                this.fajr = this.monthData[i][salat.fajr];
                this.chouruq = this.monthData[i][salat.chouruq];
                this.dohr = this.monthData[i][salat.dohr];
                this.asr = this.monthData[i][salat.asr];
                this.maghreb = this.monthData[i][salat.maghreb];
                this.isha = this.monthData[i][salat.isha];
            }
        }
        this.getNextSalat();
    }


    /**
     * Search and returns the next salat of the day
     *
     * @returns {string[]}
     */
    getNextSalat() {
        this.refreshDatetime();
        let fajrCnf = this.fajr.split(/:|h/);
        let dohrCnf = this.dohr.split(/:|h/);
        let asrCnf = this.asr.split(/:|h/);
        let maghrebCnf = this.maghreb.split(/:|h/);
        let ishaCnf = this.isha.split(/:|h/);

        var allDates = [
            [IGNORING, 'header'],
            [IGNORING, 'header'],
            [IGNORING, 'imsak'],
            [ fajrCnf[HOUR], fajrCnf[MIN], 'fajr' ],
            [IGNORING, 'chouruq'],
            [ dohrCnf[HOUR], dohrCnf[MIN], 'dohr' ],
            [ asrCnf[HOUR], asrCnf[MIN], 'asr' ],
            [ maghrebCnf[HOUR], maghrebCnf[MIN], 'maghreb' ],
            [ ishaCnf[HOUR], ishaCnf[MIN], 'isha' ]
        ];
        for (var i = 0; allDates[i]; i++) {
            if (allDates[i][HOUR] !== IGNORING) {
                if (this.hour < allDates[i][HOUR] ) {
                    this.nextSalatIndex = i;
                    break;
                } else if (this.hour === allDates[i][HOUR]) {
                    if (this.min <= allDates[i][MIN]) {
                        this.nextSalatIndex = i;
                        break;
                    } else {
                        this.nextSalatIndex = i + 1;
                        break;
                    }
                }
            }
        }

        return allDates[this.nextSalatIndex];
    }


    /**
     * Print all salat of the day
     */
    printTodaySalat() {
        var newHTML = "<div class=\"ontop\"><aside><figure><img class=\"logo\" src=\"img/logo-mosquee-vigneux.png\" alt=\"logo\" height=\"133px\" width=\"133px\" /></figure><div class=\"jumu3a\"><h3>Prière du vendredi</h3><h4>13:04</h4></div></aside>" +
            "<nav><ul>" +
            "<li class=\"hlune\" id=\"" + salatString[salat.fajr]+ "\"><h4>" + this.fajr +"</h4></li>" +
            "<li class=\"hlune\" id=\"" + salatString[salat.dohr]+ "\"><h4>" + this.dohr +"</h4></li>" +
            "<li class=\"hlune\" id=\"" + salatString[salat.asr]+ "\"><h4>" + this.asr +"</h4></li>" +
            "<li class=\"hlune\" id=\"" + salatString[salat.maghreb]+ "\"><h4>" + this.maghreb +"</h4></li>" +
            "<li class=\"hlune\" id=\"" + salatString[salat.isha]+ "\"><h4>" + this.isha +"</h4></li>" +
            "</ul></nav></div>";
        $('body').append(newHTML);
    }




    /**
     * HightLight the next salat in white
     */
    highLightNextSalat() {
        const nextSalatIndex = this.nextSalatIndex;
        const nextSalat = salatString[nextSalatIndex];
        $('#' + nextSalat).css('background-image', 'url(img/' + nextSalat + '-white.png)');
    }

}

// now we export the class, so other modules can create Cat objects
module.exports = {
    Mdv91Adhan: Mdv91Adhan
}
