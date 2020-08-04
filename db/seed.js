const {
    client,
    getAllUsers,
    createUser
} = require('./index');

// DROP TABLES
async function dropTables() {
    try {
        console.log("Dropping tables...");
        await client.query(`
        DROP TABLE IF EXISTS users;
        `);

        console.log("Finished dropping tables!");
    } catch (error) {
        console.error("Error Dropping tables!");
        throw error;
    }
}

// CREATE TABLES
async function createTables() {
    try {
        console.log("Creating tables...");
        await client.query(`
        CREATE TABLE users(
            id SERIAL PRIMARY KEY,
            username varchar(255) UNIQUE NOT NULL,
            password varchar(255) NOT NULL
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
        await createUser({ username: 'tristana', password: 'pocketrocket'});
        await createUser({ username: 'mundo', password: 'mundomundo'});

        console.log("Finished creating users!");
    } catch (error) {
        console.error("Error creating users!");
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
    } catch (error) {
        console.error(error);
    }
}

// TEST DATABASE
async function testDB() {
    try {
        console.log("Starting to test database...");

        const users = await getAllUsers();
        console.log("getAllUsers:", users);

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