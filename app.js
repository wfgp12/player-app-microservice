const express = require('express');
const bodyParser = require('body-parser');
const { body, validationResult, header } = require('express-validator');
const sequelize = require('./config/database');
const Player = require('./models/player');
const { errorResponse, successResponse } = require('./utils/response-utils');
const { default: axios } = require('axios');
const { validateCreateDataSheet } = require('./middleware/player/player-validator');
const handleValidationResult = require('./middleware/handleValidationErrors');

const app = express();
app.use(bodyParser.json());

app.post('/api/players', [
    validateCreateDataSheet,
    handleValidationResult
], async (req, res) => {
    const token = req.headers.authorization;
    try {
        const {status, data} = await axios.post('http://localhost:3000/api/permissions/validatePermission', {
            permission: 'createPlayer'
        }, {
            headers: {
                'Authorization': token
            }
        });

        if (status !== 200) {
            throw new Error('Permiso denegado');
        }

        console.log(data._id);
        const player = await Player.create({...req.body, userId: data._id});
        res.status(201).json(successResponse(player));
    } catch (error) {
        res.status(500).json(errorResponse('Database error: ' + error.message, 500) );
    }
});

const PORT = process.env.PORT || 3000;

sequelize.sync().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}).catch(error => {
    console.error('Unable to connect to the database:', error);
});
