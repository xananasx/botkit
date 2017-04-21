/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
           ______     ______     ______   __  __     __     ______
          /\  == \   /\  __ \   /\__  _\ /\ \/ /    /\ \   /\__  _\
          \ \  __<   \ \ \/\ \  \/_/\ \/ \ \  _"-.  \ \ \  \/_/\ \/
           \ \_____\  \ \_____\    \ \_\  \ \_\ \_\  \ \_\    \ \_\
            \/_____/   \/_____/     \/_/   \/_/\/_/   \/_/     \/_/


This is a sample Slack bot built with Botkit.

This bot demonstrates many of the core features of Botkit:

* Connect to Slack using the real time API
* Receive messages based on "spoken" patterns
* Reply to messages
* Use the conversation system to ask questions
* Use the built in storage system to store and retrieve information
  for a user.

# RUN THE BOT:

  Get a Bot token from Slack:

    -> http://my.slack.com/services/new/bot

  Run your bot from the command line:

    token=<MY TOKEN> node slack_bot.js

# USE THE BOT:

  Find your bot inside Slack to send it a direct message.

  Say: "Hello"

  The bot will reply "Hello!"

  Say: "who are you?"

  The bot will tell you its name, where it is running, and for how long.

  Say: "Call me <nickname>"

  Tell the bot your nickname. Now you are friends.

  Say: "who am I?"

  The bot will tell you your nickname, if it knows one for you.

  Say: "shutdown"

  The bot will ask if you are sure, and then shut itself down.

  Make sure to invite your bot into other channels using /invite @<my bot>!

# EXTEND THE BOT:

  Botkit has many features for building cool and useful bots!

  Read all about it here:

    -> http://howdy.ai/botkit

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/


if (!process.env.token || !process.env.token_weather) {
    console.log('Error: Specify token in environment');
    process.exit(1);
}

var Botkit = require('./lib/Botkit.js');
var os = require('os');
var JapaneseHolidays = require('japanese-holidays');

var controller = Botkit.slackbot({
    debug: true,
});

var bot = controller.spawn({
    token: process.env.token
}).startRTM(function(err,bot,payload) {
  // 初期処理
  if (err) {
    throw new Error('Could not connect to Slack');
  }
  new CronJob({
        cronTime: '00 30 18 * * 1-5',
        onTick: function() {
                var today = new Date();
                var holiday = JapaneseHolidays.isHoliday(today);

                if (holiday) {
                  bot.say({
                          channel: '#engineer',
                          text: '休日出勤つらかったけど帰るでほるす:hankey:'
                  });
                } else {
                  bot.say({
                          channel: '#engineer',
                          text: '帰るでほるす:hankey:'
                  });
                }
        },
        start: true,
        timeZone: 'Asia/Tokyo'
  });
/*
  new CronJob({
        cronTime: '00 30 9 * * 1-5',
        onTick: function() {
                var today = new Date();
                var holiday = JapaneseHolidays.isHoliday(today);

                if (! holiday) { //平日のみ投稿する
                  bot.say({
                          channel: '#random',
                          text: '朝ZOONEの時間です'
                  });
                }
        },
        start: true,
        timeZone: 'Asia/Tokyo'
  });
  new CronJob({
        cronTime: '00 30 12 * * 1-5',
        onTick: function() {
                var today = new Date();
                var holiday = JapaneseHolidays.isHoliday(today);

                if (! holiday) { //平日のみ投稿する
                  bot.say({
                          channel: '#random',
                          text: 'そろそろお昼のZOONEの時間です'
                  });
                }
        },
        start: true,
        timeZone: 'Asia/Tokyo'
  });
  new CronJob({
        cronTime: '00 30 18 * * 1-5',
        onTick: function() {
                var today = new Date();
                var holiday = JapaneseHolidays.isHoliday(today);

                if (! holiday) { //平日のみ投稿する
                  bot.say({
                          channel: '#random',
                          text: '帰りもZOONEに投稿します'
                  });
                }
        },
        start: true,
        timeZone: 'Asia/Tokyo'
  });
 */
});

var yaml = require('js-yaml');
var fs = require('fs');

var CronJob = require('cron').CronJob;

var http = require('http')

controller.hears(['^mygif$'], 'direct_message,direct_mention,mention', function(bot, message) {

  // sota: U0L1Q258A
  // shiraken: U0HQE5Z4K
  // anna: U0L1Q42MQ
  // matsuo: U0L1PGKED

  switch (message.user) {
    case 'U0L1Q42MQ':
      bot.reply(message,'http://media.giphy.com/media/RIoZ9zuRrEwQo/giphy-tumblr.gif');
      break;

    case 'U0L1Q258A':
      bot.reply(message,'https://media.giphy.com/media/yswTMT947Ebe0/giphy-tumblr.gif');
      break;

    default:
      bot.reply(message,'好きなgifをcommitしてくれ:hankey:');
      break;
  }
});

controller.hears(['(.*)の天気', '(.*) 天気', '天気 (.*)'], 'direct_message,direct_mention,mention', function(bot,message) {
  var city = message.match[1];

  console.log("city: "+city);
  if(city==='東京'){
    bot.replyWithTyping(message,"まだ東京で消耗してるんですか？");
    return;
  }
  if(undefined === city || '' === city || null === city) {
    bot.replyWithTyping(message,"そんなCity無いよ");
  } else {
    var options = {
      protocol : 'http:',
      host : 'api.openweathermap.org',
      path : '/data/2.5/weather?q='+city+'&appid='+process.env.token_weather,
      port : 80,
      method : 'GET'
    }

    var request = http.request(options, function(response){
      var body = "";
      response.on('data', function(data) {
        body += data;
        try{
          weather = JSON.parse(body);
        }catch(e){
          console.log(e)
          bot.replyWithTyping(message, `${city}じゃわかりません`);
          return;
        }


        if (weather.weather === undefined){
          bot.replyWithTyping(message, `${city}じゃわかりません`);
          return;
        }

        bot.replyWithTyping(message, `${city}の天気は${weather.weather[0].main}です`);
        bot.replyWithTyping(message, `場所はだいたい\nhttp://maps.googleapis.com/maps/api/staticmap?center=${weather.coord.lat},${weather.coord.lon}&zoom=15&format=png&sensor=false&size=640x480&maptype=roadmap&markers=${weather.coord.lat},${weather.coord.lon} \nこのへんです`);

        var reaction = "";
        switch(weather.weather[0].main)
        {
          case "Clear":
          reaction = "mostly_sunny";
          bot.replyWithTyping(message, `:${reaction}:`);
          bot.replyWithTyping(message,"良い天気みたいです");
          break;
          case "Clouds":
          case "Cloud":
          reaction = "cloud";
          bot.replyWithTyping(message, `:${reaction}:`);
          bot.replyWithTyping(message,"くもってるみたいです");
          break;
          case "Smoke":
          reaction = "smoking";
          bot.replyWithTyping(message, `:${reaction}:`);
          break;
          case "Rain":
          reaction = "rain_cloud";
          bot.replyWithTyping(message, `:${reaction}:`);
          bot.replyWithTyping(message, `${city}では今傘が必要みたいですよ`);
          break;
          case "Thunderstorm":
          reaction = "thunder_cloud_and_rain";
          bot.replyWithTyping(message, `:${reaction}:`);
          break;
        }
        bot.api.reactions.add({
          timestamp: message.ts,
          channel: message.channel,
          name: reaction,
        }, function(err, res) {
          if (err) {
            bot.botkit.log('Failed to add emoji reaction :(', err);
          }
        });
      });
      response.on('end', function() {
        /*res.send(JSON.parse(body));*/
      });
    });

    request.on('error', function(e) {
      console.log('Problem with request: ' + e.message);
      bot.replyWithTyping(message, "sorry, couldn't find weather info for city " + city);
    });
    request.end();
  }
});

controller.hears(['^lgtm$'], 'direct_message,direct_mention,mention', function(bot, message) {
  var options = {
    url: 'http://www.lgtm.in/g',
    method: 'GET',
    rejectUnauthorized: false,
    json: true
  };
  var request = require('request');
  request(options, function(error, response, json){
//      console.log("lgtm response",response);
//      console.log("lgtm json",json);
    try {
      bot.replyWithTyping(message, `${json.imageUrl}`);
    } catch (e) {
      bot.replyWithTyping(message, "探すの失敗しちゃいました");
      console.log("lgtm error",e);
    }

  });
});

controller.hears(['ノムリッシュ (.*)'], 'direct_message,direct_mention,mention', function(bot, message) {
  var text = message.match[1];

  var options = {
    headers: {
      "Cookie": "PHPSESSID=3ep1tb6lt1le5qeml82p7j5rh6"
    },
    url: 'http://racing-lagoon.info/nomu/translate.php',
    method: 'POST',
    form: {
      level: 3,
      before: text,
      options: "nochk",
      transbtn: true,
      token: "aca4223a9f837dcc8f2637e571ebd7a4511558dd38d6e4fc52804b8dae3f1322"
    }
  };
  var request = require('request');
  request(options, function(error, response,body){
    var cheerio = require("cheerio");
    var $ = cheerio.load(body);
    var resultText = $('textarea[name=after1]').val();


    try {
      bot.replyWithTyping(message, `${resultText}`);
    } catch (e) {
      bot.replyWithTyping(message, "ノムリッシュ失敗しました");
      console.log("ノムリッシュ error",e);
    }

  });
});

controller.hears(['ノムリッシュニュース'], 'direct_message,direct_mention,mention', function(bot, message) {
  var comment = message.match[1];
  controller.storage.users.get(message.user, function(err, user) {
    if (!user) {
      user = {
        id: message.user,
      };
    }

    var headers = {
      'Content-Type':'application/json',
      'Accept': 'application/json'
    }
    var json = {
      "utt": "ニュース",
      "place": "福岡",
    }

    if (user.name) {
      json.nickname = user.name;
    }
    if (user.context) {
      json.context = user.context;
    }

    var options = {
      url: 'https://api.apigw.smt.docomo.ne.jp/dialogue/v1/dialogue?APIKEY='+process.env.token_kaiwa,
      method: 'POST',
      headers: headers,
      json : json
    };

    console.log("発言:", json);
    var request = require('request');
    request(options, function(error, response, json){
      try {
        var text = json.utt;

        console.log(text);

        var options = {
          headers: {
            "Cookie": "PHPSESSID=3ep1tb6lt1le5qeml82p7j5rh6"
          },
          url: 'http://racing-lagoon.info/nomu/translate.php',
          method: 'POST',
          form: {
            level: 3,
            before: text,
            options: "nochk",
            transbtn: true,
            token: "aca4223a9f837dcc8f2637e571ebd7a4511558dd38d6e4fc52804b8dae3f1322"
          }
        };
        var request = require('request');
        request(options, function(error, response,body){
          var cheerio = require("cheerio");
          var $ = cheerio.load(body);
          var resultText = $('textarea[name=after1]').val();


          try {
            bot.replyWithTyping(message, `${resultText}`);
          } catch (e) {
            bot.replyWithTyping(message, "ノムリッシュ失敗しました");
            console.log("ノムリッシュ error",e);
          }

        });
      } catch (e) {
        console.log("error:", e);
        bot.replyWithTyping(message, "発言に失敗しちゃいました");
      }

    });

  });
});


controller.hears(['^hello$', '^hi$', '^こんにちは$'], 'direct_message,direct_mention,mention', function(bot, message) {

    bot.api.reactions.add({
        timestamp: message.ts,
        channel: message.channel,
        name: 'poop',
    }, function(err, res) {
        if (err) {
            bot.botkit.log('Failed to add emoji reaction :(', err);
        }
    });


    controller.storage.users.get(message.user, function(err, user) {
        if (user && user.name) {
            bot.replyWithTyping(message, `こんにちは ${user.name}!!`);
        } else {
            bot.replyWithTyping(message, 'Hello.');
        }
    });
});

controller.hears(['call me (.*)', 'my name is (.*)', '(.*)と呼んで'], 'direct_message,direct_mention,mention', function(bot, message) {
    var name = message.match[1];
    controller.storage.users.get(message.user, function(err, user) {
        if (!user) {
            user = {
                id: message.user,
            };
        }
        if (name.length >= 4 && Math.random() > 0.8) {
            var nickname = name.charAt(Math.floor(Math.random() * name.length));
            user.name = nickname;
            controller.storage.users.save(user, function(err, id) {
                bot.replyWithTyping(message, `贅沢な名だねぇ。 今からおまえの名前は${user.name}だ。いいかい、${user.name}だよ。分かったら返事をするんだ、${user.name}！！`);
            });
        } else {
          user.name = name;
          controller.storage.users.save(user, function(err, id) {
              bot.replyWithTyping(message, `OK. 君は今から ${user.name} だ.`);
          });
        }
    });
});

controller.hears(['what is my name', 'who am i', '私は誰'], 'direct_message,direct_mention,mention', function(bot, message) {

    controller.storage.users.get(message.user, function(err, user) {
        if (user && user.name) {
            bot.replyWithTyping(message, `君の名前は ${user.name}`);
        } else {
            bot.startConversation(message, function(err, convo) {
                if (!err) {
                    convo.say('僕は君の名前を知らない');
                    convo.ask('なんて呼んで欲しい？', function(response, convo) {
                        convo.ask(`${response.text}って呼ぶね?`, [
                            {
                                pattern: 'yes',
                                callback: function(response, convo) {
                                    // since no further messages are queued after this,
                                    // the conversation will end naturally with status == 'completed'
                                    convo.next();
                                }
                            },
                            {
                                pattern: 'no',
                                callback: function(response, convo) {
                                    // stop the conversation. this will cause it to end with status == 'stopped'
                                    convo.stop();
                                }
                            },
                            {
                                default: true,
                                callback: function(response, convo) {
                                    convo.repeat();
                                    convo.next();
                                }
                            }
                        ]);

                        convo.next();

                    }, {'key': 'nickname'}); // store the results in a field called nickname

                    convo.on('end', function(convo) {
                        if (convo.status == 'completed') {
                            bot.replyWithTyping(message, '登録すっけんちょっと待っとって。');

                            controller.storage.users.get(message.user, function(err, user) {
                                if (!user) {
                                    user = {
                                        id: message.user,
                                    };
                                }
                                user.name = convo.extractResponse('nickname');
                                controller.storage.users.save(user, function(err, id) {
                                    bot.replyWithTyping(message, `登録終わったわー。今から${user.name}って呼ぶけんね。`);
                                });
                            });



                        } else {
                            // this happens if the conversation ended prematurely for some reason
                            bot.replyWithTyping(message, 'OK, nevermind!');
                        }
                    });
                }
            });
        }
    });
});


controller.hears(['流す'], 'direct_message,direct_mention,mention', function(bot, message) {

    bot.startConversation(message, function(err, convo) {

        convo.ask('本当に流すの？', [
            {
                pattern: bot.utterances.yes,
                callback: function(response, convo) {
                    convo.say('またどこかで、会いましょう。さようなら。');
                    convo.next();
                    setTimeout(function() {
                        process.exit();
                    }, 3000);
                }
            },
        {
            pattern: bot.utterances.no,
            default: true,
            callback: function(response, convo) {
                convo.say('*Phew!*');
                convo.next();
            }
        }
        ]);
    });
});


controller.hears(['昼飯ガチャ'], 'direct_message,direct_mention,mention', function(bot, message) {
  const doc = yaml.safeLoad(fs.readFileSync('lunch.yml', 'utf-8'));
  console.log(doc);

  controller.storage.users.get(message.user, function(err, user) {

      try {
        const randomIndex = Math.floor(Math.random() * doc.length-1);
        console.log(randomIndex);
        bot.replyWithTyping(message, doc[randomIndex]);
      } catch (e) {
        bot.replyWithTyping(message, "失敗");
      }

  });

});

controller.hears(['sgu', 'SGU'], 'direct_message,direct_mention,mention', (bot, message) => {

  controller.storage.users.get(message.user, (err, user) => {
    var sgu = fs.readFileSync('resources/sgu.txt', 'utf-8');

    try {
      bot.replyWithTyping(message, "```\n" + sgu + "```\n");
    } catch (e) {
      bot.replyWithTyping(message, "失敗");
    }

  });

});

controller.hears(['ぬるぽ', 'NullPointerException'], 'direct_message,direct_mention,mention', (bot, message) => {

  controller.storage.users.get(message.user, (err, user) => {
      const res = `          Λ＿Λ　　＼＼
    　 （　・∀・）　　　|　|　ｶﾞｯ
    　と　　　　）　 　 |　|
    　　 Ｙ　/ノ　　　 人
    　　　 /　）　 　 < 　>_Λ∩
    　 ＿/し'　／／. Ｖ｀Д´）/
    　（＿フ彡　　　　　 　　/
`;

      try {
        bot.replyWithTyping(message, "```\n" + res + "```\n");
      } catch (e) {
        bot.replyWithTyping(message, "失敗");
      }

  });

});

controller.hears(['^Get Wild$', '^GetWild$', '^GetWildAndTough$'], 'direct_message,direct_mention,mention', (bot, message) => {
  const phrases = [
    "ひとりでは 解けない愛のパズルを抱いて",
    "この街で やさしさに甘えていたくはない",
    "君だけが 守れるものがどこかにあるさ",
    "ひとりでも 傷ついた夢をとりもどすよ",
  ]

  controller.storage.users.get(message.user, (err, user) => {
    const index = Math.floor(Math.random() * phrases.length - 1);
    bot.replyWithTyping(message, phrases[index]);
  });

});

controller.hears(['^(今日|TODAY)(!|！|❗|:exclamation:)(¥?|？|❓|:question:)'], 'ambient,direct_message,direct_mention,mention', (bot, message) => {
  controller.storage.users.get(message.user, (err, user) => {
    bot.api.reactions.add({
    timestamp: message.ts,
    channel: message.channel,
    name: 'ima',
    }, function(err, res) {
      bot.api.reactions.add({
      timestamp: message.ts,
      channel: message.channel,
      name: 'nichi',
      }, function(err, res) {
        bot.api.reactions.add({
        timestamp: message.ts,
        channel: message.channel,
        name: 'exclamation',
        }, function(err, res) {
          bot.api.reactions.add({
          timestamp: message.ts,
          channel: message.channel,
          name: 'question',
          }, function(err, res) {
            if (err) {
              bot.botkit.log('Failed to add emoji reaction :(', err);
            }
          });
        });
      });
    });
  });
  var options = {
    url: 'http://api.giphy.com/v1/gifs/search?q=just+do+it+Shia+LaBeouf&api_key=dc6zaTOxFJmzC',
    method: 'GET'
  };
  var request = require('request');
  request(options, function(error, response, body){
    try {
      var data = JSON.parse(body).data;
      if (data.length != 0) {
        const index = Math.floor(Math.random() * data.length-1);
        bot.replyWithTyping(message, data[index].images.downsized.url);
      } else {
        bot.replyWithTyping(message, 'https://media.giphy.com/media/kJZagXD9Y4t7q/giphy.gif');
      }
    } catch (e) {
      bot.replyWithTyping(message, 'http://67.media.tumblr.com/1b636507e5c5a1c8fce80cb2bbb7279b/tumblr_npovx5zmUS1r2aobgo2_540.gif');
    }
  });
});

controller.hears(['^gif .*$'], 'direct_message,direct_mention,mention', function(bot,message) {

  console.log(message.match[0]);
  var keyword = message.match[0].replace(/^gif /, '');
  keyword.replace(/ /, '+');

  var options = {
    url: 'http://api.giphy.com/v1/gifs/search?q='+keyword+'&api_key=dc6zaTOxFJmzC',
    method: 'GET'
  };
  var request = require('request');
  request(options, function(error, response, body){

    try {
      var data = JSON.parse(body).data;
      if (data.length != 0) {
        const index = Math.floor(Math.random() * data.length);
        bot.replyWithTyping(message, data[index].images.downsized.url);
      } else {
        bot.replyWithTyping(message, "そんなものはない");
      }
    } catch (e) {
      console.log(data);
      bot.replyWithTyping(message, "なんらかのエラー");
    }

  });
});

controller.hears(['(.*)'], 'direct_message,direct_mention,mention', function(bot,message) {
  var comment = message.match[1];
  controller.storage.users.get(message.user, function(err, user) {
    if (!user) {
      user = {
        id: message.user,
      };
    }

    var headers = {
      'Content-Type':'application/json',
      'Accept': 'application/json'
    }
    var json = {
      "utt":comment,
      "place": "福岡",
    }

    if (user.name) {
      json.nickname = user.name;
    }
    if (user.context) {
      json.context = user.context;
    }

    var options = {
      url: 'https://api.apigw.smt.docomo.ne.jp/dialogue/v1/dialogue?APIKEY='+process.env.token_kaiwa,
      method: 'POST',
      headers: headers,
      json : json
    };

    console.log("発言:", json);
    var request = require('request');
    request(options, function(error, response, json){
      try {
        bot.replyWithTyping(message, `${json.utt}`);
            user.context = json.context;

            controller.storage.users.save(user, function(err, id) {
            });

      } catch (e) {
        console.log("error:", e);
        bot.replyWithTyping(message, "発言に失敗しちゃいました");
      }

    });

  });
});

/*-----------------------------------------------------------------------------------------------------
#以下動いてない
controller.hears(['uptime', 'identify yourself', 'who are you', 'what is your name'],
    'direct_message,direct_mention,mention', function(bot, message) {

        var hostname = os.hostname();
        var uptime = formatUptime(process.uptime());

        bot.replyWithTyping(message,
            ':robot_face: I am a bot named <@' + bot.identity.name +
             '>. I have been running for ' + uptime + ' on ' + hostname + '.');

    });

function formatUptime(uptime) {
    var unit = 'second';
    if (uptime > 60) {
        uptime = uptime / 60;
        unit = 'minute';
    }
    if (uptime > 60) {
        uptime = uptime / 60;
        unit = 'hour';
    }
    if (uptime != 1) {
        unit = unit + 's';
    }

    uptime = uptime + ' ' + unit;
    return uptime;
}

controller.hears(['うんち', 'うんこ', 'poop', 'hankey'], 'ambient', function(bot, message) {

    bot.api.reactions.add({
        timestamp: message.ts,
        channel: message.channel,
        name: 'poop',
    }, function(err, res) {
        if (err) {
            bot.botkit.log('Failed to add emoji reaction :(', err);
        }
    });
});

-----------------------------------------------------------------------------------------------------*/
