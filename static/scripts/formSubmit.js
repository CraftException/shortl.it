$("#url_valid").submit(() => {
    if (isStringAValidHttpUrl($("#longUrl").val())) {
        handleUrlShorting();
    } else {
        $("#longUrl").val("");
        $("#longUrlMessage").html("<span style='color: red'>This is not a valid url!</span>");
    }
});

$("#longUrlField").click(() => {
    $("#longUrlMessage").html("Long URL");
});

function handleUrlShorting() {
    $.ajax({
        url: "/api/getShortUrl",
        method: "POST",
        data: {
            longUrl: $("#longUrl").val()
        }
    }).done((data) => {
        if (data.message === "OK") {
            $("#longUrl").val(data.shortUrl);
            $("#longUrlMessage").html("<span style='color: green'>Your URL has been shorten</span>");
        } else {
            $("#longUrl").val("");
            $("#longUrlMessage").html("<span style='color: red'>An error has been occured while shorting the URL. Please try again.</span>");
        }
    });
}

function isStringAValidHttpUrl(string) {
    let url;

    try {
        url = new URL(string);
    } catch (_) {
        return false;
    }

    return url.protocol === "http:" || url.protocol === "https:";
}