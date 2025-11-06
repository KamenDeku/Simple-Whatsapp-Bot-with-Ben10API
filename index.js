require('dotenv').config();
require('./api/api.js');

const axios = require('axios');
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const API_URL = 'http://localhost:3000/api';

const client = new Client({
  authStrategy: new LocalAuth(),
});

let loginState = {};
let jwtToken = null;

async function handleLogin(message) {
  const userId = message.from;
  const botMessages = [
    'please write the password',
    'incorrect phone number',
    'incorrect password. try again\n\t `#login`.',
    'successfull log in',
    'authentication error',
  ];

  if (botMessages.includes(message.body.toLowerCase().trim())) {
    return;
  }

  if (!loginState[userId]) {
    loginState[userId] = { step: 'askPhone' };
    return message.reply('Please write the phone number');
  }

  const state = loginState[userId];

  if (state.step === 'askPhone') {
    if (message.body.trim() === process.env.PHONE) {
      state.step = 'askPassword';
      state.phone = message.body.trim();
      return message.reply('Please write the password');
    } else {
      delete loginState[userId];
      return message.reply('Incorrect phone number');
    }
  }

  if (state.step === 'askPassword') {
    if (message.body.trim() === process.env.PASSWORD) {
      try {
        const res = await axios.post(`${API_URL}/login`, {
          phone: state.phone,
          password: message.body.trim(),
        });

        jwtToken = res.data.token;
        delete loginState[userId];

        return message.reply('Successfull log in');
      } catch (error) {
        delete loginState[userId];
        return message.reply('Authentication error');
      }
    } else {
      delete loginState[userId];
      return message.reply('Incorrect password. Try again\n\t `#login`.');
    }
  }
}

async function searchAlien(message, name, headers) {
  try {
    const url = name === 'random'
      ? `${API_URL}/aliens/random`
      : `${API_URL}/aliens/${name}`;

    const response = await axios.get(url, { headers });
    const alien = response.data;
    
    let respuesta =
      "--------------------------------" +
      `\n${alien.name.toUpperCase()}\n` +
      "--------------------------------\n";
    respuesta += `Planet: ${alien.home}\n`;
    respuesta += `Species: ${alien.species}\n`;
    respuesta += `Abilities:\n`;
    alien.abilities.forEach(ability => {
      respuesta += ` • ${ability}\n`;
    });

    const imageResponse = await axios.get(alien.img, { responseType: 'arraybuffer' });
    const base64Image = Buffer.from(imageResponse.data, 'binary').toString('base64');
    const media = new MessageMedia('image/png', base64Image);
    
    await message.reply(respuesta);
    await message.reply(media, undefined, { sendMediaAsSticker: true });
  } catch (error) {
    message.reply('Alien not found');
  }
}

  client.on("qr", (qr) => {
    qrcode.generate(qr, { small: true });
    console.log(
      "--------------------------------" +
      "\nQR code received, scan please!\n" +
      "--------------------------------"
    );
  });

  client.on("ready", () => {
      console.log("Client is ready!");
  });

  client.on('message_create', async (message) => {
    const msg = message.body.toLowerCase();
    const userId = message.from;

    if (msg === '#login') {
      await handleLogin(message);
      return; 
    }

    if (loginState[userId] && msg !== '#login') {
      await handleLogin(message);
      return;
    }

    if ((msg === '#aliens' || msg.startsWith('!') || msg === '!random') && !jwtToken) {
      return message.reply('Log in please with: #login');
    }

    const headers = { Authorization: `Bearer ${jwtToken}` };

    if (msg === "#aliens") {
      try {
        const response = await axios.get(`${API_URL}/aliens`, { headers });
        let respuesta =
          "--------------------------------" +
          "\nOmnitrix Aliens\n" +
          "--------------------------------\n";

        response.data.forEach((alien, index) => {
          respuesta += `${index + 1}. ${alien.name}\n`;
        });
        message.reply(respuesta);
      } catch (error) {
        message.reply('Error fetching aliens.');
      }
    }
    
    else if (msg.startsWith('!')) {
        const name = msg.slice(1).trim().toLowerCase();
        await searchAlien(message, name, headers);
    }

    else if (msg === "!random") {
      await searchAlien(message, 'random', headers);
    }

  });

client.initialize();