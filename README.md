# Scraping-Satire
A web app that lets users view and leave comments on the latest satirical news utilizing MongoDB, Mongoose and Cheerio to scrape articles on the world wide web.

  // Grab the articles as a json
    $.getJSON("/scrape", function (data) {
        console.log ("Scrape DATA: " + data);
        var id = $(this).data("id");
        // Send the PUT request.
        $.ajax("/articles" + id, {
            type: "PUT",
        }).then(
            function (res) {
                console.log("PUT ARTICLES" + res)
                // Reload the page to get the updated list
                location.reload();
            }
        );
    });