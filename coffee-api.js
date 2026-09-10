async function requireUser() {
    var result = await supabaseClient.auth.getUser();
    var user = result.data.user;

    if (!user) {
        window.location.href = "login.html";
        throw new Error("You must sign in first.");
    }

    return user;
}

function getCoffeeImageUrl(imagePath) {
    if (!imagePath) {
        return null;
    }

    var result = supabaseClient.storage
        .from("coffee-images")
        .getPublicUrl(imagePath);

    return result.data.publicUrl;
}

async function rowToCoffee(row) {
    return {
        id: row.id,
        name: row.name,
        imagePath: row.image_path,
        image: getCoffeeImageUrl(row.image_path),
        recipe: {
            ingredients: row.ingredients || [],
            method: row.method || []
        },
        tried: row.tried,
        triedDate: row.tried_date,
        rating: row.rating,
        note: row.note || "",
        thoughts: row.thoughts || ""
    };
}

async function listCoffees() {
    var result = await supabaseClient
        .from("coffees")
        .select("*")
        .order("created_at", { ascending: false });

    if (result.error) {
        throw result.error;
    }

    return Promise.all(result.data.map(rowToCoffee));
}

async function getCoffeeById(id) {
    var result = await supabaseClient
        .from("coffees")
        .select("*")
        .eq("id", id)
        .single();

    if (result.error) {
        throw result.error;
    }

    return rowToCoffee(result.data);
}

async function uploadCoffeeImage(file, oldImagePath) {
    if (!file) {
        return oldImagePath || null;
    }

    var user = await requireUser();
    var extension = file.name.split(".").pop() || "jpg";
    var imagePath = user.id + "/" + crypto.randomUUID() + "." + extension;

    var uploadResult = await supabaseClient.storage
        .from("coffee-images")
        .upload(imagePath, file, {
            cacheControl: "3600",
            upsert: false,
            contentType: file.type
        });

    if (uploadResult.error) {
        throw uploadResult.error;
    }

    if (oldImagePath) {
        await supabaseClient.storage
            .from("coffee-images")
            .remove([oldImagePath]);
    }

    return imagePath;
}

async function saveCoffee(coffee, selectedImageFile) {
    await requireUser();
    var imagePath = await uploadCoffeeImage(
        selectedImageFile,
        coffee.imagePath
    );

    var row = {
        name: coffee.name,
        ingredients: coffee.recipe.ingredients,
        method: coffee.recipe.method,
        tried: coffee.tried,
        tried_date: coffee.triedDate,
        rating: coffee.rating,
        note: coffee.note,
        thoughts: coffee.thoughts,
        image_path: imagePath
    };

    var result;

    if (coffee.id) {
        result = await supabaseClient
            .from("coffees")
            .update(row)
            .eq("id", coffee.id)
            .select()
            .single();
    } else {
        result = await supabaseClient
            .from("coffees")
            .insert(row)
            .select()
            .single();
    }

    if (result.error) {
        throw result.error;
    }

    return rowToCoffee(result.data);
}

async function deleteCoffee(coffee) {
    await requireUser();

    var databaseResult = await supabaseClient
        .from("coffees")
        .delete()
        .eq("id", coffee.id);

    if (databaseResult.error) {
        throw databaseResult.error;
    }

    if (coffee.imagePath) {
        var imageResult = await supabaseClient.storage
            .from("coffee-images")
            .remove([coffee.imagePath]);

        if (imageResult.error) {
            console.error("Coffee deleted, but its photo could not be removed:", imageResult.error);
        }
    }
}