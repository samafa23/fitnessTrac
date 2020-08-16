const express = require('express');
const routinesRouter = express.Router();
const {
    getPublicRoutines,
    createRoutine,
    updateRoutine,
    addActivityToRoutine,
    deleteRoutine,
    getAllRoutineActivities,
    deleteRoutineActivity
} = require('../db');
const { requireUser } = require('./utils');

routinesRouter.get('/', async (req, res) => {
    try {
        const publicRoutines = await getPublicRoutines();
        res.send({
            routines: publicRoutines
        });

    } catch ({ name, message }) {
        next({ name, message });
    }
});

routinesRouter.post('/', requireUser, async (req, res, next) => {
    try {
        const { name, goal, public } = req.body;
        const routineData = {};
        routineData.creatorId = req.user.id;
        routineData.name = name;
        routineData.goal = goal;
        routineData.public = public;

        const routine = await createRoutine(routineData);
        if (routine) {
            res.send({
                routine
            });
        } else {
            next({
                name: "CreateRoutineError",
                message: "Error creating your routine!"
            });
        }
    } catch ({ name, message }) {
        next({ name, message });
    }
});

routinesRouter.patch('/:routineId', requireUser, async (req, res, next) => {
    const { routineId } = req.params;
    const { name, goal, public } = req.body;

    const updateFields = {};

    if (name) {
        updateFields.name = name;
    }
    if (goal) {
        updateFields.goal = goal;
    }
    if (public) {
        updateFields.public = public;
    }

    try {
        // console.log(routineId);
        // const routines = await getAllRoutines();
        // const originalRoutine = routines.filter((id) => id = routineId);
        // console.log("routine", originalRoutine);
        // if (req.user.id !== originalRoutine.creatorId) {
        const updatedRoutine = await updateRoutine(routineId, updateFields);
        res.send({
            routine: updatedRoutine
        });
        //} else {
        // next({
        //     name: "InvalidUserError",
        //     message: "You can only edit routines you have created!"
        // });
        // }
    } catch ({ name, message }) {
        next({ name, message });
    }
});

routinesRouter.post('/:routineId/activities', async (req, res, next) => {
    const { routineId } = req.params;
    const { count, duration, activityId } = req.body;

    try {
        const routAct = await addActivityToRoutine(
            {
                routineId: routineId,
                activityId: activityId,
                count: count,
                duration: duration
            });

        res.send({
            routine: routAct
        });
    } catch ({ name, message }) {
        next({ name, message });
    }
});

routinesRouter.delete('/:routineId', requireUser, async (req, res, next) => {
    try {
        const { routineId } = req.params;
        const { routineActivities } = await getAllRoutineActivities();

        console.log(routineActivities);
        if (routActs) {
            routActs.forEach(async (routAct) => {
                await deleteRoutineActivity(routAct.id);
            });
        } else {
            // // await deleteRoutine(routineId);

            // res.send({
            //     message: `Successfully deleted Routine: ${routineId}`
            // });

        }
    } catch ({ name, message }) {
        next({ name, message });
    }
});

module.exports = routinesRouter;

// token
// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwidXNlcm5hbWUiOiJhbm5pZSIsImlhdCI6MTU5NzUxMDk2OX0.R0v9M127mt8nBn-UlSARhvsSP3P226y1nDARb-vWU48

// curl http://localhost:3000/api/routines -X POST -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwidXNlcm5hbWUiOiJhbm5pZSIsImlhdCI6MTU5NzUxMDk2OX0.R0v9M127mt8nBn-UlSARhvsSP3P226y1nDARb-vWU48' -H 'Content-Type: application/json' -d '{"name": "Increase FireBall Production", "goal": "The more fireballs I can throw, the more I can help tibbers!", "public": "true"}'

// curl http://localhost:3000/api/routines/6 -X PATCH -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwidXNlcm5hbWUiOiJhbm5pZSIsImlhdCI6MTU5NzUyNzcyNH0.H4UFEwP_UNsJAFlKkuPgBMzOYBbl5KCdcFHIDQeoQeQ' -H 'Content-Type: application/json' -d '{"name": "Increase FireBall Production!","goal": "The more fireballs I can throw, the more I can help tibbers decimate the enemy lines!!"}'

// curl http://localhost:3000/api/routines/6/activities -X POST -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwidXNlcm5hbWUiOiJhbm5pZSIsImlhdCI6MTU5NzYxMTc1Mn0.FlX7M3xAU7qTYceVOxuPhg3zOyftefPHKR6DQ0DzkwQ' -H 'Content-Type: application/json' -d '{"activityId": "2", "count": "25", "duration": "60"}'

// curl http://localhost:3000/api/routines/6 -X DELETE -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwidXNlcm5hbWUiOiJhbm5pZSIsImlhdCI6MTU5NzYxMTc1Mn0.FlX7M3xAU7qTYceVOxuPhg3zOyftefPHKR6DQ0DzkwQ'