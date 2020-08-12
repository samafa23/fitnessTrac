// ROUTINES

// GET ALL ROUTINES

async function getAllRoutines() {
    try {
        const { rows } = await client.query(`
        SELECT *
        FROM routines;
        `);

        return rows;
    } catch (error) {
        throw error;
    }
}

// // GET ALL PUBLIC ROUTINES

async function getPublicRoutines() {
    try {
        const { rows } = await client.query(`
        SELECT *
        FROM routines
        WHERE public=true;
        `);

        return rows;
    } catch (error) {
        throw error;
    }
}

// GET ALL ROUTINES BY USER

// async function getRoutinesByUser({ username }) {
//     try {
//         const { rows } = await client.query(`
//         SELECT *
//         FROM routines
//         WHERE "creatorId"=${ username};
//         `);

//         return rows;
//     } catch (error) {
//         throw error;
//     }
// }

// GET PUBLIC ROUTINES BY USER

// async function getPublicRoutinesByUser({ username }) {
//     try {
//         const { rows } = await client.query(`
//         SELECT *
//         FROM routines
//         WHERE public=true, "creatorId"=${ username}
//         `);

//         return rows;
//     } catch (error) {
//         throw error;
//     }
// }