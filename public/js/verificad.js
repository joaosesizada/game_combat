window.addEventListener("load", () => {
    const id = localStorage.getItem("userId");
    const nome = localStorage.getItem("username");
    const photo_user = localStorage.getItem("photo_user");
    const victory = localStorage.getItem("victory");
    const lose = localStorage.getItem("lose");

    if (id == null || nome == null || photo_user == null || victory == null || lose == null) {
        window.location.href = "login";
    }
});