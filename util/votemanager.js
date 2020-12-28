const chalk = require('chalk');
const moment = require('moment');
const ArchivedVote = require('../models/archivedVote');
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
        console.log(chalk.green.dim('↱ ') + 'Laufende und Zunkünftige Amstimmungen werden erfasst:');
        console.log(chalk.red.dim('! ') + 'Daten von Abstimmungen, die bei Serverstart laufen sollten werden zurückgesetzt.');
        for (var i = 0; i < result.length; i++) {
            let vote = result[i];
            //get all votes that will be running in the future and register them into the schedule
            if (vote.date.startDate > Date.now()) {
                console.log(chalk.blue.dim(`↪ [${i}] `) + vote.title);
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
                    archiveVote(vote);
                });
            }

            //get all votes that should be running on server startup and register them
            if(vote.date.startDate < Date.now() && Date.now() < vote.date.endDate) {
                console.log(chalk.blue.dim(`↪ [${i}] `) + vote.title);
                vote.isVoteRunning = true;
                vote.votes.yes = 0;
                vote.votes.no = 0;
                vote.votes.abstention = 0;
                vote.save();
                //schedule unregistering the vote at .endDate
                var unregisterSchedule = schedule.scheduleJob(result[i].date.endDate, () => {
                    vote.isVoteRunning = false;
                    archiveVote(vote);
                });
            }
            //TODO: get all votes that should've already passed and move them into the archive
        }

    });
}

archiveVote = (vote) => {
    var archivedVote = new ArchivedVote({
        title: vote.title,
        description: vote.description,
        creationDate: vote.creationDate,
        date: {
            startDate: vote.date.startDate,
            endDate: vote.date.endDate,
        },
        votes: {
            yes: vote.votes.yes,
            no: vote.votes.no,
            abstention: vote.votes.abstention
        }
    });
    archivedVote.save();
    vote.remove();
}