const screens = document.querySelectorAll(".screen");
const root = document.documentElement;
const toggle = document.querySelector("#themeToggle");
const splash = document.querySelector("#splash");
const landingContent = document.querySelector("#landingContent");
const regForm = document.querySelector("#regForm");
const logForm = document.querySelector("#logForm");
const welcomeText = document.querySelector("#welcomeText");

const getUsers = () => {
    const raw = localStorage.getItem("users");
    return JSON.parse(raw) ?? [];
};

const show = (id) => {
    screens.forEach((s) => {
        s.classList.toggle("hidden", s.id !== id);
    });
};

// 1. Page initialization
if (landingContent) {
    // Landing page: show splash screen for 2 seconds, then reveal landing content
    setTimeout(() => {
        splash?.classList.add("hidden");
        landingContent.classList.remove("hidden");
    }, 2000);
} else {
    // Sign In page: show Login or Register immediately with no splash screen
    const params = new URLSearchParams(window.location.search);
    const targetScreen = params.get("screen") === "login" ? "login" : "register";
    show(targetScreen);
}

// 2. Navigation clicks on Sign In page
document.addEventListener("click", (e) => {
    const id = e.target.id;
    if (id === "toLogin" || id === "toRegister" || id === "logout") {
        e.preventDefault();
    }
    if (id === "toLogin") show("login");
    if (id === "toRegister") show("register");
    if (id === "logout") {
        localStorage.removeItem("currentUser");
        show("login");
    }
});

// 3. Registration
if (regForm) {
    const regMsg = document.querySelector("#regMsg");

    regForm.addEventListener("submit", (e) => {
        e.preventDefault();
        regMsg.textContent = "";
        const f = regForm.elements;
        try {
            if (!f.name.value.trim())
                throw new Error("Name is required");
            if (f.password.value.length < 8)
                throw new Error("Password too short (min 8 chars)");
            if (f.password.value !== f.confirm.value)
                throw new Error("Passwords do not match");

            const email = f.email.value.trim().toLowerCase();
            if (!email)
                throw new Error("Email is required");
            if (getUsers().some((u) => u.email === email))
                throw new Error("Email already used");

            const users = [...getUsers(), {
                name: f.name.value.trim(),
                email,
                password: f.password.value,
            }];
            localStorage.setItem("users", JSON.stringify(users));
            regForm.reset();
            show("login");
        } catch (error) {
            regMsg.textContent = error.message;
        }
    });
}

// 4. Login (Goes to week4.html)
if (logForm) {
    const logMsg = document.querySelector("#logMsg");

    logForm.addEventListener("submit", (e) => {
        e.preventDefault();
        logMsg.textContent = "";
        const f = logForm.elements;
        const mail = f.email.value.trim().toLowerCase();
        const user = getUsers().find((u) => u.email === mail);
        if (user?.password === f.password.value) {
            localStorage.setItem("currentUser", JSON.stringify(user));
            logForm.reset();
            window.location.href = "week4.html";
        } else {
            logMsg.textContent = "Wrong email or password";
        }
    });
}

// 5. Theme Toggle
if (toggle) {
    const setTheme = (name) => {
        const dark = name === "dark";
        root.dataset.theme = name;
        toggle.textContent = dark ? "Light" : "Dark";
        localStorage.setItem("theme", name);
    };

    const systemDark = matchMedia("(prefers-color-scheme: dark)").matches;
    const saved = localStorage.getItem("theme");
    setTheme(saved ?? (systemDark ? "dark" : "light"));

    toggle.addEventListener("click", () => {
        const dark = root.dataset.theme === "dark";
        setTheme(dark ? "light" : "dark");
    });
}
