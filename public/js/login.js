let username = document.getElementById("username");
let password = document.getElementById("password");

let button = document.getElementById("login");

let response = document.getElementById("confirmPassword");

let eyePassword = document.getElementById("eye-password");
eyePassword.addEventListener("click", () => {    
    if (password.type == "password") {
        password.type = "text";
        eyePassword.innerHTML = `<i class="fa-solid fa-eye-slash" style="color: #ffffff;"></i>`
    } else {
        password.type = "password";
        eyePassword.innerHTML = `<i class="fa-solid fa-eye" style="color: #ffffff;">`
    }
});

button.addEventListener("click", () => {
    let usernameValue = username.value;
    let passwordValue = password.value;

    fetch("http://localhost:3000/login/" + usernameValue + "/" + passwordValue)
        .then(response => response.json())
        .then(data => {
            if (data.message == "unavailable") {
                response.innerHTML = "Nome de usuário ou senha inválidos!";
                response.style.color = "red";
            } else {
                response.innerHTML = "Login realizado com sucesso!";
                response.style.color = "green";

                socket.emit('bindUserToSocket', {
                    userId: data.id,          // ID do usuário
                    username: data.username,   // Nome do usuário
                    photo_user: data.photo_user // Foto do usuário
                });

                window.location.href = "home.html";
            }
        })
        .catch(error => {
            console.error("Erro ao fazer login:", error);
        });
});