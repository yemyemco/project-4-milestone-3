const mongoose = require("mongoose");
//Course schema
const courseSchema = new mongoose.Schema(
{ 
    code: {type: String, unique: true, require: true},
    title: {type: String, require: true},
    unit: {type: Number, require: true},
    semester: {type: String, require: true},
    completion: {type: Boolean, default: 0}
},
{timestamps: true}
);

const courseDB = new mongoose.model("courseDB", courseSchema);
module.exports = courseDB;