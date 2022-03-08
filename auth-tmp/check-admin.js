const User = require('../models/user');

module.exports = (req, res, next) => {

    User.findById(req.userData.userId)
    .exec()
    .then( result => {
        if (result) {
            if (result.isAdmin) {
                next();
            } else {
                    res.status(401).json({
                    message: 'Unauthorized.'
                });
            }
        } else {
            res.satus(401).json({
                message: 'Unauthorized.'
            });
        }
    })
    .catch(err => {
        return res.status(500).json({
            error: err
        })
    })
    
};