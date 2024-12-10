const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const mongoose = require("mongoose")
const { Exercise, Log, User } = require('./Schemas')
const { customError, DBErrors } = require('./Errors')

mongoose.connect(process.env.MONGO_URI)

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});


app.use(express.urlencoded({ extended: false }))

app.post("/api/users", async function (req, res) {
  postCreateUser(req, res)
})



// Error handling middleware
app.use(function (err, req, res, next) {
  res.status(err.code || 500).json({
    error: {
      code: err.code,
      message: err.message
    }
  })
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})


// User Reset
/* User.deleteMany({}).then(e=>console.log("Deleted: ",e))
User.find({}).then(e=>console.log("Found", e))  */