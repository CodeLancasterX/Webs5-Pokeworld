const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) => {
    const pokeWorldRoutes = {
        routes: [{userRoutes: ['get_all_users: / ', 'get_user_by_id: /:id', 'get_encounter_by_userId: /:userId/encounters', 'get_all_pokemon_by_userId: /:userId/pokemon', 'get_pokemon_by_userId: /:userId/pokemon/:pokemonId', 'get_pokemonMove_by_pokemon_with_userId: :userId/pokemon/:pokemonId/moves/:moveId', 'get_battles_by_userId: /:userId/battles', 'sign_up: /signup', 'create_encounter: /:userId/encounters/new', 'update_encounter: /:userId/encounters/:encounterId', 'login: /login', 'update_user_by_id: /:userId', 'update_pokemonMoves_by_userId: /:userId/pokemon/:pokemonId/moves', 'update_pokemon_by_userId: /:userId/pokemon/:pokemonId', 'delete_user_by_userId: /:userId', 'delete_pokemon_by_userId: /:userId/pokemon/:pokemonId']},
                {battleRequestRoutes: ['get_all_battleRequests: /', 'get_battleRequest_by_id: /:id', '(Login) create_battleRequest: /', '(Login) update_battleRequest_by_id: /:id', '(Login) delete_battleRequest_by_id: /:id']},
                {battleRoutes: ['get_all_battles: /', 'get_battle_by_id: /:id', '(Login & Admin) create_battle: /', '(Login & Admin) update_battle_by_id: /:id', '(Login & Admin) delete_battle_by_id: /:id']},
                {encounterRoutes: ['get_all_encounters: /', 'get_encounter_by_id: /:id']},
                {moveRoutes: ['get_all_moves: /', 'get_move_by_id: /:moveId', '(Login & Admin) create_move: /new', '(Login & Admin) update_move_by_id: /:moveId', '(Login & Admin) delete_move_by_id: /:moveId']},
                {pokemonRoutes: ['get_all_pokemon: /', 'get_pokemon_by_Id: /:pokemonId', '(Login & Admin) create_pokemon: /', '(Login & Admin) edit_pokemon: /:pokemonId', '(Login & Admin) delete_pokemon: /:pokemonId']}
                ],
        message: "All create routes are POST methods. All update routes are PATCH methods. \n Do not forget to user the prefix of the route. i.e. get_user_by_id: https://webs5pokeworld.herokuapp.com/users/{id}"
    }

    res.status(200).json({
         pokeWorldRoutes
    })
})

module.exports = router;