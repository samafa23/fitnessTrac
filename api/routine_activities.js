const express = require('express');
const { requireUser } = require('./utils');
const jointRouter = express.Router();
const { updateRoutineActivity, deleteRoutineActivity } = require('../db');

jointRouter.patch('/:routineActivityId', requireUser, async (req, res, next) => {
    const { routineActivityId } = req.params;

    const { count, duration } = req.body;

    const updateFields = {};

    if (count) {
        updateFields.count = count;
    }
    if (duration) {
        updateFields.duration = duration;
    }

    try {
        const updatedRoutAct = await updateRoutineActivity(routineActivityId, updateFields);

        res.send({
            routine_activity: updatedRoutAct
        });
    } catch ({ name, message }) {
        next({ name, message });
    }
});

jointRouter.delete('/:routineActivityId', requireUser, async (req, res, next) => {
    try {
        const routAct = req.params;

        await deleteRoutineActivity(routAct.routineActivityId);
        res.send({
            message: `Successfully deleted Routine Activity: ${routAct.routineActivityId}`
        });
    } catch ({ name, message }) {
        next({ name, message });
    }
});

module.exports = jointRouter;

