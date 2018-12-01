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
mongoose.connect("mongodb://localhost/NYTdb", {
  useNewUrlParser: true
});

// ==========*** Routes ***========== //
// if I have time I will put routes in MVC paradigm //

// Route for index page
app.get("/", function (req, res) {

  res.render("index", {
    layout: 'main.handlebars'
  });
});

// A GET route for scraping the NYT website
app.get("/scrape", function (req, res) {
  axios.get("https://www.nytimes.com/").then(function (response) {
    var $ = cheerio.load(response.data);
    $("div.css-6p6lnl").each(function (i, element) {
      var result = {};
      result.title = $(this)
        .children("a").children("div").children("h2")
        .text();
      result.link = $(this)
        .children("a")
        .attr("href");
      result.summary = $(this)
        .children("a").children("p")
        .text();
      console.log(result);
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

//Saved Articles 
app.post("/saved", function (req, res) {
  db.Saved.create(req.body).then(function (savedArticle) {
    return db.Article.findOneAndUpdate({
      _id: req.params.id
    }, {
      saved: savedArticle._id
    }, {
      new: true
    });
  }).then(function (savedArticle) {

    res.render("saved", {
      savedArticle: savedArticle
    });
  }).catch(function (err) {
    console.log(err);
  });
});

app.get("/saved", function (req, res) {
  db.Saved.find({})
    .populate("saved")
    .then(function (dbArticle) {
      console.log(dbArticle);
      res.render("saved", {
        savedArticle: dbArticle
      });
    }).catch(function (error) {
      res.json(error);
    })
})

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