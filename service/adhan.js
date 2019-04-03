/**
 * Adhan Main class
 *
 * @author Ben Younes Ousama
 * @date 2018/04/03
 * @type {{csv}|*}
 */
const csvService = require('./csv');
const xlsx = require('xlsx');

/**
 *
 * @type {{asr: number, icha: number, imsak: number, maghreb: number, dohr: number, fajr: number, churuq: number}}
 */
const salat = {
    imsak: 2,
    fajr: 3,
    chouruq: 4,
    dohr: 5,
    asr: 6,
    maghreb: 7,
    icha: 8
};

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
        let workbook = xlsx.readFile('horaires.xlsx');
        let sheet_name_list = workbook.SheetNames;
        let monthData = xlsx.utils.sheet_to_csv(workbook.Sheets[sheet_name_list[this.month]]);
        this.monthData = csvService.csv(monthData, ',');
    }


    /**
     * Refresh datetime and initialize all needed properties
     */
    initProperties() {
        this.refreshDatetime();
        this.nextSalatIndex = 0;
        this.monthData = '';
        this.imsak = '';
        this.fajr = '';
        this.chouruq = '';
        this.dohr = '';
        this.asr = '';
        this.maghreb = '';
        this.icha = '';
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
                this.icha = this.monthData[i][salat.icha];
            }
        }
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
        let ichaCnf = this.icha.split(/:|h/);

        var allDates = [
            [IGNORING, 'header'],
            [IGNORING, 'header'],
            [IGNORING, 'imsak'],
            [ fajrCnf[HOUR], fajrCnf[MIN], 'fajr' ],
            [IGNORING, 'chouruq'],
            [ dohrCnf[HOUR], dohrCnf[MIN], 'dohr' ],
            [ asrCnf[HOUR], asrCnf[MIN], 'asr' ],
            [ maghrebCnf[HOUR], maghrebCnf[MIN], 'maghreb' ],
            [ ichaCnf[HOUR], ichaCnf[MIN], 'icha' ]
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
     * Get Salat of the day
     *
     * @returns {string}
     */
    getTodaySalat() {
        const nextSalatIndex = this.nextSalatIndex;
        var html = "var newHTML = document.createElement('div'); " +
            "newHTML.innerHTML = '<div id=gmSomeID>" +
            "<ul><li>Imsak: " + this.imsak + (nextSalatIndex === salat.imsak ? ' OK ' : '') + "</li>" +
            "<li>fajr: " + this.fajr + (nextSalatIndex === salat.fajr ? ' OK ' : '')  + "</li>" +
            "<li>chouruq: " + this.chouruq + (nextSalatIndex === salat.chouruq? ' OK ' : '')  + "</li>" +
            "<li>dohr: " + this.dohr + (nextSalatIndex === salat.dohr ? ' OK ' : '') + "</li>" +
            "<li>asr: " + this.asr + (nextSalatIndex === salat.asr ? ' OK ' : '') + "</li>" +
            "<li>maghreb: " + this.maghreb + (nextSalatIndex === salat.maghreb ? ' OK ' : '') + "</li>" +
            "<li>icha: " + this.icha + (nextSalatIndex === salat.icha ? ' OK ' : '') + "</li></ul> " +
            "</div>'; " +
            "document.body.prepend(newHTML);";

        return html;
    }

}

// now we export the class, so other modules can create Cat objects
module.exports = {
    Mdv91Adhan: Mdv91Adhan
}
