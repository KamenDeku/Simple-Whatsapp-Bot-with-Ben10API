const express = require('express');
const dotenv = require('dotenv');
const { getAllAliens, getAlienByName, getRandomAlien } = require('./controller/aliensController');
const { login, verifyToken } = require('./controller/authController');
const authToken = require('./middleware/auth');

dotenv.config();

const app = express();
app.use(express.json());

app.post('/api/login', login);
app.get('/api/verify', verifyToken);

app.get('/api/aliens', authToken, getAllAliens);
app.get('/api/aliens/random', authToken, getRandomAlien);
app.get('/api/aliens/:name', authToken, getAlienByName);

app.get('/', (req, res) => {
  res.send('Ben 10 Aliens API is running');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API running at:http://localhost:${PORT}`);
});

module.exports = app;