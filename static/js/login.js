if (localStorage.getItem("token")) {

    alert("Already logged in");

    window.location.href = "/destinations/";
}


document.getElementById("loginForm")
.addEventListener("submit", function(event) {

    event.preventDefault();

    const username =
        document.getElementById("username").value;

    const password =
        document.getElementById("password").value;


    fetch("/api/users/login/", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            username: username,
            password: password
        })

    })

    .then(response => response.json())

    .then(data => {

        if (data.token) {

            localStorage.setItem(
                "token",
                data.token
            );

            alert("Login Successful");

            window.location.href =
                "/destinations/";

        } else {

            alert(data.message);

        }

    })

    .catch(error => {

        console.error(error);

        alert("Login Failed");

    });

});