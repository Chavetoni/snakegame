const express = require('express');
const path = require('path')
const app = express();
const port = 3000;

app.use(express.static('public'));

console.log(`serving static files from: ${path.join(__dirname, 'public')}`)

app.listen(port , () => {
    console.log(`App is listening at http://localhost:${port}`)
});

app.use(function(req, res, next){
    res.status(404).send("Sorry can't find that")
});