require('dotenv').config();
const express = require('express');
const { getAllAliens, getAlienByName, getRandomAlien } = require('./controller/aliensController.js');

const authRoutes = require('./auth/auth.routes.js');
const auth = require('./auth/middleware/auth.Middleware.js');

const app = express();
app.use(express.json());

app.use('/api/auth', authRoutes);

app.get('/api/aliens', auth, getAllAliens);
app.get('/api/aliens/random', auth, getRandomAlien);
app.get('/api/aliens/:name', auth, getAlienByName);

app.get('/', (req, res) => {
  res.send('Ben 10 Aliens API is running');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API running at:http://localhost:${PORT}`);
});

module.exports = app;