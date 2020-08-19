const express = require('express');
const usersRouter = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { getAllUsers, getUser, createUser, getAllRoutinesByUser } = require('../db');
const SALT_COUNT = 10;

usersRouter.get('/', async (req, res, next) => {
    try {
        const users = await getAllUsers();

        res.send({
            users
        });
    } catch ({ name, message }) {
        next({ name, message });
    }
});

usersRouter.post(`/login`, async (req, res, next) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            next({
                name: "MissingCredentialsError",
                message: "Please supply both a username and password."
            });
        }

        const user = await getUser({ username });

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
        } else if (password.length <= 7) {
            next({
                name: 'PasswordLengthError',
                message: 'Password must be at least 8 characters'
            });
        } else {
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
        }
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
