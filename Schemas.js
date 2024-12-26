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
        _id: this.username._id,
        username: this.username.username,
        date: this.date.toDateString(),
        duration: this.duration,
        description: this.description
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

const populateExercisePre = async function (next) {
    await this.populate("username")
    next()
}

const populateExercisePost = async function(doc, next){
    await doc.populate("username")
    next()
}

const populateLogPre = async function (next) {
    await this.populate("username")
    await this.populate("log")
    next()
}

exerciseSchema.pre("find", populateExercisePre)
exerciseSchema.pre("findOne", populateExercisePre)
exerciseSchema.post("save", populateExercisePost)
logSchema.pre("find", populateLogPre)
logSchema.pre("findOne", populateLogPre)

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