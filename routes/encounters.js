const express = require('express');
const router = express.Router();
const EncounterController = require('../controllers/encounterController');

router.get('/', EncounterController.get_all_encounters);

router.get('/:id', EncounterController.get_encounter_by_id);

router.post('/', EncounterController.create_encounter);

router.patch('/:encounterId', EncounterController.update_encounter);

router.delete('/:id', EncounterController.delete_encounter_by_id);

//post patch delete routes were only made for the rubric.
module.exports = router;