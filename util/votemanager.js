const chalk = require('chalk');
const moment = require('moment');
const Vote = require('../models/vote');
const schedule = require('node-schedule');

//converts date strings from newvote.ejs to dates
module.exports.getDateByString = (range) => {
    const rangeArray = range.split(' - ')

    const startDate = moment(rangeArray[0], "MM.DD.YYYY hh:mm A");
    const endDate = moment(rangeArray[1], "MM.DD.YYYY hh:mm A");
    return {
        startDate: startDate._d,
        endDate: endDate._d
    }
}

//registers all currently running votes (usually run on startup)
module.exports.registerRunningVotes = () => {
    Vote.find({}).exec((err, result) => {
        console.log(chalk.green.dim('✓ ') + 'Laufende Abstimmungen werden erfasst:');
        //get all votes that will be running in the future and register them into the schedule
        for (var i = 0; i < result.length; i++) {
            let vote = result[i];
            if (vote.date.startDate > Date.now()) {
                console.log(chalk.grey.dim(`[${i}] `) + vote.title)
                //schedule resgistering the vote on .startDate
                var registerSchedule = schedule.scheduleJob(result[i].date.startDate, () => {
                    vote.isVoteRunning = true;
                    vote.votes.yes = 0;
                    vote.votes.no = 0;
                    vote.votes.abstention = 0;
                    vote.save();
                });

                //schedule unregistering the vote at .endDate
                var unregisterSchedule = schedule.scheduleJob(result[i].date.endDate, () => {
                    vote.isVoteRunning = false;
                    vote.save();
                    //TODO: figure "the archive" out
                });
            }
        }

        //TODO: get all votes that should be running on server startup and register them


        //TODO: get  all votes that should've already passed and move them into the archive
    });
}