const express = require('express');
const router = express.Router();


//get pokemon
router.get('/', (req, res, next) => {
    res.status(200).json({
        message: 'get pokemon router ready.'
    });
}); 

//get specific pokemon
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


//create pokemon
router.post('/', (req, res, next) => {
    res.status(201).json({
        message: 'posting pokemon route ready.'
    })
})

//update pokemon
router.patch('/', (req, res, next) => {
    res.status(200).json({
        message: 'update route ready.'
    })
})

//delete pokemon
router.delete('/', (req, res, next) => {
    res.status(200).json({
        message: 'delete route ready.'
    })
})

module.exports = router;