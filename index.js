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

/// FUNCTIONS

async function validateItem(item) {
  try {
    await item.validate()
  } catch (error) {
    throw new customError(DBErrors.Validation, error.errors)
  }
}

async function findUserbyUsername(usernameStr) {
  try {
    const user = await User.findOne({ username: usernameStr })
    return user
  } catch (error) {
    throw new customError(DBErrors.Find, error)
  }
}

async function saveItem(item) {
  try {
    const response = await item.save()
    return response
  } catch (error) {
    throw new customError(DBErrors.Save, error)
  }
}

async function formatItem(item) {
  try {
    return item.toJson()
  } catch (error) {
    throw new customError(DBErrors.Format, error)
  }
}



async function createUser(usernameStr) {
  const newUser = new User({ username: usernameStr })
  await validateItem(newUser)
  const result = await saveItem(newUser)
  const formated = formatItem(result)
  return formated
}

async function post_CreateUser(req, res) {
  const user = req.body.username
  const doesExist = await findUserbyUsername(user)
  if (doesExist) {
    const formated = formatItem(doesExist)
    res.json(formated)
  } else {
    const newUser = await createUser(user)
    res.json(newUser)
  }
}


app.use(express.urlencoded({ extended: false }))

app.post("/api/users", async function (req, res) {
  post_CreateUser(req, res)
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
// User.deleteMany({}).then(e=>console.log("Deleted: ",e))
// User.find({}).then(e=>console.log("Found", e))  



