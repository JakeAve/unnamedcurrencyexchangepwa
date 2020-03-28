const express = require('express');
const app = express();

const options = {
    setHeaders: res => {
        res.set('Service-Worker-Allowed', '/');
    }
};

app.use(express.static('dist', options))

app.listen(3000, () => {
    console.log('Listening on port 3000');
})