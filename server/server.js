const express = require('express');
const app = express();

const options = {
    setHeaders: res => {
        res.set('Service-Worker-Allowed', '/');
    }
};

app.use(express.static('dist', options))

// test calls
app.get('/convert/1/USD/CAD', (req, res) => {
    const time = new Date().toISOString();
    const amount = 1.32;
    res.json({ time, amount })
})
app.get('/convert/1/USD/GRB', (req, res) => {
    const time = new Date().toISOString();
    const amount = .77;
    res.json({ time, amount })
})
app.get('/convert/1/CAD/USD', (req, res) => {
    const time = new Date().toISOString();
    const amount = .76;
    res.json({ time, amount })
})
app.get('/convert/1/CAD/GRB', (req, res) => {
    const time = new Date().toISOString();
    const amount = .58;
    res.json({ time, amount })
})
app.get('/convert/1/GRB/CAD', (req, res) => {
    const time = new Date().toISOString();
    const amount = 1.71;
    res.json({ time, amount })
})
app.get('/convert/1/GRB/USD', (req, res) => {
    const time = new Date().toISOString();
    const amount = 1.30;
    res.json({ time, amount })
})
app.get('/convert/1/GRB/GRB', (req, res) => {
    const time = new Date().toISOString();
    const amount = 1.00;
    res.json({ time, amount })
})
app.get('/convert/1/USD/USD', (req, res) => {
    const time = new Date().toISOString();
    const amount = 1.00;
    res.json({ time, amount })
})
app.get('/convert/1/CAD/CAD', (req, res) => {
    const time = new Date().toISOString();
    const amount = 1.00;
    res.json({ time, amount })
})

app.listen(3000, () => {
    console.log('Listening on port 3000');
})