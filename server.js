var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var exphbs = require("express-handlebars");

// scraping tools
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = 3000;

// Initialize Express
var app = express();

// Middleware 
app.use(logger("dev"));
app.use(express.urlencoded({
  extended: true
}));
app.use(express.json());
app.use(express.static("public"));

// Handlebars
app.engine(
  "handlebars",
  exphbs({
    defaultLayout: "main"
  })
);
app.set("view engine", "handlebars");

// Connect to the Mongo DB
mongoose.connect("mongodb://localhost/Oniondb", {
  useNewUrlParser: true
});

// ==========*** Routes ***========== //
// if I have time I will put routes in MVC paradigm //

// Route for index page
// app.get("/", function (req, res) {

//   res.render("index", {
//     layout: 'main.handlebars'
//   });
// });

app.get("/", function (req, res) {

  // Create a new Article using the `result` object built from scraping
  db.Article.find({})
  .then(function (dbArticle) {
    res.render("index", {dbArticle: dbArticle});
  })
  .catch(function (err) {
  // If an error occurred, log it
  console.log(err);
  });

});

// A GET route for scraping the NYT website
app.get("/scrape", function (req, res) {
  axios.get("https://www.theonion.com/").then(function (response) {
    var $ = cheerio.load(response.data);
    $("div.post-wrapper").each(function (i, element) {
      var result = {};
      result.title = $(this)
        .children("article").children("header").children("h1")
        .text();
      result.link = $(this)
        .children("article").children("header").children("h1").children("a")
        .attr("href");
      result.summary = $(this)
        .children("article").children("div.item__content").children("div.entry-summary").children("p")
        .text();
      console.log("This is the result: " + result);
      db.Article.create(result)
        .then(function (dbArticle) {
          console.log(dbArticle);
        })
        .catch(function (err) {
          console.log(err);
        });
    });
    res.send("Scrape Complete");
  });
});

// Route for getting all Articles from the db
app.get("/articles", function (req, res) {
  db.Article.find({})
    .then(function (dbArticle) {
      res.json(dbArticle);
    })
    .catch(function (err) {
      res.json(err);
    });
});

// Route for grabbing a specific Article by id, populate it with it's notes
app.get("/articles/:id", function (req, res) {
  db.Article.findOne({
      _id: req.params.id
    })
    .populate("Note")
    .then(function (dbArticle) {
      res.json(dbArticle);
    })
    .catch(function (err) {
      res.json(err);
    });
});

//Get route for Saved Articles(Boolean toggled to true in Article DB)
app.get("/saved", function (req, res) {
  db.Article.find({
      saved: true
    })
    .then(function (dbSaved) {
      res.render("saved", {
        dbSaved: dbSaved
      });
    })
    .catch(function (err) {
      // If an error occurred, log it
      console.log(err);
    });
});


// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function (req, res) {
  db.Note.create(req.body)
    .then(function (dbNote) {
      return db.Article.findOneAndUpdate({
        _id: req.params.id
      }, {
        note: dbNote._id
      }, {
        new: true
      });
    })
    .then(function (dbArticle) {
      res.json(dbArticle);
    })
    .catch(function (err) {
      res.json(err);
    });
});

//Viewing all Notes
app.get("/notes/", function (req, res) {
  db.Note.find({}).populate("note").then(function (dbNote) {
    res.render("savednotes", {
      Note: dbNote
    });
  }).catch(function (err) {
    res.json(err);
  })
});

//Viewing the notes associated witha  specific article
app.get("/notes/:id", function (req, res) {
  db.Article.findOne({
    _id: req.params.id
  }).populate("note").then(function (dbNote) {
    res.render("notes", {
      Note: dbNote
    });
  }).catch(function (err) {
    res.json(err);
  })
});

// Route for deleting an article from saved
app.delete("/saved/:id", function (req, res) {
  db.Saved.findOne({
      _id: req.params.id
    }).deleteOne()
    //db.Saved.deleteOne({_id: req.params.id})
    .then(function (savedArticle) {
      // View the added result in the console
      console.log(savedArticle);
      return db.Saved.findOneAndUpdate({
        _id: req.params.id
      }, {
        savedArticle: savedArticle._id
      }, {
        new: true
      });
    })
    .then(function (savedArticle) {
      res.render("saved", {
        savedArticle: savedArticle
      });
    })
    .catch(function (err) {
      console.log(err);
    });
})

// Start the server
app.listen(PORT, function () {
  console.log(
    "==> 🌎  Listening on port %s. Visit http://localhost:%s/ in your browser.",
    PORT,
    PORT
  );
});