const { Client } = require('pg');

const client = new Client('postgres://localhost:5432/fitness-dev');


// USERS 

// GET ALL USERS
async function getAllUsers() {
    try {
        const { rows } = await client.query(`
    SELECT id, username
    FROM users;
        `);

        return rows;
    } catch (error) {
        throw error;
    }
}

// GET USER -- FINISH ADD PASSWORD

async function getUser({ username }) {
    try {
        const { rows: [user] } = await client.query(`
        SELECT *
        FROM users
        WHERE username=$1
        `, [username]);

        return user;
    } catch (error) {
        throw error;
    }
}

// CREATE USER
async function createUser({ username, password }) {
    try {
        const { rows: [user] } = await client.query(`
          INSERT INTO users(username, password)
          VALUES ($1, $2)
          ON CONFLICT (username) DO NOTHING
          RETURNING *;
         `, [username, password]);

        return user;
    } catch (error) {
        throw error;
    }
}


// ACTIVITIES

// GET ALL ACTIVITIES

async function getAllActivities() {
    try {
        const { rows } = await client.query(`
        SELECT *
        FROM activities;
        `);

        return rows;
    } catch (error) {
        throw error;
    }
}

// CREATE ACTIVITY

async function createActivity({ name, description }) {
    try {

        const { rows: [activity] } = await client.query(`
        INSERT INTO activities(name, description)
        VALUES ($1, $2)
        RETURNING *;
        `, [name.toLowerCase(), description.toLowerCase()]);

        return activity;
    } catch (error) {
        throw error;
    }
}

// UPDATE ACTIVITY

async function updateActivity(id, fields = {}) {
    const setString = Object.keys(fields).map(
        (key, index) => `"${key}"=$${index + 1}`
    ).join(', ');

    if (setString.length === 0) {
        return;
    }

    try {
        const { rows: [activity] } = await client.query(`
        UPDATE activities
        SET ${ setString}
        WHERE id=${id}
        RETURNING *;
        `, Object.values(fields));

        return activity;
    } catch (error) {
        throw error;
    }
}

// ROUTINES

// GET ALL ROUTINES

async function getAllRoutines() {
    try {
        const { rows: routines } = await client.query(`
        SELECT *
        FROM routines;
        `);

        for (let routine of routines) { routine.activities = await getActivitiesByRoutine(routine.id); }

        return routines;
    } catch (error) {
        throw error;
    }
}

// // GET ALL PUBLIC ROUTINES

async function getPublicRoutines() {
    try {
        const { rows: routines } = await client.query(`
        SELECT *
        FROM routines
        WHERE public=true;
        `);

        for (let routine of routines) { routine.activities = await getActivitiesByRoutine(routine.id); }

        return routines;
    } catch (error) {
        throw error;
    }
}

// GET ALL ROUTINES BY USER

// the instructions said by username, but "creatorId" takes an id. 
// I wasn't sure how to get that to loop around properly so I went with id instead.
async function getAllRoutinesByUser({ username }) {
    try {
        const user = await getUser({ username });

        const { rows: routines } = await client.query(`
        SELECT *
        FROM routines
        WHERE "creatorId"=$1;
        `, [user.id]);

        for (let routine of routines) { routine.activities = await getActivitiesByRoutine(routine.id); }

        return routines;
    } catch (error) {
        throw error;
    }
}


// GET PUBLIC ROUTINES BY USER

async function getPublicRoutinesByUser({ username }) {
    try {
        const user = await getUser({ username });

        const { rows: routines } = await client.query(`
        SELECT *
        FROM routines
        WHERE public=true AND "creatorId"=$1;
        `, [user.id]);

        for (let routine of routines) { routine.activities = await getActivitiesByRoutine(routine.id); }

        return routines;
    } catch (error) {
        throw error;
    }
}

// GET PUBLIC ROUTINES BY ACTIVITY

async function getPublicRoutinesByActivity({ activityId }) {
    try {
        const { rows: routines } = await client.query(`
        SELECT routines.*
        FROM routines
        JOIN routine_activities
        ON routine_activities."routineId" = routines.id
        WHERE public=true AND routine_activities."activityId" = $1;
        `, [activityId]);


        for (let routine of routines) { routine.activities = await getActivitiesByRoutine(routine.id); }

        return routines;
    } catch (error) {
        throw error;
    }
}

// GET ACTIVITIES BY ROUTINEID - HELPER FUNCTION

async function getActivitiesByRoutine(id) {
    try {
        const { rows: activity } = await client.query(`
        SELECT activities.*
        FROM activities
        JOIN routine_activities
        ON routine_activities."activityId" = activities.id
        WHERE routine_activities."routineId" = $1;
        `, [id]);

        return activity;
    } catch (error) {
        throw error;
    }
}

// CREATE ROUTINE

async function createRoutine({ creatorId, name, goal, public }) {
    try {
        const { rows: [routine] } = await client.query(`
        INSERT INTO routines("creatorId", name, goal, public)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
        `, [creatorId, name, goal, public]);

        return routine;
    } catch (error) {
        throw error;
    }
}

// I first did this without public declared - Success, but then added it to
// provide read-able results for getPublicRoutines. 

// UPDATE ROUTINE

async function updateRoutine(id, fields = {}) {
    const setString = Object.keys(fields).map(
        (key, index) => `"${key}"=$${index + 1}`
    ).join(`, `);

    if (setString === 0) {
        return;
    }

    try {
        const { rows: [activity] } = await client.query(`
        UPDATE routines
        SET ${ setString}
        WHERE id=${ id}
        RETURNING *;
        `, Object.values(fields));

        return activity;
    } catch (error) {
        throw error;
    }
}

// DESTROY ROUTINE

async function deleteRoutine(id) {
    try {
        await client.query(`
        DELETE FROM routine_activities
        WHERE "routineId"=$1;
        `, [id]);

        await client.query(`
        DELETE FROM routines
        WHERE id=$1;
        `, [id]);

        return `Deleted ROUTINE: ${id}`;
    } catch (error) {
        throw error;
    }
}

// ROUTINE - ACTIVITIES

// GET ALL ROUTINE ACTIVITIES

async function getAllRoutineActivities() {
    try {
        const { rows: routineActivities } = await client.query(`
        SELECT *
        FROM routine_activities
        `);

        return routineActivities;
    } catch (error) {
        throw error;
    }
}


// ADD ACTIVITIES TO ROUTINES
async function addActivityToRoutine({ routineId, activityId, count, duration }) {
    try {
        const { rows } = await client.query(`
        INSERT INTO routine_activities("routineId", "activityId", count, duration)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
        `, [routineId, activityId, count, duration]);

        return rows;
    } catch (error) {
        throw error;
    }
}

// UPDATE ACTVITIES ON A ROUTINE

async function updateRoutineActivity(id, fields = {}) {
    const setString = Object.keys(fields).map(
        (key, index) => `${key}=$${index + 1}`
    ).join(', ');

    if (setString.length === 0) {
        return;
    }

    try {
        const { rows: routineActivity } = await client.query(`
        UPDATE routine_activities
        SET ${ setString}
        WHERE id=${id}
        RETURNING *;
        `, Object.values(fields));

        return routineActivity;
    } catch (error) {
        throw error;
    }
}

// DESTROY ROUTINE_ACTIVITY

async function deleteRoutineActivity(id) {
    try {
        await client.query(`
        DELETE FROM routine_activities
        WHERE id=$1;
        `, [id]);
        return `Deleted ROUTINE_ACTIVITY: ${id}`
    } catch (error) {
        throw error;
    }
}


module.exports = {
    client,
    getAllUsers,
    createUser,
    getUser,
    getAllActivities,
    createActivity,
    updateActivity,
    getAllRoutines,
    getPublicRoutines,
    getAllRoutinesByUser,
    getPublicRoutinesByUser,
    getPublicRoutinesByActivity,
    createRoutine,
    updateRoutine,
    deleteRoutine,
    getAllRoutineActivities,
    addActivityToRoutine,
    updateRoutineActivity,
    deleteRoutineActivity
}