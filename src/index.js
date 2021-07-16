process.env.NTBA_FIX_319 = 1;
const TelegramBot = require("node-telegram-bot-api");
const fs = require("fs");
const config = require("./config");
const helpers = require("./helpers");
const keyboard = require("./keyboard");
const kb = require("./keyboard-buttons");
const mysql = require("mysql");
const bot = new TelegramBot(config.TOKEN, {
    polling: true,
});

/* DB */
var db_config = {
    host: "45.147.178.11",
    user: "letcop",
    password: "Jx7euJ87Zl8!@#",
    database: "letcop",
};
var connection;

function handleDisconnect() {
    connection = mysql.createConnection(db_config);
    connection.connect(function(err) {
        if (err) {
            console.log("error when connecting to db:", err);
            setTimeout(handleDisconnect, 2000);
        }
    });
    connection.on("error", function(err) {
        console.log("db error", err);
        if (err.code === "PROTOCOL_CONNECTION_LOST") {
            handleDisconnect();
        } else {
            throw err;
        }
    });
}

handleDisconnect();

/* Global */

let userDbData = {};
const admin = 386567097;

bot.onText(/\/start/, (msg) => {
    let userId = msg.from.id;
    let regName = msg.from.first_name;
    let regUsername = msg.from.username;
    const text = `Здравствуйте, ${msg.from.first_name}\n\n👥 Для продолжения выберете роль:`;
    connection.query(
        "SELECT * FROM users WHERE userid = ?", [helpers.getUserId(msg)],
        (error, results) => {
            if (error) {
                console.log("Ошибка при поиске в users", error);
            } else {
                if (results.length === 0) {
                    userDbData = results[0];
                    const user = [
                        helpers.getUserId(msg),
                        regName,
                        regUsername,
                        "true",
                        null,
                        0,
                    ];
                    const sql =
                        "INSERT INTO users(userid, regName, username, push, sendMsg, role) VALUES(?, ?, ?, ?, ?, ?)";
                    connection.query(sql, user, function(err, results) {
                        if (err) console.log(err);
                        else console.log("Юзер зареган");
                    });
                    bot.sendMessage(helpers.getChatId(msg), text, {
                        reply_markup: {
                            resize_keyboard: true,
                            inline_keyboard: [
                                [{
                                        text: "Исполнитель",
                                        callback_data: "var1",
                                    },
                                    {
                                        text: "Заказчик",
                                        callback_data: "var2",
                                    },
                                ],
                            ],
                        },
                    });
                } else if (results[0].role == 0) {
                    bot.sendMessage(helpers.getChatId(msg), text, {
                        reply_markup: {
                            resize_keyboard: true,
                            inline_keyboard: [
                                [{
                                        text: "Исполнитель",
                                        callback_data: "var1",
                                    },
                                    {
                                        text: "Заказчик",
                                        callback_data: "var2",
                                    },
                                ],
                            ],
                        },
                    });
                } else if (results[0].role == 1) {
                    bot.sendMessage(msg.chat.id, "Основное меню:", {
                        reply_markup: {
                            resize_keyboard: true,
                            keyboard: keyboard.freelancer,
                        },
                    });
                } else if (results[0].role == 2) {
                    bot.sendMessage(msg.chat.id, "Основное меню:", {
                        reply_markup: {
                            resize_keyboard: true,
                            keyboard: keyboard.home,
                        },
                    });
                } else if (results[0].role == 99) {
                    bot.sendMessage(msg.chat.id, "Основное меню:", {
                        reply_markup: {
                            resize_keyboard: true,
                            keyboard: keyboard.home,
                        },
                    });
                }
            }
        }
    );
});

bot.on("message", (msg) => {
    let userId = msg.from.id;
    const chatId = helpers.getChatId(msg);
    switch (msg.text) {
        case kb.home.add:
            bot.sendPhoto(
                chatId,
                fs.readFileSync(__dirname + "/images/img1.png"), {
                    caption: `📝 Отправьте текст вашего заказа/вакансии 

⚠️ Не забудь указать контакт для связи
            
✅ После модерации ваш заказ или вакансия появится в боте
            
Пример:
Ищу таргетолога для своего бизнеca, опыт не важен но желательно с кейсами пишите и оправляете мне в телеграме
            
Связь: @letcop_user_simple
(Оставляете свою юзер)`,
                }
            );
            connection.query(
                "SELECT * FROM users WHERE userid = ?", [helpers.getUserId(msg)],
                (error, results) => {
                    if (error) {
                        console.log(error);
                    } else {
                        if (results.length === 0) {} else if (results[0].sendMsg == null) {
                            const sql =
                                "UPDATE users SET sendMsg = 'text1' WHERE userid = ?";
                            connection.query(sql, userId, function(err, results) {});
                        }
                    }
                }
            );
            break;
        case kb.home.support:
            bot.sendPhoto(
                chatId,
                fs.readFileSync(__dirname + "/images/img2.png"), {
                    caption: `Если у вас возникли вопросы или предложения обращайтесь:

@Letcop_support_bot`,
                }
            );
            break;
        case kb.home.change:
            connection.query(
                "SELECT * FROM users WHERE userid = ?", [userId],
                (error, results) => {
                    if (error) {
                        console.log(error, "4");
                    } else {
                        if (results.length === 0) {
                            userDbData = results[0];
                            console.log(userDbData, "6");
                        } else if (results[0].role == 2) {
                            const sql = "UPDATE users SET role = '1' WHERE userid = ?";
                            connection.query(sql, userId, function(err, results) {
                                if (err) console.log(err, "5");
                                else console.log("Данные добавлены");
                            });
                        }
                    }
                }
            );
            bot.sendMessage(chatId, `Выберите профессию:`, {
                reply_markup: {
                    resize_keyboard: true,
                    inline_keyboard: [
                        [{
                                text: "Сайтолог",
                                callback_data: "prof1",
                            },
                            {
                                text: "Веб-дизайнер",
                                callback_data: "prof2",
                            },
                        ],
                        [{
                                text: "Граф. Дизайнер",
                                callback_data: "prof3",
                            },
                            {
                                text: "Таргетолог",
                                callback_data: "prof4",
                            },
                        ],
                        [{
                                text: "Программист",
                                callback_data: "prof5",
                            },
                            {
                                text: "СММ специалист",
                                callback_data: "prof6",
                            },
                        ],
                        [{
                            text: "Остальные/Другие",
                            callback_data: "prof7",
                        }, ],
                    ],
                },
            });
            break;
        case kb.freelancer.change:
            bot.sendMessage(chatId, `Выберите профессию:`, {
                reply_markup: {
                    resize_keyboard: true,
                    inline_keyboard: [
                        [{
                                text: "Сайтолог",
                                callback_data: "prof1",
                            },
                            {
                                text: "Веб-дизайнер",
                                callback_data: "prof2",
                            },
                        ],
                        [{
                                text: "Граф. Дизайнер",
                                callback_data: "prof3",
                            },
                            {
                                text: "Таргетолог",
                                callback_data: "prof4",
                            },
                        ],
                        [{
                                text: "Программист",
                                callback_data: "prof5",
                            },
                            {
                                text: "СММ специалист",
                                callback_data: "prof6",
                            },
                        ],
                        [{
                            text: "Остальные/Другие",
                            callback_data: "prof7",
                        }, ],
                    ],
                },
            });
            break;
        case kb.freelancer.push:
            connection.query(
                "SELECT * FROM users WHERE userid = ?", [helpers.getUserId(msg)],
                (error, results) => {
                    if (error) {
                        console.log(error);
                    } else {
                        if (results.length === 0) {} else if (results[0].push == "false") {
                            bot.sendMessage(msg.chat.id, "Уведомления:", {
                                reply_markup: {
                                    resize_keyboard: true,
                                    inline_keyboard: [
                                        [{
                                                text: "❌ Вкл",
                                                callback_data: "push1",
                                            },
                                            {
                                                text: "✅ Откл",
                                                callback_data: "push2",
                                            },
                                        ],
                                    ],
                                },
                            });
                        } else if (results[0].push == "true") {
                            bot.sendMessage(msg.chat.id, "Уведомления:", {
                                reply_markup: {
                                    resize_keyboard: true,
                                    inline_keyboard: [
                                        [{
                                                text: "✅ Вкл",
                                                callback_data: "push1",
                                            },
                                            {
                                                text: "❌ Откл",
                                                callback_data: "push2",
                                            },
                                        ],
                                    ],
                                },
                            });
                        } else if (results[0].role == 2) {
                            bot.sendMessage(msg.chat.id, "Основное меню:", {
                                reply_markup: {
                                    resize_keyboard: true,
                                    keyboard: keyboard.home,
                                },
                            });
                        }
                    }
                }
            );
            break;
    }
});

bot.on("message", (msg) => {
    let userId = msg.from.id;
    connection.query(
        "SELECT * FROM users WHERE userid = ?", [helpers.getUserId(msg)],
        (error, results) => {
            if (error) {
                console.log("Ошибка при поиске в users", error);
            } else {
                if (results.length === 0) {} else if (results[0].sendMsg == "text1") {
                    bot.sendMessage(admin, `Заявка на вакансию: ${msg.text}`);
                    const sql = "UPDATE users SET sendMsg = null WHERE userid = ?";
                    connection.query(sql, userId, function(err, results) {
                        if (err) console.log(err);
                        else {}
                    });
                } else if (results[0].sendMsg == "send1") {
                    connection.query(
                        "SELECT * FROM users WHERE role = 1 AND prof = 1 AND push = 'true'",
                        function(err, result, fields) {
                            if (err) throw err;
                            for (var key in result) {
                                bot.sendMessage(result[key].userid, msg.text);
                            }
                        }
                    );
                    const sql = "UPDATE users SET sendMsg = null WHERE userid = ?";
                    connection.query(sql, userId, function(err, results) {
                        if (err) console.log(err);
                    });
                } else if (results[0].sendMsg == "send2") {
                    connection.query(
                        "SELECT * FROM users WHERE role = 1 AND prof = 2 AND push = 'true'",
                        function(err, result, fields) {
                            if (err) throw err;
                            for (var key in result) {
                                bot.sendMessage(result[key].userid, msg.text);
                            }
                        }
                    );
                    const sql = "UPDATE users SET sendMsg = null WHERE userid = ?";
                    connection.query(sql, userId, function(err, results) {
                        if (err) console.log(err);
                    });
                } else if (results[0].sendMsg == "send3") {
                    connection.query(
                        "SELECT * FROM users WHERE role = 1 AND prof = 3 AND push = 'true'",
                        function(err, result, fields) {
                            if (err) throw err;
                            for (var key in result) {
                                bot.sendMessage(result[key].userid, msg.text);
                            }
                        }
                    );
                    const sql = "UPDATE users SET sendMsg = null WHERE userid = ?";
                    connection.query(sql, userId, function(err, results) {
                        if (err) console.log(err);
                    });
                } else if (results[0].sendMsg == "send4") {
                    connection.query(
                        "SELECT * FROM users WHERE role = 1 AND prof = 4 AND push = 'true'",
                        function(err, result, fields) {
                            if (err) throw err;
                            for (var key in result) {
                                bot.sendMessage(result[key].userid, msg.text);
                            }
                        }
                    );
                    const sql = "UPDATE users SET sendMsg = null WHERE userid = ?";
                    connection.query(sql, userId, function(err, results) {
                        if (err) console.log(err);
                    });
                } else if (results[0].sendMsg == "send5") {
                    connection.query(
                        "SELECT * FROM users WHERE role = 1 AND prof = 5 AND push = 'true'",
                        function(err, result, fields) {
                            if (err) throw err;
                            for (var key in result) {
                                bot.sendMessage(result[key].userid, msg.text);
                            }
                        }
                    );
                    const sql = "UPDATE users SET sendMsg = null WHERE userid = ?";
                    connection.query(sql, userId, function(err, results) {
                        if (err) console.log(err);
                    });
                } else if (results[0].sendMsg == "send6") {
                    connection.query(
                        "SELECT * FROM users WHERE role = 1 AND prof = 6 AND push = 'true'",
                        function(err, result, fields) {
                            if (err) throw err;
                            for (var key in result) {
                                bot.sendMessage(result[key].userid, msg.text);
                            }
                        }
                    );
                    const sql = "UPDATE users SET sendMsg = null WHERE userid = ?";
                    connection.query(sql, userId, function(err, results) {
                        if (err) console.log(err);
                    });
                } else if (results[0].sendMsg == "send7") {
                    connection.query(
                        "SELECT * FROM users WHERE role = 1 AND prof = 7 AND push = 'true'",
                        function(err, result, fields) {
                            if (err) throw err;
                            for (var key in result) {
                                bot.sendMessage(result[key].userid, msg.text);
                            }
                        }
                    );
                    const sql = "UPDATE users SET sendMsg = null WHERE userid = ?";
                    connection.query(sql, userId, function(err, results) {
                        if (err) console.log(err);
                    });
                }
            }
        }
    );
});

bot.onText(/\/send/, (msg) => {
    const text = `Привет админ, по имени ${msg.from.first_name}\n\n👥 Для продолжения выбери что хочешь:`;
    let userId = msg.from.id;
    connection.query(
        "SELECT * FROM users WHERE userid = ?", [helpers.getUserId(msg)],
        (error, results) => {
            if (error) {
                console.log("Ошибка при поиске в users", error);
            } else {
                if (results.length === 0) {} else if (results[0].role == 99) {
                    bot.sendMessage(helpers.getChatId(msg), text, {
                        reply_markup: {
                            resize_keyboard: true,
                            inline_keyboard: [
                                [{
                                        text: "Сайтолог",
                                        callback_data: "sendVac1",
                                    },
                                    {
                                        text: "Веб-дизайнер",
                                        callback_data: "sendVac2",
                                    },
                                ],
                                [{
                                        text: "Граф. Дизайнер",
                                        callback_data: "sendVac3",
                                    },
                                    {
                                        text: "Таргетолог",
                                        callback_data: "sendVac4",
                                    },
                                ],
                                [{
                                        text: "Программист",
                                        callback_data: "sendVac5",
                                    },
                                    {
                                        text: "СММ специалист",
                                        callback_data: "sendVac6",
                                    },
                                ],
                                [{
                                    text: "Остальные/Другие",
                                    callback_data: "sendVac7",
                                }, ],
                            ],
                        },
                    });
                } else {
                    console.log("Не размещу");
                }
            }
        }
    );
});

bot.on("callback_query", (callbackQuery) => {
    const msg = callbackQuery.message;
    const userId = callbackQuery.from.id;
    const msgId = callbackQuery.data;
    if (msgId === "var1") {
        bot.answerCallbackQuery(callbackQuery.id).then(() =>
            bot.sendMessage(msg.chat.id, "Выберите профессию:", {
                reply_markup: {
                    resize_keyboard: true,
                    inline_keyboard: [
                        [{
                                text: "Сайтолог",
                                callback_data: "prof1",
                            },
                            {
                                text: "Веб-дизайнер",
                                callback_data: "prof2",
                            },
                        ],
                        [{
                                text: "Граф. Дизайнер",
                                callback_data: "prof3",
                            },
                            {
                                text: "Таргетолог",
                                callback_data: "prof4",
                            },
                        ],
                        [{
                                text: "Программист",
                                callback_data: "prof5",
                            },
                            {
                                text: "СММ специалист",
                                callback_data: "prof6",
                            },
                        ],
                        [{
                            text: "Остальные/Другие",
                            callback_data: "prof7",
                        }, ],
                    ],
                },
            })
        );
        bot.deleteMessage(msg.chat.id, msg.message_id);
        connection.query(
            "SELECT * FROM users WHERE userid = ?", [userId],
            (error, results) => {
                if (error) {
                    console.log(error, "4");
                } else {
                    if (results.length === 0) {
                        userDbData = results[0];
                        console.log(userDbData, "6");
                    } else {
                        const sql = "UPDATE users SET role = '1' WHERE userid = ?";
                        connection.query(sql, userId, function(err, results) {
                            if (err) console.log(err, "5");
                            else console.log("Данные добавлены");
                        });
                    }
                }
            }
        );
    } else if (msgId === "var2") {
        bot.answerCallbackQuery(callbackQuery.id).then(() =>
            bot.sendMessage(msg.chat.id, "Основное меню:", {
                reply_markup: {
                    resize_keyboard: true,
                    keyboard: keyboard.home,
                },
            })
        );
        bot.deleteMessage(msg.chat.id, msg.message_id);
        connection.query(
            "SELECT * FROM users WHERE userid = ?", [userId],
            (error, results) => {
                if (error) {
                    console.log(error, "4");
                } else {
                    if (results.length === 0) {
                        userDbData = results[0];
                        console.log(userDbData, "6");
                    } else {
                        const sql = "UPDATE users SET role = '2' WHERE userid = ?";
                        connection.query(sql, userId, function(err, results) {
                            if (err) console.log(err, "5");
                            else console.log("Данные добавлены");
                        });
                    }
                }
            }
        );
    } else if (msgId === "prof1") {
        bot.answerCallbackQuery(callbackQuery.id).then(() =>
            bot.sendMessage(msg.chat.id, "Основное меню:", {
                reply_markup: {
                    resize_keyboard: true,
                    keyboard: keyboard.freelancer,
                },
            })
        );
        bot.deleteMessage(msg.chat.id, msg.message_id);
        connection.query(
            "SELECT * FROM users WHERE userid = ?", [userId],
            (error, results) => {
                if (error) {
                    console.log(error, "4");
                } else {
                    if (results.length === 0) {
                        userDbData = results[0];
                        console.log(userDbData, "6");
                    } else {
                        const sql = "UPDATE users SET prof = '1' WHERE userid = ?";
                        connection.query(sql, userId, function(err, results) {
                            if (err) console.log(err, "5");
                            else console.log("Данные добавлены");
                        });
                    }
                }
            }
        );
    } else if (msgId === "prof2") {
        bot.answerCallbackQuery(callbackQuery.id).then(() =>
            bot.sendMessage(msg.chat.id, "Основное меню:", {
                reply_markup: {
                    resize_keyboard: true,
                    keyboard: keyboard.freelancer,
                },
            })
        );
        bot.deleteMessage(msg.chat.id, msg.message_id);
        connection.query(
            "SELECT * FROM users WHERE userid = ?", [userId],
            (error, results) => {
                if (error) {
                    console.log(error, "4");
                } else {
                    if (results.length === 0) {
                        userDbData = results[0];
                        console.log(userDbData, "6");
                    } else {
                        const sql = "UPDATE users SET prof = '2' WHERE userid = ?";
                        connection.query(sql, userId, function(err, results) {
                            if (err) console.log(err, "5");
                            else console.log("Данные добавлены");
                        });
                    }
                }
            }
        );
    } else if (msgId === "prof3") {
        bot.answerCallbackQuery(callbackQuery.id).then(() =>
            bot.sendMessage(msg.chat.id, "Основное меню:", {
                reply_markup: {
                    resize_keyboard: true,
                    keyboard: keyboard.freelancer,
                },
            })
        );
        bot.deleteMessage(msg.chat.id, msg.message_id);
        connection.query(
            "SELECT * FROM users WHERE userid = ?", [userId],
            (error, results) => {
                if (error) {
                    console.log(error, "4");
                } else {
                    if (results.length === 0) {
                        userDbData = results[0];
                        console.log(userDbData, "6");
                    } else {
                        const sql = "UPDATE users SET prof = '3' WHERE userid = ?";
                        connection.query(sql, userId, function(err, results) {
                            if (err) console.log(err, "5");
                            else console.log("Данные добавлены");
                        });
                    }
                }
            }
        );
    } else if (msgId === "prof4") {
        bot.answerCallbackQuery(callbackQuery.id).then(() =>
            bot.sendMessage(msg.chat.id, "Основное меню:", {
                reply_markup: {
                    resize_keyboard: true,
                    keyboard: keyboard.freelancer,
                },
            })
        );
        bot.deleteMessage(msg.chat.id, msg.message_id);
        connection.query(
            "SELECT * FROM users WHERE userid = ?", [userId],
            (error, results) => {
                if (error) {
                    console.log(error, "4");
                } else {
                    if (results.length === 0) {
                        userDbData = results[0];
                        console.log(userDbData, "6");
                    } else {
                        const sql = "UPDATE users SET prof = '4' WHERE userid = ?";
                        connection.query(sql, userId, function(err, results) {
                            if (err) console.log(err, "5");
                            else console.log("Данные добавлены");
                        });
                    }
                }
            }
        );
    } else if (msgId === "prof5") {
        bot.answerCallbackQuery(callbackQuery.id).then(() =>
            bot.sendMessage(msg.chat.id, "Основное меню:", {
                reply_markup: {
                    resize_keyboard: true,
                    keyboard: keyboard.freelancer,
                },
            })
        );
        bot.deleteMessage(msg.chat.id, msg.message_id);
        connection.query(
            "SELECT * FROM users WHERE userid = ?", [userId],
            (error, results) => {
                if (error) {
                    console.log(error, "4");
                } else {
                    if (results.length === 0) {
                        userDbData = results[0];
                        console.log(userDbData, "6");
                    } else {
                        const sql = "UPDATE users SET prof = '5' WHERE userid = ?";
                        connection.query(sql, userId, function(err, results) {
                            if (err) console.log(err, "5");
                            else console.log("Данные добавлены");
                        });
                    }
                }
            }
        );
    } else if (msgId === "prof6") {
        bot.answerCallbackQuery(callbackQuery.id).then(() =>
            bot.sendMessage(msg.chat.id, "Основное меню:", {
                reply_markup: {
                    resize_keyboard: true,
                    keyboard: keyboard.freelancer,
                },
            })
        );
        bot.deleteMessage(msg.chat.id, msg.message_id);
        connection.query(
            "SELECT * FROM users WHERE userid = ?", [userId],
            (error, results) => {
                if (error) {
                    console.log(error, "4");
                } else {
                    if (results.length === 0) {
                        userDbData = results[0];
                        console.log(userDbData, "6");
                    } else {
                        const sql = "UPDATE users SET prof = '6' WHERE userid = ?";
                        connection.query(sql, userId, function(err, results) {
                            if (err) console.log(err, "5");
                            else console.log("Данные добавлены");
                        });
                    }
                }
            }
        );
    } else if (msgId === "prof72") {
        bot.answerCallbackQuery(callbackQuery.id).then(() =>
            bot.sendMessage(msg.chat.id, "Основное меню:", {
                reply_markup: {
                    resize_keyboard: true,
                    keyboard: keyboard.freelancer,
                },
            })
        );
        bot.deleteMessage(msg.chat.id, msg.message_id);
        connection.query(
            "SELECT * FROM users WHERE userid = ?", [userId],
            (error, results) => {
                if (error) {
                    console.log(error, "4");
                } else {
                    if (results.length === 0) {
                        userDbData = results[0];
                        console.log(userDbData, "6");
                    } else {
                        const sql = "UPDATE users SET prof = '7' WHERE userid = ?";
                        connection.query(sql, userId, function(err, results) {
                            if (err) console.log(err, "5");
                            else console.log("Данные добавлены");
                        });
                    }
                }
            }
        );
    } else if (msgId === "push1") {
        bot.answerCallbackQuery(callbackQuery.id, `Уведомления включены`);
        bot.answerCallbackQuery(callbackQuery.id).then(() =>
            bot.sendMessage(msg.chat.id, "Уведомления:", {
                reply_markup: {
                    resize_keyboard: true,
                    inline_keyboard: [
                        [{
                                text: "✅ Вкл",
                                callback_data: "push1",
                            },
                            {
                                text: "❌ Откл",
                                callback_data: "push2",
                            },
                        ],
                    ],
                },
            })
        );
        bot.deleteMessage(msg.chat.id, msg.message_id);
        connection.query(
            "SELECT * FROM users WHERE userid = ?", [userId],
            (error, results) => {
                if (error) {
                    console.log(error, "4");
                } else {
                    if (results.length === 0) {
                        userDbData = results[0];
                        console.log(userDbData, "6");
                    } else {
                        const sql = "UPDATE users SET push = 'true' WHERE userid = ?";
                        connection.query(sql, userId, function(err, results) {
                            if (err) console.log(err, "5");
                            else console.log("Данные добавлены");
                        });
                    }
                }
            }
        );
    } else if (msgId === "push2") {
        bot.answerCallbackQuery(callbackQuery.id, `Уведомления отключены`);
        bot.answerCallbackQuery(callbackQuery.id).then(() =>
            bot.sendMessage(msg.chat.id, "Уведомления:", {
                reply_markup: {
                    resize_keyboard: true,
                    inline_keyboard: [
                        [{
                                text: "❌ Вкл",
                                callback_data: "push1",
                            },
                            {
                                text: "✅ Откл",
                                callback_data: "push2",
                            },
                        ],
                    ],
                },
            })
        );
        bot.deleteMessage(msg.chat.id, msg.message_id);
        connection.query(
            "SELECT * FROM users WHERE userid = ?", [userId],
            (error, results) => {
                if (error) {
                    console.log(error, "4");
                } else {
                    if (results.length === 0) {
                        userDbData = results[0];
                        console.log(userDbData, "6");
                    } else {
                        const sql =
                            "UPDATE users SET push = 'false' WHERE userid = ?";
                        connection.query(sql, userId, function(err, results) {
                            if (err) console.log(err, "5");
                            else console.log("Данные добавлены");
                        });
                    }
                }
            }
        );
    } else if (msgId === "sendVac1") {
        connection.query(
            "SELECT * FROM users WHERE userid = ?", [userId],
            (error, results) => {
                if (error) {
                    console.log("Ошибка при поиске в users", error);
                } else {
                    if (results[0].sendMsg == null) {
                        const sql =
                            "UPDATE users SET sendMsg = 'send1' WHERE userid = ?";
                        connection.query(sql, userId, function(err, results) {
                            if (err) console.log(err, "5");
                            else console.log("Данные добавлены 2");
                        });
                    } else {
                        console.log("test2");
                    }
                }
            }
        );
    } else if (msgId === "sendVac2") {
        connection.query(
            "SELECT * FROM users WHERE userid = ?", [userId],
            (error, results) => {
                if (error) {
                    console.log("Ошибка при поиске в users", error);
                } else {
                    if (results[0].sendMsg == null) {
                        const sql =
                            "UPDATE users SET sendMsg = 'send2' WHERE userid = ?";
                        connection.query(sql, userId, function(err, results) {
                            if (err) console.log(err, "5");
                            else console.log("Данные добавлены 2");
                        });
                    } else {
                        console.log("test2");
                    }
                }
            }
        );
    } else if (msgId === "sendVac3") {
        connection.query(
            "SELECT * FROM users WHERE userid = ?", [userId],
            (error, results) => {
                if (error) {
                    console.log("Ошибка при поиске в users", error);
                } else {
                    if (results[0].sendMsg == null) {
                        const sql =
                            "UPDATE users SET sendMsg = 'send3' WHERE userid = ?";
                        connection.query(sql, userId, function(err, results) {
                            if (err) console.log(err, "5");
                            else console.log("Данные добавлены 2");
                        });
                    } else {
                        console.log("test2");
                    }
                }
            }
        );
    } else if (msgId === "sendVac4") {
        connection.query(
            "SELECT * FROM users WHERE userid = ?", [userId],
            (error, results) => {
                if (error) {
                    console.log("Ошибка при поиске в users", error);
                } else {
                    if (results[0].sendMsg == null) {
                        const sql =
                            "UPDATE users SET sendMsg = 'send4' WHERE userid = ?";
                        connection.query(sql, userId, function(err, results) {
                            if (err) console.log(err, "5");
                            else console.log("Данные добавлены 2");
                        });
                    } else {
                        console.log("test2");
                    }
                }
            }
        );
    } else if (msgId === "sendVac5") {
        connection.query(
            "SELECT * FROM users WHERE userid = ?", [userId],
            (error, results) => {
                if (error) {
                    console.log("Ошибка при поиске в users", error);
                } else {
                    if (results[0].sendMsg == null) {
                        const sql =
                            "UPDATE users SET sendMsg = 'send5' WHERE userid = ?";
                        connection.query(sql, userId, function(err, results) {
                            if (err) console.log(err, "5");
                            else console.log("Данные добавлены 2");
                        });
                    } else {
                        console.log("test2");
                    }
                }
            }
        );
    } else if (msgId === "sendVac6") {
        connection.query(
            "SELECT * FROM users WHERE userid = ?", [userId],
            (error, results) => {
                if (error) {
                    console.log("Ошибка при поиске в users", error);
                } else {
                    if (results[0].sendMsg == null) {
                        const sql =
                            "UPDATE users SET sendMsg = 'send6' WHERE userid = ?";
                        connection.query(sql, userId, function(err, results) {
                            if (err) console.log(err, "5");
                            else console.log("Данные добавлены 2");
                        });
                    } else {
                        console.log("test2");
                    }
                }
            }
        );
    } else if (msgId === "sendVac7") {
        connection.query(
            "SELECT * FROM users WHERE userid = ?", [userId],
            (error, results) => {
                if (error) {
                    console.log("Ошибка при поиске в users", error);
                } else {
                    if (results[0].sendMsg == null) {
                        const sql =
                            "UPDATE users SET sendMsg = 'send7' WHERE userid = ?";
                        connection.query(sql, userId, function(err, results) {
                            if (err) console.log(err, "5");
                            else console.log("Данные добавлены 2");
                        });
                    } else {
                        console.log("test2");
                    }
                }
            }
        );
    } else {
        console.log("Не работает");
    }
});

bot.on("polling_error", (error) => console.log(error));