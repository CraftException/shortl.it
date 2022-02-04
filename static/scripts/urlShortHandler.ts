$("#advanced_url_shorting").submit(() => { //@ts-ignore
    if (isStringAValidHttpUrl($("#target").val()) || $("#target").val().startsWith("https://lnkdto.link")) {
        handleAdvancedUrlShorting();
    } else {
        $("#target").val("");
        $("#targetMessage").html("<span style='color: red'>This is not a valid url!</span>");
    }
});

function handleAdvancedUrlShorting() {
    $.ajax({
        url: "/api/url",
        method: "POST",
        data: {
            target: $("#target").val(),
            domain: $("#domain").val(),
            password: $("#password").val()
        }
    }).done((data) => {
        if (data.message === "Ok") {
            var $temp = $("<input>");
            $("body").append($temp);
            $temp.val(data.domain + "/" + data.label).select();
            document.execCommand("copy");
            $temp.remove();

            $("#shortenUrlLink").text(data.domain + "/" + data.label);
            $("#urlModel").modal('show');
        } else {
            $("#target").val("");
            $("#targetMessage").html("<span style='color: red'>An error occurred while shorting the URL. Please try again.</span>");
        }
    });
}
