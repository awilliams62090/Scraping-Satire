// Make sure we wait to attach our handlers until the DOM is fully loaded.
$(document).ready(function () {

    //Re-Scraping theonion.com
    $("#scrapeAgain").on("click", function () {
        // $(".articles").empty();
        $.get("/scrape");
        console.log("Rescrape complete!");
        location.reload();
    });

//Saving Articles
    $(".toggleSaved").on("click", function(event) {
        var id = $(this).data("id");
  
     // Send the PUT request.
        $.ajax("/article/" + id, {
          type: "PUT",
        }).then(
          function() {
            // Reload the page to get the updated list
            location.reload();
          }
        );
      });

    // Whenever someone opens note modal
    $("#noteModal").on("click", function () {
        // Empty the notes from the note section
        // $("#notes").empty();
        // Save the id from the p tag
        var thisId = $(this).attr("data-id");

        // Now make an ajax call for the Article
        $.ajax({
                method: "GET",
                url: "/articles/" + thisId
            })
            // With that done, add the note information to the page
            .then(function (data) {
                console.log(data);
                // The title of the article
                $("#notes").append("<h2>" + data.title + "</h2>");
                // An input to enter a new title
                $("#notes").append("<input id='titleinput' name='title' >");
                // A textarea to add a new note body
                $("#notes").append("<textarea id='bodyinput' name='body'></textarea>");
                // A button to submit a new note, with the id of the article saved to it
                $("#notes").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");

                // If there's a note in the article
                if (data.note) {
                    // Place the title of the note in the title input
                    $("#titleinput").val(data.note.title);
                    // Place the body of the note in the body textarea
                    $("#bodyinput").val(data.note.body);
                }
            });
    });

    // // When you click the Save  button post to the saved articles collection
    // $("#saveNote").on("click", function () {
    //     var thisId = $(this).attr("data-id");
    //     $.ajax({
    //             method: "POST",
    //             url: "/saved/" + thisId,
    //             data: {
    //                 title: $("#titleinput").val(),
    //                 body: $("#bodyinput").val()
    //             }
    //         })
    //         .then(function (data) {
    //             console.log(data);
    //             $("#notes").empty();
    //         });

    //     // Clear the values entered note entry area
    //     $("#titleinput").val("");
    //     $("#bodyinput").val("");
    // });

    $(".create-form").on("submit", function(event) {
        // Make sure to preventDefault on a submit event.
        event.preventDefault();
    
        var newNote = {
          noteAuthor: $("#noteAuthor").val(),
          noteText: $("#noteBody").val()
        };
    
        // Send the POST request.
        $.ajax("/articles/:id", {
          type: "POST",
          data: newNote
        }).then(
          function() {
            console.log("new note added!");
            // Reload the page to get the updated list
            location.reload();
          }
        );
      });
});