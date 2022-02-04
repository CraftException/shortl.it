function loadEditPageSubmitListener() {

    $(() => {
        $("#changePassword").submit(() => {
            if ($("#new_pw").val() == $("#new_pw_1").val()) {
                $.ajax({
                    url: "/api/user/current",
                    method: "POST",
                    data: {
                        password: $("#new_pw").val()
                    }
                }).done((data) => {
                    if (data.message == "Ok") {
                        $("#changePasswordMessage").attr('style', 'color: green');
                        $("#changePasswordMessage").text("Your password has been changed!");
                    } else {
                        $("#changePasswordMessage").attr('style', 'color: red');
                        $("#changePasswordMessage").text("Please try again!");
                    }
                });
            } else {
                $("#changePasswordMessage").attr('style', 'color: red');
                $("#changePasswordMessage").text("Both passwords must be the same!");
            }
        });

        $("#changeMail").submit(() => {
            $.ajax({
                url: "/api/user/current",
                method: "POST",
                data: {
                    mail: $("#new_mail").val()
                }
            }).done((data) => {
                if (data.message == "Ok") {
                    $("#changeMailMessage").attr('style', 'color: green');
                    $("#changeMailMessage").text("Your mail has been changed!");
                } else {
                    $("#changeMailMessage").attr('style', 'color: red');
                    $("#changeMailMessage").text("Please try again!");
                }
            });
        });
    })

}
