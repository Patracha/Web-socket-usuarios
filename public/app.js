let socket;
let token;
let users = {};

// Registro de usuario
document.getElementById('register-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const username = document.getElementById('register-username').value;
  const password = document.getElementById('register-password').value;
  try {
    const response = await fetch('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await response.json();
    alert(data.message);
  } catch (error) {
    console.error('Error registering user:', error);
    alert('Error registering user');
  }
});

// Login de usuario
document.getElementById('login-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const username = document.getElementById('login-username').value;
  const password = document.getElementById('login-password').value;
  try {
    const response = await fetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await response.json();
    if (data.token) {
      token = data.token;
      localStorage.setItem('token', token);
      localStorage.setItem('username', username);
      document.getElementById('auth-container').classList.add('hidden');
      document.getElementById('app-container').classList.remove('hidden');
      document.getElementById('user-name').textContent = username;
      initializeSocket(username);
    } else {
      alert(data.message);
    }
  } catch (error) {
    console.error('Error logging in:', error);
    alert('Error logging in');
  }
});

// Verificar el token al cargar la página
window.addEventListener('load', () => {
  token = localStorage.getItem('token');
  const username = localStorage.getItem('username');
  if (token && username) {
    verifyToken(token).then(isValid => {
      if (isValid) {
        document.getElementById('auth-container').classList.add('hidden');
        document.getElementById('app-container').classList.remove('hidden');
        document.getElementById('user-name').textContent = username;
        initializeSocket(username);
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
      }
    }).catch(error => {
      console.error('Error verifying token:', error);
    });
  }
});

async function verifyToken(token) {
  try {
    const response = await fetch('/auth/verifyToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    });
    const data = await response.json();
    return data.isValid;
  } catch (error) {
    console.error('Error verifying token:', error);
    return false;
  }
}

function initializeSocket(username) {
  console.log('Initializing socket with username:', username);
  socket = io({
    auth: { token }
  });

  const canvas = document.getElementById('officeCanvas');
  const ctx = canvas.getContext('2d');

  function resizeCanvas() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  const user = {
    id: socket.id,
    name: username,
    avatar: '🧑',
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    color: '#' + Math.floor(Math.random() * 16777215).toString(16),
  };

  users[socket.id] = user;

  function drawAvatar(user) {
    ctx.fillStyle = user.color;
    ctx.beginPath();
    ctx.arc(user.x, user.y, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = '30px Arial';
    ctx.fillStyle = '#000';
    ctx.fillText(user.avatar, user.x - 6, user.y + 4);
  }

  function drawAllAvatars() {
    console.log('Drawing all avatars:', users);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const id in users) {
      drawAvatar(users[id]);
    }
  }

  socket.on('connect', () => {
    console.log('Socket connected:', socket.id);
    user.id = socket.id;
    users[user.id] = user;
    drawAllAvatars();
    socket.emit('newUser', user);
  });

  socket.on('initUsers', (initUsers) => {
    console.log('Initializing users:', initUsers);
    users = initUsers;
    drawAllAvatars();
    updateUserList();
  });

  socket.on('newUser', (newUser) => {
    console.log('New user connected:', newUser);
    users[newUser.id] = newUser;
    drawAllAvatars();
    updateUserList();
  });

  socket.on('moveAvatar', (data) => {
    console.log('Avatar moved:', data);
    users[data.id] = data;
    drawAllAvatars();
  });

  socket.on('userDisconnected', (id) => {
    console.log('User disconnected:', id);
    delete users[id];
    drawAllAvatars();
    updateUserList();
  });

  document.addEventListener('keydown', (event) => {
    const step = 5;
    switch (event.key) {
      case 'ArrowUp':
        user.y -= step;
        break;
      case 'ArrowDown':
        user.y += step;
        break;
      case 'ArrowLeft':
        user.x -= step;
        break;
      case 'ArrowRight':
        user.x += step;
        break;
    }
    drawAllAvatars();
    socket.emit('moveAvatar', user);
  });

  document.getElementById('change-avatar').addEventListener('click', () => {
    const avatars = ['🧑', '👩', '👨', '🧔', '👵', '👴', '👶', '👧', '👦'];
    user.avatar = avatars[Math.floor(Math.random() * avatars.length)];
    drawAllAvatars();
    socket.emit('moveAvatar', user);
  });

  document.getElementById('logout').addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    location.reload();
  });

  // Enviar mensaje de chat
  document.getElementById('chatInput').addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
      const message = event.target.value;
      console.log('Sending chat message:', message);
      socket.emit('chatMessage', { user: username, message });
      event.target.value = '';
    }
  });

  // Recibir mensaje de chat
  socket.on('chatMessage', (data) => {
    console.log('Chat message received:', data);
    const messageElement = document.createElement('div');
    messageElement.textContent = `${data.user}: ${data.message}`;
    document.getElementById('messages').appendChild(messageElement);
  });

  function updateUserList() {
    console.log('Updating user list:', users);
    const userList = document.getElementById('user-list');
    userList.innerHTML = '';
    for (const id in users) {
      const userItem = document.createElement('li');
      userItem.textContent = users[id].name;
      userList.appendChild(userItem);
    }
  }
}