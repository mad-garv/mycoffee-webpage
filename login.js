var emailInput = document.getElementById("login-email");
var sendLinkButton = document.getElementById("send-link");
var loginStatus = document.getElementById("login-status");

async function alreadySignedIn() {
    var result = await supabaseClient.auth.getUser();

    if (result.data.user) {
        window.location.href = "index.html";
    }
}

alreadySignedIn();

var passwordInput = document.getElementById("login-password");

sendLinkButton.addEventListener("click", async function () {
    var email = emailInput.value.trim();
    var password = passwordInput.value;

    if (email === "" || password === "") {
        loginStatus.textContent = "Enter your email and password.";
        return;
    }

    sendLinkButton.disabled = true;
    loginStatus.textContent = "Signing in…";

    var result = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password
    });

    sendLinkButton.disabled = false;

    if (result.error) {
        loginStatus.textContent = result.error.message;
    } else {
        window.location.href = "index.html";
    }
});