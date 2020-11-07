const chalk = require('chalk');
const moment = require('moment');

//converts date strings from newvote.ejs to dates
module.exports.getDateByString = (range) => {
    const rangeArray = range.split(' - ')

    const startDate = moment(rangeArray[0], "MM.DD.YYYY hh:mm");
    const endDate = moment(rangeArray[1], "MM.DD.YYYY hh:mm");
    return {
        startDate: startDate._d,
        endDate: endDate._d
    }
}

//gets all currently running votes
module.exports.getRunningVotes = () => {
    console.log(chalk.blue.dim('✓ ') + 'Laufende Abstimmungen werden erfasst:');
}