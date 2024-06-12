const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sequelize = require('./config/database');
const Player = require('./models/player');
const { errorResponse, successResponse } = require('./utils/response-utils');
const { default: axios } = require('axios');
const { validateCreateDataSheet } = require('./middleware/player/player-validator');
const handleValidationResult = require('./middleware/handleValidationErrors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post('/api/players', [
    validateCreateDataSheet,
    handleValidationResult
], async (req, res) => {
    const token = req.headers.authorization;
    try {
        const { status, data } = await axios.post('http://localhost:3000/api/permissions/validatePermission', {
            permission: 'createPlayer'
        }, {
            headers: {
                'Authorization': token
            }
        });

        if (status !== 200) {
            throw new Error('Permiso denegado');
        }

        const player = await Player.create({ ...req.body, userId: data.data._id });
        res.status(201).json(successResponse(player));
    } catch (error) {
        res.status(500).json(errorResponse('Database error: ' + error.message, 500));
    }
});

app.get('/api/players', async (req, res) => {
    const token = req.headers.authorization;
    try {
        const { status, data } = await axios.post('http://localhost:3000/api/permissions/validatePermission', {
            permission: 'getPlayer'
        }, {
            headers: {
                'Authorization': token
            }
        });

        if (status !== 200) {
            throw new Error('Permiso denegado');
        }

        const dataSheet = await Player.findOne({
            where: {
                userId: data.data._id
            }
        });
        res.status(201).json(successResponse(dataSheet));
    } catch (error) {
        console.log(error.message);
        res.status(500).json(errorResponse('Database error: ' + error.message, 500));
    }
});

app.get('/api/players/:id', async (req, res) => {
    const {id} = req.params;
    try {
        const dataSheet = await Player.findByPk(id,{attributes: {exclude:['updatedAt', 'createdAt']}});
        res.status(201).json(successResponse(dataSheet));
    } catch (error) {
        console.log(error.message);
        res.status(500).json(errorResponse('Database error: ' + error.message, 500));
    }
});

app.get('/api/players/by-team/:teamId', async (req, res) => {
    try {
        const { teamId } = req.params;

        const players = await Player.findAll({
            where: {
                clubId: teamId
            }
        });

        res.json(successResponse(players));
    } catch (error) {
        console.error('Error al obtener jugadores por equipo:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

app.put('/api/players/:id/club', async (req, res) => {
    const { id } = req.params;
    const { clubId,  } = req.body;

    try {
        const player = await Player.findByPk(id);

        if (!player) {
            return res.status(404).json(errorResponse('Jugador no encontrado', 404));
        }

        // Actualizar la información del jugador
        await player.update({ clubId });

        res.status(200).json(successResponse(player));
    } catch (error) {
        console.log(error.message);
        res.status(500).json(errorResponse('Error en la base de datos: ' + error.message, 500));
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
