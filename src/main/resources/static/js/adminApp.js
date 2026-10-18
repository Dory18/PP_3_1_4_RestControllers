const ADMIN_API_URL = '/api/admin';
const ROLES_API_URL = '/api/admin/roles';

window.cachedAllRoles = [];

document.addEventListener('DOMContentLoaded', async () => {
    await loadAllRoles();
    await renderUsersTable();
    initFormListeners();

    fillCreateUserRolesSelect();
});

async function loadAllRoles() {
    try {
        const response = await fetch(ROLES_API_URL);
        if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("html")) {
            console.error("Сервер вернул HTML вместо JSON ролей. Возможно, истекла сессия авторизации.");
            return;
        }

        window.cachedAllRoles = await response.json();

        fillCreateUserRolesSelect();
    } catch (error) {
        console.error('Error fetching roles:', error);
    }
}

// таблица пользователей
window.renderUsersTable = async function () {
    try {
        const response = await fetch(ADMIN_API_URL);
        if (!response.ok) throw new Error(`HTTP dynamic error: ${response.status}`);

        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("html")) {
            console.error("Сервер вернул HTML вместо JSON таблицы. Запрос перенаправлен на логин.");
            return;
        }

        const users = await response.json();
        const tbody = document.querySelector('#all-users-table tbody');
        if (!tbody) return;
        tbody.innerHTML = '';

        users.forEach(user => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="py-3">${user.id}</td>
                <td>${user.firstName}</td>
                <td>${user.lastName}</td>
                <td>${user.age}</td>
                <td>${user.email}</td>
                <td class="text-nowrap">${user.roles.map(r => r.name).join(', ')}</td>
                <td>
                    <button class="btn btn-info text-white btn-sm" onclick="showEditModal(${user.id})">Edit</button>
                </td>
                <td>
                    <button class="btn btn-danger btn-sm" onclick="showDeleteModal(${user.id})">Delete</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Failed to render table:', error);
    }
}

// модальное окно редактирования
async function showEditModal(id) {
    const user = await fetchUserById(id);
    if (!user) return;
    document.getElementById('edit-id').value = user.id;
    document.getElementById('edit-firstName').value = user.firstName;
    document.getElementById('edit-lastName').value = user.lastName;
    document.getElementById('edit-age').value = user.age;
    document.getElementById('edit-email').value = user.email;
    document.getElementById('edit-password').value = '';

    fillRolesSelect('edit-roles', user.roles);

    const editModal = new bootstrap.Modal(document.getElementById('editUserModal'));
    editModal.show();
}

// модальное окно удаления
async function showDeleteModal(id) {
    const user = await fetchUserById(id);
    if (!user) return;
    document.getElementById('delete-id').value = user.id;
    document.getElementById('delete-firstName').value = user.firstName;
    document.getElementById('delete-lastName').value = user.lastName;
    document.getElementById('delete-age').value = user.age;
    document.getElementById('delete-email').value = user.email;
    fillRolesSelect('delete-roles', user.roles);
    const deleteModal = new bootstrap.Modal(document.getElementById('deleteUserModal'));
    deleteModal.show();
}

// Получение юзера по ID с сервера
async function fetchUserById(id) {
    try {
        const response = await fetch(`${ADMIN_API_URL}/${id}`);
        if (response.ok) return await response.json();
    } catch (e) {
        console.error(e);
    }
    return null;
}

// Заполнение списка ролей в модальных окнах
function fillRolesSelect(selectId, userRoles) {
    const selectElem = document.getElementById(selectId);
    if (!selectElem) return;
    selectElem.innerHTML = '';

    const rolesSource = window.cachedAllRoles || [];
    selectElem.size = rolesSource.length;

    const userRoleIds = userRoles ? userRoles.map(r => r.id) : [];
    rolesSource.forEach((role, index) => {
        const option = document.createElement('option');
        option.value = role.id;
        option.textContent = role.name;
        if (userRoleIds.includes(role.id) || (userRoleIds.length === 0 && index === 0)) {
            option.selected = true;
        }
        selectElem.appendChild(option);
    });
}

// создание пользователя
window.fillCreateUserRolesSelect = function () {
    const selectElem = document.getElementById('role');
    if (!selectElem) return;

    selectElem.innerHTML = '';
    const rolesSource = window.cachedAllRoles || [];
    selectElem.size = rolesSource.length;

    rolesSource.forEach((role, index) => {
        const option = document.createElement('option');
        option.value = role.id;
        option.textContent = role.name.replace('ROLE_', '');
        if (index === 0) {
            option.selected = true;
        }
        selectElem.appendChild(option);
    });
}

// отправка форм
function initFormListeners() {
    //редактирования
    const editForm = document.getElementById('edit-user-form');
    if (editForm) {
        editForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const selectedRoles = Array.from(document.getElementById('edit-roles').selectedOptions)
                .map(opt => ({id: parseInt(opt.value), name: opt.textContent}));
            const updatedUser = {
                id: parseInt(document.getElementById('edit-id').value),
                firstName: document.getElementById('edit-firstName').value,
                lastName: document.getElementById('edit-lastName').value,
                age: parseInt(document.getElementById('edit-age').value),
                email: document.getElementById('edit-email').value,
                roles: selectedRoles
            };
            const password = document.getElementById('edit-password').value;
            if (password) updatedUser.password = password;
            const response = await fetch(`${ADMIN_API_URL}`, {
                method: 'PATCH',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(updatedUser)
            });
            if (response.ok) {
                bootstrap.Modal.getInstance(document.getElementById('editUserModal')).hide();
                window.renderUsersTable();
            } else {
                alert('Error updating user');
            }
        });
    }

    // удаления
    const deleteForm = document.getElementById('delete-user-form');
    if (deleteForm) {
        deleteForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('delete-id').value;
            const response = await fetch(`${ADMIN_API_URL}/${id}`, {method: 'DELETE'});
            if (response.ok) {
                bootstrap.Modal.getInstance(document.getElementById('deleteUserModal')).hide();
                window.renderUsersTable();
            } else {
                alert('Error deleting user');
            }
        });
    }

    // создания
    const addForm = document.getElementById('add-user-form');
    if (addForm) {
        addForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            clearFormErrors();

            const selectElem = document.getElementById('role');
            if (!selectElem) return;

            const selectedRoles = Array.from(selectElem.selectedOptions).map(opt => {
                const roleId = parseInt(opt.value);
                const originalRole = window.cachedAllRoles.find(r => r.id === roleId);
                return originalRole ? originalRole : {id: roleId, name: 'ROLE_' + opt.textContent};
            });

            const newUserPayload = {
                firstName: document.getElementById('firstName').value,
                lastName: document.getElementById('lastName').value,
                age: parseInt(document.getElementById('age').value),
                email: document.getElementById('email').value,
                password: document.getElementById('password').value,
                roles: selectedRoles
            };

            try {
                const response = await fetch(ADMIN_API_URL, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(newUserPayload)
                });

                if (response.ok) {
                    addForm.reset();
                    window.fillCreateUserRolesSelect();
                    window.renderUsersTable();

                    const usersTabTrigger = document.querySelector('#nav-users-tab, [data-bs-target="#nav-users"]');
                    if (usersTabTrigger) {
                        const tab = bootstrap.Tab.getOrCreateInstance(usersTabTrigger);
                        tab.show();
                    }
                } else if (response.status === 400) {
                    const errorData = await response.json();
                    displayFormErrors(errorData);
                } else {
                    alert(`Error creating user. Status: ${response.status}`);
                }
            } catch (error) {
                console.error('Network error during user creation:', error);
                alert('Server connection failed.');
            }
        });
    }
// переключение вкладок
    document.querySelectorAll('[data-bs-toggle="tab"], [data-bs-toggle="pill"]').forEach(tabEl => {
        tabEl.addEventListener('shown.bs.tab', () => {
            window.fillCreateUserRolesSelect();
        });
    });
}

function displayFormErrors(errors) {
    for (const [fieldName, message] of Object.entries(errors)) {
        const inputElem = document.getElementById(fieldName);
        const feedbackElem = document.getElementById('error-${fieldName}');
        if (inputElem && feedbackElem) {
            inputElem.classList.add('is-invalid');
            feedbackElem.textContent = message;
        }
    }
}

function clearFormErrors() {
    const inputs = document.querySelectorAll('#add-user-form .form-control, #add-user-form .form-select');
    inputs.forEach(input => input.classList.remove('is-invalid'));
    const feedbacks = document.querySelectorAll('#add-user-form .invalid-feedback');
    feedbacks.forEach(fb => fb.textContent = '');
}

document.addEventListener('DOMContentLoaded', fetchAndRenderUser);
users