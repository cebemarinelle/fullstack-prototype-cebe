// =====================================
// SIMPLE DATABASE
// =====================================
window.db = {
    accounts: []
};

let currentUser = null;


// =====================================
// NAVIGATION
// =====================================
function navigateTo(hash) {
    window.location.hash = hash;
}


// =====================================
// AUTH STATE MANAGEMENT
// =====================================
function setAuthState(isAuth, user = null) {
    const body = document.body;

    if (isAuth) {
        currentUser = user;

        body.classList.remove("not-authenticated");
        body.classList.add("authenticated");

        if (user.role === "admin") {
            body.classList.add("is-admin");
        } else {
            body.classList.remove("is-admin");
        }

        // Update navbar username
        const dropdown = document.querySelector(".dropdown-toggle");
        if (dropdown) {
            dropdown.textContent = user.firstName;
        }

        renderProfile();

    } else {
        currentUser = null;
        body.classList.remove("authenticated", "is-admin");
        body.classList.add("not-authenticated");
    }
}


// =====================================
// ROUTING
// =====================================
function handleRouting() {

    let hash = window.location.hash;

    if (!hash) {
        hash = "#/";
        window.location.hash = hash;
    }

    const protectedRoutes = [
        "#/profile",
        "#/employees",
        "#/departments",
        "#/accounts",
        "#/requests"
    ];

    if (!currentUser && protectedRoutes.includes(hash)) {
        alert("You must log in first.");
        hash = "#/login";
        window.location.hash = hash;
    }

    const adminRoutes = [
        "#/employees",
        "#/departments",
        "#/accounts"
    ];

    if (
        currentUser &&
        adminRoutes.includes(hash) &&
        currentUser.role !== "admin"
    ) {
        alert("Admins only.");
        hash = "#/";
        window.location.hash = hash;
    }

    document.querySelectorAll(".page").forEach(page => {
        page.classList.remove("active");
    });

    const pageId = hash.replace("#/", "") + "-page";
    const page = document.getElementById(pageId) || document.getElementById("home-page");

    if (page) {
        page.classList.add("active");
    }
}


// =====================================
// REGISTRATION
// =====================================
function registerUser(event) {
    event.preventDefault();

    const firstName = regFirstName.value.trim();
    const lastName = regLastName.value.trim();
    const email = regEmail.value.trim();
    const password = regPassword.value;

    if (password.length < 6) {
        alert("Password must be at least 6 characters.");
        return;
    }

    if (window.db.accounts.find(acc => acc.email === email)) {
        alert("Email already exists.");
        return;
    }

    window.db.accounts.push({
        firstName,
        lastName,
        email,
        password,
        role: "user",
        verified: false
    });

    localStorage.setItem("unverified_email", email);

    alert("Registration successful! Please verify email.");
    navigateTo("#/verify-email");
}


// =====================================
// EMAIL VERIFICATION
// =====================================
function verifyEmail() {
    const email = localStorage.getItem("unverified_email");

    if (!email) {
        alert("No email to verify.");
        return;
    }

    const user = window.db.accounts.find(acc => acc.email === email);

    if (user) {
        user.verified = true;
        localStorage.removeItem("unverified_email");
        alert("Email verified successfully!");
        navigateTo("#/login");
    }
}


// =====================================
// LOGIN
// =====================================
function loginUser(event) {
    event.preventDefault();

    const email = loginEmail.value.trim();
    const password = loginPassword.value;

    const user = window.db.accounts.find(acc =>
        acc.email === email &&
        acc.password === password &&
        acc.verified === true
    );

    if (!user) {
        alert("Invalid credentials or email not verified.");
        return;
    }

    localStorage.setItem("auth_token", user.email);

    setAuthState(true, user);
    navigateTo("#/profile");
}


// =====================================
// LOGOUT
// =====================================
function logoutUser() {
    localStorage.removeItem("auth_token");
    setAuthState(false);
    navigateTo("#/");
}


// =====================================
// PROFILE RENDER
// =====================================
function renderProfile() {
    if (!currentUser) return;

    const profileContent = document.getElementById("profileContent");

    if (profileContent) {
        profileContent.innerHTML = `
            <p><strong>Name:</strong> ${currentUser.firstName} ${currentUser.lastName}</p>
            <p><strong>Email:</strong> ${currentUser.email}</p>
            <p><strong>Role:</strong> ${currentUser.role}</p>
        `;
    }
}


// =====================================
// EVENT LISTENERS
// =====================================
window.addEventListener("hashchange", handleRouting);
window.addEventListener("DOMContentLoaded", handleRouting);
