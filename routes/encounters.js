const express = require('express');
const router = express.Router();
const Encounter = require('../models/encounter');
const EncounterController = require('../controllers/encounterController');

router.get('/', EncounterController.get_all_encounters);

router.get('/:id', EncounterController.get_encounter_by_id);

//Could make more routes, but it doesnt make sense in the context of this api.

module.exports = router;