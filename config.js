const express = require('express')
const exphbs = require('express-handlebars')
const routes = require('./routes/social_net')
const session = require('express-session')


const PORT = process.env.PORT || 4000

const app = express()

const hbs = exphbs.create({
    defaultLayout: "main",
    extname: "hbs"
})

app.engine("hbs", hbs.engine)
app.set('view engine', 'hbs')
app.set('views', 'views')

app.use(express.urlencoded({ extended: true }))

app.use(session({
    secret: 'code_union',
    resave: false,
    saveUninitialized: false
}))

app.use(routes)

app.use((res, req) => {
    res.sendStatus(404)
})

module.exports = {
    app: app,
    port: PORT,
    db_config: {
        url: "mongodb+srv://ximiz:ximiz@socialnet.ryyzg.mongodb.net/socialnet?retryWrites=true&w=majority",
        options: {
            useNewUrlParser: true,
            useFindAndModify: false,
            useUnifiedTopology: true
        }
    }
}