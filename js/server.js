require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Подключение к MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tutorfind')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Модель пользователя
const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  subscription: { type: Object, default: null }
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);

// Middleware для проверки JWT
const authenticate = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).send('Access denied');

  try {
    const verified = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET || 'your_secret_key');
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).send('Invalid token');
  }
};

// Роуты
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Хеширование пароля
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const user = new User({ name, email, password: hashedPassword });
    await user.save();
    
    // Создание JWT токена
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET || 'your_secret_key');
    
    res.header('Authorization', `Bearer ${token}`).json({ user, token });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) throw new Error('User not found');
    
    // Проверка пароля
    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) throw new Error('Invalid password');
    
    // Создание JWT токена
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET || 'your_secret_key');
    
    res.header('Authorization', `Bearer ${token}`).json({ user, token });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/profile', authenticate, async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  res.json(user);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
document.getElementById('login-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
  
    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
  
      const data = await response.json();
  
      if (response.ok) {
        // Сохраняем токен в localStorage
        localStorage.setItem('jwt', data.token);
        
        // Перенаправляем в профиль
        window.location.href = 'profile.html';
      } else {
        showError(data.error);
      }
    } catch (err) {
      showError('Ошибка соединения с сервером');
    }
  });
  document.getElementById('register-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = {
      name: document.getElementById('name').value,
      email: document.getElementById('email').value,
      password: document.getElementById('password').value
    };
  
    try {
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
  
      const data = await response.json();
  
      if (response.ok) {
        localStorage.setItem('jwt', data.token);
        window.location.href = 'profile.html';
      } else {
        showError(data.error);
      }
    } catch (err) {
      showError('Ошибка соединения с сервером');
    }
  });
  document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('jwt');
    
    if (!token) {
      window.location.href = 'login.html';
      return;
    }
  
    try {
      const response = await fetch('http://localhost:5000/api/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
  
      if (response.ok) {
        const user = await response.json();
        displayUserInfo(user);
      } else {
        localStorage.removeItem('jwt');
        window.location.href = 'login.html';
      }
    } catch (err) {
      console.error('Error:', err);
    }
  });
  
  function displayUserInfo(user) {
    document.getElementById('profile-info').innerHTML = `
      <h2>${user.name}</h2>
      <p>Email: ${user.email}</p>
      ${user.subscription ? `
        <p>Подписка: ${user.subscription.plan} (до ${new Date(user.subscription.expiry).toLocaleDateString()})</p>
      ` : '<p>Нет активной подписки</p>'}
    `;
  }