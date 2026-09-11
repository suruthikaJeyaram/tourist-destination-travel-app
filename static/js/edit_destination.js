const token =
    localStorage.getItem("token");


if (!token) {

    alert("Please login first");

    window.location.href = "/login/";

}


// Get ID from URL

const id =
    window.location.pathname.split("/")[2];


const photoInput = document.getElementById("photos");


// Get existing destination

fetch(
    `/api/destinations/${id}/`,
    {

        method: "GET",

        headers: {

            "Authorization":
                "Token " + token

        }

    }
)

.then(response => response.json())

.then(data => {

    if (!data.is_owner) {

        alert("You can only edit your own destinations");

        window.location.href = "/destinations/";

        return;
    }

    document.getElementById(
        "place_name"
    ).value = data.place_name;

    document.getElementById(
        "weather"
    ).value = data.weather;

    document.getElementById(
        "location"
    ).value = data.location;

    document.getElementById(
        "google_map_link"
    ).value = data.google_map_link;

    document.getElementById(
        "description"
    ).value = data.description;

    document.getElementById(
        "visitor_info"
    ).value = data.visitor_info || "";

    const existingPhotos =
        document.getElementById("existingPhotos");

    (data.photos || []).forEach(photo => {

        const img = document.createElement("img");
        img.src = photo.image;
        existingPhotos.appendChild(img);
    });

});


// Update

document.getElementById("editForm")
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

    fetch(
        `/api/destinations/${id}/`,
        {

            method: "PATCH",

            headers: {

                "Authorization":
                    "Token " + token

            },

            body: formData

        }
    )

    .then(response => response.json())

    .then(data => {

        if (data.id) {

            alert(
                "Destination Updated Successfully"
            );

            window.location.href =
                "/destinations/";

        } else {

            alert("Update Failed");

            console.log(data);

        }

    })

    .catch(error => {

        console.error(error);

        alert("Update Failed");

    });

});
