// ========================================
// STORY CREATE / EDIT SYSTEM
// ========================================

const form =
    document.getElementById("story-form");

const message =
    document.getElementById("message");

const titleInput =
    document.getElementById("title");

const authorInput =
    document.getElementById("author");

const categoryInput =
    document.getElementById("category");

const contentInput =
    document.getElementById("content");

const imageInput =
    document.getElementById("image");


// ========================================
// CHECK IF WE ARE EDITING
// ========================================

const params =
    new URLSearchParams(
        window.location.search
    );

const storyId =
    params.get("id");

const editMode =
    Boolean(storyId);


// ========================================
// PAGE ELEMENTS
// ========================================

const pageTitle =
    document.querySelector(
        ".form-container h1"
    );

const pageDescription =
    document.querySelector(
        ".form-container > p"
    );

const submitButton =
    form.querySelector(
        'button[type="submit"]'
    );


// ========================================
// LOAD STORY FOR EDITING
// ========================================

async function loadStoryForEditing() {

    if (!editMode) {

        return;

    }


    try {

        // Check logged-in user
        const meResponse =
            await fetch("/api/me");

        const me =
            await meResponse.json();


        if (!me.loggedIn) {

            message.textContent =
                "Please log in to edit a story.";

            setTimeout(() => {

                window.location.href =
                    "login.html";

            }, 1200);

            return;

        }


        // Get the story
        const response =
            await fetch(
                `/api/stories/${storyId}`
            );


        const story =
            await response.json();


        if (!response.ok) {

            message.textContent =
                story.error ||
                "Story not found.";

            return;

        }


        // Make sure this user owns the story
        if (
            Number(me.userId) !==
            Number(story.user_id)
        ) {

            message.textContent =
                "You can only edit your own stories.";

            form.style.display =
                "none";

            return;

        }


        // ========================================
        // FILL FORM WITH EXISTING STORY
        // ========================================

        titleInput.value =
            story.title || "";

        authorInput.value =
            story.author || "";

        categoryInput.value =
            story.category || "";

        contentInput.value =
            story.content || "";


        // ========================================
        // CHANGE PAGE TEXT
        // ========================================

        pageTitle.textContent =
            "Edit Your Story";

        pageDescription.textContent =
            "Make changes to your story and save them.";

        submitButton.textContent =
            "Update Story";


        // Image is optional.
        // The existing image stays unless
        // the user chooses a new one.

        message.textContent =
            "Story loaded. You can now edit it.";


    } catch (error) {

        console.error(
            "LOAD STORY ERROR:",
            error
        );

        message.textContent =
            "Unable to load story.";

    }

}


// ========================================
// SUBMIT FORM
// ========================================

form.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        message.textContent =
            editMode
                ? "Updating story..."
                : "Publishing story...";


        const formData =
            new FormData();


        formData.append(
            "title",
            titleInput.value.trim()
        );


        formData.append(
            "author",
            authorInput.value.trim()
        );


        formData.append(
            "category",
            categoryInput.value
        );


        formData.append(
            "content",
            contentInput.value.trim()
        );


        // Add image only if the user
        // selected a new one.
        if (
            imageInput.files.length > 0
        ) {

            formData.append(
                "image",
                imageInput.files[0]
            );

        }


        try {

            let response;


            // ========================================
            // EDIT EXISTING STORY
            // ========================================

            if (editMode) {

                response =
                    await fetch(
                        `/api/stories/${storyId}`,
                        {
                            method: "PUT",
                            body: formData
                        }
                    );

            }

            // ========================================
            // CREATE NEW STORY
            // ========================================

            else {

                response =
                    await fetch(
                        "/api/stories",
                        {
                            method: "POST",
                            body: formData
                        }
                    );

            }


            const data =
                await response.json();


            // ========================================
            // ERROR
            // ========================================

            if (!response.ok) {

                message.textContent =
                    data.error ||
                    "Something went wrong.";

                return;

            }


            // ========================================
            // SUCCESS
            // ========================================

            message.textContent =
                editMode
                    ? "Story updated successfully!"
                    : "Story published successfully!";


            // ========================================
            // REDIRECT
            // ========================================

            setTimeout(() => {

                if (editMode) {

                    window.location.href =
                        `story.html?id=${storyId}`;

                } else {

                    window.location.href =
                        `story.html?id=${data.id}`;

                }

            }, 1000);


        } catch (error) {

            console.error(
                "SAVE STORY ERROR:",
                error
            );


            message.textContent =
                editMode
                    ? "Unable to update story."
                    : "Unable to publish story.";

        }

    }
);


// ========================================
// START
// ========================================

loadStoryForEditing();