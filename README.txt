WHATSAPP BOT - ALIEN FINDER
===========================

INICIO:
1. Instala dependencias:
   npm install

2. Crea un archivo .env con:
   PORT=3000

3. Inicia el bot:
   npm start

4. Escanea el código QR que aparece en consola con tu WhatsApp
   (Menú → Dispositivos vinculados → Vincular dispositivo)

5. Cuando diga “Client is ready!”, el bot ya está funcionando.


DOCUMENTACIÓN:
https://wwebjs.dev/guide/creating-your-bot/mentions.html#sending-messages-with-user-mentions


COMANDOS:
---------

#register
  → Registra tu número de teléfono en el sistema.
  → El bot te pedirá una contraseña.

#login
  → Inicia sesión con tu número y contraseña.
  → Necesario para usar los comandos protegidos.

#logout
  → Cierra tu sesión actual.

#aliens
  → Muestra la lista completa de aliens disponibles.

!nombre
  → Muestra información detallada del alien indicado.
    Ejemplo: !heatblast

!random
  → Muestra información e imagen de un alien aleatorio.


NOTAS:
------
- Debes usar #login antes de usar #aliens, !nombre o !random.

