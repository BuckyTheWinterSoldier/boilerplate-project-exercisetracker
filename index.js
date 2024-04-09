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



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
