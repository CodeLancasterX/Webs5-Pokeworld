exports.home = (req, res, next) => {
    const pokeWorldRoutes = {
        routes: [{userRoutes: ['get_all_users: / ', 'get_user_by_id: /:id', 'get_encounter_by_userId: /:userId/encounters' ]}],
        message: "this is working... Also, hi martian space designer, its an honor."
    }

    res.status(200).json({
         pokeWorldRoutes
    })
}