// ========================================
// STORY PAGE
// ========================================

const storyContainer =
    document.getElementById("story");


const params =
    new URLSearchParams(
        window.location.search
    );


const storyId =
    params.get("id");


// ========================================
// LOAD STORY
// ========================================

async function loadStory() {

    if (!storyId) {

        storyContainer.innerHTML = `
            <h1>Story not found</h1>
        `;

        return;

    }


    try {

        // ========================================
        // GET STORY
        // ========================================

        const response =
            await fetch(
                `/api/stories/${storyId}`
            );


        if (!response.ok) {

            throw new Error(
                "Story not found"
            );

        }


        const story =
            await response.json();


        // ========================================
        // GET CURRENT USER
        // ========================================

        const meResponse =
            await fetch("/api/me");


        const me =
            await meResponse.json();


        // ========================================
        // OWNER BUTTONS
        // ========================================

        let editButton = "";

        let deleteButton = "";


        if (
            me.loggedIn &&
            Number(me.userId) ===
            Number(story.user_id)
        ) {

            editButton = `
                <a
                    href="create.html?id=${story.id}"
                    class="btn primary"
                >
                    Edit Story
                </a>
            `;


            deleteButton = `
                <button
                    id="delete-story"
                    class="btn delete-btn"
                    type="button"
                >
                    Delete Story
                </button>
            `;

        }


        // ========================================
        // DISPLAY STORY
        // ========================================

        let imageHTML = "";


        if (story.image) {

            imageHTML = `
                <div class="story-image">
                    <img
                        src="${escapeHTML(story.image)}"
                        alt="${escapeHTML(story.title)}"
                    >
                </div>
            `;

        }


        storyContainer.innerHTML = `

            <span class="category">
                ${escapeHTML(story.category)}
            </span>


            <h1>
                ${escapeHTML(story.title)}
            </h1>


            <p class="author">
                Written by
                ${escapeHTML(story.author)}
            </p>


            ${imageHTML}


            <hr>


            <div class="story-content">
                ${formatStory(story.content)}
            </div>


            <div class="story-actions">

                <a
                    href="index.html"
                    class="btn secondary"
                >
                    ← Back to Stories
                </a>


                ${editButton}


                ${deleteButton}

            </div>

        `;


        // ========================================
        // DELETE BUTTON
        // ========================================

        const deleteButtonElement =
            document.getElementById(
                "delete-story"
            );


        if (deleteButtonElement) {

            deleteButtonElement.addEventListener(
                "click",
                deleteStory
            );

        }


    } catch (error) {

        console.error(
            error
        );


        storyContainer.innerHTML = `

            <h1>
                Story not found
            </h1>

            <p>
                This story may have been removed.
            </p>

        `;

    }

}


// ========================================
// DELETE STORY
// ========================================

async function deleteStory() {

    const confirmed =
        confirm(
            "Are you sure you want to delete this story? This action cannot be undone."
        );


    if (!confirmed) {

        return;

    }


    try {

        const response =
            await fetch(
                `/api/stories/${storyId}`,
                {
                    method: "DELETE"
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            alert(
                data.error ||
                "Unable to delete story."
            );

            return;

        }


        alert(
            "Story deleted successfully."
        );


        window.location.href =
            "index.html";


    } catch (error) {

        console.error(
            error
        );


        alert(
            "Unable to delete story."
        );

    }

}


// ========================================
// ESCAPE HTML
// ========================================

function escapeHTML(text) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        text;


    return div.innerHTML;

}


// ========================================
// FORMAT STORY
// ========================================

function formatStory(text) {

    return escapeHTML(text)
        .replace(
            /\n/g,
            "<br><br>"
        );

}


// ========================================
// START
// ========================================

loadStory();
