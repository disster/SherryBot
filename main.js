const TeleBot = require('telebot');
const bot = new TeleBot('1125357561:AAFGNZcowSJAKjR-XZ6Pr6Nc9glGl-znTxQ');
const firebase = require('firebase');
///////////////////////////////////////////////////////////////
//                       DATABASE
///////////////////////////////////////////////////////////////

const app = firebase.initializeApp({
  apiKey: "AIzaSyDj1qpNvjnKSeRwRCZeuw-ZDzn8lRqKsQQ",
  authDomain: "sherrybot-c50eb.firebaseapp.com",
  databaseURL: "https://sherrybot-c50eb.firebaseio.com",
  projectId: "sherrybot-c50eb",
  storageBucket: "sherrybot-c50eb.appspot.com",
  messagingSenderId: "510629674250"
});

const ref = firebase.database().ref();
const users = ref.child("users");

function addUser(u_id) {
  if(users.orderByChild("user_id").equalTo(u_id).once("value",snapshot => {
    if (snapshot.exists()){
      console.log("Exists!" + u_id);
      return false;
    }
    console.log("Adding user " + u_id);
    users.push().set({
        user_id: u_id,
        status: false,
        donee_rating: 0,
        donor_rating: 0,
        priority: 0,
        geo: { long: 0.0, lat: 0.0}
      });
    return true;
  }));
}

function setUserStatus(s, u_id){
  console.log("User " + u_id + " status is set to " + s);
  users.orderByChild("user_id").equalTo(u_id).on("child_added", snapshot => {
    //console.log(snapshot.key);
    users.child(snapshot.key).update({status: s});
  });
}

function setUserGeo(u_id, long, lat){
  console.log("User " + u_id + " geo is set!");
  users.orderByChild("user_id").equalTo(u_id).on("child_added", snapshot => {
    //console.log(snapshot.key);
    users.child(snapshot.key).update({geo: { long: long, lat: lat}});
  });
}

function getUserPropertyValue(u_id, val_name) {
  var r = null;
  users.orderByChild("user_id").equalTo(u_id).on("child_added", snapshot => {
    users.child(snapshot.key + '/' + val_name).orderByChild(val_name).once("value", snapshot => {
      console.log("Func ref: " + snapshot.key + " --- Func val: " + snapshot.val());
      r = snapshot.val();
    });
  });

  return r;
}
function setPostsInDb(){
  let parser = require("./parser");
  let posts = parser.getPosts('sharingfood', 500);
  //console.log(posts);
}
///////////////////////////////////////////////////////////////
//                          BOT
///////////////////////////////////////////////////////////////

let lastInlineMsgID = 0;

bot.on("polling_error", (m) => console.log(m));

bot.on(['/start','/role'], msg => {

  let replyMarkup = bot.inlineKeyboard([
    [bot.inlineButton('Я отдаю', {callback: 'donor'})],
    [bot.inlineButton('Я принимаю', {callback: 'donee'})]
  ]);
    addUser(msg.from.id);
    return bot.sendMessage(msg.from.id, 'Здравствуйте, ' + msg.from.first_name + '! Вы отдающая или принимающая сторона?', {replyMarkup});
});

bot.on('callbackQuery', msg => {

    let replyMarkup = null;

    switch (msg.data) {
      case 'donor':
          setUserStatus(true, msg.from.id);
          replyMarkup = bot.keyboard([
            ['Создать объявление','Настройки']
          ], {resize: true});
        break;
      case 'donee':
          setUserStatus(false, msg.from.id);
          replyMarkup = bot.keyboard([
            ['Поиск','Настройки']
          ], {resize: true});
        break;
      default:
    }
    return bot.sendMessage(msg.from.id, 'Готово!', {replyMarkup});
});

bot.on('text', msg => {

  let replyMarkup = null;

  switch (msg.text) {
    case 'Настройки':
      replyMarkup = bot.keyboard([
        [bot.button('location', 'Установить местоположение')],
        ['Сменить роль'],
        ['Назад']
      ], {resize: true});
      return bot.sendMessage(msg.from.id, 'Открываю меню настроек.', {replyMarkup});

    case 'Сменить роль':
      replyMarkup = bot.inlineKeyboard([
        [bot.inlineButton('Я отдаю', {callback: 'donor'})],
        [bot.inlineButton('Я принимаю', {callback: 'donee'})]
      ]);
      return bot.sendMessage(msg.from.id, 'Выбор роли:', {replyMarkup});

    case 'Назад':
      if(getUserPropertyValue(msg.from.id, "status")){
        replyMarkup = bot.keyboard([
          ['Создать объявление','Настройки']
        ], {resize: true});
      } else {
        replyMarkup = bot.keyboard([
          ['Поиск','Настройки']
        ], {resize: true});
      }
      return bot.sendMessage(msg.from.id, 'Возвращаю в главное меню.', {replyMarkup});
    default:
  }
});

bot.on('location', msg => {

  let replyMarkup = null;

  if(getUserPropertyValue(msg.from.id, "status")){
    replyMarkup = bot.keyboard([
      ['Создать объявление','Настройки']
    ], {resize: true});
  } else {
    replyMarkup = bot.keyboard([
      ['Поиск','Настройки']
    ], {resize: true});
  }

  setUserGeo(msg.from.id, msg.location.longitude, msg.location.latitude);

  return bot.sendMessage(msg.from.id, 'Местоположение установлено!', {replyMarkup});
});
//setPostsInDb();
bot.start();

