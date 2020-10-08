const Joi = require('@hapi/joi');

const loginValidation = (data) => {
    const loginSchema = Joi.object({
        email: Joi.string().required().email(),
        password: Joi.string().required()
    });
    return loginSchema.validate(data);
};

const registerValidation = (data) => {
    const registerSchema = Joi.object({
        first_name: Joi.string().required(),
        last_name: Joi.string().required(),
        email: Joi.string().required().email(),
        phone: Joi.string().required(),
        password: Joi.string().required()
    });
    return registerSchema.validate(data);
};

module.exports.loginValidation = loginValidation;
module.exports.registerValidation = registerValidation;