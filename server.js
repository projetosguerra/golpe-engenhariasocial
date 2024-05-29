const express = require('express');
const mongoose = require('mongoose');
const geoip = require('geoip-lite');
const app = express();
const PORT = process.env.PORT || 3000;

// Conecte-se ao MongoDB
mongoose.connect('mongodb://localhost:27017/iptracker', { useNewUrlParser: true, useUnifiedTopology: true });

const visitorSchema = new mongoose.Schema({
    ip: String,
    location: Object,
    date: { type: Date, default: Date.now }
});

const Visitor = mongoose.model('Visitor', visitorSchema);

app.get('/', (req, res) => {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const geo = geoip.lookup(ip);
    
    const visitor = new Visitor({
        ip: ip,
        location: geo
    });

    visitor.save((err) => {
        if (err) return console.error(err);
        res.send(`
            <h1>Bem-vindo!</h1>
            <p>Seu IP: ${ip}</p>
            <p>Localização: ${geo ? JSON.stringify(geo) : 'Desconhecida'}</p>
        `);
    });
});

app.get('/stats', async (req, res) => {
    try {
        const visitors = await Visitor.find();
        res.json(visitors);
    } catch (err) {
        res.status(500).send(err);
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
