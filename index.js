require('./api/api.js');

const axios = require('axios');
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const API_URL = 'http://localhost:3000/api';

const client = new Client({
  authStrategy: new LocalAuth(),
});

async function searchAlien(message, name) {
  try {
    const url = name === 'random'
      ? `${API_URL}/aliens/random`
      : `${API_URL}/aliens/${name}`;
    
    const response = await axios.get(url);
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
    
    await message.reply(respuesta);
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
    const msg = message.body.toLowerCase()

    if (msg === "ping") {
      message.reply("pong");
    }
    
    else if (msg === "aliens") {
      try {
        const response = await axios.get(`${API_URL}/aliens`);
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
        await searchAlien(message, name);
    }

    else if (msg === "!random") {
      await searchAlien(message, 'random');
    }

  });

client.initialize();