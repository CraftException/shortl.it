$(document).ready(() => {
    $.ajax({
        url: "/view/" + viewToLoad,
        method: "GET"
    }).done((data) => {
        setTimeout(() => {
            $("#loader").attr('style','display: none');
            $("#pageContent").attr('style','display: block');
            $("#footer").attr('style','display: block');

            $("#pageContent").html(data);
        }, 150);
    });
});