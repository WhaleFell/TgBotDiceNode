var express = require('express');
var mysql = require('mysql');
var conf = require('./config/conf');
var TelegramBot = require('node-telegram-bot-api');
var cors = require('cors');
var fs = require('fs');

var login = require('./api/login');
var chart = require('./api/chart');
var table = require('./api/table');
var result = require('./api/result');

var app = express();

app.use(cors())
app.use(login);
app.use(chart);
app.use(table);
app.use(result);


var iskey, iszaliu, a, b, c, daxiao, danshuang, baozi, shunzi, duizi, value, date, minutes, isfengpan = false, iskaijiang = false, resultArray = [], resultid = "1",
    resultCount = [
        { value: 0 },
        { value: 0 },
        { value: 0 },
        { value: 0 },
        { value: 0 },
        { value: 0 }
    ],
    resultdxds = {
        big: 0,
        small: 0,
        odd: 0,
        even: 0,
        baozi: 0,
        shunzi: 0,
        duizi: 0
    }

var server = app.listen(3888, function () {
    setInterval(function () {

        date = new Date();
        if (resultid == "1") {
            setResultID();
        }

        minutes = date.getMinutes();
        if (minutes == 0) {
            minutes = 60;
        }

        if (date.getSeconds() == 40 && minutes % conf.gameTime == 0 && conf.isfptx) {//封盘倒计时提醒
            fengpantixing();
        }

        if (date.getSeconds() >= 50 && minutes % conf.gameTime == 0 && !isfengpan) { //封盘提醒
            isfengpan = true;
            getAllBet();
        }

        if (date.getSeconds() >= 56 && minutes % conf.gameTime == 0 && !iskaijiang) { //开奖
            iskaijiang = true;
            setResult();
        }

    }, 1000)
})

var bot = new TelegramBot(conf.token, { polling: true });
// 历史 余额 投注 流水 反水
var allkeyword = ["反水", "历史", "余额", "投注", "流水", "撤回", "全部撤回", "历史", "上分", "下分", "大", "小", "单", "双", "豹子", "对子", "顺子", "杀"]
/*监听新的文字消息*/
bot.on('message', (msg) => {
    if (msg.forward_date == undefined && msg.text) {
        if (msg.chat.type == "group" || msg.chat.type == "supergroup") {
            if (msg.chat.id == conf.chatid || msg.chat.id == conf.sxfqunid) {
                var msgtxt = msg.text;
                iskey = false;
                for (let index = 0; index < allkeyword.length; index++) {
                    if (msgtxt.search(allkeyword[index]) != -1) {
                        iskey = true;
                    }
                }
                if (iskey) {
                    conf.pool.getConnection(function (err, connection) {
                        if (err) throw err;
                        connection.query(`SELECT * FROM users where telegramid = "${msg.from.id}"`, (error, result) => {
                            if (result.length == 0) {
                                connection.query(`Insert into users (name,telegramid,register_time) values ("${msg.from.username}","${msg.from.id}",now());`, (error, result) => {
                                    connection.destroy();
                                    if (error) throw error;
                                    if (msg.chat.id == conf.chatid) {
                                        main(msg);
                                    }

                                    if (msg.chat.id == conf.sxfqunid) {
                                        sxf(msg);
                                    }
                                });
                            } else {
                                connection.destroy();
                                if (msg.chat.id == conf.chatid) {
                                    main(msg);
                                }

                                if (msg.chat.id == conf.sxfqunid) {
                                    sxf(msg);
                                }


                            }
                        })
                    })
                }
            }
        }
    }
});

/*监听错误*/
bot.on('error', (error) => {
    console.log("监听到普通错误：" + date + error);
});
bot.on('polling_error', (error) => {
    console.log("监听到轮循错误：" + date + error);
});
bot.on('webhook_error', (error) => {
    console.log("监听到webhook错误：" + date + error);
});


/*监听内联键盘*/
bot.on('callback_query', function onCallbackQuery(callbackQuery) {
    switch (callbackQuery.data) {
        case "6":
            getBalance(callbackQuery.from.id, callbackQuery.from.username, callbackQuery.id);
            break;
        case "7":
            getMyBet(callbackQuery.from.id, callbackQuery.from.username, callbackQuery.id);
            break;
        case "8":
            getTodayBill(callbackQuery.from.id, callbackQuery.from.username, callbackQuery.id);
            break;
        case "9":
            getReturnWater(callbackQuery.from.id, callbackQuery.from.username, callbackQuery.id);
            break;
        default:
            break;
    }
});
// 历史 余额 投注 流水 反水
/*主函数，处理过滤完的文字消息 */
function main(msg) {
    if (msg.text == "撤回" && msg.reply_to_message != undefined) {
        chehui(msg.text, msg.from.id, msg.from.username, msg.reply_to_message.message_id, msg.message_thread_id)
    } else if (msg.text == "全部撤回") {
        quanbuchehui(msg.text, msg.from.id, msg.from.username, msg.message_id)
    } else if (msg.text.search("历史") != -1) {
        lishi(msg.text, msg.from.id, msg.from.username, msg.message_id)
    } else if (msg.text.search("余额") != -1) {
        yuetxt(msg.text, msg.from.id, msg.from.username, msg.message_id)
    } else if (msg.text.search("投注") != -1) {
        getMyBettxt(msg.text, msg.from.id, msg.from.username, msg.message_id)
    } else if (msg.text.search("流水") != -1) {
        getTodayBilltxt(msg.text, msg.from.id, msg.from.username, msg.message_id)
    } else if (msg.text.search("反水") != -1) {
        getReturnWatertxt(msg.text, msg.from.id, msg.from.username, msg.message_id)
    } else {
        bet(msg.text, msg.from.id, msg.from.username, msg.message_id, msg.from.first_name);
    }
}

function sxf(msg) {
    if (msg.text.search("上分") != -1) {
        shangfen(msg.text, msg.from.id, msg.from.username, msg.message_id)
    } else if (msg.text.search("下分") != -1) {
        xiafen(msg.text, msg.from.id, msg.from.username, msg.message_id)
    }
}

/*上分*/
function shangfen(contant, telegramid, name, replyMessageid) {
    if (parseInt(contant.split('上分')[1]) % 1 == 0 && contant.split('上分')[0] == "") {
        conf.pool.getConnection(function (err, connection) {
            connection.query(`Insert into pay (name,telegramid,amount,state,way,applytime,replyMessageid) values ("${name}","${telegramid}",${contant.split("上分")[1]},0,"群内上分",now(),${replyMessageid}); `, (error, result) => {
                connection.destroy();
                if (error) throw error;
                bot.sendMessage(conf.sxfqunid, `收到，请等待审核！`, {
                    reply_to_message_id: replyMessageid
                })
            });
        })
    }
}

/*下分*/
function xiafen(contant, telegramid, name, replyMessageid) {
    if (parseInt(contant.split('下分')[1]) % 1 == 0 && contant.split('下分')[0] == "") {
        conf.pool.getConnection(function (err, connection) {
            connection.query(`SELECT * FROM users where telegramid = "${telegramid}";`, (error, result) => {
                if (error) throw error;
                if (result.length == 0) {
                    bot.sendMessage(conf.sxfqunid, `余额不足，提现失败！`, {
                        reply_to_message_id: replyMessageid
                    })
                } else {
                    if (result[0].balance >= parseFloat(contant.split("下分")[1])) {
                        connection.query(`Insert into withdrawal (name,telegramid,amount,state,way,applytime,replyMessageid) values ("${name}","${telegramid}",${contant.split("下分")[1]},0,"群内下分",now(),${replyMessageid}); update users set balance  = balance - ${contant.split("下分")[1]} where telegramid = "${telegramid}"`, (error, result) => {
                            connection.destroy();
                            if (error) throw error;
                            bot.sendMessage(conf.sxfqunid, `收到，请等待审核！`, {
                                reply_to_message_id: replyMessageid
                            })
                        });
                    } else {
                        bot.sendMessage(conf.sxfqunid, `余额不足，提现失败！`, {
                            reply_to_message_id: replyMessageid
                        })
                    }
                }
            });
        })
    }
}

/*发送即将封盘提醒*/
function fengpantixing() {
    bot.sendMessage(conf.chatid, `🕑🕑🕑🕑提醒 🕐🕐🕐🕑\n\n🔔封盘剩余10秒🔔`)
        .catch(err => {
            console.log(err);

        })
}

/*查询开奖历史*/
function lishi(contant, telegramid, name, replyMessageid) {
    if (parseInt(contant.split('历史')[1]) % 1 != 0 || parseInt(contant.split('历史')[1]) > 100) {
        return
    }
    conf.pool.getConnection(function (err, connection) {
        if (err) throw err;
        connection.query(`SELECT * FROM result ORDER by result_time desc limit ${parseInt(contant.split('历史')[1])} ;`, (error, result) => {
            if (error) throw error;
            connection.destroy();
            var historylist = "";
            for (let index = 0; index < result.length; index++) {
                iszaliu = 0;
                if (result[index].baozi == 0 && result[index].shunzi == 0 && result[index].duizi == 0) {
                    iszaliu = 1;
                }
                historylist = `${historylist}${result[index].id}期  ${result[index].one},${result[index].two},${result[index].three}  ${(result[index].big == 1 ? "大" : "")}${(result[index].small == 1 ? "小" : "")}${(result[index].odd == 1 ? "单|" : "")}${(result[index].even == 1 ? "双|" : "")}${(result[index].baozi == 1 ? "豹子" : "")}${(result[index].shunzi == 1 ? "顺子" : "")}${(result[index].duizi == 1 ? "对子" : "")}${(iszaliu == 1 ? "杂六" : "")}\n`;
            }
            bot.sendMessage(conf.chatid, `${historylist}`, {
                reply_to_message_id: replyMessageid
            })
        });
    });
}

/*撤回单个*/
function chehui(contant, telegramid, name, replyMessageid, message_thread_id) {
    if (isfengpan) {
        bot.sendMessage(conf.chatid, `撤回失败！\n原因:已经封盘`, {
            reply_to_message_id: replyMessageid
        })
        return
    }
    var chehuisql = "";
    var chehuiorder = "";
    conf.pool.getConnection(function (err, connection) {
        if (err) throw err;
        connection.query(`SELECT * FROM bet where messageid = "${message_thread_id}" and telegramid = "${telegramid}" and resultid = "${resultid}";`, (error, result) => {
            if (error) throw error;
            for (let index = 0; index < result.length; index++) {
                chehuiorder = `${chehuiorder}${result[index].guess}-${result[index].amount}\n`
                chehuisql = `${chehuisql}DELETE FROM bet  where id  ='${result[index].id}';UPDATE users set balance = balance + ${result[index].amount} where telegramid = "${result[index].telegramid}"; `
            }
            if (result.length == 0) {
                connection.destroy();
                bot.sendMessage(conf.chatid, `撤回失败！\n原因:已经开奖`, {
                    reply_to_message_id: replyMessageid
                })
            } else {
                connection.query(chehuisql, (error, result) => {
                    connection.destroy();
                    if (error) throw error;
                    bot.sendMessage(conf.chatid, `撤回成功！\n包含的投注有：\n${chehuiorder}`, {
                        reply_to_message_id: replyMessageid
                    })
                });
            }

        });
    });
}

/*文字消息查看余额*/
function yuetxt(contant, telegramid, name, replyMessageid) {
    conf.pool.getConnection(function (err, connection) {
        if (err) throw err;
        connection.query(`SELECT * FROM users where telegramid = "${telegramid}";`, (error, result) => {
            if (error) throw error;
            if (result.length == 0) {
                connection.destroy();
                bot.sendMessage(conf.chatid, `余额：0.00`, {
                    reply_to_message_id: replyMessageid
                })
            } else {
                connection.destroy();
                bot.sendMessage(conf.chatid, `余额：${result[0].balance.toFixed(2)}`, {
                    reply_to_message_id: replyMessageid
                })
            }
        });
    });

}

/*文字消息查询我的投注记录*/
function getMyBettxt(contant, telegramid, name, replyMessageid) {
    conf.pool.getConnection(function (err, connection) {
        if (err) throw err;
        connection.query(`SELECT * FROM bet where telegramid = '${telegramid}' order by id desc LIMIT 10;`, (error, result) => {
            if (error) throw error;
            connection.destroy();
            var myBet = "";
            for (let index = 0; index < result.length; index++) {
                if (result[index].resultid == resultid) {
                    result_money = `待开奖`
                } else if (result[index].result == 0) {
                    result_money = `未中奖`
                } else {
                    result_money = `中奖${result[index].result.toFixed(2)}${conf.coin[0]}`
                }
                myBet = `${myBet} ${result[index].resultid}期：${result[index].guess}${result[index].amount.toFixed(2)}${conf.coin[0]}-${result_money}\n`;
            }
            if (result.length == 0) {
                myBet = `🈚有效投注`
            }
            bot.sendMessage(conf.chatid, `最近投注记录：\n${myBet}`, {
                reply_to_message_id: replyMessageid
            })
        });
    });
}

/*文字消息查询流水*/
function getTodayBilltxt(contant, telegramid, name, replyMessageid) {
    conf.pool.getConnection(function (err, connection) {
        if (err) throw err;
        connection.query(`SELECT * FROM bet where telegramid = "${telegramid}" and time LIKE CONCAT(CURDATE(), '%');`, (error, result) => {
            if (error) throw error;
            connection.destroy();
            var todayWin = 0;
            var todayPurchase = 0;
            var todayWaitResult = 0;
            for (let index = 0; index < result.length; index++) {
                if (resultid != result[index].resultid) {
                    todayWin = todayWin + result[index].result - result[index].amount + result[index].amountreturn;
                    todayPurchase = todayPurchase + result[index].amount;
                } else {
                    todayWaitResult = todayWaitResult + result[index].amount;
                }
            }
            bot.sendMessage(conf.chatid, `待结算：${todayWaitResult.toFixed(2)} ${conf.coin}\n今日输赢：${todayWin.toFixed(2)} ${conf.coin}\n今日总流水：${todayPurchase.toFixed(2)} ${conf.coin}`, {
                reply_to_message_id: replyMessageid
            })
        });
    });
}

/*文字消息领取反水*/
function getReturnWatertxt(contant, telegramid, name, replyMessageid) {
    conf.pool.getConnection(function (err, connection) {
        if (err) throw err;
        connection.query(`SELECT * FROM bet where telegramid = "${telegramid}" and isreturn = 0 and resultid != ${resultid};`, (error, result) => {
            if (error) throw error;
            var myReturnWater = 0;
            for (let index = 0; index < result.length; index++) {
                myReturnWater = myReturnWater + result[index].amount * conf.returnWater;
            }
            connection.query(`UPDATE users set balance = balance + ${myReturnWater} where telegramid = "${telegramid}";UPDATE bet set isreturn = 1,amountreturn = amount*${conf.returnWater} where telegramid = "${telegramid}";`, (error, result) => {
                connection.destroy();
                if (error) throw error;
                bot.sendMessage(conf.chatid, `领取反水：${myReturnWater.toFixed(2)} ${conf.coin}`, {
                    reply_to_message_id: replyMessageid
                })
            });
        });
    });
}

/*全部撤回*/
function quanbuchehui(contant, telegramid, name, replyMessageid) {
    if (isfengpan) {
        bot.sendMessage(conf.chatid, `撤回失败！\n原因:已经封盘`, {
            reply_to_message_id: replyMessageid
        })
        return
    }
    var chehuisql = "";
    var chehuiorder = "";
    conf.pool.getConnection(function (err, connection) {
        if (err) throw err;
        connection.query(`SELECT * FROM bet where telegramid = "${telegramid}" and resultid = "${resultid}";`, (error, result) => {
            if (error) throw error;
            if (result.length == 0) {
                connection.destroy();
                bot.sendMessage(conf.chatid, `撤回失败！\n原因:本期没有参与投注`, {
                    reply_to_message_id: replyMessageid
                })
            } else {
                for (let index = 0; index < result.length; index++) {
                    chehuiorder = `${chehuiorder}${result[index].guess}-${result[index].amount}\n`
                    chehuisql = `${chehuisql}DELETE FROM bet  where id  ='${result[index].id}';UPDATE users set balance = balance + ${result[index].amount} where telegramid = "${result[index].telegramid}"; `
                }
                connection.query(chehuisql, (error, result) => {
                    connection.destroy();
                    if (error) throw error;
                    bot.sendMessage(conf.chatid, `撤回成功！\n包含的投注有：\n${chehuiorder}`, {
                        reply_to_message_id: replyMessageid
                    })
                });
            }
        });
    });
}

/*设置开奖期数*/
function setResultID() {
    conf.pool.getConnection(function (err, connection) {
        if (err) throw err;
        connection.query(`SELECT COUNT(*) FROM result WHERE result_time LIKE CONCAT(CURDATE(), '%');`, (error, result) => {
            if (error) throw error;
            connection.destroy();
            resultid = `${date.getFullYear()}${(date.getMonth() + 1 < 10 ? "0" + date.getMonth() + 1 : date.getMonth() + 1)}${(date.getDate() < 10 ? "0" + date.getDate() : date.getDate())}${result[0]['COUNT(*)'] + 1}`;
        });
    });

}

/*查询用户余额*/
function getBalance(telegramid, name, callbackQueryid) {
    conf.pool.getConnection(function (err, connection) {
        if (err) throw err;
        connection.query(`SELECT * FROM users where telegramid = '${telegramid}';`, (error, result) => {
            if (error) throw error;
            if (result.length == 0) {
                connection.query(`Insert into users (name,telegramid,register_time) values ('${name}','${telegramid}',now());`, (error, result) => {
                    connection.destroy();
                    if (error) throw error;
                    bot.answerCallbackQuery(callbackQueryid, {
                        text: `ID：${telegramid}\n余额：0 ${conf.coin}`,
                        show_alert: true
                    })
                });
            } else {
                connection.destroy();
                bot.answerCallbackQuery(callbackQueryid, {
                    text: `ID：${telegramid}\n余额：${result[0].balance.toFixed(2)} ${conf.coin}`,
                    show_alert: true
                })
            }
        });
    });
}

/*查询我的投注记录*/
function getMyBet(telegramid, name, callbackQueryid) {
    conf.pool.getConnection(function (err, connection) {
        if (err) throw err;
        connection.query(`SELECT * FROM bet where telegramid = '${telegramid}' order by id desc LIMIT 5;`, (error, result) => {
            if (error) throw error;
            connection.destroy();
            var myBet = "";
            for (let index = 0; index < result.length; index++) {
                if (result[index].resultid == resultid) {
                    result_money = `待开奖`
                } else if (result[index].result == 0) {
                    result_money = `未中奖`
                } else {
                    result_money = `中奖${result[index].result.toFixed(2)}${conf.coin[0]}`
                }
                myBet = `${myBet} ${result[index].resultid}期：${result[index].guess}${result[index].amount.toFixed(2)}${conf.coin[0]}-${result_money}\n`;
            }
            if (result.length == 0) {
                myBet = `🈚有效投注`
            }
            bot.answerCallbackQuery(callbackQueryid, {
                text: `最近投注记录：\n${myBet}`,
                show_alert: true
            })

        });
    });
}

/*封盘*/
function getAllBet(telegramid) {
    conf.pool.getConnection(function (err, connection) {
        if (err) {
            console.log(err);
            return;
        }
        connection.query(`SELECT * FROM bet where resultid = "${resultid}"`, (error, result) => {
            if (error) {
                console.log(error);
                return;
            }
            connection.destroy();
            var AllBet = `\n本期下注玩家：`;
            for (let index = 0; index < result.length; index++) {
                AllBet = `${AllBet}\n${result[index].firstname} ${result[index].guess}-${result[index].amount}`;
            }
            if (result.length == 0) {
                AllBet = `${AllBet}\n🈚人投注 `;
            }
            if (AllBet.length > 900) {
                AllBet = ""
                for (let index = 0; index < 40; index++) {
                    AllBet = `${AllBet}\n${result[index].firstname} ${result[index].guess}-${result[index].amount}`;
                }
                AllBet += `\n等${result.length}次投注`
            }

            resultArray = result;
            var fengpanresulttxt = `${resultid}期已封盘\n封盘时间：${(date.getHours() < 10 ? "0" + date.getHours() : date.getHours())}:${(date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes())}:55\n开奖时间：${(date.getHours() < 10 ? "0" + date.getHours() : date.getHours())}:${(date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes())}:59\n➖➖➖➖➖➖➖➖➖➖${AllBet}`;
            if (conf.sendmode == "t") {
                bot.sendMessage(conf.chatid, fengpanresulttxt, {
                    reply_markup: JSON.stringify({
                        inline_keyboard: conf.inline_keyboard
                    })
                }).then(res => {
                    iskaijiang = false;
                });
            } else if (conf.sendmode == "pt") {
                bot.sendPhoto(conf.chatid, 'img/tzxz.jpg', {
                    caption: fengpanresulttxt
                }).then(res => {
                    iskaijiang = false;
                });
            }
        });
    });
}

/*下注*/
function bet(contant, telegramid, name, replyMessageid, firstname) {
    date = new Date();
    conf.pool.getConnection(function (err, connection) {
        if (err) throw err;
        connection.query(`SELECT * FROM users where telegramid = "${telegramid}"`, (error, result) => {
            if (error) throw error;
            var userBalance = result[0].balance;
            const contantArray = contant.split(/\s+/);
            var allbet = "", amount, guess = "", peilv = "", sql = "INSERT INTO bet (telegramid ,name ,amount ,guess ,time ,resultid,messageid,firstname) VALUES";
            for (let index = 0; index < contantArray.length; index++) {
                amount = 0, guess = "";
                if (contantArray[index].search("大单") != -1 && contantArray[index].split("大单")[0] == "" && contantArray[index].split("大单").length == 2) {
                    amount = contantArray[index].split("大单")[1];
                    guess = "大单";
                    peilv = conf.peilv['fushi1'];
                } else {
                    if (contantArray[index].search("大") != -1 && contantArray[index].split("大")[0] == "" && contantArray[index].split("大").length == 2) {
                        amount = contantArray[index].split("大")[1];
                        guess = "大";
                        peilv = conf.peilv['dxds'];
                    }
                    if (contantArray[index].search("单") != -1 && contantArray[index].split("单")[0] == "" && contantArray[index].split("单").length == 2) {
                        amount = contantArray[index].split("单")[1];
                        guess = "单";
                        peilv = conf.peilv['dxds'];
                    }
                }

                if (contantArray[index].search("小双") != -1 && contantArray[index].split("小双")[0] == "" && contantArray[index].split("小双").length == 2) {
                    amount = contantArray[index].split("小双")[1];
                    guess = "小双";
                    peilv = conf.peilv['fushi1'];
                } else {
                    if (contantArray[index].search("小") != -1 && contantArray[index].split("小")[0] == "" && contantArray[index].split("小").length == 2) {
                        amount = contantArray[index].split("小")[1];
                        guess = "小";
                        peilv = conf.peilv['dxds'];
                    }
                    if (contantArray[index].search("双") != -1 && contantArray[index].split("双")[0] == "" && contantArray[index].split("双").length == 2) {
                        amount = contantArray[index].split("双")[1];
                        guess = "双";
                        peilv = conf.peilv['dxds'];
                    }
                }

                if (contantArray[index].search("大双") != -1 && contantArray[index].split("大双")[0] == "" && contantArray[index].split("大双").length == 2) {
                    amount = contantArray[index].split("大双")[1];
                    guess = "大双";
                    peilv = conf.peilv['fushi2'];
                }

                if (contantArray[index].search("小单") != -1 && contantArray[index].split("小单")[0] == "" && contantArray[index].split("小单").length == 2) {
                    amount = contantArray[index].split("小单")[1];
                    guess = "小单";
                    peilv = conf.peilv['fushi2'];
                }

                if (contantArray[index].search("豹子") != -1 && contantArray[index].split("豹子")[0] == "" && contantArray[index].split("豹子").length == 2) {
                    amount = contantArray[index].split("豹子")[1];
                    guess = "豹子";
                    peilv = conf.peilv['baozi'];
                }
                if (contantArray[index].search("顺子") != -1 && contantArray[index].split("顺子")[0] == "" && contantArray[index].split("顺子").length == 2) {
                    amount = contantArray[index].split("顺子")[1];
                    guess = "顺子";
                    peilv = conf.peilv['shunzi'];
                }
                if (contantArray[index].search("对子") != -1 && contantArray[index].split("对子")[0] == "" && contantArray[index].split("对子").length == 2) {
                    amount = contantArray[index].split("对子")[1];
                    guess = "对子";
                    peilv = conf.peilv['duizi'];
                }
                // 点杀
                if (contantArray[index].search("杀") != -1) {
                    if (contantArray[index].split("杀")[0] == "3" || contantArray[index].split("杀")[0] == "4" || contantArray[index].split("杀")[0] == "5" || contantArray[index].split("杀")[0] == "6" || contantArray[index].split("杀")[0] == "7" || contantArray[index].split("杀")[0] == "8" || contantArray[index].split("杀")[0] == "9" || contantArray[index].split("杀")[0] == "10" || contantArray[index].split("杀")[0] == "11" || contantArray[index].split("杀")[0] == "12" || contantArray[index].split("杀")[0] == "13" || contantArray[index].split("杀")[0] == "14" || contantArray[index].split("杀")[0] == "15" || contantArray[index].split("杀")[0] == "16" || contantArray[index].split("杀")[0] == "17" || contantArray[index].split("杀")[0] == "18") {
                        if (typeof parseFloat(contantArray[index].split("杀")[1]) === 'number' && !isNaN(contantArray[index].split("杀")[1])) {
                            amount = contantArray[index].split("杀")[1];
                            guess = "杀" + contantArray[index].split("杀")[0] + "点";
                            peilv = conf.peilv['s' + contantArray[index].split("杀")[0] + 'd'];
                        }
                    }
                }

                if (contantArray[index].search("豹子") != -1) {
                    if (contantArray[index].split("豹子")[0] == "1" || contantArray[index].split("豹子")[0] == "2" || contantArray[index].split("豹子")[0] == "3" || contantArray[index].split("豹子")[0] == "4" || contantArray[index].split("豹子")[0] == "5" || contantArray[index].split("豹子")[0] == "6") {
                        if (parseFloat(contantArray[index].split("豹子")[1]) % 1 == 0 && !isNaN(contantArray[index].split("豹子")[1])) {
                            amount = contantArray[index].split("豹子")[1];
                            guess = "豹子" + contantArray[index].split("豹子")[0] + "点";
                            peilv = conf.peilv['dsbz'];
                        }
                    }
                }

                userBalance = userBalance - amount;
                if (index == 0) {
                    sql = sql + ` ("${telegramid}","${name}",${amount},"${guess}",now(),"${resultid}","${replyMessageid}","${firstname}")`;
                } else {
                    sql = sql + ` ,("${telegramid}","${name}",${amount},"${guess}",now(),"${resultid}","${replyMessageid}","${firstname}")`;
                }

                allbet = allbet + `${guess}-${amount}(${parseFloat(peilv).toFixed(2)}赔率)\n`

                if (amount == "" || /[\u4e00-\u9fa5]+/.test(amount) || /[a-zA-Z]+/.test(amount) || amount % 1 != 0) {
                    return;
                }
                if (isfengpan) {
                    bot.sendMessage(conf.chatid, `已封盘，本次投注无效！`, {
                        reply_to_message_id: replyMessageid
                    })
                    return;
                }
                if (amount <= 0 || guess == "") {
                    bot.sendMessage(conf.chatid, `格式有误，本次投注无效！`, {
                        reply_to_message_id: replyMessageid
                    })
                    return;
                }

                if (amount > conf.betMax || amount < conf.betMin) {
                    bot.sendMessage(conf.chatid, `请勿超过投注范围 ${conf.betMin}-${conf.betMax}，本次投注无效！`, {
                        reply_to_message_id: replyMessageid
                    })
                    return;
                }

            }
            if (userBalance < 0) {
                bot.sendMessage(conf.chatid, `余额不足，本次投注无效！`, {
                    reply_to_message_id: replyMessageid
                })
                return;
            }
            connection.query(`${sql};UPDATE users set balance = ${userBalance} where telegramid = "${telegramid}";`, (error, result) => {
                connection.destroy();
                if (error) throw error;
                bot.sendMessage(conf.chatid, `【${firstname}-${telegramid}】\n下注内容:\n${allbet.substring(0, 4000)}\n余额：${userBalance.toFixed(2)}`, {
                    reply_to_message_id: replyMessageid,
                })
            });
        });
    });
}

/*查询流水*/
function getTodayBill(telegramid, name, callbackQueryid) {
    conf.pool.getConnection(function (err, connection) {
        if (err) throw err;
        connection.query(`SELECT * FROM bet where telegramid = "${telegramid}" and time LIKE CONCAT(CURDATE(), '%');`, (error, result) => {
            if (error) throw error;
            connection.destroy();
            var todayWin = 0;
            var todayPurchase = 0;
            var todayWaitResult = 0;
            for (let index = 0; index < result.length; index++) {
                if (resultid != result[index].resultid) {
                    todayWin = todayWin + result[index].result - result[index].amount + result[index].amountreturn;
                    todayPurchase = todayPurchase + result[index].amount;
                } else {
                    todayWaitResult = todayWaitResult + result[index].amount;
                }
            }
            bot.answerCallbackQuery(callbackQueryid, {
                text: `待结算：${todayWaitResult.toFixed(2)} ${conf.coin}\n今日输赢：${todayWin.toFixed(2)} ${conf.coin}\n今日总流水：${todayPurchase.toFixed(2)} ${conf.coin}`,
                show_alert: true
            })
        });
    });
}

/*领取反水*/
function getReturnWater(telegramid, name, callbackQueryid) {
    conf.pool.getConnection(function (err, connection) {
        if (err) throw err;
        connection.query(`SELECT * FROM bet where telegramid = "${telegramid}" and isreturn = 0 and resultid != ${resultid};`, (error, result) => {
            if (error) throw error;
            var myReturnWater = 0;
            for (let index = 0; index < result.length; index++) {
                myReturnWater = myReturnWater + result[index].amount * conf.returnWater;
            }
            connection.query(`UPDATE users set balance = balance + ${myReturnWater} where telegramid = "${telegramid}";UPDATE bet set isreturn = 1,amountreturn = amount*${conf.returnWater} where telegramid = "${telegramid}";`, (error, result) => {
                connection.destroy();
                if (error) throw error;
                bot.answerCallbackQuery(callbackQueryid, {
                    text: `领取反水：${myReturnWater.toFixed(2)} ${conf.coin}`,
                    show_alert: true
                })
            });
        });
    });
}

/*开奖*/
function setResult() {
    bot.sendDice(conf.chatid, { values: 1, emoji: '🎲' }).then(res => {
        a = res.dice.value;
        bot.sendDice(conf.chatid, { values: 1, emoji: '🎲' }).then(res => {
            b = res.dice.value;
            bot.sendDice(conf.chatid, { values: 1, emoji: '🎲' }).then(res => {
                c = res.dice.value;
                value = a + b + c;
                /*初始化*/
                resultdxds = {
                    big: 0,
                    small: 0,
                    odd: 0,
                    even: 0,
                    baozi: 0,
                    shunzi: 0,
                    duizi: 0
                }
                baozi = "";
                shunzi = "";
                duizi = "";
                daxiao = "";
                danshuang = "";



                if (c - b == 1 && b - a == 1) {
                    resultdxds.shunzi = 1;
                    shunzi = "顺子";
                }
                if (c - a == 1 && b - c == 1) {
                    resultdxds.shunzi = 1;
                    shunzi = "顺子";
                }
                if (a - b == 1 && c - a == 1) {
                    resultdxds.shunzi = 1;
                    shunzi = "顺子";
                }
                if (b - a == 1 && a - c == 1) {
                    resultdxds.shunzi = 1;
                    shunzi = "顺子";
                }
                if (a - b == 1 && b - c == 1) {
                    resultdxds.shunzi = 1;
                    shunzi = "顺子";
                }
                if (a - c == 1 && c - b == 1) {
                    resultdxds.shunzi = 1;
                    shunzi = "顺子";
                }


                if (a == b && b != c) {
                    resultdxds.duizi = 1;
                    duizi = "对子";
                }
                if (b == c && c != a) {
                    resultdxds.duizi = 1;
                    duizi = "对子";
                }
                if (a == c && c != b) {
                    resultdxds.duizi = 1;
                    duizi = "对子";
                }

                if (a == b && b == c && c == a) { //如果是豹子，通杀
                    resultdxds.baozi = 1;
                    baozi = "豹子";
                } else {
                    /*大小*/
                    if (value > 10) {
                        resultdxds.big = 1;
                        daxiao = "大";
                    }
                    if (value <= 10) {
                        resultdxds.small = 1;
                        daxiao = "小";
                    }
                    /*单双*/
                    if (value % 2 == 1) {
                        resultdxds.odd = 1;
                        danshuang = "单";
                    }
                    if (value % 2 == 0) {
                        resultdxds.even = 1;
                        danshuang = "双";
                    }
                }

                var allResultMessage = "";
                var allResultSql = "";
                if (!resultArray) {
                    resultArray = [];
                }
                for (let index = 0; index < resultArray.length; index++) {
                    var allResult = resultArray[index];

                    if (allResult.guess == "大" || allResult.guess == "小" || allResult.guess == "单" || allResult.guess == "双") {
                        if (allResult.guess == daxiao || allResult.guess == danshuang) {
                            allResultMessage = `${allResultMessage}${allResult.firstname} ${allResult.guess} +${parseInt(conf.peilv['dxds'] * allResult.amount)}\n`
                            allResultSql = `${allResultSql}update bet set result = ${conf.peilv['dxds'] * allResult.amount} where id = ${allResult.id};update users set balance = balance + ${parseInt(conf.peilv['dxds'] * allResult.amount)} where telegramid = "${allResult.telegramid}";`
                        } else {
                            if (conf.istishishu) {
                                allResultMessage = `${allResultMessage}${allResult.firstname} ${allResult.guess} -${parseInt(allResult.amount)}\n`
                            }
                            allResultSql = `${allResultSql}update bet set result = 0 where id = ${allResult.id};`
                        }
                    }
                    if (allResult.guess == "大单") {
                        if (baozi != "豹子") {
                            if (value == 11 || value == 13 || value == 15 || value == 17) {
                                allResultMessage = `${allResultMessage}${allResult.firstname} ${allResult.guess} +${parseInt(conf.peilv['fushi1'] * allResult.amount)}\n`
                                allResultSql = `${allResultSql}update bet set result = ${conf.peilv['fushi1'] * allResult.amount} where id = ${allResult.id};update users set balance = balance + ${parseInt(conf.peilv['fushi1'] * allResult.amount)} where telegramid = "${allResult.telegramid}";`
                            }

                        } else {
                            if (conf.istishishu) {
                                allResultMessage = `${allResultMessage}${allResult.firstname} ${allResult.guess} -${parseInt(allResult.amount)}\n`
                            }
                            allResultSql = `${allResultSql}update bet set result = 0 where id = ${allResult.id};`
                        }
                    }
                    if (allResult.guess == "小双") {
                        if (baozi != "豹子") {
                            if (value == 4 || value == 6 || value == 8 || value == 10) {
                                allResultMessage = `${allResultMessage}${allResult.firstname} ${allResult.guess} +${parseInt(conf.peilv['fushi1'] * allResult.amount)}\n`
                                allResultSql = `${allResultSql}update bet set result = ${conf.peilv['fushi1'] * allResult.amount} where id = ${allResult.id};update users set balance = balance + ${parseInt(conf.peilv['fushi1'] * allResult.amount)} where telegramid = "${allResult.telegramid}";`
                            }
                        } else {
                            if (conf.istishishu) {
                                allResultMessage = `${allResultMessage}${allResult.firstname} ${allResult.guess} -${parseInt(allResult.amount)}\n`
                            }
                            allResultSql = `${allResultSql}update bet set result = 0 where id = ${allResult.id};`
                        }
                    }
                    if (allResult.guess == "大双") {
                        if (baozi != "豹子") {
                            if (value == 12 || value == 14 || value == 16) {
                                allResultMessage = `${allResultMessage}${allResult.firstname} ${allResult.guess} +${parseInt(conf.peilv['fushi2'] * allResult.amount)}\n`
                                allResultSql = `${allResultSql}update bet set result = ${conf.peilv['fushi2'] * allResult.amount} where id = ${allResult.id};update users set balance = balance + ${parseInt(conf.peilv['fushi1'] * allResult.amount)} where telegramid = "${allResult.telegramid}";`
                            }
                        } else {
                            if (conf.istishishu) {
                                allResultMessage = `${allResultMessage}${allResult.firstname} ${allResult.guess} -${parseInt(allResult.amount)}\n`
                            }
                            allResultSql = `${allResultSql}update bet set result = 0 where id = ${allResult.id};`
                        }
                    }
                    if (allResult.guess == "小单") {
                        if (baozi != "豹子") {
                            if (value == 5 || value == 7 || value == 9) {
                                allResultMessage = `${allResultMessage}${allResult.firstname} ${allResult.guess} +${parseInt(conf.peilv['fushi2'] * allResult.amount)}\n`
                                allResultSql = `${allResultSql}update bet set result = ${conf.peilv['fushi2'] * allResult.amount} where id = ${allResult.id};update users set balance = balance + ${parseInt(conf.peilv['fushi1'] * allResult.amount)} where telegramid = "${allResult.telegramid}";`
                            }
                        } else {
                            if (conf.istishishu) {
                                allResultMessage = `${allResultMessage}${allResult.firstname} ${allResult.guess} -${parseInt(allResult.amount)}\n`
                            }
                            allResultSql = `${allResultSql}update bet set result = 0 where id = ${allResult.id};`
                        }
                    }
                    if (allResult.guess == "豹子") {
                        if (resultdxds.baozi == 1) {
                            allResultMessage = `${allResultMessage}${allResult.firstname} ${allResult.guess} +${parseInt(conf.peilv['baozi'] * allResult.amount)}\n`
                            allResultSql = `${allResultSql}update bet set result = ${conf.peilv['baozi'] * allResult.amount} where id = ${allResult.id};update users set balance = balance + ${parseInt(conf.peilv['baozi'] * allResult.amount)} where telegramid = "${allResult.telegramid}";`
                        } else {
                            if (conf.istishishu) {
                                allResultMessage = `${allResultMessage}${allResult.firstname} ${allResult.guess} -${parseInt(allResult.amount)}\n`
                            }
                            allResultSql = `${allResultSql}update bet set result = 0 where id = ${allResult.id};`
                        }
                    }
                    if (allResult.guess == "顺子") {
                        if (resultdxds.shunzi == 1) {
                            allResultMessage = `${allResultMessage}${allResult.firstname} ${allResult.guess} +${parseInt(conf.peilv['shunzi'] * allResult.amount)}\n`
                            allResultSql = `${allResultSql}update bet set result = ${conf.peilv['shunzi'] * allResult.amount} where id = ${allResult.id};update users set balance = balance + ${parseInt(conf.peilv['shunzi'] * allResult.amount)} where telegramid = "${allResult.telegramid}";`
                        } else {
                            if (conf.istishishu) {
                                allResultMessage = `${allResultMessage}${allResult.firstname} ${allResult.guess} -${parseInt(allResult.amount)}\n`
                            }
                            allResultSql = `${allResultSql}update bet set result = 0 where id = ${allResult.id};`
                        }
                    }
                    if (allResult.guess == "对子") {
                        if (resultdxds.duizi == 1) {
                            allResultMessage = `${allResultMessage}${allResult.firstname} ${allResult.guess} +${parseInt(conf.peilv['duizi'] * allResult.amount)}\n`
                            allResultSql = `${allResultSql}update bet set result = ${conf.peilv['duizi'] * allResult.amount} where id = ${allResult.id};update users set balance = balance + ${parseInt(conf.peilv['duizi'] * allResult.amount)} where telegramid = "${allResult.telegramid}";`
                        } else {
                            if (conf.istishishu) {
                                allResultMessage = `${allResultMessage}${allResult.firstname} ${allResult.guess} -${parseInt(allResult.amount)}\n`
                            }
                            allResultSql = `${allResultSql}update bet set result = 0 where id = ${allResult.id};`
                        }
                    }

                    if (allResult.guess.search("杀") != -1 && allResult.guess.search("点") != -1) {
                        if (parseInt(allResult.guess.split("点")[0].split("杀")[1]) == value) {
                            allResultMessage = `${allResultMessage}${allResult.firstname} ${allResult.guess} +${parseInt(conf.peilv['s' + value + 'd'] * allResult.amount)}\n`
                            allResultSql = `${allResultSql}update bet set result = ${conf.peilv['s' + value + 'd'] * allResult.amount} where id = ${allResult.id};update users set balance = balance + ${parseInt(conf.peilv['s' + value + 'd'] * allResult.amount)} where telegramid = "${allResult.telegramid}";`
                        } else {
                            if (conf.istishishu) {
                                allResultMessage = `${allResultMessage}${allResult.firstname} ${allResult.guess} -${parseInt(allResult.amount)}\n`
                            }
                            allResultSql = `${allResultSql}update bet set result = 0 where id = ${allResult.id};`
                        }
                    }

                    if (allResult.guess.search("豹子") != -1 && allResult.guess.search("点") != -1) {
                        if (parseInt(allResult.guess.split("点")[0].split("豹子")[1]) == value / 3 && resultdxds.baozi == 1) {
                            allResultMessage = `${allResultMessage}${allResult.firstname} ${allResult.guess} +${parseInt(conf.peilv['dsbz'] * allResult.amount)}\n`
                            allResultSql = `${allResultSql}update bet set result = ${conf.peilv['dsbz'] * allResult.amount} where id = ${allResult.id};update users set balance = balance + ${parseInt(conf.peilv['dsbz'] * allResult.amount)} where telegramid = "${allResult.telegramid}";`
                        } else {
                            if (conf.istishishu) {
                                allResultMessage = `${allResultMessage}${allResult.firstname} ${allResult.guess} -${parseInt(allResult.amount)}\n`
                            }
                            allResultSql = `${allResultSql}update bet set result = 0 where id = ${allResult.id};`
                        }
                    }

                }
                if (resultArray.length == 0 || allResultMessage == "") {
                    allResultMessage = `${allResultMessage}🈚人中奖\n `;
                }
                conf.pool.getConnection(function (err, connection) {
                    if (err) {
                        bot.sendMessage(conf.chatid, `${resultid}期开奖接口不稳定，但此期投注仍有效，请联系人工客服处理`, {
                            reply_markup: JSON.stringify({
                                inline_keyboard: conf.inline_keyboard
                            })
                        });
                        console.log(err);
                        return;
                    };

                    connection.query(`INSERT INTO result (id , one ,two ,three ,big ,small ,odd ,even ,baozi,shunzi,duizi,result_time ) VALUES ("${resultid}",${a},${b},${c},${resultdxds.big},${resultdxds.small},${resultdxds.odd},${resultdxds.even},${resultdxds.baozi},${resultdxds.shunzi},${resultdxds.duizi},now());${allResultSql}`, (error, result) => {
                        if (error) {
                            bot.sendMessage(conf.chatid, `${resultid}期开奖接口不稳定，但此期投注仍有效，请联系人工客服处理`, {
                                reply_markup: JSON.stringify({
                                    inline_keyboard: conf.inline_keyboard
                                })
                            });
                            console.log(error);
                            return;
                        }
                        connection.query(`SELECT * FROM result order by result_time desc LIMIT 20;`, (error, result) => {
                            if (error) throw error;
                            connection.destroy()
                            var historyResult = "";
                            for (let index = 0; index < result.length - 10; index++) {
                                iszaliu = 0;
                                if (result[index].baozi == 0 && result[index].shunzi == 0 && result[index].duizi == 0) {
                                    iszaliu = 1;
                                }
                                historyResult = `${historyResult}${result[index].id}期  ${result[index].one},${result[index].two},${result[index].three}  ${(result[index].big == 1 ? "大" : "")}${(result[index].small == 1 ? "小" : "")}${(result[index].odd == 1 ? "单|" : "")}${(result[index].even == 1 ? "双|" : "")}${(result[index].baozi == 1 ? "豹子" : "")}${(result[index].shunzi == 1 ? "顺子" : "")}${(result[index].duizi == 1 ? "对子" : "")}${(iszaliu == 1 ? "杂六" : "")}\n`;
                            }
                            if (allResultMessage.length > 600) {
                                allResultMessage = allResultMessage.substring(0, 600);
                                allResultMessage += `...等${resultArray.length}次投注\n`
                            }
                            var sendruselttxt = `${resultid}期开奖：\n${a} + ${b} + ${c} = ${a + b + c} (${daxiao} ${danshuang}${(baozi == "" ? baozi : " " + baozi + " ")}${(shunzi == "" ? shunzi : " " + shunzi)}${(duizi == "" ? duizi : " " + duizi)})\n➖➖➖➖➖➖➖➖➖➖➖➖➖\n本期返奖结果：\n${allResultMessage}➖➖➖➖➖➖➖➖➖➖➖➖➖\n开奖历史 (最近10期)：\n${historyResult}`;
                            setResultID();
                            setTimeout(function () {
                                if (conf.sendmode == "t") {
                                    bot.sendMessage(conf.chatid, sendruselttxt, {
                                        reply_markup: {
                                            inline_keyboard: conf.inline_keyboard
                                        }
                                    })
                                        .then(res => {
                                            isfengpan = false;
                                        });
                                } else if (conf.sendmode == "pt") {
                                    if (conf.ishistorypicture) {
                                        const { createCanvas, registerFont } = require('canvas')
                                        registerFont('./fount/wryh.ttf', { family: 'Sans' })

                                        const canvas = createCanvas(497, 651)
                                        const ctx = canvas.getContext('2d')
                                        ctx.fillStyle = '#353535';
                                        ctx.fillRect(0, 0, canvas.width, 35)

                                        ctx.fillStyle = '#f2f2f2';
                                        ctx.fillRect(330, 35, canvas.width, canvas.height - 35)

                                        ctx.font = '17px Sans'
                                        ctx.fillStyle = 'rgb(255,255,255)'
                                        ctx.fillText('回合', 40, 25)

                                        ctx.font = '17px Sans'
                                        ctx.fillStyle = 'rgb(255,255,255)'
                                        ctx.fillText('结果', 175, 25)

                                        ctx.font = '17px Sans'
                                        ctx.fillStyle = 'rgb(255,255,255)'
                                        ctx.fillText('特码', 280, 25)

                                        ctx.font = '17px Sans'
                                        ctx.fillStyle = 'rgb(255,255,255)'
                                        ctx.fillText('双面', 350, 25)

                                        ctx.font = '17px Sans'
                                        ctx.fillStyle = 'rgb(255,255,255)'
                                        ctx.fillText('形态', 420, 25)

                                        for (let index = 0; index < result.length; index++) {
                                            ctx.font = '17px Sans'
                                            ctx.fillStyle = 'rgb(0,0,0)'
                                            ctx.fillText(result[index].id, 10, (2 + index) * 30)


                                            ctx.beginPath();
                                            ctx.arc(155, (2 + index) * 30 - 5, 13, 0, 2 * Math.PI);
                                            ctx.fillStyle = '#960000'
                                            ctx.fill();
                                            ctx.closePath();

                                            ctx.beginPath();
                                            ctx.arc(195, (2 + index) * 30 - 5, 13, 0, 2 * Math.PI);
                                            ctx.fillStyle = '#960000'
                                            ctx.fill();
                                            ctx.closePath();

                                            ctx.beginPath();
                                            ctx.arc(235, (2 + index) * 30 - 5, 13, 0, 2 * Math.PI);
                                            ctx.fillStyle = '#960000'
                                            ctx.fill();
                                            ctx.closePath();

                                            ctx.font = '17px Sans'
                                            ctx.fillStyle = '#ffffff'
                                            ctx.fillText(`${result[index].one}      ${result[index].two}      ${result[index].three} `, 150, (2 + index) * 30)

                                            ctx.font = '17px Sans'
                                            ctx.fillStyle = '#000000'
                                            ctx.fillText(`${(result[index].one + result[index].two + result[index].three < 10 ? "0" + (result[index].one + result[index].two + result[index].three) : result[index].one + result[index].two + result[index].three)}`, 287, (2 + index) * 30)

                                            if (result[index].baozi != 1) {
                                                ctx.font = '17px Sans'
                                                if (result[index].big == 1) {
                                                    ctx.fillStyle = '#ea3335'
                                                    ctx.fillText(`大`, 350, (2 + index) * 30)
                                                } else {
                                                    ctx.fillStyle = '#123692'
                                                    ctx.fillText(`小`, 350, (2 + index) * 30)
                                                }
                                                if (result[index].odd == 1) {
                                                    ctx.fillStyle = '#123692'
                                                    ctx.fillText(`单`, 370, (2 + index) * 30)
                                                } else {
                                                    ctx.fillStyle = '#ea3335'
                                                    ctx.fillText(`双`, 370, (2 + index) * 30)
                                                }
                                            } else {
                                                ctx.fillStyle = '#000000'
                                                ctx.fillText(`无`, 360, (2 + index) * 30)
                                            }
                                            ctx.font = '17px Sans'
                                            if (result[index].baozi == 1) {
                                                ctx.fillStyle = '#8d0405'
                                                ctx.fillText(`豹子`, 420, (2 + index) * 30)
                                            } else if (result[index].duizi == 1) {
                                                ctx.fillStyle = '#f8a137'
                                                ctx.fillText(`对子`, 420, (2 + index) * 30)
                                            } else if (result[index].shunzi == 1) {
                                                ctx.fillStyle = '#390bce'
                                                ctx.fillText(`顺子`, 420, (2 + index) * 30)
                                            } else {
                                                ctx.fillStyle = '#66c96c'
                                                ctx.fillText(`杂六`, 420, (2 + index) * 30)
                                            }
                                            ctx.strokeStyle = '#e4e4e4'
                                            ctx.beginPath()
                                            ctx.lineTo(0, (2 + index) * 30 + 10)
                                            ctx.lineTo(canvas.width, (2 + index) * 30 + 10)
                                            ctx.stroke()
                                        }

                                        var base64Data = canvas.toDataURL().replace(/^data:image\/\w+;base64,/, "");
                                        var dataBuffer = new Buffer(base64Data, 'base64');
                                        fs.writeFile("img/result.jpg", dataBuffer, function (err) {
                                            bot.sendPhoto(conf.chatid, "img/result.jpg", {
                                            })
                                                .then(res => {
                                                    bot.sendPhoto(conf.chatid, 'img/ksxz.jpg', {
                                                        caption: `${resultid}期开奖：\n${a} + ${b} + ${c} = ${a + b + c} (${daxiao} ${danshuang}${(baozi == "" ? baozi : " " + baozi + " ")}${(shunzi == "" ? shunzi : " " + shunzi)}${(duizi == "" ? duizi : " " + duizi)})\n➖➖➖➖➖➖➖➖➖➖➖➖➖\n本期返奖结果：\n${allResultMessage}`,
                                                        reply_markup: {
                                                            inline_keyboard: conf.inline_keyboard
                                                        }
                                                    }).then(res => {
                                                        isfengpan = false;
                                                    });
                                                });

                                        });
                                    } else {
                                        bot.sendPhoto(conf.chatid, 'img/ksxz.jpg', {
                                            caption: sendruselttxt,
                                            reply_markup: {
                                                inline_keyboard: conf.inline_keyboard
                                            }
                                        }).then(res => {
                                            isfengpan = false;
                                        });
                                    }
                                }
                            }, 6000)
                        });
                    });
                });
            });
        });
    });
}