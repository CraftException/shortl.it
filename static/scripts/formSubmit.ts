$(document).ready(function() {
    $("#url_shorting").submit(() => { //@ts-ignore
        if (isStringAValidHttpUrl($("#longUrl").val()) || $("#longUrl").val().startsWith("https://lnkdto.link")) {
            handleUrlShorting();
        } else {
            $("#longUrl").val("");
            $("#longUrlMessage").html("<span style='color: red'>This is not a valid url!</span>");
        }
    });

});

function handleUrlShorting() {
    $.ajax({
        url: "/api/url",
        method: "POST",
        data: {
            target: $("#longUrl").val()
        }
    }).done((data) => {
        if (data.message === "Ok") {
            $("#longUrl").val(data.domain + "/" + data.label);
            $("#longUrlMessage").html("<span style='color: green'>The Link has been copied to the clipboard</span>");

            var $temp = $("<input>");
            $("body").append($temp);
            $temp.val($("#longUrl").val()).select();
            document.execCommand("copy");
            $temp.remove();

            if (window.location.toString().includes("/user/domainList")) {
                loadView('domainList', '/user/domainList');
            }

            if (window.location.toString().includes("extension")) {
                document.location.reload();
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
