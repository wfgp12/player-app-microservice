const { body } = require("express-validator");

module.exports = {
    validateCreateDataSheet: [
        body('firstName').isString().notEmpty().bail(),
        body('lastName').isString().notEmpty().bail(),
        body('birthDate').isDate().bail(),
        body('age').isInt({ min: 1 }).bail(),
        body('jerseyNumber').isInt({ min: 1 }).bail(),
        body('position').isString().notEmpty().bail(),
        body('weight').isFloat({ min: 1 }).bail(),
        body('height').isFloat({ min: 1 }).bail(),
        body('bloodType').isString().notEmpty().bail(),
        body('category').isString().notEmpty().bail(),
    ]
}