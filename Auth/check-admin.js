const User = require('../models/user');

module.exports = (req, res, next) => {

    User.findById(req.userData.userId)
    .exec()
    .then( result => {
        if (result) {
            if (result.isAdmin) {
                next();
            } else {
                return res.satus(401).json({
                    message: 'Unauthorized.'
                });
            }
        }
    })
    .catch(err => {
        return res.status(500).json({
            message: err
        })
    })
    
};