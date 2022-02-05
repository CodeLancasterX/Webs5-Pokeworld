const express = require('express');
const router = express.Router();


//get battles
router.get('/', (req, res, next) => {
    res.status(200).json({
        message: 'get battle route ready'
    });
}); 

//get specific battle
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


//create battles
router.post('/', (req, res, next) => {
    res.status(201).json({
        message: 'post battle route ready.'
    })
})

//update battles
router.patch('/', (req, res, next) => {
    res.status(200).json({
        message: 'update route ready.'
    })
})

//delete battles
router.delete('/', (req, res, next) => {
    res.status(200).json({
        message: 'delete route ready.'
    })
})

module.exports = router;