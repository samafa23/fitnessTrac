const express = require('express');
const usersRouter = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { getAllUsers, getUser, createUser, getAllRoutinesByUser } = require('../db');
const SALT_COUNT = 10;

usersRouter.use((req, res, next) => {
    console.log("A request is being made to /users!");

    next();
});

usersRouter.get('/', async (req, res) => {
    const users = await getAllUsers();

    res.send({
        users
    });
});

usersRouter.post(`/login`, async (req, res, next) => {
    try {
        const { username, password } = req.body;

        console.log(req.body);

        if (!username || !password) {
            next({
                name: "MissingCredentialsError",
                message: "Please supply both a username and password."
            });
        }

        const user = await getUser({ username });

        console.log("the User", user);

        const hashedPassword = user.password;

        bcrypt.compare(password, hashedPassword, (err, passwordsMatch) => {
            if (passwordsMatch) {
                const { id, username } = user;
                const token = jwt.sign({ id, username }, process.env.JWT_SECRET);
                res.send({ message: "You're logged in!", token });
            } else {
                res.send({
                    name: 'IncorrectCredenialsError',
                    message: 'Username or password is incorrect'
                });
            }
        });
    } catch ({ name, message }) {
        next({ name, message });
    }
});

usersRouter.post('/register', async (req, res, next) => {
    try {
        const { username, password } = req.body;

        let securedPassword;
        const _user = await getUser({ username });

        if (_user) {
            next({
                name: 'UserExistsError',
                message: 'A user by that username already exists!'
            });
        }
        // } else if (password <= 7) {
        //     next({
        //         name: 'PasswordLengthError',
        //         message: 'Password must be at least 8 characters'
        //     });
        // }

        bcrypt.hash(password, SALT_COUNT, async (err, hashedPassword,) => {
            console.log(hashedPassword);
            securedPassword = hashedPassword;
            const user = await createUser({
                username, password: securedPassword
            });

            const token = jwt.sign({
                id: user.id,
                username
            }, process.env.JWT_SECRET, {
                expiresIn: '1w'
            });

            res.send({
                message: "Thank you for signing up!",
                token
            });
        });

    } catch ({ name, message }) {
        next({ name, message });
    }
});

usersRouter.get('/:username/routines', async (req, res, next) => {
    const user = req.params;
    try {
        const data = await getAllRoutinesByUser(user);

        res.send({
            routines: data
        });

    } catch ({ name, message }) {
        next({ name, message });
    }
});

module.exports = usersRouter;

// curl http://localhost:3000/api/users/:username/routines -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjMsInVzZXJuYW1lIjoibGVvbmEiLCJpYXQiOjE1OTczNTYxNjV9.iuLy7AnJn4zSiiij-ifiX0pBbxamFgeIUQwp8tu_ow4'
// curl http://localhost:3000/api/users/register -H "Content-Type: application/json" -X POST -d '{"username": "nunu", "password": "abominable"}' 
// curl http://localhost:3000/api/users/login -H "Content-Type: application/json" -X POST -d '{"username": "nunu", "password": "abominable"}'
// nunu - abominable

// curl http://localhost:3000/api/activities -X POST -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwidXNlcm5hbWUiOiJudW51IiwiaWF0IjoxNTk3NDE5NTU4fQ.wVoCduvCi5RHDEqgFD0btI-Dal2sS2Qo5xe4qw_FsL0' -H 'Content-Type: application/json' -d '{"name": "lift snowballs", "description": "Lift a 30lb from the grand and above your head, hold, bring back down, release infront of you."}'
// curl http://localhost:3000/api/activities/1 -X PATCH -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwidXNlcm5hbWUiOiJudW51IiwiaWF0IjoxNTk3NTA0MTMxfQ.F3lYjF2iM8Zbd2bpcZl3sbZVCrlHKGHmpd2TCljd6ts' -H 'Content-Type: application/json' -d '{"name": "squats","description": "squats increase lower body and core strength, as well as flexibility in your lower back and hips."}'
// PRACTICE TOKEN: 
// 08/14/20
// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwidXNlcm5hbWUiOiJudW51IiwiaWF0IjoxNTk3NDI2OTIzfQ.grqk3y9T-duMKVfVZZFOnRTRJ0AV4caDx4Uz4D-LdL8