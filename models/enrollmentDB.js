const mongoose = require("mongoose");

//Student Schema
const studentSchema = new mongoose.Schema(
{
    matricNo: {type: String, require: true},
    name: {
        firstName: {type: String, require: true},
        middleName: {type: String, require: false},
        lastName: {type: String, require: true}
    },
    dob:{type: String, require: true},
    email: {type: String, require: true},
    level: {type: Number, default: 100, require: true},
    entryMode: {type: String, require: true},
    course: {type: Array, default: [] }
},
{timestamps: true}
);

const enrollDB = new mongoose.model("enrollDB", studentSchema);
module.exports = enrollDB;