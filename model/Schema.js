require('dotenv').config();

const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI).then(()=>{
    console.log("Connected to DB for goals");
}).catch((error)=>{
    console.log(error);
});


const goalsSchema = new mongoose.Schema({
    username : {
        type : String,
        required : true,
        unique : true
    },
    completed : {
        type : Number
    },
    uncomplete : {
        type : Number
    },
    goalsData : {
        type : Array,
        goalsId : {
            type : Number,
            required : true,
        },
        title:{
            type : String
        },
        content : {
            type : String,
        },
        date : {
            type : String
        },
        day : {
            type : String
        },
        complete : {
            type : Boolean
        }
    }
},
{
    timestamps : {
        createdAt : true,
        updatedAt : true,
    },
});

const goals = mongoose.model('goals',goalsSchema);

module.exports = goals;

