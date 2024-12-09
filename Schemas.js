const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    }
})

userSchema.methods.toJson = function () {
    return {
        username: this.username,
        _id: this._id.toString()
    }
}

const exerciseSchema = new mongoose.Schema({
    username: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    description: {
        type: String,
        required: false
    },
    duration: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        default: Date.now()
    }
})

exerciseSchema.methods.toJson = function () {
    return {
        username: this.username.username,
        description: this.description,
        duration: this.duration,
        date: this.date.toDateString(),
        _id: this._id.toString()
    }
}

exerciseSchema.methods.toJsonMin = function () {
    return {
        description: this.description,
        duration: this.duration,
        date: this.date.toDateString(),
    }
}

const logSchema = new mongoose.Schema({
    username: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    log: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "Exercise"
    }
})

logSchema.virtual("count").get(function () {
    return this.log.length()
})
logSchema.set('toJSON', { virtuals: true });
logSchema.set('toObject', { virtuals: true });

const populate = function (next) {
    this.populate("username")
    this.populate("log")
    next()
}

exerciseSchema.pre("find", populate)
exerciseSchema.pre("findOne", populate)
logSchema.pre("find", populate)
logSchema.pre("findOne", populate)

logSchema.methods.toJson = function () {
    return {
        username: this.username.username,
        count: this.count,
        _id: this._id,
        log: this.log.map(e => e.toJsonMin())
    }
}

let User = mongoose.model("User", userSchema)
let Exercise = mongoose.model("Exercise", exerciseSchema)
let Log = mongoose.model("Log", logSchema)

module.exports = {
    User,
    Exercise,
    Log
}