const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) => {
    const pokeWorldRoutes = {
        routes: [{userRoutes: ['get_all_users: / ', 'get_user_by_id: /:id', 'get_encounter_by_userId: /:userId/encounters' ]}],
        message: "this is working."
    }

    res.status(200).json({
         pokeWorldRoutes
    })
})

module.exports = router;