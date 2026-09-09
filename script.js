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
        localStorage.setItem("selected-coffee-id", coffee.id);
        window.location.href = "recipe.html";
    });

    coffeeContainer.insertBefore(coffeeCard, addCoffeeButton);
}

var coffees = loadCoffees();

for (var i = 0; i < coffees.length; i++) {
    createCoffeeCard(coffees[i]);
}

addCoffeeButton.addEventListener("click", function () {
    openCoffeeModal(null);
});