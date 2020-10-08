const router = require('express').Router();
const { loginValidation } = require('../validation');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../dbConfig');

router.post('/', async (req, res) => {
    //VALIDATE DATA BEFORE LOGIN
    const { error } = loginValidation(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    //CHECK IF THE USER IS ALREADY EXIST IN DB
    let user;
    pool.query(
        `SELECT * FROM users WHERE email = $1`,
        [req.body.email],
        async (err, result) => {
            if (err) res.status(400).send(err);
            if (result.rows.length > 0) {
                user = await result.rows[0];
            } else {
                return res.status(400).send("Email didn't registered.");
            }
            console.log(user);

            //PASSWORD IS CORRECT
            const validPassword = await bcrypt.compare(req.body.password, user.password);
            if (!validPassword) return res.status(400).send("Password is not valid.")

            //CREATE AND ASSIGN JWT TOKEN
            const token = jwt.sign({ id: user.id }, process.env.SECRET_JWT_TOKEN);
            res.header('login-token', token).send(token);
        }
    );
});

module.exports = router;