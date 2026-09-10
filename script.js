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

function updateCoffeeLayout() {
    var cards = coffeeContainer.children;

    if (cards.length === 0) {
        return;
    }

    var firstRowTop = cards[0].offsetTop;
    var cardsOnFirstRow = 0;

    for (var i = 0; i < cards.length; i++) {
        if (cards[i].offsetTop === firstRowTop) {
            cardsOnFirstRow++;
        }
    }

    if (cardsOnFirstRow === 1) {
        coffeeContainer.classList.add("single-column");
    } else {
        coffeeContainer.classList.remove("single-column");
    }
}

window.addEventListener("resize", updateCoffeeLayout);

async function loadHomePage() {
    await requireUser();

    var coffees = await listCoffees();

    for (var i = 0; i < coffees.length; i++) {
        createCoffeeCard(coffees[i]);
    }

    updateCoffeeLayout();
}

loadHomePage();