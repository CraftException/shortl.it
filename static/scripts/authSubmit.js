$("#login").submit(() => {
    $.ajax({
        url: "/api/login",
        method: "POST",
        data: {
            username: $("#login_name").val(),
            password: $("#login_pw").val()
        }
    }).done((data) => {
        if (data.message == "OK") {
            document.location.href = "/user/control";
        } else if (data.message === "User does not exists") {
            $("#login_message").text("The User does not exists!");
        } else if (data.message === "Wrong Password") {
            $("#login_message").text("The password is wrong!");
        } else {
            $("#login_message").text("An error occurred. Please try again!");
        }
    });
});

$("#register").submit(() => {
    $("#loader").attr('style','display: block');
    $("#pageContent").attr('style','display: none');
    $("#footer").attr('style','display: none');

    $.ajax({
        url: "/api/register",
        method: "POST",
        data: {
            username: $("#register_name").val(),
            password: $("#register_pw").val(),
            email: $("#register_mail").val()
        }
    }).done((data) => {
        if (data.message == "OK") {
            document.location.href = "/user/control";
        } else if (data.message === "Already exists") {
            $("#register_message").text("The User already exists!");
            loadView("start", "");
        } else {
            $("#register_message").text("An error occurred. Please try again!");
            loadView("start", "");
        }
    });
});

$("#logout").click(() => {
    $("#loader").attr('style','display: block');
    $("#pageContent").attr('style','display: none');
    $("#footer").attr('style','display: none');

    $.ajax({
        url: "/api/logout",
        method: "POST"
    }).done((data) => {
        document.location.reload();
        document.location.href = "/";
    });
});