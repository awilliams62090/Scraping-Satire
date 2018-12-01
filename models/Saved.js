var mongoose = require("mongoose");
var Schema = mongoose.Schema

var savedSchema = new Schema({
    title: {
        type:String,
        required: true
    },
    summary: {
        type:String,
        required: true
    },
    scrapeDate: {
        type: Date,
        default: Date.now
    },
    link: {
        type:String,
        required: true
    },
    headlineId: {
        ref: "Article",
        type: Schema.Types.ObjectId
    }
}); 
var Saved= mongoose.model("Saved", savedSchema);

module.exports= Saved;