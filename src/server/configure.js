const bodyParser = require('body-parser')
const api = require('./api')

module.exports = app => {
    app.use(bodyParser.json());
     
    app.use('/api', api);

    app.use(function (err, req, res, next) {
        console.error(err.stack)
        res.status(500);
      })
}