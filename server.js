// importing
import mongoose from "mongoose";
import express from "express";
import Messages from "./dbMessages.js";
import Pusher from "pusher"
import cors from 'cors'
//app config hDtSgIufa4FCsmed

const app = express();
const port = process.env.PORT || 9000;

 
const pusher = new Pusher({
    appId: '1089887',
    key: 'fa971e414d99955bfa8c',
    secret: '73b2494089830f0c2432',
    cluster: 'ap2',
    encrypted: true
  });
//middleware
app.use(express.json()) 
app.use(cors())

// app.use((req,res,next)=>{
//     res.setHeader("Accss-control-Allow-Origin","*");
//     res.setHeader("Accss-control-Allow-Headers","*")
//     next()
// })

const db = mongoose.connection;
db.once("open",()=>{
    console.log("MongoDb is Connected");
    
    const msgCollection = db.collection("messagecontents");
    const changestream = msgCollection.watch();
    changestream.on("change",(change)=>{
        console.log("change occured",change);
        if(change.operationType==="insert"){ 
            const messageDetails = change.fullDocument
            pusher.trigger("messages","inserted",{
                name: messageDetails.name,
                message:messageDetails.message,
                timestamp: messageDetails.timestamp,
                received:messageDetails.received,
            })}
         else{
                console.log("error triggering pusher");
            }
        }

    )
})


 
//db config trav M ,working one
const connection_url =
  "mongodb+srv://admin:SMnD8Ckgfoiw6QH5@cluster0.vcsop.mongodb.net/whatsmerndb?retryWrites=true&w=majority";
mongoose
.connect(connection_url, { useNewUrlParser: true,useUnifiedTopology: true, useUnifiedTopology: true })

.catch(err=> console.log(err))



 
//DB config cp 
// const connection_url =
//   "mongodb+srv://admin:hDtSgIufa4FCsmed.@cluster0.vcsop.mongodb.net/whatsmern?retryWrites=true&w=majority";
// mongoose.connect(connection_url, {
//   useCreateIndex: true,
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });
  
//???


//api routes
app.get("/", (req, res) => {
  res.status(200).send("hello world");
});

app.get("/messages/sync",(req,res)=>{
    Messages.find((err,data)=>{
        if(err){
            res.status(500).send(err)
        }
        else{
            res.status(200).send(data)
        }
    })

})


 
app.post("/messages/new", (req, res) => {
  const dbMessage = req.body;
   
  Messages.create(dbMessage,(err,data)=>{
      if(err){
          res.status(500).send(err)
      }
      else{
          res.status(201).send(data)
      }
  })
});


//listen
app.listen(port, () => console.log(`listening on localhost: ${port}`));
