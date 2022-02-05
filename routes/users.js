const express = require('express');
const router = express.Router();

//get users
router.get('/', (req, res, next) => {
    res.status(200).json({
        message: 'get user route ready'
    });
}); 

//get specific user
router.get('/:userId', (req, res, next) => {
    const id = req.params.userId;
    if (id == '1') {
        res.status(200).json({
            message: 'you received id: 1',
            id: id
        })
    } else {
        res.status(200).json({
            message: 'some other id that is not 1',
            id: id
        })
    }
})


//create users
router.post('/', (req, res, next) => {
    res.status(200).json({
        message: 'posting user route ready.'
    })
})

//update users
router.patch('/', (req, res, next) => {
    res.status(200).json({
        message: 'update route ready.'
    })
})

//delete users
router.delete('/', (req, res, next) => {
    res.status(200).json({
        message: 'delete route ready.'
    })
})

module.exports = router;