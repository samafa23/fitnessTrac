const express = require('express');
const { requireUser } = require('./utils');
const jointRouter = express.Router();
const { getAllRoutineActivities, updateRoutineActivity, deleteRoutineActivity } = require('../db');

jointRouter.patch('/:routineActivityId', requireUser, async (req, res, next) => {
    const { routineActivityId } = req.params;
    console.log("routineActivity", routineActivityId);
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
        console.log(routAct.routineActivityId);

        await deleteRoutineActivity(routAct.routineActivityId);
        res.send({
            message: `Successfully deleted Routine Activity: ${routAct.routineActivityId}`
        });
    } catch ({ name, message }) {
        next({ name, message });
    }
});

module.exports = jointRouter;

// curl http://localhost:3000/api/routine_activities/3 -X PATCH -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwidXNlcm5hbWUiOiJhbm5pZSIsImlhdCI6MTU5NzYxMTc1Mn0.FlX7M3xAU7qTYceVOxuPhg3zOyftefPHKR6DQ0DzkwQ' -H 'Content-Type: application/json' -d '{"count": "15","duratuion": "30"}'

// curl http://localhost:3000/api/routine_activities/3 -X DELETE -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwidXNlcm5hbWUiOiJhbm5pZSIsImlhdCI6MTU5NzYxMTc1Mn0.FlX7M3xAU7qTYceVOxuPhg3zOyftefPHKR6DQ0DzkwQ'