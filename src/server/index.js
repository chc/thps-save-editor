const express = require('express')
const app = express()
require('./configure.js')(app);
var port = process.env.PORT ||8080;
app.listen(port, () => console.log('Server running on port: ', port))
