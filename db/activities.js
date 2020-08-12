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