$("#login").submit(() => {
    $.ajax({
        url: "/api/session/" + $("#login_name").val(),
        method: "POST",
        data: {
            password: $("#login_pw").val()
        }
    }).done((data) => {
        if (data.message == "Ok") {
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
        url: "/api/user/new",
        method: "POST",
        data: {
            user: JSON.stringify({
                displayname: $("#register_name").val(),
                mail: $("#register_mail").val(),
                password: $("#register_pw").val(),
                profilePicture: "",
                createdAt: new Date().toLocaleDateString()
            })
        }
    }).done((data) => {
        if (data.message == "Ok") {
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

$("#recovery").submit(() => {
    $.ajax({
        url: "/api/user/" + $("#recovery_mail").val() + "/requestRecovery",
        method: "POST",
    }).done((data) => {
        console.log(data)
        console.log($("#recovery_mail").val())
        if (data.message == "Ok") {
            $("#recovery_message").attr('style', 'color: green');
            $("#recovery_message").text("A password recovery link has been send to your mail address!");
        } else {
            $("#recovery_message").attr('style', 'color: red');
            $("#recovery_message").text("An error occurred. Please try again!");
        }
    });
});

$("#logout").click(() => {
    $("#loader").attr('style','display: block');
    $("#pageContent").attr('style','display: none');
    $("#footer").attr('style','display: none');

    $.ajax({
        url: "/api/session",
        method: "DELETE"
    }).done((data) => {
        document.location.reload();
        document.location.href = "/";
    });
});
