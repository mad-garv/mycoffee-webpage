var coffeeContainer = document.getElementById("coffee-container");
var addCoffeeButton = document.getElementById("add-coffee");

function createCoffeeCard(coffee) {
    var coffeeCard = document.createElement("article");
    coffeeCard.className = "coffee-card";

    if (coffee.image) {
        var coffeeImage = document.createElement("img");
        coffeeImage.className = "coffee-image";
        coffeeImage.src = coffee.image;
        coffeeImage.alt = coffee.name;

        coffeeCard.appendChild(coffeeImage);
    } else {
        var imagePlaceholder = document.createElement("div");
        imagePlaceholder.className = "image-placeholder";
        imagePlaceholder.textContent = "?";

        coffeeCard.appendChild(imagePlaceholder);
    }

    var cardFooter = document.createElement("div");
    cardFooter.className = "card-footer";

    var coffeeTitle = document.createElement("p");
    coffeeTitle.textContent = coffee.name;

    cardFooter.appendChild(coffeeTitle);

    if (coffee.tried) {
        var cardRating = document.createElement("span");
        cardRating.className = "card-rating";
        cardRating.textContent = coffee.rating;

        cardFooter.appendChild(cardRating);
    }

    coffeeCard.appendChild(cardFooter);

    coffeeCard.addEventListener("click", function () {
        window.location.href = "recipe.html?id=" + coffee.id;
    });

    coffeeContainer.insertBefore(coffeeCard, addCoffeeButton);
}

addCoffeeButton.addEventListener("click", function () {
    openCoffeeModal(null);
});

var signOutButton = document.getElementById("sign-out");

if (signOutButton) {
    signOutButton.addEventListener("click", async function () {
        await supabaseClient.auth.signOut();
        window.location.href = "login.html";
    });
}

async function loadHomePage() {
    await requireUser();

    var coffees = await listCoffees();

    for (var i = 0; i < coffees.length; i++) {
        createCoffeeCard(coffees[i]);
    }
}

loadHomePage();

var newPasswordInput = document.getElementById("new-password");
var setPasswordButton = document.getElementById("set-password");
var passwordStatus = document.getElementById("password-status");

setPasswordButton.addEventListener("click", async function () {
    var password = newPasswordInput.value;

    if (password.length < 12) {
        passwordStatus.textContent =
            "Use a password with at least 12 characters.";
        return;
    }

    setPasswordButton.disabled = true;
    passwordStatus.textContent = "Setting password…";

    var result = await supabaseClient.auth.updateUser({
        password: password
    });

    setPasswordButton.disabled = false;

    if (result.error) {
        passwordStatus.textContent = result.error.message;
    } else {
        passwordStatus.textContent =
            "Password set. You can now use it to sign in on other devices.";
        newPasswordInput.value = "";
    }
});