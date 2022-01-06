const Discord = require("discord.js");
const config = require("./config.json");
const intents = new Discord.Intents(32767);
const bot = new Discord.Client({ intents });

const { Player } = require("discord-player");
const { channel } = require("diagnostics_channel");
const { disconnect } = require("process");
const player = new Player(bot);
bot.player = player;

bot.login(config.token);

bot.on("ready", bot =>{
    console.log("Bot is online!")
})

bot.on("message", async message => {
    const prefix = config.prefix;

    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    const queue = player.createQueue(message.guild, {
        metadata: message
    });

    if (command === 'play') {
        
        query = args[0];
        if (query == null){
            await queue.connect(message.member.voice.channel);
            queue.play();
        }
        else {
            await queue.connect(message.member.voice.channel);
            const song = await player.search(query, {
                requestedBy: message.author
            });
            queue.addTrack(song.tracks[0]);
            queue.play();
        }
    }

    if (command === 'pause') {
        queue.pause();
    }

    if (command === 'disconnect') {
        queue.destroy(disconnect);
    }

    if (command === 'enqueue') {
        query = args[0];

        await queue.connect(message.member.voice.channel);
        const song = await player.search(query, {
            requestedBy: message.author
        });
        queue.addTrack(song.tracks[0]);
        console.log(queue.tracks);
    }
});

player.on("trackStart", (queue, track) => {
    const channel = queue.metadata.channel; // queue.metadata is your "message" object
    channel.send(`🎶 | Started playing **${track.title}**`);
});