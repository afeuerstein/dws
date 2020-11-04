const chalk = require('chalk');

module.exports.getRunningVotes = () => {
    console.log(chalk.blue.dim('✓ ') + 'Laufende Abstimmungen werden erfasst:');
}