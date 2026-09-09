var COFFEE_STORAGE_KEY = "coffee-log";

function createCoffeeId() {
    return "coffee-" + Date.now() + "-" + Math.random().toString(16).slice(2);
}

function loadCoffees() {
    var savedCoffees = localStorage.getItem(COFFEE_STORAGE_KEY);
    var coffees = savedCoffees ? JSON.parse(savedCoffees) : [];
    var changed = false;

    for (var i = 0; i < coffees.length; i++) {
        if (!coffees[i].id) {
            coffees[i].id = createCoffeeId();
            changed = true;
        }

        if (!coffees[i].recipe) {
            coffees[i].recipe = {
                ingredients: [],
                method: []
            };
            changed = true;
        }

        if (coffees[i].image === undefined) {
            coffees[i].image = null;
            changed = true;
        }

        if (coffees[i].tried === undefined) {
            coffees[i].tried = false;
            coffees[i].triedDate = null;
            coffees[i].rating = null;
            coffees[i].note = "";
            changed = true;
        }
    }

    if (changed) {
        saveCoffees(coffees);
    }

    return coffees;
}

function saveCoffees(coffees) {
    localStorage.setItem(COFFEE_STORAGE_KEY, JSON.stringify(coffees));
}

function textToLines(text) {
    var lines = text.split("\n");
    var cleanLines = [];

    for (var i = 0; i < lines.length; i++) {
        var line = lines[i].trim();

        if (line !== "") {
            cleanLines.push(line);
        }
    }

    return cleanLines;
}

function getTodayDate() {
    var today = new Date();
    var month = String(today.getMonth() + 1).padStart(2, "0");
    var day = String(today.getDate()).padStart(2, "0");

    return today.getFullYear() + "-" + month + "-" + day;
}

function compressImage(file) {
    return new Promise(function (resolve, reject) {
        var reader = new FileReader();

        reader.onload = function () {
            var image = new Image();

            image.onload = function () {
                var maxSize = 1200;
                var scale = Math.min(maxSize / image.width, maxSize / image.height, 1);
                var width = Math.round(image.width * scale);
                var height = Math.round(image.height * scale);

                var canvas = document.createElement("canvas");
                canvas.width = width;
                canvas.height = height;

                var context = canvas.getContext("2d");
                context.drawImage(image, 0, 0, width, height);

                resolve(canvas.toDataURL("image/jpeg", 0.82));
            };

            image.onerror = reject;
            image.src = reader.result;
        };

        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

(function () {
    var modal = document.getElementById("coffee-modal");

    if (!modal) {
        return;
    }

    var modalContent = document.getElementById("modal-content");
    var formTitle = document.getElementById("form-title");
    var closeButton = document.getElementById("cancel-coffee");
    var saveButton = document.getElementById("save-coffee");

    var coffeeNameInput = document.getElementById("coffee-name");
    var ingredientsInput = document.getElementById("ingredients-input");
    var methodInput = document.getElementById("method-input");

    var triedCheckbox = document.getElementById("tried-checkbox");
    var tryDetails = document.getElementById("try-details");
    var triedDateInput = document.getElementById("tried-date");
    var coffeeRatingInput = document.getElementById("coffee-rating");
    var coffeeNoteInput = document.getElementById("coffee-note");

    var imageUpload = document.getElementById("image-upload");
    var cameraUpload = document.getElementById("camera-upload");
    var imagePreview = document.getElementById("image-preview");

    var editingCoffeeId = null;
    var imageData = null;

    function updateTryDetails(scrollToDetails) {
        if (triedCheckbox.checked) {
            tryDetails.classList.add("show");

            if (triedDateInput.value === "") {
                triedDateInput.value = getTodayDate();
            }

            if (scrollToDetails) {
                setTimeout(function () {
                    modalContent.scrollTo({
                        top: modalContent.scrollHeight,
                        behavior: "smooth"
                    });
                }, 0);
            }
        } else {
            tryDetails.classList.remove("show");
        }
    }

    function showImagePreview() {
        if (imageData) {
            imagePreview.src = imageData;
            imagePreview.classList.add("show");
        } else {
            imagePreview.removeAttribute("src");
            imagePreview.classList.remove("show");
        }
    }

    function clearForm() {
        editingCoffeeId = null;
        imageData = null;

        formTitle.textContent = "Save a new cup";
        saveButton.textContent = "Save coffee";

        coffeeNameInput.value = "";
        ingredientsInput.value = "";
        methodInput.value = "";

        triedCheckbox.checked = false;
        triedDateInput.value = "";
        coffeeRatingInput.value = "";
        coffeeNoteInput.value = "";

        imageUpload.value = "";
        cameraUpload.value = "";

        updateTryDetails(false);
        showImagePreview();
    }

    window.openCoffeeModal = function (coffee) {
        clearForm();

        if (coffee) {
            editingCoffeeId = coffee.id;
            imageData = coffee.image || null;

            formTitle.textContent = "Edit coffee";
            saveButton.textContent = "Save changes";

            coffeeNameInput.value = coffee.name;
            ingredientsInput.value = coffee.recipe.ingredients.join("\n");
            methodInput.value = coffee.recipe.method.join("\n");

            triedCheckbox.checked = coffee.tried;
            triedDateInput.value = coffee.triedDate || "";
            coffeeRatingInput.value = coffee.rating === null ? "" : coffee.rating;
            coffeeNoteInput.value = coffee.note || "";

            updateTryDetails(false);
            showImagePreview();
        }

        modal.classList.add("show");
        coffeeNameInput.focus();
    };

    closeButton.addEventListener("click", function () {
        modal.classList.remove("show");
    });

    triedCheckbox.addEventListener("change", function () {
        if (!triedCheckbox.checked) {
            triedDateInput.value = "";
            coffeeRatingInput.value = "";
            coffeeNoteInput.value = "";
        }

        updateTryDetails(true);
    });

    async function useSelectedImage(file) {
        if (!file) {
            return;
        }

        imageData = await compressImage(file);
        showImagePreview();
    }

    imageUpload.addEventListener("change", function () {
        useSelectedImage(imageUpload.files[0]);
    });

    cameraUpload.addEventListener("change", function () {
        useSelectedImage(cameraUpload.files[0]);
    });

    saveButton.addEventListener("click", async function () {
        var coffeeName = coffeeNameInput.value.trim();

        if (coffeeName === "") {
            alert("Please give this coffee a title.");
            coffeeNameInput.focus();
            return;
        }

        var rating = null;

        if (triedCheckbox.checked) {
            rating = Number(coffeeRatingInput.value);

            if (
                triedDateInput.value === "" ||
                coffeeRatingInput.value === "" ||
                rating < 0 ||
                rating > 10
            ) {
                alert("Please add a date and a rating from 0 to 10.");
                return;
            }
        }

        var selectedFile = imageUpload.files[0] || cameraUpload.files[0];

        if (selectedFile) {
            imageData = await compressImage(selectedFile);
        }

        var coffee = {
            id: editingCoffeeId || createCoffeeId(),
            name: coffeeName,
            image: imageData,
            recipe: {
                ingredients: textToLines(ingredientsInput.value),
                method: textToLines(methodInput.value)
            },
            tried: triedCheckbox.checked,
            triedDate: triedCheckbox.checked ? triedDateInput.value : null,
            rating: rating,
            note: triedCheckbox.checked ? coffeeNoteInput.value.trim() : ""
        };

        var coffees = loadCoffees();
        var foundExistingCoffee = false;

        for (var i = 0; i < coffees.length; i++) {
            if (coffees[i].id === coffee.id) {
                coffees[i] = coffee;
                foundExistingCoffee = true;
            }
        }

        if (!foundExistingCoffee) {
            coffees.push(coffee);
        }

        saveCoffees(coffees);

        localStorage.setItem("selected-coffee-id", coffee.id);
        modal.classList.remove("show");

        if (editingCoffeeId) {
            window.location.href = "recipe.html";
        } else {
            window.location.href = "index.html";
        }
    });
})();