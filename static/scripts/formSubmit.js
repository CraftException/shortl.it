$("#url_shorting").submit(() => {
    if (isStringAValidHttpUrl($("#longUrl").val()) || $("#longUrl").val().startsWith("https://lnkdto.link")) {
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
            $("#longUrl").val(window.location.origin + "/" + data.shortUrl);
            $("#longUrlMessage").html("<span style='color: green'>The Link has been copied to the clipboard</span>");

            var $temp = $("<input>");
            $("body").append($temp);
            $temp.val($("#longUrl").val()).select();
            document.execCommand("copy");
            $temp.remove();

            if (window.location.toString().includes("/user/usercontrol")) {
                loadView('usercontrol', '/user/usercontrol');
            }
        } else {
            $("#longUrl").val("");
            $("#longUrlMessage").html("<span style='color: red'>An error occurred while shorting the URL. Please try again.</span>");
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