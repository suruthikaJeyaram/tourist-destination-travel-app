document.getElementById("registerForm")
.addEventListener("submit", function(event) {

    event.preventDefault();


    const username =
        document.getElementById("username").value;

    const email =
        document.getElementById("email").value;

    const password =
        document.getElementById("password").value;

    const country =
        document.getElementById("country").value;

    const state =
        document.getElementById("state").value;

    const district =
        document.getElementById("district").value;


    fetch("/api/users/", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({

            username: username,
            email: email,
            password: password

        })

    })

    .then(response => response.json())

    .then(userData => {

        if (!userData.id) {

            alert(
                userData.username ||
                "Registration Failed"
            );

            return;
        }


        return fetch("/api/userprofile/", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                user: userData.id,
                country: country,
                state: state,
                district: district

            })

        });

    })

    .then(response => {

        if (!response) return;

        return response.json();

    })

    .then(profileData => {

        if (!profileData) return;

        alert("Registration Successful!");

        window.location.href = "/login/";

    })

    .catch(error => {

        console.error(error);

        alert("Registration Failed");

    });

});