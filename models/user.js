const { Schema, model } = require('mongoose')

const schema = Schema({
    first_name: {
        type: String,
        required: true
    },
    last_name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: false,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    address: {
        type: Object,
        required: false
    }
})

module.exports = model("User", schema)