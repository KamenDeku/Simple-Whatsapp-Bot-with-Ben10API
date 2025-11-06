const aliens = require('../db/aliens');

const getAllAliens = (req, res) => {
  res.json(aliens);
};

const getAlienByName = (req, res) => {
  const { name } = req.params;
  const alien = aliens.find((a) => a.name.toLowerCase() === name.toLowerCase());

  if (alien) {
    res.json(alien);
  } else {
    res.status(404).json({ message: 'Alien not found' });
  }
};

const getRandomAlien = (req, res) => { 
  const randomIndex = Math.floor(Math.random() * aliens.length);
  const randomAlien = aliens[randomIndex];
  res.json(randomAlien);
};

module.exports = { getAllAliens, getAlienByName, getRandomAlien };
