const express = require('express');
const { getAllAliens, getAlienByName, getRandomAlien } = require('./controller/aliensController');

const app = express();

app.use(express.json());

app.get('/api/aliens', getAllAliens);
app.get('/api/aliens/random', getRandomAlien);
app.get('/api/aliens/:name', getAlienByName);

app.get('/', (req, res) => {
  res.send('Ben 10 Aliens API is running');
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`API running at:http://localhost:${PORT}`);
});

module.exports = app;