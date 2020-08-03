require('console-stamp')(console, '[HH:MM:ss.l]');

const fs = require('fs');
const Discord = require('discord.js');
const { prefix, token, channelId } = require('./config.json');


const client = new Discord.Client();
client.commands = new Discord.Collection();


const commandFiles = fs.readdirSync('./commands').filter(
    file => file.endsWith('.js')
);

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

client.once('ready', () => {
    console.log('Ready!');

    var channel = client.channels.cache.get(channelId)
    var command = client.commands.get('news');
    var message = new Discord.Message(client, {}, channel)
    //channel.send('I know I have a stuffed animal body, but I\'ll work really hard!');
    try {
        command.execute(message);
    } catch (error) {
        console.error(error);
    }

    var CronJob = require('cron').CronJob;
    var job = new CronJob('0 * * * *', function() {
        try {
            console.log('go cronjob go cronjob go');
            command.execute(message);
        } catch (error) {
            console.error(error);
        }
    }, null, true, 'America/Los_Angeles');
    job.start();
});

client.on('message', message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).split(' ');
    const commandName = args.shift().toLowerCase();

    if (!client.commands.has(commandName)) return;

    const command = client.commands.get(commandName);

    try {
        command.execute(message, args);
    } catch (error) {
        console.error(error);
        message.reply('uh oh. that didn\'t work');
    }
});

process.on('unhandledRejection', error => {
    console.error('Unhandled promise rejection:', error);
});

client.login(token);
