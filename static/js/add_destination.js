const token =
    localStorage.getItem("token");


if (!token) {

    alert("Please login first");

    window.location.href = "/login/";
}


// live preview of selected photos

const photoInput = document.getElementById("photos");
const preview = document.getElementById("photoPreview");

photoInput.addEventListener("change", function () {

    preview.innerHTML = "";

    Array.from(photoInput.files).forEach(file => {

        const reader = new FileReader();

        reader.onload = e => {

            const img = document.createElement("img");
            img.src = e.target.result;
            preview.appendChild(img);
        };

        reader.readAsDataURL(file);
    });
});


document.getElementById("destinationForm")
.addEventListener("submit", function(event) {

    event.preventDefault();

    const formData = new FormData();

    formData.append(
        "place_name",
        document.getElementById("place_name").value
    );

    formData.append(
        "weather",
        document.getElementById("weather").value
    );

    formData.append(
        "location",
        document.getElementById("location").value
    );

    formData.append(
        "google_map_link",
        document.getElementById("google_map_link").value
    );

    formData.append(
        "description",
        document.getElementById("description").value
    );

    formData.append(
        "visitor_info",
        document.getElementById("visitor_info").value
    );

    Array.from(photoInput.files).forEach(file => {
        formData.append("uploaded_photos", file);
    });


    fetch("/api/destinations/", {

        method: "POST",

        headers: {
            "Authorization": "Token " + token
            // Note: no Content-Type header here on purpose -
            // the browser sets the multipart boundary itself.
        },

        body: formData

    })

    .then(response => response.json())

    .then(data => {

        if (data.id) {

            alert(
                "Destination Added Successfully"
            );

            window.location.href =
                "/destinations/";

        } else {

            alert("Failed to Add Destination");

            console.log(data);

        }

    })

    .catch(error => {

        console.error(error);

        alert("Failed to Add Destination");

    });

});
