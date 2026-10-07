/* ================================
   STORY PROJECT APP
================================ */


/* ================================
   LOAD STORIES
================================ */

let allStories = [];


async function loadStories() {

    const container =
        document.getElementById("stories-container");

    try {

        const response =
            await fetch("/api/stories");

        const stories =
            await response.json();

        if (!response.ok) {
            throw new Error("Unable to load stories.");
        }

        allStories = stories;

        displayStories(allStories);

    } catch (error) {

        console.error(error);

        container.innerHTML = `
            <p class="empty">
                Unable to load stories.
            </p>
        `;
    }
}


/* ================================
   DISPLAY STORIES
================================ */

function displayStories(stories) {

    const container =
        document.getElementById("stories-container");


    if (stories.length === 0) {

        container.innerHTML = `
            <p class="empty">
                No stories found.
            </p>
        `;

        return;
    }


    container.innerHTML = "";


    stories.forEach((story) => {

        const card =
            document.createElement("article");

        card.className = "story-card";


        const preview =
            story.content.length > 180
                ? story.content.substring(0, 180) + "..."
                : story.content;


        card.innerHTML = `
            <span class="category">
                ${escapeHTML(story.category)}
            </span>

            <h3>
                ${escapeHTML(story.title)}
            </h3>

            <p class="author">
                By ${escapeHTML(story.author)}
            </p>

            <p>
                ${escapeHTML(preview)}
            </p>

            <a
                class="read-more"
                href="story.html?id=${story.id}"
            >
                Read Story →
            </a>
        `;


        container.appendChild(card);

    });
}


/* ================================
   SEARCH STORIES
================================ */

const searchInput =
    document.getElementById("story-search");


if (searchInput) {

    searchInput.addEventListener("input", () => {

        const searchTerm =
            searchInput.value
                .trim()
                .toLowerCase();


        if (searchTerm === "") {

            displayStories(allStories);

            return;
        }


        const filteredStories =
            allStories.filter((story) => {

                const title =
                    story.title.toLowerCase();

                const author =
                    story.author.toLowerCase();

                const category =
                    story.category.toLowerCase();

                const content =
                    story.content.toLowerCase();


                return (
                    title.includes(searchTerm) ||
                    author.includes(searchTerm) ||
                    category.includes(searchTerm) ||
                    content.includes(searchTerm)
                );

            });


        displayStories(filteredStories);

    });

}


/* ================================
   ESCAPE HTML
================================ */

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}


/* ================================
   HERO IMAGE SLIDESHOW
================================ */

const heroSlide =
    document.getElementById("heroSlide");


const heroImages = [

    "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=85",

    "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=1200&q=85",

    "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=85",

    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=85"

];


let currentSlide = 0;


function changeHeroImage() {

    if (!heroSlide) {
        return;
    }


    heroSlide.style.opacity = "0";


    setTimeout(() => {

        currentSlide++;


        if (currentSlide >= heroImages.length) {
            currentSlide = 0;
        }


        heroSlide.src =
            heroImages[currentSlide];


        heroSlide.style.opacity = "1";

    }, 700);

}


if (heroSlide) {

    setInterval(
        changeHeroImage,
        5000
    );

}


/* ================================
   START APPLICATION
================================ */

loadStories();