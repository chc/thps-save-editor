const configureAPI = require('./src/server/configure')

module.exports = {
    configureWebpack: {
        devtool: 'inline-source-map',
      },
    
    devServer: {
        before: configureAPI
    }
}