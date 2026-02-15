// ===============================
// PHASE 2 – CLIENT-SIDE ROUTING
// ===============================

// Global auth variable
let currentUser = null;


// Navigate helper
function navigateTo(hash) {
    window.location.hash = hash;
}


// Main router
function handleRouting() {

    let hash = window.location.hash;

    // Default route
    if (!hash) {
        hash = "#/";
        window.location.hash = hash;
    }

    // ===============================
    // PROTECTED ROUTES (Must Be Logged In)
    // ===============================
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

    // ===============================
    // ADMIN ROUTES (Must Be Admin)
    // ===============================
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
        alert("Access denied. Admins only.");
        hash = "#/";
        window.location.hash = hash;
    }

    // ===============================
    // Hide all pages
    // ===============================
    document.querySelectorAll(".page").forEach(page => {
        page.classList.remove("active");
    });

    // Determine page ID
    let pageId = "";

    switch (hash) {
        case "#/":
            pageId = "home-page";
            break;
        case "#/login":
            pageId = "login-page";
            break;
        case "#/register":
            pageId = "register-page";
            break;
        case "#/verify-email":
            pageId = "verify-email-page";
            break;
        case "#/profile":
            pageId = "profile-page";
            break;
        case "#/employees":
            pageId = "employees-page";
            break;
        case "#/departments":
            pageId = "departments-page";
            break;
        case "#/accounts":
            pageId = "accounts-page";
            break;
        case "#/requests":
            pageId = "requests-page";
            break;
        default:
            pageId = "home-page";
    }

    // Activate selected page
    const selectedPage = document.getElementById(pageId);
    if (selectedPage) {
        selectedPage.classList.add("active");
    }
}


// ===============================
// Event Listeners
// ===============================

window.addEventListener("hashchange", handleRouting);
window.addEventListener("DOMContentLoaded", handleRouting);
