const express = require('express');
const activitiesRouter = express.Router();
const { getAllActivities, createActivity, updateActivity } = require('../db');
const { requireUser } = require('./utils');

//             G  E  T
activitiesRouter.get('/', async (req, res, next) => {
    try {
        const activities = await getAllActivities();

        res.send({
            activities
        });
    } catch ({ name, message }) {
        next({ name, message });
    }
});

//            P  O  S  T
activitiesRouter.post('/', requireUser, async (req, res, next) => {
    const { name, description } = req.body;

    try {
        const activity = await createActivity({ name, description });
        if (activity) {
            res.send({ activity });
        } else {
            next({
                name: "CreateActivityError",
                message: "An error occured while creating the Activity."
            });
        }
    } catch ({ name, message }) {
        next({ name, message });
    }
});

//            U  P  D  A  T  E
activitiesRouter.patch('/:activityId', requireUser, async (req, res, next) => {
    const { activityId } = req.params;
    const { name, description } = req.body;
    const updateFields = {};
    if (name) {
        updateFields.name = name;
    }

    if (description) {
        updateFields.description = description;
    }

    try {
        const updatedActivity = await updateActivity(activityId, updateFields);
        console.log("updatedActivity", updatedActivity);
        res.send({
            activity: updatedActivity
        });
    } catch ({ name, message }) {
        next({ name, message });
    }
});

module.exports = activitiesRouter;

