require('dotenv').config();
require('./api/api.js');
require('dotenv').config();
const axios = require('axios');
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const PORT = process.env.PORT || 3000;
const API_URL = `http://localhost:${PORT}/api`;

const userSessions = new Map();
const userStates = new Map();

const botMessages = [];

const client = new Client({
  authStrategy: new LocalAuth(),
});

function replyAndTrack(message, content, chatId, options = {}) {
  // Si el contenido es texto, lo agregamos al registro
  if (typeof content === 'string') {
    botMessages.push(content.toLowerCase());
  }

  // Enviamos el mensaje (texto o media)
  return message.reply(content, chatId, options);
}


async function searchAlien(message, name, token) {
  try {
    const url = name === 'random'
      ? `${API_URL}/aliens/random`
      : `${API_URL}/aliens/${name}`;
    
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` }
    });
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
    
    await replyAndTrack(message, respuesta);
    await replyAndTrack(message, media, undefined, { sendMediaAsSticker: true });
  } catch (error) {
    if (error.response && error.response.status === 401) {
      replyAndTrack(message,'You need to login first. Use #login');
    } else {
      replyAndTrack(message,'Alien not found');
    }
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

    if (botMessages.includes(msg)) {
      botMessages.splice(botMessages.indexOf(msg), 1);
      return;
    }

    const phone = message.from;
    const userState = userStates.get(phone);

    if (userState && userState.action === '#register' && userState.waitingPassword) {
      const password = message.body;
      
      try {
        const response = await axios.post(`${API_URL}/auth/register`, {
          phone: userState.phone,
          password: password
        });
        
        replyAndTrack(message,'Registration successful! Now use #login to access the bot.');
        userStates.delete(phone);
      } catch (error) {
        if (error.response && error.response.data) {
          replyAndTrack(message,`${error.response.data.message}`);
        } else {
          replyAndTrack(message,'Registration failed. Please try again.');
        }
        userStates.delete(phone);
      }
      return;
    }
  
    if (userState && userState.action === '#login' && userState.waitingPassword) {
      const password = message.body;
      
      try {
        const response = await axios.post(`${API_URL}/auth/login`, {
          phone: userState.phone,
          password: password
        });
        
        userSessions.set(phone, response.data.token);
        replyAndTrack(message,
          '------------------\n' +
          'Login successful!\n' +
          '------------------\n' +
          'Commands:' +
          '\n#aliens' +
          '\n!<alien_name>' +
          '\n!random' +
          '\n#logout'
        );
        userStates.delete(phone);
      } catch (error) {
        if (error.response && error.response.data) {
          replyAndTrack(message,`${error.response.data.message}`);
        } else {
          replyAndTrack(message,'Login failed. Please try again.');
        }
        userStates.delete(phone);
      }
      return;
    }
  
    if (msg === "#register") {
      const phoneNumber = phone.replace('@c.us', '');
      
      userStates.set(phone, {
        action: '#register',
        phone: phoneNumber,
        waitingPassword: true
      });
      
      replyAndTrack(message, `Registration\n\n- User: ${phoneNumber}\n\nPlease enter your password:`);
      return;
    }
  
    if (msg === "#login") {
      const phoneNumber = phone.replace('@c.us', '');
      
      userStates.set(phone, {
        action: '#login',
        phone: phoneNumber,
        waitingPassword: true
      });
      
      replyAndTrack(message, `- User: ${phoneNumber}\n\nPlease enter your password:`);
      return;
    }
  
    if (msg === "#logout") {
      if (userSessions.has(phone)) {
        userSessions.delete(phone);
        replyAndTrack(message,'Logout successful!');
      } else {
        replyAndTrack(message,'You are not logged in.');
      }
      return;
    }
  
    const token = userSessions.get(phone);


    //---------------------------------------------
    if (msg === "#aliens") {

      if (!token) {
        replyAndTrack(message,'User not logged in. Use #login');
        return;
      }

      try {
        const response = await axios.get(`${API_URL}/aliens`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        let respuesta =
          "--------------------------------" +
          "\nOmnitrix Aliens\n" +
          "--------------------------------\n";

        response.data.forEach((alien, index) => {
          respuesta += `${index + 1}. ${alien.name}\n`;
        });
        replyAndTrack(message, respuesta);
      } catch (error) {
        if (error.response && error.response.status === 401) {
          replyAndTrack(message, 'Session expired. Please login again with #login');
          userSessions.delete(phone);
        } else {
          replyAndTrack(message, 'Error fetching aliens.');
        }
      }
    }
    
    else if (msg.startsWith('!') && msg !== "!random") {
      if (!token) {
        replyAndTrack(message, 'You need to login first. Use #login');
        return;
      }
      const name = msg.slice(1).trim().toLowerCase();
      await searchAlien(message, name, token);
    }
    
    else if (msg === "!random") {
      if (!token) {
        replyAndTrack(message, 'You need to login first. Use #login');
        return;
      }
      await searchAlien(message, 'random', token);
    }
});

client.initialize();