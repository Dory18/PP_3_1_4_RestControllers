const CURRENT_USER_API = '/api/user';

async function fetchAndRenderUser() {
    try {
        const response = await fetch(CURRENT_USER_API);

        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }

        const user = await response.json();

        document.getElementById('user-id').textContent = user.id;
        document.getElementById('user-firstName').textContent = user.firstName;
        document.getElementById('user-lastName').textContent = user.lastName;
        document.getElementById('user-age').textContent = user.age;
        document.getElementById('user-email').textContent = user.email;

        if (user.roles && user.roles.length > 0) {
            const rolesString = user.roles.map(role => typeof role === 'object' ? role.name : role).join(', ');
            document.getElementById('user-roles').textContent = rolesString;
        } else {
            document.getElementById('user-roles').textContent = 'No roles';
        }

    } catch (error) {
        console.error('Не удалось загрузить данные пользователя:', error);
        document.getElementById('user-id').textContent = 'Ошибка загрузки';
    }
}

document.addEventListener('DOMContentLoaded', fetchAndRenderUser);