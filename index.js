const Discord = require('discord.js')
const bot = new Discord.Client()
const config = require('./config.json')
const fs = require('fs');
const format = require('node.date-time');
const logInterval = 6000;
const intervalLogText = `The bot works, but there are no messages on any bot server`

bot.on('ready', () => {
	let logtext = "";
	logtext = `Logged in as ${bot.user.tag}`;
	console.log(logtext);
	log(logtext, "info");
})

bot.on('message', msg => {
  logtext = `${msg.channel.name}(${msg.guild.name}) : ${msg.author.tag} : ${msg.content}`;
  console.log(`\n\n${logtext}`);
  log(logtext, "msg");
});
function log(logText, logType) {
  function logTime(){
    return new Date().format('Y-MM-dd HH:mm:SS');
  };
  let logPrefix = "";
  switch (logType){
	case "msg":
    logPrefix = "[MESSAGE]";
    break;
      
	case "warn":
    logPrefix = "[WARN]";
    break;
        
	case "err":
    logPrefix = "[ERROR]";
    break;
      
	case "info":
    logPrefix = "[INFO]";
    break;
  }
  logPrefix += " ";
  let logResult = `(${bot.user.tag}): ${logTime()} ${logPrefix} ${logText}`
  
  fs.appendFile(`recent.log`, `${logResult}\n`, () =>{
    // setTimeout(log, logInterval, intervalLogText, "info");
  });
};

require('./private-rooms.js')(bot)
bot.login(config.token)