const moment = require('moment');
const async = require('async');
const http = require('http');
const fetch = require('node-fetch');
const Promise = require("bluebird");
const config = require('config');
const queryString = require('query-string');

const DataParser = require('./parser');

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const BASE_URL = 'https://maps.googleapis.com/maps/api/directions/json';

class Manager {

    constructor() {
        console.time('total');
    }

    start(data) {

        if (!new RegExp(/^([0-1]?[0-9]|2[0-3])(:[0-5][0-9])?$/g).test(data.home_time)) {
            return new Promise((resolve, reject) => reject(new Error('Invalid home time format, must be HH:mm. ' + data.home_time + ' given')));
        }
        if (!new RegExp(/^([0-1]?[0-9]|2[0-3])(:[0-5][0-9])?$/g).test(data.work_time)) {
            return new Promise((resolve, reject) => reject(new Error('Invalid work time format, must be HH:mm. ' + data.work_time + ' given')));
        }

        return Promise.all(this.getPromises(data))
            .then(this.concatGooglePromises.bind(this))
            .then(this.callGoogleService.bind(this))
    }

    getPromises(data) {

        const homeTime = moment(data.home_time, 'HH:mm');
        const workTime = moment(data.work_time, 'HH:mm');

        const promises = [
            this.formatPromiseArray(data.home_addr, data.work_addr, homeTime),
            this.formatPromiseArray(data.work_addr, data.home_addr, workTime),
        ]

        for (let i = 0; i <= data.home_range; i += 10) {
            if (i > 0) {
                promises.push(this.formatPromiseArray(data.home_addr, data.work_addr, moment(homeTime.format('YYYY-MM-DD HH:mm:ss')).add(i, 'm')));
            }
        }
        for (let i = 0; i <= data.home_range; i += 10) {
            if (i > 0) {
                promises.push(this.formatPromiseArray(data.home_addr, data.work_addr, moment(homeTime.format('YYYY-MM-DD HH:mm:ss')).subtract(i, 'm')));
            }
        }
        return promises;
    }

    concatGooglePromises(googlePromises) {
        return new Promise((resolve, reject) => {
            return resolve(googlePromises.reduce((acc, gp) => {
                return acc.concat(gp);
            }, []));
        });
    }

    callGoogleService(googlePromises) {
        return new Promise((resolve, reject) => {
            async.map(googlePromises, (data, done) => {
                data.promise.then((response) => response.json()).then((json) => {
                    data.json = json;
                    if (json.status !== 'OK') {
                        const err = new Error('[' + json.status + '] ' + json.error_message);
                        err.status = 400;
                        done(err);
                    } else {
                        done(null, data);
                    }
                }).catch(err => reject(err));
            }, (err, results) => {
                console.timeEnd('total');
                if (err) {
                    reject(err);
                } else {
                    const dataParser = new DataParser(results);
                    resolve(dataParser.parse());
                }
            });
        });
    }

    formatPromiseArray(from, to, time) {
        return new Promise((resolve, reject) => {
            async.map(DAYS, (day, done) => {
                done(null, this.getGooglePromise(from, to, time, day));
            }, (err, results) => {
                return resolve(results);
            });
        });
    }

    getGooglePromise(from, to, time, day) {

        const timeTmp = moment(time.unix() * 1000);
        const departure_time = timeTmp.add(1, 'w').isoWeekday(day).unix();

        const parsedUrl = BASE_URL + '?' + queryString.stringify({
            origin: from,
            destination: to,
            departure_time: departure_time,
            traffic_model: 'pessimistic',
            key: config.get('google').api_key
        });
        return {
            promise: fetch(parsedUrl),
            parsedUrl,
            from,
            to,
            time: timeTmp,
            day,
            departure: departure_time
        };
    }

}

module.exports = Manager;