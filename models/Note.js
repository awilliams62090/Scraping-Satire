var mongoose = require("mongoose");
var Schema = mongoose.Schema

var noteSchema = new Schema({
    noteAuthor: String,
    noteText: String,
    noteDate: {
        type: Date,
        default: Date.now
    },
    headlineId: {
        ref: "Article",
        type: Schema.Types.ObjectId
    }
}); 
var Note= mongoose.model("Note", noteSchema);

module.exports= Note;