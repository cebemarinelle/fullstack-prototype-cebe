// =====================================================
// PHASE 0 – PROJECT INITIALIZATION
// =====================================================

window.db = {
    accounts: [],
    departments: [],
    employees: [],
    requests: []
};

let currentUser = null;


// =====================================================
// PHASE 4 – STORAGE CONFIG
// =====================================================

const STORAGE_KEY = "ipt_demo_v1";

function loadFromStorage() {
    const data = localStorage.getItem(STORAGE_KEY);

    if (data) {
        try {
            window.db = JSON.parse(data);
        } catch {
            seedDefaultData();
        }
    } else {
        seedDefaultData();
    }
}

function saveToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(window.db));
}

function seedDefaultData() {
    window.db = {
        accounts: [
            {
                firstName: "Admin",
                lastName: "User",
                email: "admin@example.com",
                password: "Password123!",
                role: "admin",
                verified: true
            }
        ],
        departments: [
            { id: 1, name: "Engineering", description: "Tech Department" },
            { id: 2, name: "HR", description: "Human Resources" }
        ],
        employees: [],
        requests: []
    };

    saveToStorage();
}


// =====================================================
// PHASE 3 – AUTHENTICATION
// =====================================================

function setAuthState(isAuthenticated, user = null) {
    const body = document.body;

    if (isAuthenticated) {
        currentUser = user;

        body.classList.remove("not-authenticated");
        body.classList.add("authenticated");

        if (user.role === "admin") {
            body.classList.add("is-admin");
        }

        const dropdown = document.querySelector(".dropdown-toggle");
        if (dropdown) dropdown.textContent = user.firstName;
    } else {
        currentUser = null;
        body.classList.remove("authenticated", "is-admin");
        body.classList.add("not-authenticated");
    }
}

function checkAuthOnLoad() {
    const token = localStorage.getItem("auth_token");
    if (!token) return;

    const user = window.db.accounts.find(acc => acc.email === token);
    if (user) {
        setAuthState(true, user);
    }
}


// =====================================================
// PHASE 5 – PROFILE PAGE
// =====================================================

function renderProfile() {
    const profileDiv = document.getElementById("profileContent");
    if (!profileDiv || !currentUser) return;

    profileDiv.innerHTML = `
        <div class="card shadow-sm">
            <div class="card-body">
                <h5 class="card-title">
                    ${currentUser.firstName} ${currentUser.lastName}
                </h5>
                <p><strong>Email:</strong> ${currentUser.email}</p>
                <p><strong>Role:</strong> ${currentUser.role}</p>
                <p><strong>Status:</strong> ${currentUser.verified ? "Verified" : "Not Verified"}</p>
                <button class="btn btn-warning mt-2" onclick="editProfile()">
                    Edit Profile
                </button>
            </div>
        </div>
    `;
}

function editProfile() {
    alert("Edit Profile feature coming soon!");
}


// =====================================================
// PHASE 2 – ROUTING SYSTEM
// =====================================================

function navigateTo(hash) {
    window.location.hash = hash;
}

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

    const selectedPage = document.getElementById(pageId);
    if (selectedPage) {
        selectedPage.classList.add("active");
    }

    if (pageId === "profile-page") {
        renderProfile();
    }
}


// =====================================================
// PHASE 3 – REGISTER / LOGIN / LOGOUT
// =====================================================

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
        alert("Email already registered.");
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

    saveToStorage();

    localStorage.setItem("unverified_email", email);
    navigateTo("#/verify-email");
}

function verifyEmail() {
    const email = localStorage.getItem("unverified_email");
    if (!email) return;

    const user = window.db.accounts.find(acc => acc.email === email);

    if (user) {
        user.verified = true;
        saveToStorage();
    }

    localStorage.removeItem("unverified_email");
    navigateTo("#/login");
}

function loginUser(event) {
    event.preventDefault();

    const email = loginEmail.value;
    const password = loginPassword.value;

    const user = window.db.accounts.find(acc =>
        acc.email === email &&
        acc.password === password &&
        acc.verified
    );

    if (!user) {
        alert("Invalid credentials or email not verified.");
        return;
    }

    localStorage.setItem("auth_token", user.email);
    setAuthState(true, user);
    navigateTo("#/profile");
}

function logoutUser() {
    localStorage.removeItem("auth_token");
    setAuthState(false);
    navigateTo("#/");
}


// =====================================================
// INIT
// =====================================================

window.addEventListener("DOMContentLoaded", () => {
    loadFromStorage();
    checkAuthOnLoad();
    handleRouting();
});

window.addEventListener("hashchange", handleRouting);
