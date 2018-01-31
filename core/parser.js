const moment = require('moment');

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

class DataParser {
    constructor(data) {
        this.data = data;
    }

    parse() {
        const data = this.sortByOrigin();

        Object.keys(data).map((d) => this.sortByDeparture(data[d]));

        const result = Object.keys(data).reduce((acc, key) => {
            acc[key] = data[key].map(d => {
                return {
                    min: false,
                    max: false,
                    day: d.day,
                    time: d.time.format(),
                    timeHour: d.time.format('HH:mm'),
                    origin: d.from,
                    destination: d.to,
                    distance: d.json.routes[0].legs[0].distance.text,
                    distanceValue: d.json.routes[0].legs[0].distance.value,
                    duration: d.json.routes[0].legs[0].duration.text,
                    durationValue: d.json.routes[0].legs[0].duration.value
                };
            });
            return acc;
        }, {});


        const tmp = DAYS.reduce((acc, day) => {
            acc[day] = {
                min: null,
                max: null
            };
            return acc;
        }, {});

        result[Object.keys(result)[0]].map((data) => {
            if (!tmp[data.day].min || data.durationValue < tmp[data.day].min) {
                tmp[data.day].min = data.durationValue;
            }
            if (!tmp[data.day].max || data.durationValue > tmp[data.day].max) {
                tmp[data.day].max = data.durationValue;
            }
            return data;
        }).forEach((data) => {
            if (tmp[data.day].min === data.durationValue) {
                data.min = true;
            }
            if (tmp[data.day].max === data.durationValue) {
                data.max = true;
            }
        });

        return result;
    }

    sortByOrigin() {
        return this.data.reduce((acc, d) => {
            if (!acc[d.from]) {
                acc[d.from] = [];
            }
            acc[d.from].push(d);
            return acc;
        }, {});
    }

    sortByDeparture(arr) {

        arr.sort((a, b) => {
            if (a.departure > b.departure) {
                return 1;
            }
            if (a.departure < b.departure) {
                return -1;
            }
            return 0;
        });

        return arr;
    }
}

module.exports = DataParser;