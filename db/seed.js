const {
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
} = require('./index');

// DROP TABLES
async function dropTables() {
    try {
        console.log("Dropping tables...");
        await client.query(`
        DROP TABLE IF EXISTS routine_activities;
        DROP TABLE IF EXISTS routines;
        DROP TABLE IF EXISTS activities;
        DROP TABLE IF EXISTS users;
        `);

        console.log("Finished dropping tables!");
    } catch (error) {
        console.error("Error Dropping tables!");
        throw error;
    }
}

// CREATE TABLES - USERS, ACTIVITIES, ROUTINES
async function createTables() {
    try {
        console.log("Creating tables...");
        await client.query(`
        CREATE TABLE users(
            id SERIAL PRIMARY KEY,
            username varchar(255) UNIQUE NOT NULL,
            password varchar(255) NOT NULL
        );

        CREATE TABLE activities(
            id SERIAL PRIMARY KEY,
            name varchar(255) UNIQUE NOT NULL,
            description text NOT NULL
        );

        CREATE TABLE routines(
            id SERIAL PRIMARY KEY,
            "creatorId" INTEGER REFERENCES users(id),
            public BOOLEAN DEFAULT false,
            name varchar(255) UNIQUE NOT NULL,
            goal TEXT NOT NULL
        );

        CREATE TABLE routine_activities(
            id SERIAL PRIMARY KEY,
            "routineId" INTEGER REFERENCES routines(id),
            "activityId" INTEGER REFERENCES activities(id),
            duration INTEGER,
            count INTEGER
        );

        `);

        console.log("Tables are ready!");
    } catch (error) {
        console.log("Error creating tables!");
        throw error;
    }
}

// TEST USERS - CREATE
async function createInitialUsers() {
    try {
        console.log("Starting to create users...");

        await createUser({ username: 'akali', password: 'bloodmoon1' });
        await createUser({ username: 'leona', password: 'vanguard!' });
        await createUser({ username: 'renekton', password: 'carnage77' });

        console.log("Finished creating users!");
    } catch (error) {
        console.error("Error creating users!");
        throw error;
    }
}

// TEST ACTIVITIES - CREATE

async function createInitialActivities() {
    try {
        console.log("Starting to create activities...");

        await createActivity({
            name: "Jumping Jacks",
            description: "A calisthenic jump done from a standing position with legs together and arms at the sides to a position with the legs apart and the arms over the head.",
        });

        await createActivity({
            name: "Push Ups",
            description: "An exercise in which a person lies facing the floor and, keeping their back straight, raises their body by pressing down on their hands.",
        });

        await createActivity({
            name: "Chin Ups",
            description: "Added weight can be placed on dip belt or dumbbell can be placed between ankles to increase intensity.",
        });

        console.log("Finished creating activites!");
    } catch (error) {
        console.log("Error creating activites!");
        throw error;
    }
}

// TEST ROUTINES - CREATE
async function createInitialRoutines() {
    try {
        console.log("Creating routines...");

        const [akali, leona, renekton] = await getAllUsers();

        await createRoutine({
            creatorId: leona.id,
            name: "Feel the Sun's Glory!",
            goal: "With willpower, the devotion and my capabilities I will one day become the Ra'Horak.",
            public: true
        });


        await createRoutine({
            creatorId: renekton.id,
            name: "Nasus Cannot Escape Me Forever!",
            goal: "Prepare to make him pay for leaving me to the darkness.",
            public: true
        });

        await createRoutine({
            creatorId: leona.id,
            name: "Chosen of the Sun!",
            goal: "Imbued by the Aspect of the Sun, destiny has chosen me to protect the Solari!",
            public: false
        });


        await createRoutine({
            creatorId: akali.id,
            name: "As Balance Dictates!",
            goal: "Emphasizing speed and agility over strength.",
            public: false
        });

        await createRoutine({
            creatorId: leona.id,
            name: "Stay at the Vanguard!",
            goal: "I will bring Diana back to the the light, in the name of the Solari!",
            public: true
        });

        console.log("Creating renekton", renekton);

        console.log("Finished making routines");
    } catch (error) {
        console.log("Error creating routines!");
        throw error;
    }
}

// TEST ROUTINE - ACTIVITIES

async function testRoutAct() {
    try {
        console.log("Adding Activities to a Routines");

        await addActivityToRoutine({
            routineId: 2,
            activityId: 2,
            count: 20,
            duration: 10
        });

        await addActivityToRoutine({
            routineId: 1,
            activityId: 2,
            count: 10,
            duration: 5
        });

        await addActivityToRoutine({
            routineId: 2,
            activityId: 3,
            count: 10,
            duration: 5
        });

        await addActivityToRoutine({
            routineId: 3,
            activityId: 1,
            count: 30,
            duration: 10
        });

        await addActivityToRoutine({
            routineId: 1,
            activityId: 3,
            count: 15,
            duration: 10
        });

        console.log("Finished adding Activities to Routines");

    } catch (error) {
        console.log('Failed adding an Activity(ies) to Routine(s)!');
        throw error;
    }
}


// REBUILD DATABASE
async function rebuildDB() {
    try {
        client.connect();

        await dropTables();
        await createTables();
        await createInitialUsers();
        await createInitialActivities();
        await createInitialRoutines();
        await testRoutAct();
    } catch (error) {
        console.error(error);
        throw error;
    }
}

// TEST DATABASE
async function testDB() {
    try {
        console.log("Starting to test database...");

        const users = await getAllUsers();
        console.log("getAllUsers:", users);

        console.log("Calling getUser[akali]...");
        const user = await getUser({ username: 'akali' });
        console.log("Finished getting user[akali]", user);

        console.log("Calling getAllActivities...");
        const activities = await getAllActivities();
        console.log("getAllActivities:", activities);

        console.log("Updating Activity[0]");
        const updatingActivity = await updateActivity(activities[0].id, {
            name: "Squats",
            description: "Squats increase lower body and core strength, as well as flexibility in your lower back and hips. Because they engage some of the largest muscles in the body, they also pack a major punch in terms of calories burned."
        });
        console.log("Updated Activity[0]:", updatingActivity);

        console.log("Calling getAllRoutines...");
        const routines = await getAllRoutines();
        console.log("getAllRoutines:", routines);

        console.log("Calling getPublicRoutines...");
        const public = await getPublicRoutines();
        console.log("getPublicRoutines", public);

        console.log("Calling getALLRoutinesByUser[leona]...");
        const allUserRouts = await getAllRoutinesByUser({ username: 'leona' });
        console.log("Finished getALLRoutinesByUser[leona]:", allUserRouts);

        console.log("Calling getPUBLICRoutinesByUser[leona]...");
        const publicUserRouts = await getPublicRoutinesByUser({ username: 'leona' });
        console.log("Finished getPUBLICRoutinesByUser[leona]:", publicUserRouts);

        console.log("Calling getPublicRoutinesByActivity[2]");
        const routineActs = await getPublicRoutinesByActivity({ activityId: 2 });
        console.log("Finished GetPublicRoutinesbyActivity[2]", routineActs);

        console.log("Updating Routine[3]");
        const updatingRoutine = await updateRoutine(routines[3].id, {
            goal: "Increase speed and agility as Master Shen taught me."
        });
        console.log("updateRoutine[3]:", updatingRoutine);

        console.log("Deleting Routine[3]...");
        const routineDelete = await deleteRoutine(routines[2].id);
        console.log("Deleted Routine[3]", routineDelete);

        console.log("Calling getAllRoutineActivities");
        const routineActivities = await getAllRoutineActivities();
        console.log("Finished gettting all Routine Activities!", routineActivities);

        console.log("Updating Activity in Routine [2]");
        const updateRoutAct = await updateRoutineActivity(routineActivities[2].id, {
            duration: 10,
            count: 20
        });
        console.log("Finished Updating Activity in Routine [2]", updateRoutAct);

        console.log("Deleting A Routine_Activity[5]...");
        const deleteRoutAct = await deleteRoutineActivity(routineActivities[3].id);
        console.log("Deleted Routine_Activity!", deleteRoutAct);

        console.log("Finished database tests!");
    } catch (error) {
        console.error("Error testing database!");
        throw (error);
    };
}

rebuildDB()
    .then(testDB)
    .catch(console.error)
    .finally(() => client.end());