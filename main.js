const TeleBot = require('telebot');
const bot = new TeleBot('1125357561:AAFGNZcowSJAKjR-XZ6Pr6Nc9glGl-znTxQ');
bot.on('text', (msg) => msg.reply.text(msg.text));
bot.on(['/start', '/hello'], (msg) => msg.reply.text('Hi, '));
bot.start();
