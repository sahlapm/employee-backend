// Task1: initiate app and run server at 3000
// app.js

const express = require('express');
const bodyparser=require('body-parser');
const bcrpt=require('bcrypt')
const jwt=require('jsonwebtoken')
var app=new express();
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extented:false}));
const cors=require('cors');
app.use(cors());
const mongoose=require('mongoose');
const { EmployeeModel } = require('./model/employee');
const { UserModel } = require('./model/users');


mongoose.connect('mongodb+srv://sahla:sahlaAtlas@cluster0.2wlvq8k.mongodb.net/EmployeeDB?retryWrites=true&w=majority',
{
    useNewUrlParser:true
});

const path = require('path');
app.use(express.static(path.join(__dirname,'/build')));
app.get('/*', function(req, res) {
    res.sendFile(path.join(__dirname
    ,'/build/index.html')); });

app.post('/api/create',(req,res)=>{

    jwt.verify(req.body.token,"myKey",(err,decoded)=>{
        if(decoded && decoded.username){
       
            let data = new EmployeeModel({ 
                name: req.body.name, 
                position: req.body.position,
                location:req.body.location,
                salary:req.body.salary
            })
    
              data.save()
              res.json({"status":"success"})
    
    
        }
        else{
            res.json({"status":"Unauthorised user"})
    
        }
       })   
})
app.post('/api/logincheck',(req,res)=>{

    jwt.verify(req.body.token,"myKey",(err,decoded)=>{
        if(decoded && decoded.username){
            res.json({"status":"success"})
        }
        else{
            res.json({"status":"Unauthorised user"})
    
        }
       })
    })
app.get('/',async(req,res)=>{
try
{
  const data=await EmployeeModel.find()
  res.json(data);
}
catch(err)
{
    res.status(400).json({error:"No employee to display"});
}  
})

app.put('/api/update/:id',async(req,res)=>{
  try {
    let id=req.params.id;
const data= await EmployeeModel.findOneAndUpdate({"_id":id},req.body)
res.json({"status":"success"})
}
catch (error)
{
    res.status(400).json({error:"No employee updated"});
}
   
})

app.delete('/api/delete/:id',async(req,res)=>{           
    try
    {
        let id=req.params.id;
       const data= await EmployeeModel.findOneAndDelete({"_id":id},req.body);
       res.json({"status":"success"})
    }
    catch (error)
    {
        res.status(400).json({error:"No employee deleted"});
    }
   
})


app.post("/api/signup",async(req,res)=>{

    let data = new UserModel({ username: req.body.username, 
        password: bcrpt.hashSync(req.body.password,10),
        usertype:req.body.usertype })
    console.log(data)
    await data.save()
    res.json({"status":"success","data":data})

})

app.post("/api/signin",async(req,res)=>{
    var getUsername=req.body.username
    var password=req.body.password

    let result=UserModel.find({username:getUsername},(err,data)=>{

        if(data.length>0){
            const passwordValidator=bcrpt.compareSync(password,data[0].password)
            if(passwordValidator){

                jwt.sign({username:getUsername,id:data[0]._id},"myKey",{expiresIn:"1d"},
                (err,token)=>{
                    if (err) {
                        res.json({"status":"error","error":err})

                    } else {
                        res.json({"status":"success","data":data,"token":token})
                    }
                })            
            }
            else{
                res.json({"status":"failed","data":"invalid password"})
            }
        }
        else{
            res.json({"status":"failed","data":"invalid email id"})
        }
    })
})

//Running server at port 8082
app.listen(8082,()=>
{
    console.log("Server listening to port 8082");
}
)