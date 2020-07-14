const { app, port, db_config } = require('./config')
const mongoose = require('mongoose')

function start() {
    mongoose.connect(db_config.url, db_config.options)
    app.listen(port, () => {
        console.log("Server has been started...")
    })
}

start()