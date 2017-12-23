const express = require('express');
const router = express.Router();
const Manager = require('../core/manager');

const NEEDED_PARAMS = ['home_addr', 'home_time', 'home_range', 'work_time', 'work_addr'];

/* GET data */
router.get('/', function(req, res, next) {

    const data = req.query;

    const errors = NEEDED_PARAMS.reduce((acc, need) => {
        if (!data[need]) {
            acc.push(need);
        }
        return acc;
    }, []);

    if (errors.length) {
        return res.status(400).render('includes/error-block', {
            error: {},
            message: 'Missing required parameters: [' + errors.join(', ') + ']'
        });
    }

    const fn = new Manager();

    fn.start(data)
        .then((parsed) => res.render('includes/result-table', { data: parsed }))
        .catch(err => res.status(400).render('includes/error-block', { error: {}, message: err.message }));
});

module.exports = router;