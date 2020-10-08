const router = require('express').Router();
const { registerValidation } = require('../validation');
const verify = require('./verifyToken');
const { pool } = require('../dbConfig');
const io = require('socket.io');
const bcrypt = require('bcryptjs');

const socket = io();

//GET ALL USERS
router.get('/', verify, async (req, res) => {
    pool.query(
        `SELECT * FROM users`,
        (err, result) => {
            if (err) return res.status(400).send(err);
            res.json(result.rows);
        }
    );
});

//ADD USER
router.post('/', verify, async (req, res) => {
    //VALIDATE DATA BEFORE ADDING NEW USER
    const { error } = registerValidation(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    //CHECK IF THE USER IS ALREADY EXIST IN DB
    pool.query(
        `SELECT * FROM users
        WHERE email=$1`,
        [req.body.email],
        (err, result) => {
            if (err) return res.status(400).send(err);
            console.log(result.rows);
        }
    );

    //MAKE HASH OF PASSWORD
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    pool.query(
        `INSERT INTO users (first_name, last_name, email, phone, password)
        VALUES ($1, $2, $3, $4, $5)`,
        [req.body.first_name, req.body.last_name, req.body.email, req.body.phone, hashedPassword],
        (err, result) => {
            if (err) return res.status(400).send(err);
            res.send('User added.');
            console.log(result);
        }
    );
});

//GET SPECIFIC USER
router.get('/:id', verify, async (req, res) => {
    pool.query(
        `SELECT * FROM users
        WHERE id=$1`,
        [req.params.id],
        (err, result) => {
            if (err) res.status(400).send(err);
            res.json(result.rows);
        }
    );
});

//UPDATE USER'S DATA
router.put('/:id', verify, async (req, res) => {
    //MAKE HASH OF PASSWORD
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    pool.query(
        `UPDATE users SET (first_name, last_name, email, phone, password) = ($2, $3, $4, $5, $6)
        WHERE id = $1`,
        [req.params.id, req.body.first_name, req.body.last_name, req.body.email, req.body.phone, hashedPassword],
        (err, result) => {
            if (err) res.status(400).send(err);
            res.send(`User's info updated.`);
            //This does not work. I have no idea why. But I was trying to do something.
            //In my GitHub you can check out another project in which I used the ws library. (hint that I understand what WebSockets are :D)
            socket.emit('updateUser', { data: 'User updated!' });
        } 
    );
});

module.exports = router;