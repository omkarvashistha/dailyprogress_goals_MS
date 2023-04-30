const express = require('express')
const router = express.Router();
const controller = require('../Controller/goalsController');
const cors = require('cors');

router.use(cors())


router.get("/:username/getUserGoalsData",controller.getUserGoalsData);
router.get("/:username/getUserGoals",controller.getUserGoals);
router.get("/:username/getCompleteGoals",controller.getUserCompletedGoals);

router.post("/:username/addGoal",controller.addGoals);
router.post("/:username/markGoalComplete",controller.markGoalCompleted);

router.put("/:username/updateGoal",controller.updateGoals);
router.put("/:username/deleteGoal",controller.deleteGoals);

router.all('*',controller.invalid);
module.exports = router