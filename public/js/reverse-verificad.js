window.addEventListener("load", () => {
    const id = localStorage.getItem("userId");
    const nome = localStorage.getItem("username");
    const photo_user = localStorage.getItem("photo_user");
    const victory = localStorage.getItem("victory");
    const lose = localStorage.getItem("lose");

    if (id && nome && photo_user && victory && lose) {
        window.location.href = "home";
    }
});