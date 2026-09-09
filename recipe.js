async function loadRecipePage() {
    var parameters = new URLSearchParams(window.location.search);
    var coffeeId = parameters.get("id");

    if (!coffeeId) {
        window.location.href = "index.html";
        return;
    }

    var selectedCoffee;

    try {
        selectedCoffee = await getCoffeeById(coffeeId);
    } catch (error) {
        window.location.href = "index.html";
        return;
    }

    
    var recipeImage = document.getElementById("recipe-image");
    var recipeTitle = document.getElementById("recipe-title");
    var recipeNote = document.getElementById("recipe-note");
    var ingredientsList = document.getElementById("ingredients-list");
    var methodList = document.getElementById("method-list");
    var triedStatus = document.getElementById("tried-status");
    var recipeRating = document.getElementById("recipe-rating");
    var editButton = document.getElementById("edit-coffee");

    recipeTitle.textContent = selectedCoffee.name;

    if (selectedCoffee.image) {
        var image = document.createElement("img");
        image.className = "recipe-photo";
        image.src = selectedCoffee.image;
        image.alt = selectedCoffee.name;

        recipeImage.appendChild(image);
    } else {
        recipeImage.textContent = "?";
    }

    if (selectedCoffee.tried) {
        var triedDate = new Date(selectedCoffee.triedDate + "T00:00:00");

        triedStatus.textContent = triedDate.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric"
        });

        recipeRating.textContent = selectedCoffee.rating;

        if (!selectedCoffee.note || selectedCoffee.note.trim() === "") {
            recipeNote.textContent = "im sure it slapped";
        } else {
            recipeNote.textContent = selectedCoffee.note;
        }
    } else {
        triedStatus.textContent = "Yet to try";
        recipeRating.textContent = "?/10";
        recipeNote.textContent = "HOW HAVE YOU NOT TRIED THIS ONE YET??";
    }

    if (selectedCoffee.recipe.ingredients.length === 0) {
        ingredientsList.textContent = "No ingredients added yet.";
    } else {
        for (var j = 0; j < selectedCoffee.recipe.ingredients.length; j++) {
            var ingredientLine = selectedCoffee.recipe.ingredients[j];
            var ingredientRow = document.createElement("div");
            ingredientRow.className = "ingredient-row";

            var amount = document.createElement("span");
            amount.className = "ingredient-amount";

            var ingredientName = document.createElement("span");
            ingredientName.className = "ingredient-name";

            var dashPosition = ingredientLine.indexOf("–");

            if (dashPosition === -1) {
                ingredientName.textContent = ingredientLine;
            } else {
                amount.textContent = ingredientLine.slice(0, dashPosition).trim();
                ingredientName.textContent = ingredientLine.slice(dashPosition + 1).trim();
            }

            ingredientRow.appendChild(amount);
            ingredientRow.appendChild(ingredientName);
            ingredientsList.appendChild(ingredientRow);
        }
    }

    if (selectedCoffee.recipe.method.length === 0) {
        methodList.textContent = "No method added yet.";
    } else {
        for (var k = 0; k < selectedCoffee.recipe.method.length; k++) {
            var methodRow = document.createElement("div");
            methodRow.className = "method-row";

            var stepNumber = document.createElement("span");
            stepNumber.className = "step-number";
            stepNumber.textContent = String(k + 1).padStart(2, "0");

            var stepText = document.createElement("p");
            stepText.textContent = selectedCoffee.recipe.method[k];

            methodRow.appendChild(stepNumber);
            methodRow.appendChild(stepText);
            methodList.appendChild(methodRow);
        }
    }

    editButton.addEventListener("click", function () {
        openCoffeeModal(selectedCoffee);
    });

}

loadRecipePage();