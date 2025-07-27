const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const {MongoClient, ObjectId} = require('mongodb')
require('dotenv').config()

const app = express()
app.use(cors())
app.use(bodyParser.json())

let database;
const connectToDatabase = async () => {
    try {
        const client = new MongoClient(process.env.MONGO_URI)
        await client.connect()
        database = client.db('LloretDB')
        console.log('✅ Connected to MongoDB')
        
        // Avvia il server solo dopo la connessione al database
        app.listen(process.env.PORT, () => {
            console.log(`🚀 Server in ascolto su porta ${process.env.PORT}`)
        })
    } catch (error) {
        console.error('❌ Error connecting to MongoDB:', error)
        process.exit(1) // Termina l'applicazione in caso di errore
    }
}
connectToDatabase()

app.get('/players', async (req, res) => {
    try {
        const players = await database.collection('players').find().toArray()
        res.json(players)
    } catch (error) {
        console.error('Error fetching players:', error)
        res.status(500).send('Internal Server Error')
    }
})

app.get('/sfide', async (req, res) => {
    try {
        const sfide = await database.collection('sfide').find().toArray()
        res.json(sfide)
    } catch (error) {
        console.error('Error fetching sfide:', error)
        res.status(500).send('Internal Server Error')
    }
})

app.get('/notifiche', async (req, res) => { 
    try {
        const notifiche = await database.collection('notifiche').find().toArray()
        res.json(notifiche)
    } catch (error) {
        console.error('Error fetching notifiche:', error)
        res.status(500).send('Internal Server Error')
    }
})

app.get('/players/:id', async (req, res) => {
    const playerId = req.params.id
    try {
        const player = await database.collection('players').findOne({ nome: playerId })
        if (!player) {
            return res.status(404).send('Player not found')
        }
        res.json(player)
    } catch (error) {
        console.error('Error fetching player:', error)
        res.status(500).send('Internal Server Error')
    }
})

app.patch('/players/:id', async (req, res) => {
    const playerId = req.params.id;
    const { punti, motivo } = req.body;

    if (typeof punti !== 'number') {
        return res.status(400).json({ error: 'Il campo punti deve essere un numero' });
    }

    try {
        const player = await database.collection('players').findOne({ _id: new ObjectId(playerId) });
        if (!player) return res.status(404).json({ error: 'Giocatore non trovato' });

        const nuovoPunteggio = player.punti + punti;
        const result = await database.collection('players').updateOne(
            { _id: new ObjectId(playerId) },
            { $set: { punti: nuovoPunteggio } }
        );

        if (result.modifiedCount === 0) {
            return res.status(400).json({ error: 'Nessun aggiornamento effettuato' });
        }

        // Crea una notifica
        await database.collection('notifiche').insertOne({
            giocatoreId: playerId,
            giocatoreNome: player.nome,
            punti,
            motivo: motivo || 'Assegnazione punti',
            data: new Date()
        });

        const updatedPlayer = await database.collection('players').findOne({ _id: new ObjectId(playerId) });
        res.json(updatedPlayer);

    } catch (error) {
        console.error('Error updating player points:', error);
        res.status(500).json({ error: 'Errore del server' });
    }
});

app.post('/notifiche', async (req, res) => {
    const { giocatoreId, giocatoreNome, punti, motivo } = req.body;

    if (!giocatoreId || !giocatoreNome || motivo === undefined) {
        return res.status(400).json({ error: 'Campi mancanti' });
    }

    try {
        const nuovaNotifica = {
            giocatoreId,
            giocatoreNome,
            punti: Number(punti) || 0,
            motivo,
            data: new Date().toISOString()
        };

        const result = await database.collection('notifiche').insertOne(nuovaNotifica);
        
        res.status(201).json({
            ...nuovaNotifica,
            _id: result.insertedId
        });
    } catch (error) {
        console.error('Error creating notification:', error);
        res.status(500).json({ error: 'Errore del server' });
    }
});