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
            { firstName: "Admin", lastName: "User", email: "admin@example.com", password: "Password123!", role: "admin", verified: true }
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
        if (user.role === "admin") body.classList.add("is-admin");
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
    if (user) setAuthState(true, user);
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
                <h5 class="card-title">${currentUser.firstName} ${currentUser.lastName}</h5>
                <p><strong>Email:</strong> ${currentUser.email}</p>
                <p><strong>Role:</strong> ${currentUser.role}</p>
                <p><strong>Status:</strong> ${currentUser.verified ? "Verified" : "Not Verified"}</p>
                <button class="btn btn-warning mt-2" onclick="editProfile()">Edit Profile</button>
            </div>
        </div>
    `;
}

function editProfile() { alert("Edit Profile feature coming soon!"); }

// =====================================================
// PHASE 6 – ADMIN FEATURES (CRUD)
// =====================================================

// ACCOUNTS MANAGEMENT
let editingAccountId = null;

function renderAccountsList() {
    const container = document.getElementById("accountsTableContainer");
    if (!container) return;

    let html = `<table class="table table-bordered">
        <thead>
            <tr>
                <th>Name</th><th>Email</th><th>Role</th><th>Verified</th><th>Actions</th>
            </tr>
        </thead><tbody>`;

    window.db.accounts.forEach((acc) => {
        html += `<tr>
            <td>${acc.firstName} ${acc.lastName}</td>
            <td>${acc.email}</td>
            <td>${acc.role}</td>
            <td>${acc.verified ? "✔" : "—"}</td>
            <td>
                <button class="btn btn-sm btn-warning" onclick="editAccount('${acc.email}')">Edit</button>
                <button class="btn btn-sm btn-info" onclick="resetPassword('${acc.email}')">Reset PW</button>
                <button class="btn btn-sm btn-danger" onclick="deleteAccount('${acc.email}')">Delete</button>
            </td>
        </tr>`;
    });

    html += `</tbody></table>`;
    container.innerHTML = html;
}

function openAccountForm(editEmail = null) {
    editingAccountId = editEmail;
    const container = document.getElementById("accountFormContainer");
    let account = { firstName: "", lastName: "", email: "", password: "", role: "user", verified: false };
    
    if (editEmail !== null) {
        account = window.db.accounts.find(a => a.email === editEmail);
    }

    container.innerHTML = `
        <div class="card p-3">
            <h5>${editEmail ? 'Edit' : 'Add'} Account</h5>
            <form onsubmit="saveAccount(event)">
                <input id="accFirstName" class="form-control mb-2" placeholder="First Name" value="${account.firstName}" required>
                <input id="accLastName" class="form-control mb-2" placeholder="Last Name" value="${account.lastName}" required>
                <input id="accEmail" type="email" class="form-control mb-2" placeholder="Email" value="${account.email}" ${editEmail ? 'readonly' : ''} required>
                <input id="accPassword" type="password" class="form-control mb-2" placeholder="${editEmail ? 'Leave blank to keep current' : 'Password (min 6)'}" ${editEmail ? '' : 'required'}>
                <select id="accRole" class="form-control mb-2">
                    <option value="user" ${account.role === "user" ? "selected" : ""}>User</option>
                    <option value="admin" ${account.role === "admin" ? "selected" : ""}>Admin</option>
                </select>
                <div class="form-check mb-2">
                    <input id="accVerified" type="checkbox" class="form-check-input" ${account.verified ? "checked" : ""}>
                    <label class="form-check-label">Verified</label>
                </div>
                <button class="btn btn-success">Save</button>
                <button type="button" class="btn btn-secondary" onclick="closeAccountForm()">Cancel</button>
            </form>
        </div>`;
}

function closeAccountForm() {
    document.getElementById("accountFormContainer").innerHTML = "";
    editingAccountId = null;
}

function saveAccount(event) {
    event.preventDefault();
    
    const email = document.getElementById('accEmail').value.trim();
    const firstName = document.getElementById('accFirstName').value.trim();
    const lastName = document.getElementById('accLastName').value.trim();
    const role = document.getElementById('accRole').value;
    const verified = document.getElementById('accVerified').checked;

    if (editingAccountId === null) {
        // New account
        const password = document.getElementById('accPassword').value;
        if (!password || password.length < 6) {
            alert("Password must be at least 6 characters");
            return;
        }
        
        // Check if email already exists
        if (window.db.accounts.find(a => a.email === email)) {
            alert("Email already exists");
            return;
        }
        
        window.db.accounts.push({
            firstName: firstName,
            lastName: lastName,
            email: email,
            password: password,
            role: role,
            verified: verified
        });
    } else {
        // Edit existing
        const index = window.db.accounts.findIndex(a => a.email === editingAccountId);
        const password = document.getElementById('accPassword').value;
        
        window.db.accounts[index] = {
            ...window.db.accounts[index],
            firstName: firstName,
            lastName: lastName,
            email: email,
            role: role,
            verified: verified,
            password: password || window.db.accounts[index].password
        };
    }

    saveToStorage();
    renderAccountsList();
    closeAccountForm();
}

function editAccount(email) { 
    openAccountForm(email); 
}

function resetPassword(email) {
    const newPw = prompt("Enter new password (min 6 chars)");
    if (!newPw || newPw.length < 6) {
        alert("Invalid password");
        return;
    }
    
    const account = window.db.accounts.find(a => a.email === email);
    account.password = newPw;
    saveToStorage();
    alert("Password reset!");
}

function deleteAccount(email) {
    if (email === currentUser?.email) {
        alert("Cannot delete yourself");
        return;
    }
    
    if (!confirm("Delete this account?")) return;
    
    window.db.accounts = window.db.accounts.filter(a => a.email !== email);
    saveToStorage();
    renderAccountsList();
}

// DEPARTMENTS MANAGEMENT (COMPLETE CRUD)
let editingDeptId = null;

function renderDepartmentsTable() {
    const container = document.getElementById("departmentsTableContainer");
    if (!container) return;
    
    let html = `<table class="table table-bordered">
        <thead>
            <tr>
                <th>Name</th><th>Description</th><th>Actions</th>
            </tr>
        </thead><tbody>`;
    
    if (window.db.departments.length === 0) {
        html += `<tr><td colspan="3" class="text-center">No departments found</td></tr>`;
    } else {
        window.db.departments.forEach(d => { 
            html += `<tr>
                <td>${d.name}</td>
                <td>${d.description}</td>
                <td>
                    <button class="btn btn-sm btn-warning" onclick="editDepartment(${d.id})">Edit</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteDepartment(${d.id})">Delete</button>
                </td>
            </tr>`; 
        });
    }
    
    html += `</tbody></table>`;
    container.innerHTML = html;
}

function openDepartmentForm(editId = null) {
    editingDeptId = editId;
    const container = document.getElementById("departmentFormContainer");
    let dept = { name: "", description: "" };
    
    if (editId !== null) {
        dept = window.db.departments.find(d => d.id === editId);
    }

    container.innerHTML = `
        <div class="card p-3">
            <h5>${editId ? 'Edit' : 'Add'} Department</h5>
            <form onsubmit="saveDepartment(event)">
                <input id="deptName" class="form-control mb-2" placeholder="Department Name" value="${dept.name}" required>
                <textarea id="deptDesc" class="form-control mb-2" placeholder="Description" required>${dept.description}</textarea>
                <button class="btn btn-success">Save</button>
                <button type="button" class="btn btn-secondary" onclick="closeDepartmentForm()">Cancel</button>
            </form>
        </div>`;
}

function closeDepartmentForm() {
    document.getElementById("departmentFormContainer").innerHTML = "";
    editingDeptId = null;
}

function saveDepartment(event) {
    event.preventDefault();
    
    const name = document.getElementById('deptName').value.trim();
    const description = document.getElementById('deptDesc').value.trim();

    if (editingDeptId === null) {
        // Add new department
        const newId = window.db.departments.length > 0 
            ? Math.max(...window.db.departments.map(d => d.id)) + 1 
            : 1;
        
        window.db.departments.push({
            id: newId,
            name: name,
            description: description
        });
    } else {
        // Edit existing
        const index = window.db.departments.findIndex(d => d.id === editingDeptId);
        window.db.departments[index] = {
            ...window.db.departments[index],
            name: name,
            description: description
        };
    }

    saveToStorage();
    renderDepartmentsTable();
    closeDepartmentForm();
}

function editDepartment(id) {
    openDepartmentForm(id);
}

function deleteDepartment(id) {
    if (!confirm("Delete this department?")) return;
    
    // Check if department is used by employees
    const isUsed = window.db.employees.some(e => e.deptId === id);
    if (isUsed) {
        alert("Cannot delete department that has employees");
        return;
    }
    
    window.db.departments = window.db.departments.filter(d => d.id !== id);
    saveToStorage();
    renderDepartmentsTable();
}

// EMPLOYEES MANAGEMENT (COMPLETE CRUD)
let editingEmployeeId = null;

function renderEmployeesTable() {
    const container = document.getElementById("employeesTableContainer");
    if (!container) return;
    
    let html = `<table class="table table-bordered">
        <thead>
            <tr>
                <th>ID</th><th>Email</th><th>Position</th><th>Department</th><th>Actions</th>
            </tr>
        </thead><tbody>`;
    
    if (window.db.employees.length === 0) {
        html += `<tr><td colspan="5" class="text-center">No employees found</td></tr>`;
    } else {
        window.db.employees.forEach(e => {
            const dept = window.db.departments.find(d => d.id === e.deptId);
            html += `<tr>
                <td>${e.employeeId}</td>
                <td>${e.userEmail}</td>
                <td>${e.position}</td>
                <td>${dept ? dept.name : "N/A"}</td>
                <td>
                    <button class="btn btn-sm btn-warning" onclick="editEmployee('${e.employeeId}')">Edit</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteEmployee('${e.employeeId}')">Delete</button>
                </td>
            </tr>`;
        });
    }
    
    html += `</tbody></table>`;
    container.innerHTML = html;
}

function openEmployeeForm(editId = null) {
    editingEmployeeId = editId;
    const container = document.getElementById("employeeFormContainer");
    const deptOptions = window.db.departments.map(d => `<option value="${d.id}">${d.name}</option>`).join("");
    
    let emp = { employeeId: "", userEmail: "", position: "", deptId: "", hireDate: "" };
    if (editId !== null) {
        emp = window.db.employees.find(e => e.employeeId === editId);
    }

    container.innerHTML = `
        <div class="card p-3">
            <h5>${editId ? 'Edit' : 'Add'} Employee</h5>
            <form onsubmit="saveEmployee(event)">
                <input id="empId" class="form-control mb-2" placeholder="Employee ID" value="${emp.employeeId}" ${editId ? 'readonly' : ''} required>
                <input id="empEmail" class="form-control mb-2" placeholder="User Email" value="${emp.userEmail}" required>
                <input id="empPosition" class="form-control mb-2" placeholder="Position" value="${emp.position}" required>
                <select id="empDept" class="form-control mb-2" required>
                    <option value="">Select Department</option>
                    ${deptOptions}
                </select>
                <input id="empHireDate" type="date" class="form-control mb-2" value="${emp.hireDate}" required>
                <button class="btn btn-success">Save</button>
                <button type="button" class="btn btn-secondary" onclick="closeEmployeeForm()">Cancel</button>
            </form>
        </div>`;
    
    if (editId) document.getElementById('empDept').value = emp.deptId;
}

function closeEmployeeForm() {
    document.getElementById("employeeFormContainer").innerHTML = "";
    editingEmployeeId = null;
}

function saveEmployee(event) {
    event.preventDefault();
    
    const employeeId = document.getElementById('empId').value.trim();
    const email = document.getElementById('empEmail').value.trim();
    const position = document.getElementById('empPosition').value.trim();
    const deptId = parseInt(document.getElementById('empDept').value);
    const hireDate = document.getElementById('empHireDate').value;
    
    // Validate user exists
    const userExists = window.db.accounts.find(a => a.email === email);
    if (!userExists) {
        alert("User email does not exist");
        return;
    }

    if (editingEmployeeId === null) {
        // Check if employee ID already exists
        if (window.db.employees.find(e => e.employeeId === employeeId)) {
            alert("Employee ID already exists");
            return;
        }
        
        window.db.employees.push({
            employeeId: employeeId,
            userEmail: email,
            position: position,
            deptId: deptId,
            hireDate: hireDate
        });
    } else {
        // Edit existing
        const index = window.db.employees.findIndex(e => e.employeeId === editingEmployeeId);
        window.db.employees[index] = {
            employeeId: employeeId,
            userEmail: email,
            position: position,
            deptId: deptId,
            hireDate: hireDate
        };
    }

    saveToStorage();
    renderEmployeesTable();
    closeEmployeeForm();
}

function editEmployee(employeeId) {
    openEmployeeForm(employeeId);
}

function deleteEmployee(employeeId) {
    if (!confirm("Delete this employee?")) return;
    window.db.employees = window.db.employees.filter(e => e.employeeId !== employeeId);
    saveToStorage();
    renderEmployeesTable();
}
// =====================================================
// PHASE 2 – ROUTING SYSTEM
// =====================================================

function navigateTo(hash){ window.location.hash=hash; }

function handleRouting(){
    let hash = window.location.hash||"#/";
    document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));

    const map={
        "#/":"home-page",
        "#/login":"login-page",
        "#/register":"register-page",
        "#/verify-email":"verify-email-page",
        "#/profile":"profile-page",
        "#/accounts":"accounts-page",
        "#/departments":"departments-page",
        "#/employees":"employees-page",
        "#/requests":"requests-page"
    };

    const pageId = map[hash] || "home-page";
    document.getElementById(pageId)?.classList.add("active");

    if(pageId==="profile-page") renderProfile();
    if(pageId==="accounts-page") renderAccountsList();
    if(pageId==="departments-page") renderDepartmentsTable();
    if(pageId==="employees-page") renderEmployeesTable();
}

// =====================================================
// PHASE 3 – REGISTER / LOGIN / LOGOUT
// =====================================================

function registerUser(event){
    event.preventDefault();
    if(window.db.accounts.find(a=>a.email===regEmail.value.trim())) return alert("Email exists");
    window.db.accounts.push({
        firstName: regFirstName.value.trim(),
        lastName: regLastName.value.trim(),
        email: regEmail.value.trim(),
        password: regPassword.value,
        role: "user",
        verified: false
    });
    saveToStorage();
    localStorage.setItem("unverified_email", regEmail.value);
    navigateTo("#/verify-email");
}

function verifyEmail(){
    const email = localStorage.getItem("unverified_email");
    const user = window.db.accounts.find(a=>a.email===email);
    if(user) { user.verified = true; saveToStorage(); }
    localStorage.removeItem("unverified_email");
    navigateTo("#/login");
}

function loginUser(event){
    event.preventDefault();
    const user = window.db.accounts.find(a=>a.email===loginEmail.value && a.password===loginPassword.value && a.verified);
    if(!user) return alert("Invalid credentials");
    localStorage.setItem("auth_token", user.email);
    setAuthState(true, user);
    navigateTo("#/profile");
}

function logoutUser(){
    localStorage.removeItem("auth_token");
    setAuthState(false);
    navigateTo("#/");
}

// =====================================================
// INIT
// =====================================================

window.addEventListener("DOMContentLoaded", ()=>{
    loadFromStorage();
    checkAuthOnLoad();
    handleRouting();
});
window.addEventListener("hashchange", handleRouting);
