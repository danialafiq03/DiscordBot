const Discord = require("discord.js");
const config = require("./config.json");
const intents = new Discord.Intents(32767);
const bot = new Discord.Client({ intents });
const { Player } = require("discord-player");
const { channel } = require("diagnostics_channel");
const { MessageEmbed } = require('discord.js');
const { disconnect } = require("process");
const player = new Player(bot);
bot.player = player;

var mysql = require('mysql');

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "@$PJ_Pr0j3ct",
    database: "discordbot"
  });
  
  con.connect(function(err) {
    if (err) throw err;
    console.log("MySQL Connected!");
});
  
bot.login(config.token);

bot.on("ready", bot =>{
    console.log("Bot is online!")
})

bot.on("message", async message => {
    if (message.author.bot) return;
    const prefix = config.prefix;
    const channel = message.channel;
    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    const queue = player.createQueue(message.guild, {
        metadata: message
    });
    
    if (command === 'help') {
        const exampleEmbed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle('All Commands')
            .setURL('https://discord.js.org/')
            .setAuthor('Yotsuba Nakano', 'https://i.pinimg.com/1200x/1c/50/d8/1c50d89226c49e061889ca6c7da110b1.jpg', 'https://discord.js.org')
            .setDescription('A list of all commands')
            .setThumbnail('https://i.pinimg.com/1200x/1c/50/d8/1c50d89226c49e061889ca6c7da110b1.jpg')
            .addFields(
                { name: '**!connect**', value: 'Connects to voice channel' },
                { name: '**!play**', value: 'Plays tracks from queue' },
                { name: '**!disconnect**', value: 'Disconnects from voice channel' },
                { name: '**!queue**', value: 'Lists all tracks in queue' },
                { name: '**!enqueue**', value: 'Adds tracks to queue' },
                { name: '**!coinflip <heads/tails> <amount>**', value: 'Coinflip!' },
                { name: '**!create**', value: 'Creates an account' },
                { name: '**!profile**', value: 'Displays your profile' },
                { name: '**!balance**', value: 'Displays your balance' },
            )
        channel.send({ embeds: [exampleEmbed] });
    }

    else if (command === 'connect' || command === 'c') {
        await queue.connect(message.member.voice.channel);
    }

    else if (command === 'play') {
        queue.play();
    }

    else if (command === 'disconnect' || command === 'dc') {
        queue.destroy(disconnect);
    }

    else if (command === 'queue' || command === 'q') {
        channel.send(queue.toString());
    }

    else if (command === 'enqueue' || command == 'enq') {
        query = args.join(" ");

        const song = await player.search(query, {
            requestedBy: message.author
        });
        queue.addTrack(song.tracks[0]);
        channel.send(`Added **${song.tracks[0].title}** to the queue!`)
    }

    else if (command === 'coinflip') {
        var sql = `SELECT cash FROM accounts where uid = '${message.author.id}'`;
        con.connect(function(err) {
            con.query(sql, function (err, result, fields) {
              if (err) throw err;
              balance = result[0].cash;
              var coin = ['heads', 'tails'];
              var choice = args[0];
              var amount = args[1];
              if (amount > balance) {
                channel.send("You have insufficient balance.");
              }
              else if (coin.includes(choice)){
                  var outcome = coin[Math.floor(Math.random()*2)]
                  if (outcome == 'heads') {
                      img = 'http://www.clker.com/cliparts/7/d/e/0/139362185558690588heads-hi.png'
                  }
                  else {
                      img = 'https://www.nicepng.com/png/full/146-1464848_quarter-tail-png-tails-on-a-coin.png'
                  }
                  if (outcome == choice){
                      const exampleEmbed = new MessageEmbed()
                          .setColor('#0099ff')
                          .setTitle(`The outcome is ${outcome}.`)
                          .setDescription(`You win!\nBalance: **+${amount}**`)
                          .setThumbnail(img);
                      channel.send({ embeds: [exampleEmbed] });
                        var sql = `UPDATE accounts SET cash = cash + ${amount} WHERE uid = '${message.author.id}'`;
                        con.query(sql, function (err, result) {
                        if (err) throw err;
                        console.log(result.affectedRows + " record(s) updated");
                        });
                  }
                  else {
                       const exampleEmbed = new MessageEmbed()
                        .setColor('#0099ff')
                        .setTitle(`The outcome is ${outcome}.`)
                        .setDescription(`You lose!\nBalance: **-${amount}**`)
                        .setThumbnail(img);
                      channel.send({ embeds: [exampleEmbed] });
                        var sql = `UPDATE accounts SET cash = cash - ${amount} WHERE uid = '${message.author.id}'`;
                        con.query(sql, function (err, result) {
                        if (err) throw err;
                        console.log(result.affectedRows + " record(s) updated");
                        });
                  }
              }
              else {
                  channel.send("Enter a valid option (heads/tails).");
              }
            });
        });

    }

    else if (command === 'create') {
        var sql = `INSERT INTO accounts (uid, cash, rolls) VALUES ('${message.author.id}', 1000, 5)`;
        con.query(sql, function (err, result) {
          if (err) throw err;
          console.log("1 record inserted");
        });
        channel.send("Your account has been created!");
    }

    else if (command === 'profile') {
        con.connect(function(err) {
            con.query(`SELECT * FROM accounts WHERE uid = '${message.author.id}'`, function (err, result, fields) {
              if (err) throw err;
              const exampleEmbed = new MessageEmbed()
              .setColor('#0099ff')
              .setTitle('Your Profile')
              .setAuthor(message.author.username, message.author.displayAvatarURL(), message.author.displayAvatarURL())
              .setDescription('Displays all your information')
              .setThumbnail(message.author.displayAvatarURL())
              .addFields(
                  { name: '**UID**', value: message.author.id },
                  { name: '**Cash**', value: result[0].cash.toString() },
                  { name: '**Rolls**', value: result[0].rolls.toString() }
              )
              channel.send({ embeds: [exampleEmbed] });
            });
          });
    }

    else if (command === 'balance' || command === 'bal') {
        var sql = `SELECT cash FROM accounts where uid = '${message.author.id}'`;
        con.connect(function(err) {
            con.query(sql, function (err, result, fields) {
              if (err) throw err;
              channel.send(`Balance: **${result[0].cash}**`);
            });
        });
    }

    else if (command === 'newchar'){
        if (message.author.id == 509034970816315405) {
        const questions = [
            "Enter new character's name",
            "Enter rarity",
            "Enter HP",
            "Enter DMG",
            "Enter avatar link",
            "Enter description"
        ]
        const filter = m => m.author.id === message.author.id;
        
        channel.send(questions[0])
        // Errors: ['time'] treats ending because of the time limit as an error
        channel.awaitMessages({ filter, max: 1, time: 30000, errors: ['time'] })
        .then(collected => {
            var charName = collected.first();
            channel.send(questions[1]);
            channel.awaitMessages({ filter, max: 1, time: 30000, errors: ['time'] })
            .then(collected => {
                var rarity = collected.first();
                channel.send(questions[2]);
                channel.awaitMessages({ filter, max: 1, time: 30000, errors: ['time'] })
                .then(collected => {
                    var hp = collected.first();
                    channel.send(questions[3]);
                    channel.awaitMessages({ filter, max: 1, time: 30000, errors: ['time'] })
                    .then(collected => {
                        var dmg = collected.first();
                        channel.send(questions[4]);
                            channel.awaitMessages({ filter, max: 1, time: 30000, errors: ['time'] })
                            .then(collected => {
                                var avatar = collected.first();
                                channel.send(questions[5])
                                channel.awaitMessages({ filter, max: 1, time: 30000, errors: ['time'] })
                                .then(collected => {
                                    var description = collected.first();
                                    var sql = `INSERT INTO characters (name, rarity, hp, dmg, avatar, description) VALUES ('${charName}', '${rarity}', '${hp}', '${dmg}', '${avatar}', "${description}")`;
                                    con.query(sql, function (err, result) {
                                        if (err) throw err;
                                    });
                                    const exampleEmbed = new MessageEmbed()
                                        .setColor('#ff3333')
                                        .setTitle(charName.toString())
                                        .setURL(avatar.toString())
                                        .setDescription(description.toString())
                                        .addFields(
                                            { name: 'Rarity', value: rarity.toString() },
                                            { name: 'HP', value: hp.toString() },
                                            { name: 'Damage', value: dmg.toString() },
                                        )
                                        .setImage(avatar.toString())

                                    channel.send({ embeds: [exampleEmbed] });
                                    })
                                .catch(collected => console.log(collected));
                                })
                            .catch(collected => console.log(collected));
                        })
                    .catch(collected => console.log(collected));
                    })
                .catch(collected => console.log(collected));
                })
            .catch(collected => console.log(collected));
            })
        .catch(collected => console.log(collected));
        }
        else {
            channel.send("You do not have the permissions for this command.")
        }
    }

    else if (command === 'chars') {
        con.query(`SELECT chars FROM accounts where uid = '${message.author.id}'`, function (err, result1, fields) {
            if (err) throw err;
            charNames = result1[0].chars.split(",");
            for (i = 0; i < charNames.length; i++) {
                console.log(charNames[i]);
                con.query(`SELECT * FROM characters where name = '${charNames[i]}'`, function (err, result2, fields) {
                    if (err) throw err;
                    charName = result2[0].name;
                    rarity = result2[0].rarity;
                    hp = result2[0].hp;
                    dmg = result2[0].dmg;
                    avatar = result2[0].avatar;
                    description = result2[0].description;
                    const exampleEmbed = new MessageEmbed()
                        .setColor('#ff3333')
                        .setTitle(charName.toString())
                        .setURL(avatar.toString())
                        .setDescription(description.toString())
                        .addFields(
                            { name: 'Rarity', value: rarity.toString() },
                            { name: 'HP', value: hp.toString() },
                            { name: 'Damage', value: dmg.toString() },
                        )
                        .setImage(avatar.toString())
                    channel.send({ embeds: [exampleEmbed] });
                });
            }
            // for (i = 0; i < result.length; i++) {
                // charName = result[i].name;
                // rarity = result[i].rarity;
                // hp = result[i].hp;
                // dmg = result[i].dmg;
                // avatar = result[i].avatar;
                // description = result[i].description;
                // const exampleEmbed = new MessageEmbed()
                //     .setColor('#ff3333')
                //     .setTitle(charName.toString())
                //     .setURL(avatar.toString())
                //     .setDescription(description.toString())
                //     .addFields(
                //         { name: 'Rarity', value: rarity.toString() },
                //         { name: 'HP', value: hp.toString() },
                //         { name: 'Damage', value: dmg.toString() },
                //     )
                //     .setImage(avatar.toString())
                // channel.send({ embeds: [exampleEmbed] });
            // }
          });
    }

    else if (command === 'roll') {

        function printChar(chars){
            char = chars[Math.floor(Math.random()*chars.length)];
            var sql = `SELECT * FROM characters WHERE name = '${char}'`
            con.query(sql, function (err, result, fields) {
                if (err) throw err;
                charName = result[0].name;
                rarity = result[0].rarity;
                hp = result[0].hp;
                dmg = result[0].dmg;
                avatar = result[0].avatar;
                description = result[0].description;
                const exampleEmbed = new MessageEmbed()
                    .setColor('#ff3333')
                    .setTitle(charName.toString())
                    .setURL(avatar.toString())
                    .setDescription(description.toString())
                    .addFields(
                        { name: 'Rarity', value: rarity.toString() },
                        { name: 'HP', value: hp.toString() },
                        { name: 'Damage', value: dmg.toString() },
                    )
                    .setImage(avatar.toString())
                channel.send({ embeds: [exampleEmbed] });
                return charName;
              });
              
        }

        con.query(`SELECT * FROM accounts where uid = ${message.author.id}`, function (err, result, fields) {
            if (err) throw err;
            rollsNo = result[0].rolls;
            if (rollsNo > 0) {
                num = Math.floor((Math.random()*100));
                if (num > 96) {
                    let chars = ['Villain Deku', 'Naruto Uzumaki', 'Izuku Midoriya']
                    channel.send("You got a 10⭐ character!");
                    printChar(chars);

                }
                else if (num > 90) {
                    let chars = ['Sung Jin-Woo', 'Zero Two'];
                    channel.send("You got a 9⭐ character!");
                    printChar(chars);
                }
                else if (num > 92){
                    let chars = ['Shoto Todoroki'];
                    channel.send("You got a 8⭐ character!");
                    printChar(chars);
                }
                else if (num > 82){
                    let chars = ['Shinoa Hiiragi', 'Yotsuba Nakano']
                    channel.send("You got a 7⭐ character!");
                    printChar(chars);
                }
                else if (num > 68){
                    let chars = ['Nao Tomori', 'Yuu Otosaka'];
                    channel.send("You got a 6⭐ character!");
                    printChar(chars);
                }
                else if (num > 50){
                    let chars = ['Sayu Ogiwara']
                    channel.send("You got a 5⭐ character!");
                    printChar(chars);
                }
                else if (num > 36){
                    let chars = ['Oreki Hotouro'];
                    channel.send("You got a 4⭐ character!");
                    printChar(chars);
                }
                else if (num > 20){
                    let chars = ['Ichigo'];
                    channel.send("You got a 3⭐ character!");
                    printChar(chars);
                }
                else if (num > 12){
                    let chars = ['Aqua']
                    channel.send("You got a 2⭐ character!");
                    char = printChar(chars);
                }
                else {
                    let chars = ['Ugly Bastard']
                    channel.send("You got a 1⭐ character!");
                    printChar(chars);
                }
                var sql = `UPDATE accounts SET rolls = rolls - 1 WHERE uid = ${message.author.id}`;
                con.query(sql, function (err, result) {
                    if (err) throw err;
                });
                var sql2 = `UPDATE accounts SET chars = CONCAT(chars, ',', '${char}') WHERE uid = ${message.author.id}`;
                con.query(sql2, function (err, result) {
                    if (err) throw err;
                });
            }
            else {
                channel.send("You do not have any rolls. Do !buy <amount> to buy rolls.");
                return;
            }
          });
        
        
    } //havent saved char obtained to db

    else if (command === 'buy') {
        var rolls = args[0];
        var amount = rolls * 100;
        var sql = `SELECT cash FROM accounts where uid = '${message.author.id}'`;
        con.query(sql, function (err, result, fields) {
            if (err) throw err;
            balance = result[0].cash;
            if (amount > balance) {
              channel.send("You have insufficient balance.");
            }
            else {
              var newBalance = balance - amount;
              con.query(`UPDATE accounts SET cash = ${newBalance}, rolls = rolls + ${rolls} WHERE uid = '${message.author.id}'`, function (err, result, fields) {
                  if (err) throw err;
                  channel.send(`You bought ${rolls} rolls!\nBalance: **${newBalance}**`);
              });
            }
        });
    }
});

player.on("trackStart", (queue, track) => {
    const channel = queue.metadata.channel; // queue.metadata is your "message" object
    channel.send(`🎶 | Started playing **${track.title}**`);
});
