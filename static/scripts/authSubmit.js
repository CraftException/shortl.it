$("#login").submit(() => {
    $.ajax({
        url: "/api/login",
        method: "POST",
        data: {
            username: $("#login_name").val(),
            password: $("#login_pw").val()
        }
    }).done((data) => {
        console.log(data.message)
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
    $.ajax({
        url: "/api/register",
        method: "POST",
        data: {
            username: $("#register_name").val(),
            password: $("#register_pw").val(),
            email: $("#register_mail").val()
        }
    }).done((data) => {
        console.log(data.message)
        if (data.message == "OK") {
            document.location.href = "/user/control";
        } else if (data.message === "Already exists") {
            $("#register_message").text("The User already exists!");
        } else {
            $("#register_message").text("An error occurred. Please try again!");
        }
    });
});