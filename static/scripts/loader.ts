//@ts-ignore
$(document).ready(() => loadView(viewToLoad, viewToLoad));

function loadView(view, url) {
    if (view == "start" || view == "domainList" || view == "edituser" || view == "")
        $("#header_form").show();
    else
        $("#header_form").hide();

    $("#loader").attr('style','display: block');
    $("#pageContent").attr('style','display: none');
    $("#footer").attr('style','display: none');

    $.ajax({
        url: "/view/" + view,
        method: "GET"
    }).done((data) => {
        setTimeout(() => {
            $("#loader").attr('style','display: none');
            $("#pageContent").attr('style','display: block');
            $("#footer").attr('style','display: block');

            $("#pageContent").html(data);

            window.history.pushState('data', 'Title', url);

            if (url == "/user/edituser") loadEditPageSubmitListener();
        }, 150);
    });
}
