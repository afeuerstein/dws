const inquirer = require('inquirer');
const chalk = require('chalk');

module.exports.userSetup = (account) => {
    return inquirer.prompt([
        {
            name: 'username',
            message: 'Bitte wählen Sie einen Benutzernamen für den Administratoraccount.',
            default: 'admin',
        },
        {
            type: 'password',
            name: 'password',
            message: 'Bitte vergeben Sie ein Passwort für den Account',
        }
    ])
        .then(answers => {
            if (!answers.password) {
                console.clear();
                console.log(chalk.red.dim('! ') + 'Das vergeben eines Passworts ist erforderlich.');
                return this.userSetup(account);
            }
            let adminUser = new account({username: answers.username, admin: true, registration_status: 'complete'});
            adminUser.setPassword(answers.password, () => adminUser.save());
            console.log(chalk.green.dim('✓ ') + 'Enrichtung abgeschlossen! Sie können sich unter localhost:3000 anmelden!');
        });
};