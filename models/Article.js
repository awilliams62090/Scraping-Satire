//added saved attribute to Article schema as a boolean- attempting to not need this schema. 

var mongoose= require("mongoose");
var Schema= mongoose.Schema;

var articleSchema = new Schema({
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
    saved: {
        type: Boolean, 
        default: false
    },
    note: {
        type: Schema.Types.ObjectId,
        ref: "Note"
      }

}); 
var Article= mongoose.model("Aritcle", articleSchema);

module.exports= Article;