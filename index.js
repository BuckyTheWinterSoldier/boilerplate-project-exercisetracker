const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser');
const URL = require('url');
const mongoose = require('mongoose');
const moment = require('moment');
require('dotenv').config()

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});
app.use(bodyParser.urlencoded({ extended: false }))
mongoose.connect('mongodb+srv://ashokravi:ashokravi@cluster0.xk9uy7l.mongodb.net/ExerciseTracker?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => { console.log('Connected!') });
const userSchema = mongoose.Schema({
  userName: {
    type: String,
    required: true
  }
});
const userModel = mongoose.model("userModel", userSchema);

app.post('/api/users', async (request, response) => {
  const username = request.body.username;
  const responsePayload = await userModel.create({ userName: username });
  response.json({ username: username, _id: responsePayload._id });
})
app.get('/api/users', async (request, response) => {
  const responsePayload = await userModel.find({});
  let finalArray = [];
  responsePayload.forEach((record) => {
    finalArray.push({ username: record.userName, _id: record._id });
  })
  response.json(finalArray);
})
const exerciseSchema = mongoose.Schema({
  _userId: {
    type: String, required: true
  },
  description: {
    type: String, required: true
  },
  duration: {
    type: Number, required: true
  },
  date: {
    type: Date, required: true
  }
});
const exerciseModel = mongoose.model("exerciseModel", exerciseSchema);
app.post("/api/users/:_id/exercises", async (request, response) => {
  const description = request.body.description;
  const { _id } = request.params;
  const duration = parseInt(request.body.duration);
  let date = request.body.date;
  if (!date) {
    date = new Date().toISOString().substring(0, 10);
  }
  const requestPayload = {
    _userId: _id,
    description: description,
    duration: duration,
    date: date
  }
  // console.log(requestPayload);
  const responsePayload = await exerciseModel.create(requestPayload);
  const userresponsePayload = await userModel.findById(_id);
  // console.log(responsePayload);
  // console.log(userresponsePayload);
  // let formattedDate = new Date(date);
  let formattedDate=responsePayload.date;
  formattedDate = formattedDate.toString().split(' ');
  let finalDate = `${formattedDate[0]} ${formattedDate[1]} ${formattedDate[2]} ${formattedDate[3]}`;
   response.json({
    username: userresponsePayload.userName,
    description: description,
    duration: duration,
    date: finalDate,
    _id: _id
  });

})
// /api/users/6615596ab5b4591c3c30d79c/logs
app.get("/api/users/:_id/logs", async (request, response) => {
  const { _id } = request.params;
  const { from, to, limit } = request.query;
  // console.log(`${_id} ${from} ${limit} ${limit}`);
  let exerciseResponsePayload;
  if (from || to) {
    let query = {};
    query._userId = _id;
    if (from && to) {
      query.date = { $gte: new Date(from), $lte: new Date(to) };
    }
    if (from && !to) {
      query.date = { $gte: new Date(from)};
    }
    let logsQuery = exerciseModel.find(query);
    if (limit) {
      logsQuery = logsQuery.limit(parseInt(limit));
    }
    exerciseResponsePayload = await logsQuery.exec();
  } 
  else {
    exerciseResponsePayload = await exerciseModel.findOne({ _userId: _id });
  }
  const userResponsePayload = await userModel.findById(_id);
  // console.log(exerciseResponsePayload);
  //   console.log(userResponsePayload);
  let exerciseLog = [];
  exerciseResponsePayload = Array.isArray(exerciseResponsePayload) ? exerciseResponsePayload : [exerciseResponsePayload]; 
  exerciseResponsePayload.forEach((record) => {
    let formattedDate = record.date;
    // console.log(formattedDate);
    formattedDate = formattedDate.toString().split(' ');
  let finalDate = `${formattedDate[0]} ${formattedDate[1]} ${formattedDate[2]} ${formattedDate[3]}`;
    exerciseLog.push({
      description: record.description,
      duration: record.duration,
      date: finalDate
    })
  });
  const finalPayload = {
    username: userResponsePayload.userName,
    count: exerciseResponsePayload.length,
    _id: _id,
    log: exerciseLog
  }
  response.json(finalPayload);
});
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
