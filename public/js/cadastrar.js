let username = document.getElementById("username");
let email = document.getElementById("email");
let password = document.getElementById("password");
let confirm_password = document.getElementById("confirm_password");
let photo_user = document.getElementById("photo_user");

let usernameValido = document.getElementById("usernameValido")
let senhaValida = document.getElementById("senhaValida");
let senhaConfirmada = document.getElementById("senhaConfirmada");
let emailValido = document.getElementById("emailValido");

let button = document.getElementById("cadastrar");

let checked = {
    usernameCheck: false,
    emailCheck: false,
    passwordCheck: false
}

let eyePassword = document.getElementById("eye-password");
eyePassword.addEventListener("click", () => {
    if (password.type == "password") {
        password.type = "text";
        confirm_password.type = "text";
    } else {
        password.type = "password";
        confirm_password.type = "password";
    }
});

username.addEventListener("input", () => {
    // verifica se não usou teclas maiusculas
    if (username.value != username.value.toLowerCase()) {
        usernameValido.innerHTML = "O nome de usuário deve conter apenas letras minúsculas!";
        usernameValido.style.color = "red";
        return;
    } else if (username.value.length < 3) {
        usernameValido.innerHTML = "O nome de usuário deve ter pelo menos 3 caracteres!";
        usernameValido.style.color = "red";
        return;
    } else if (username.value.length > 15) {
        usernameValido.innerHTML = "O nome de usuário deve ter no máximo 15 caracteres!";
        usernameValido.style.color = "red";
        return;
    } else {
        usernameValido.innerHTML = "";
        usernameValido.style.color = "green";
    }

    // Verifica se o nome de usuário já existe
    fetch("http://localhost:3000/verifica-user/" + username.value)
        .then(response => response.json())
        .then(data => {
            if (data.message == "unavailable") {
                usernameValido.innerHTML = "Nome de usuário já existe!";
                usernameValido.style.color = "red";
                checked.usernameCheck = false;
                return;
            } else {
                usernameValido.innerHTML = "Nome de usuário disponível!";
                usernameValido.style.color = "green";
                checked.usernameCheck = true;
            }
        }).catch(error => {
            console.error("Erro ao verificar nome de usuário:", error);
        });
})

password.addEventListener("input", () => {
    if (password.value.length < 6) {
        senhaValida.innerHTML = "A senha deve ter pelo menos 6 caracteres!";
        senhaValida.style.color = "red";
        return;
    } else if (password.value.length > 15) {
        senhaValida.innerHTML = "A senha deve ter no máximo 15 caracteres!";
        senhaValida.style.color = "red";
        return;
    } else if (password.value == password.value.toLowerCase()) {
        senhaValida.innerHTML = "A senha deve ter pelo menos uma letra maiúscula!";
        senhaValida.style.color = "red";
        return;
    } else if (password.value == password.value.toUpperCase()) {
        senhaValida.innerHTML = "A senha deve ter pelo menos uma letra minúscula!";
        senhaValida.style.color = "red";
        return;
    } else if (!/\d/.test(password.value)) {
        senhaValida.innerHTML = "A senha deve ter pelo menos um número!";
        senhaValida.style.color = "red";
        return;
    } else {
        senhaValida.innerHTML = "Senha válida!";
        senhaValida.style.color = "green";
    }
});

confirm_password.addEventListener("change", () => {
    if (confirm_password.value != password.value) {
        senhaConfirmada.innerHTML = "As senhas não coincidem!";
        senhaConfirmada.style.color = "red";
        checked.passwordCheck = false;
        return;
    } else {
        senhaConfirmada.innerHTML = "As senhas coincidem!";
        senhaConfirmada.style.color = "green";
        checked.passwordCheck = true;
    }
});

email.addEventListener("input", () => {
    const email_regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email_regex.test(email.value)) {
        emailValido.innerHTML = "Email inválido!";
        emailValido.style.color = "red";
        return;
    } else {
        emailValido.innerHTML = "Email válido!";
        emailValido.style.color = "green";
    }

    fetch("http://localhost:3000/verifica-email/" + email.value)
        .then(response => response.json())
        .then(data => {
            if (data.message == "unavailable") {
                emailValido.innerHTML = "Email já existe!";
                emailValido.style.color = "red";
                checked.emailCheck = false;
                return;
            } else {
                emailValido.innerHTML = "Email disponível!";
                emailValido.style.color = "green";
                checked.emailCheck = true;
            }
        }).catch(error => {
            console.error("Erro ao verificar email:", error);
        });
});

photo_user.addEventListener("change", () => {
    let img_user = document.getElementById("img_user");
    img_user.src = `./imgs/icones/${photo_user.value}.png`
});

button.addEventListener("click", () => {
    // Verifica se os campos estão preenchidos
    if (username.value == "" || email.value == "" || password.value == "" || confirm_password.value == "") {
        alert("Preencha todos os campos!");
        return;
    }

    if (checked.usernameCheck == true && checked.emailCheck == true && checked.passwordCheck == true) {
        let data = {
            username: username.value,
            email: email.value,
            password: password.value,
            confirm_password: confirm_password.value,
            photo_user: photo_user.value
        }

        fetch("http://localhost:3000/cadastrar", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then(data => {
                console.log("Usuário cadastrado com sucesso:", data);
                window.location.href = "home.html";
            })
            .catch(error => {
                console.error("Erro ao cadastrar usuário:", error);
            });
    }
})