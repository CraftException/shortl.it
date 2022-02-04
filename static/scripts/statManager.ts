$(document).ready(loadStats);

function loadStats() {
    $.ajax({
        url: "/api/stats",
        method: "GET"
    }).done(data => {
       if (data.message == "Ok") {
           $("#shorten-urls").text(data.shortenUrls);
           $("#registered-users").text(data.users);
           $("#total-clicks").text(data.clicks);
           $("#most-clicks").text(data.mostClicks);
       }
    });
}
