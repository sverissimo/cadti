const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    cpf: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: 1
    },
    password: {
        type: String,
        required: true,
        trim: true,
    },
    role: {
        type: String,
    },
    verified: {
        type: Boolean,
        default: true
    },
    empresas: { type: [] },
    messagesRead: { type: [] }
},
    { timestamps: true })

const UserModel = mongoose.model('users', userSchema, 'users')

module.exports = UserModel