const express = require('express');
const router = express.Router();
const EncounterController = require('../controllers/encounterController');
const checkAuth = require('../auth/check-auth');
const checkAdmin = require('../auth/check-admin');

router.get('/', EncounterController.get_all_encounters);

router.get('/:id', EncounterController.get_encounter_by_id);

router.post('/', checkAuth, checkAdmin, EncounterController.create_encounter);

router.put('/:encounterId', checkAuth, checkAdmin, EncounterController.update_encounter);

router.delete('/:id', checkAuth, checkAdmin, EncounterController.delete_encounter_by_id);

//post patch delete routes were only made for the rubric.
module.exports = router;