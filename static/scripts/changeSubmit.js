function loadEditPageSubmitListener() {

    $(() => {
        $("#changePassword").submit(() => {
            alert("D1");
            $.ajax({
                url: "/api/changeData",
                method: "POST",
                data: {
                    password: $("#new_pw").val()
                }
            }).done((data) => {
                if (data.message == "OK") {
                    $("#changePasswordMessage").attr('style', 'color: green');
                    $("#changePasswordMessage").text("Your password has been changed!");
                } else {
                    $("#changePasswordMessage").attr('style', 'color: red');
                    $("#changePasswordMessage").text("Please try again!");
                }
            });
        });

        $("#changeMail").submit(() => {
            $.ajax({
                url: "/api/changeData",
                method: "POST",
                data: {
                    mail: $("#new_mail").val()
                }
            }).done((data) => {
                console.log(data.message)
                if (data.message == "OK") {
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