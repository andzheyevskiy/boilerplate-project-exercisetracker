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

async function findUsers(query = {}) {
  try {
    const user = await User.find(query)
    return user
  } catch (error) {
    throw new customError(DBErrors.Find, error)
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

async function findUserById(id) {
  try {
    const user = await User.findById(id)
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
  const formated = await formatItem(result)
  await addUserTolog(result)
  return formated
}

async function createExercise(data) {
  const newExercise = new Exercise(data)
  await validateItem(newExercise)
  const savedItem = await saveItem(newExercise)
  await appendLogToUser(savedItem)
  const formated = await formatItem(savedItem)
  return formated
}

async function addUserTolog(userObj) {
  const newLog = new Log({ username: userObj._id })
  try {
    await newLog.save()
  } catch (error) {
    throw new customError(DBErrors.Save, error)
  }
}

async function appendLogToUser(log) {
  try {
    const addLog = await Log.findOneAndUpdate(
      { username: log.username },
      { $push: { log: log } },
      { new: true, upsert: true }
    )
  } catch (error) {
    throw new customError(DBErrors.Find, error)
  }
}

async function getUserLogs(userId, params) {
  try {
    const allLogs = await Log.findOne({ username: userId })
    return allLogs

  } catch (error) {
    throw new customError(DBErrors.Find, error)
  }
}

async function post_CreateUser(req, res) {
  const user = req.body.username
  const doesExist = await findUserbyUsername(user)
  if (doesExist) {
    const formated = await formatItem(doesExist)
    res.json(formated)
  } else {
    const newUser = await createUser(user)
    res.json(newUser)
  }
}

async function get_allUsers(req, res) {
  const allUsers = await findUsers()
  const formated = allUsers.map(e => e.toJson())
  res.json(formated)
}

async function post_CreateExercise(req, res) {
  const exercise = await createExercise({
    username: req.params._id,
    description: req.body.description,
    duration: req.body.duration,
    date: req.body.date || Date.now()
  })
  res.json(exercise)
}

async function get_Logs(req, res) {
  const id = req.params._id
  const result = await getUserLogs(id)
  const formated = await formatItem(result)
  res.json(formated)
}

//=========== APP =============//

app.use(express.urlencoded({ extended: false }))

// Users //

app.post("/api/users", async function (req, res) {
  try {
    await post_CreateUser(req, res)
  } catch (error) {
    next(error)
  }
})

app.get("/api/users", async function (req, res) {
  try {
    await get_allUsers(req, res)
  } catch (error) {
    next(error)
  }
})

// Exercise //

app.post("/api/users/:_id/exercises", async function (req, res, next) {
  try {
    await post_CreateExercise(req, res)
  } catch (error) {
    next(error)
  }
})

// Logs //

app.get("/api/users/:_id/logs", async function (req, res, next) {
  try {
    await get_Logs(req, res)
  } catch (error) {
    next(error)
  }
})



// Error handling middleware
app.use(function (err, req, res, next) {
  console.error(err)
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



