const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser');
const URL=require('url');
const mongoose=require('mongoose');
require('dotenv').config()

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});
app.use(bodyParser.urlencoded({ extended: false }))
mongoose.connect('mongodb+srv://ashokravi:ashokravi@cluster0.xk9uy7l.mongodb.net/ExerciseTracker?retryWrites=true&w=majority&appName=Cluster0')
.then(()=>{console.log('Connected!')});
const userSchema=mongoose.Schema({
  userName:{
    type:String,
    required:true
  }
});
const userModel=mongoose.model("userModel",userSchema);

app.post('/api/users',async(request,response)=>{
const username= request.body.username;
const responsePayload=await userModel.create({userName:username});
response.json({username:username,_id:responsePayload._id});
})
app.get('/api/users',async(request,response)=>{
  const responsePayload=await userModel.find({});
  response.json(responsePayload);
})
const exerciseSchema=mongoose.Schema({
  _userId:{
    type:String,required:true
  },
  description:{
    type:String,required:true
  },
  duration:{
    type:String,required:true
  },
  date:{
    type:String,required:true
  }
});
const exerciseModel=mongoose.model("exerciseModel",exerciseSchema);
app.post("/api/users/:_id/exercises",async(request,response)=>{
  const description=request.body.description;
  const {_id}=request.params;
  const duration=request.body.duration;
  let date=request.body.date;
  if(!date){
    date=new Date().toISOString().substring(0, 10);
  }
  const requestPayload={
    _userId:_id,
    description:description,
    duration:duration,
    date:date

  }
  const responsePayload=await exerciseModel.create(requestPayload);
  const userresponsePayload=await userModel.findById(_id);

  // console.log(responsePayload);
  // console.log(userresponsePayload);
  
let formattedDate = new Date(date);
formattedDate = formattedDate.toString().split(' ');
let finalDate=`${formattedDate[0]} ${formattedDate[1]} ${formattedDate[2]} ${formattedDate[3]}`;
  response.json({
    username: userresponsePayload.userName,
    description: description,
    duration: duration,
    date: finalDate,
    _id: _id
  });

})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
