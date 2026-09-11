const logoutBtn =
    document.getElementById("logoutBtn");


if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        function () {

            localStorage.removeItem("token");

            alert("Logged out successfully");

            window.location.href =
                "/login/";

        }
    );

}