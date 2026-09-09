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

sendLinkButton.addEventListener("click", async function () {
    var email = emailInput.value.trim();

    if (email === "") {
        loginStatus.textContent = "Please enter your email.";
        return;
    }

    sendLinkButton.disabled = true;
    loginStatus.textContent = "Sending your sign-in link…";

    var redirectUrl = new URL("index.html", window.location.href).href;

    var result = await supabaseClient.auth.signInWithOtp({
        email: email,
        options: {
            emailRedirectTo: redirectUrl
        }
    });

    sendLinkButton.disabled = false;

    if (result.error) {
        loginStatus.textContent = result.error.message;
    } else {
        loginStatus.textContent = "Check your email, then open the sign-in link.";
    }
});