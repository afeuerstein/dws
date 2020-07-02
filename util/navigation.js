var navconfig = require('../views/navigation.json');

module.exports.getNav = (router) => {
    let entriesByRouter = [];
    for (let index = 0; index < navconfig.length; index++) {
        let el = navconfig[index];
        if (el.router === router) {
            entriesByRouter.push(el);
        }
    }
    return entriesByRouter;
}