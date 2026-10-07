/* ================================
   STORY PROJECT AUTHENTICATION
================================ */


/* ================================
   REGISTER
================================ */

const registerForm =
    document.getElementById("register-form");


if (registerForm) {

    registerForm.addEventListener("submit", async (event) => {

        event.preventDefault();


        const username =
            document.getElementById("username").value.trim();

        const email =
            document.getElementById("email").value.trim();

        const password =
            document.getElementById("password").value;


        const message =
            document.getElementById("register-message");


        message.textContent = "Creating account...";


        try {

            const response =
                await fetch("/api/register", {

                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        username,
                        email,
                        password
                    })

                });


            const data =
                await response.json();


            if (!response.ok) {

                message.textContent =
                    data.error || "Unable to create account.";

                return;

            }


            message.textContent =
                "Account created successfully! Redirecting...";


            setTimeout(() => {

                window.location.href =
                    "login.html";

            }, 1000);


        } catch (error) {

            console.error(error);

            message.textContent =
                "Unable to connect to the server.";

        }

    });

}


/* ================================
   LOGIN
================================ */

const loginForm =
    document.getElementById("login-form");


if (loginForm) {

    loginForm.addEventListener("submit", async (event) => {

        event.preventDefault();


        const email =
            document.getElementById("email").value.trim();

        const password =
            document.getElementById("password").value;


        const message =
            document.getElementById("login-message");


        message.textContent =
            "Logging in...";


        try {

            const response =
                await fetch("/api/login", {

                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        email,
                        password
                    })

                });


            const data =
                await response.json();


            if (!response.ok) {

                message.textContent =
                    data.error || "Login failed.";

                return;

            }


            message.textContent =
                "Login successful! Redirecting...";


            setTimeout(() => {

                window.location.href =
                    "index.html";

            }, 800);


        } catch (error) {

            console.error(error);

            message.textContent =
                "Unable to connect to the server.";

        }

    });

}
