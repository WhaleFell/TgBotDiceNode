var express = require('express');
var mysql = require('mysql');
var TelegramBot = require('node-telegram-bot-api');
var conf = require('../config/conf');
var common = require('../config/common');

var route = express.Router();

// 插入一条用户支付
route.get('/table/pay/insert', (req, res) => {
    conf.pool.getConnection(function (err, connection) {
        var params = JSON.parse(req.query.data);
        if (err) {
            common.reqError(res);
        } else if (common.oc(req)) {
            connection.query(`SELECT * FROM users where name = "${params.name}";`, (error, result) => {
                if (error || result.length == 0) {
                    common.reqError(res);
                    return
                }
                connection.query(`Insert into pay (telegramid,name,amount,state,way,applytime,changetime) values ("${result[0].telegramid}","${params.name}",${params.amount},"1","${params.way}",now(),now()) ;update users set balance = balance + ${params.amount} where telegramid = ${result[0].telegramid}`, (error, result) => {
                    connection.destroy();
                    if (error) {
                        common.reqError(res);
                    } else {
                        res.send({
                            code: 200,
                            msg: result
                        })
                    }
                });
            });
        } else {
            common.reqError(res);
        }
    });
})

// 上分允许
route.get('/table/pay/go', (req, res) => {
    conf.pool.getConnection(function (err, connection) {
        var params = JSON.parse(req.query.data);
        if (err) {
            common.reqError(res);
        } else if (common.oc(req)) {
            connection.query(`update pay set state = 1 , changetime = now() where id = ${params.id};update users set balance = balance + ${params.amount} where telegramid = ${params.telegramid};`, (error, result) => {
                connection.destroy();
                if (error) {
                    common.reqError(res);
                } else {
                    res.send({
                        code: 200,
                        msg: result
                    })
                }
            });
        } else {
            common.reqError(res);
        }
    });
})

// 上分拒绝
route.get('/table/pay/refuse', (req, res) => {
    conf.pool.getConnection(function (err, connection) {
        var params = JSON.parse(req.query.data);
        if (err) {
            common.reqError(res);
        } else if (common.oc(req)) {
            connection.query(`update pay set state = -1 , changetime = now() where id = ${params.id};`, (error, result) => {
                connection.destroy();
                if (error) {
                    common.reqError(res);
                } else {
                    res.send({
                        code: 200,
                        msg: result
                    })
                }
            });
        } else {
            common.reqError(res);
        }
    });
})

// 获取上分申请
route.get('/table/pay/apply', (req, res) => {
    conf.pool.getConnection(function (err, connection) {
        var params = req.query;
        if (err) {
            common.reqError(res);
        } else if (common.oc(req)) {
            connection.query(`SELECT * FROM pay where state = 0 order by id desc;`, (error, result) => {
                connection.destroy();
                if (error) {
                    common.reqError(res);
                } else {
                    res.send({
                        code: 0,
                        msg: "",
                        count: result.length,
                        data: result
                    })
                }
            });
        } else {
            common.reqError(res);
        }
    });
})

// 上分搜索
route.get('/table/pay/apply/search', (req, res) => {
    conf.pool.getConnection(function (err, connection) {
        var params = req.query;
        if (err) {
            common.reqError(res);
        } else if (common.oc(req)) {
            connection.query(`SELECT * FROM pay where ${params.key} = "${params.value}" AND state = 0;`, (error, result) => {
                var count = result.length;
                connection.query(`SELECT * FROM pay where ${params.key} = "${params.value}" and state = 0 order by id desc limit ${(params.page - 1) * params.limit} , ${params.limit};`, (error, result) => {
                    connection.destroy();
                    if (error) {
                        common.reqError(res);
                    } else {
                        res.send({
                            code: 0,
                            msg: "",
                            count: count,
                            data: result
                        })
                    }
                });
            });
        } else {
            common.reqError(res);
        }
    });
})

// 上分更新
route.get('/table/pay/update', (req, res) => {
    conf.pool.getConnection(function (err, connection) {
        var params = JSON.parse(req.query.data);
        if (err) {
            common.reqError(res);
        } else if (common.oc(req)) {
            connection.query(`Update pay set telegramid = "${params.telegramid}",name = "${params.name}",amount = ${params.amount},way = "${params.way}",applytime = "${params.applytime}" WHERE id = ${params.id};`, (error, result) => {
                connection.destroy();
                if (error) {
                    common.reqError(res);
                } else {
                    res.send({
                        code: 200,
                        msg: result
                    })
                }
            });
        } else {
            common.reqError(res);
        }
    });
})

// 上分取消
route.get('/table/pay/delete', (req, res) => {
    conf.pool.getConnection(function (err, connection) {
        var params = req.query;
        if (err) {
            common.reqError(res);
        } else if (common.oc(req)) {
            connection.query(`DELETE FROM pay WHERE id = ${params.id};`, (error, result) => {
                connection.destroy();
                if (error) {
                    common.reqError(res);
                } else {
                    res.send({
                        code: 200,
                        msg: result
                    })
                }
            });
        } else {
            common.reqError(res);
        }
    });
})

// 搜索上分
route.get('/table/pay/search', (req, res) => {
    conf.pool.getConnection(function (err, connection) {
        var params = req.query;
        if (err) {
            common.reqError(res);
        } else if (common.oc(req)) {
            connection.query(`SELECT * FROM pay where ${params.key} = "${params.value}";`, (error, result) => {
                var count = result.length;
                connection.query(`SELECT * FROM pay where ${params.key} = "${params.value}" order by id desc limit ${(params.page - 1) * params.limit} , ${params.limit};`, (error, result) => {
                    connection.destroy();
                    if (error) {
                        common.reqError(res);
                    } else {
                        res.send({
                            code: 0,
                            msg: "",
                            count: count,
                            data: result
                        })
                    }
                });
            });
        } else {
            common.reqError(res);
        }
    });
})
// 查询全部上分
route.get('/table/pay', (req, res) => {
    conf.pool.getConnection(function (err, connection) {
        var params = req.query;
        if (err) {
            common.reqError(res);
        } else if (common.oc(req)) {
            connection.query(`SELECT * FROM pay order by id desc;`, (error, result) => {
                connection.destroy();
                if (error) {
                    common.reqError(res);
                } else {
                    res.send({
                        code: 0,
                        msg: "",
                        count: result.length,
                        data: result
                    })
                }
            });
        } else {
            common.reqError(res);
        }
    });
})
/***************withdrawal 下分****************** */
// 插入下分
route.get('/table/withdrawal/insert', (req, res) => {
    conf.pool.getConnection(function (err, connection) {
        var params = JSON.parse(req.query.data);
        if (err) {
            common.reqError(res);
        } else if (common.oc(req)) {
            connection.query(`SELECT * FROM users where name = "${params.name}";`, (error, result) => {
                if (error || result.length == 0) {
                    common.reqError(res);
                    return
                }
                connection.query(`Insert into withdrawal (telegramid,name,amount,state,way,applytime,changetime) values ("${result[0].telegramid}","${params.name}",${params.amount},"1","${params.way}",now(),now()) ;update users set balance = balance - ${params.amount} where telegramid = ${result[0].telegramid}`, (error, result) => {
                    connection.destroy();
                    if (error) {
                        common.reqError(res);
                    } else {
                        res.send({
                            code: 200,
                            msg: result
                        })
                    }
                });
            });
        } else {
            common.reqError(res);
        }
    });
})

// 确定下分
route.get('/table/withdrawal/go', (req, res) => {
    conf.pool.getConnection(function (err, connection) {
        var params = JSON.parse(req.query.data);
        if (err) {
            common.reqError(res);
        } else if (common.oc(req)) {
            connection.query(`update withdrawal set state = 1, changetime = now() where id = ${params.id};`, (error, result) => {
                connection.destroy();
                if (error) {
                    common.reqError(res);
                } else {
                    res.send({
                        code: 200,
                        msg: result
                    })
                }
            });
        } else {
            common.reqError(res);
        }
    });
})

// 拒绝下分
route.get('/table/withdrawal/refuse', (req, res) => {
    conf.pool.getConnection(function (err, connection) {
        var params = JSON.parse(req.query.data);
        if (err) {
            common.reqError(res);
        } else if (common.oc(req)) {
            connection.query(`update withdrawal set state = -1 , changetime = now() where id = ${params.id};update users set balance = balance + ${params.amount} where telegramid = ${params.telegramid};`, (error, result) => {
                connection.destroy();
                if (error) {
                    common.reqError(res);
                } else {
                    res.send({
                        code: 200,
                        msg: result
                    })
                }
            });
        } else {
            common.reqError(res);
        }
    });
})

// 下分申请
route.get('/table/withdrawal/apply', (req, res) => {
    conf.pool.getConnection(function (err, connection) {
        var params = req.query;
        if (err) {
            common.reqError(res);
        } else if (common.oc(req)) {
            connection.query(`SELECT * FROM withdrawal where state = 0 order by id desc;`, (error, result) => {
                connection.destroy();
                if (error) {
                    common.reqError(res);
                } else {
                    res.send({
                        code: 0,
                        msg: "",
                        count: result.length,
                        data: result
                    })
                }
            });
        } else {
            common.reqError(res);
        }
    });
})

// 下分申请搜索
route.get('/table/withdrawal/apply/search', (req, res) => {
    conf.pool.getConnection(function (err, connection) {
        var params = req.query;
        if (err) {
            common.reqError(res);
        } else if (common.oc(req)) {
            connection.query(`SELECT * FROM withdrawal where ${params.key} = "${params.value}" AND state = 0;`, (error, result) => {
                var count = result.length;
                connection.query(`SELECT * FROM withdrawal where ${params.key} = "${params.value}" and state = 0 order by id desc limit ${(params.page - 1) * params.limit} , ${params.limit};`, (error, result) => {
                    connection.destroy();
                    if (error) {
                        common.reqError(res);
                    } else {
                        res.send({
                            code: 0,
                            msg: "",
                            count: count,
                            data: result
                        })
                    }
                });
            });
        } else {
            common.reqError(res);
        }
    });
})

// 下分搜索
route.get('/table/withdrawal/search', (req, res) => {
    conf.pool.getConnection(function (err, connection) {
        var params = req.query;
        if (err) {
            common.reqError(res);
        } else if (common.oc(req)) {
            connection.query(`SELECT * FROM withdrawal where ${params.key} = "${params.value}";`, (error, result) => {
                var count = result.length;
                connection.query(`SELECT * FROM withdrawal where ${params.key} = "${params.value}" order by id desc limit ${(params.page - 1) * params.limit} , ${params.limit};`, (error, result) => {
                    connection.destroy();
                    if (error) {
                        common.reqError(res);
                    } else {
                        res.send({
                            code: 0,
                            msg: "",
                            count: count,
                            data: result
                        })
                    }
                });
            });
        } else {
            common.reqError(res);
        }
    });
})

// 更新下分
route.get('/table/withdrawal/update', (req, res) => {
    conf.pool.getConnection(function (err, connection) {
        var params = JSON.parse(req.query.data);
        if (err) {
            common.reqError(res);
        } else if (common.oc(req)) {
            connection.query(`Update withdrawal set telegramid = "${params.telegramid}",name = "${params.name}",amount = ${params.amount},way = "${params.way}",applytime = "${params.applytime}" WHERE id = ${params.id};`, (error, result) => {
                connection.destroy();
                if (error) {
                    common.reqError(res);
                } else {
                    res.send({
                        code: 200,
                        msg: result
                    })
                }
            });
        } else {
            common.reqError(res);
        }
    });
})

// 查询下分
route.get('/table/withdrawal', (req, res) => {
    conf.pool.getConnection(function (err, connection) {
        var params = req.query;
        if (err) {
            common.reqError(res);
        } else if (common.oc(req)) {
            connection.query(`SELECT * FROM withdrawal order by id desc;`, (error, result) => {
                connection.destroy();
                if (error) {
                    common.reqError(res);
                } else {
                    res.send({
                        code: 0,
                        msg: "",
                        count: result.length,
                        data: result
                    })
                }
            });
        } else {
            common.reqError(res);
        }
    });
})

route.get('/table/users', (req, res) => {
    conf.pool.getConnection(function (err, connection) {
        var params = req.query;
        if (err) {
            common.reqError(res);
        } else if (common.oc(req)) {
            connection.query(`SELECT * FROM users order by id desc;`, (error, result) => {
                connection.destroy();
                if (error) {
                    common.reqError(res);
                } else {
                    res.send({
                        code: 0,
                        msg: "",
                        count: result.length,
                        data: result
                    })
                }
            });
        } else {
            common.reqError(res);
        }
    });
})

route.get('/table/users/search', (req, res) => {
    conf.pool.getConnection(function (err, connection) {
        var params = req.query;
        if (err) {
            common.reqError(res);
        } else if (common.oc(req)) {
            connection.query(`SELECT * FROM users where ${params.key} = "${params.value}";`, (error, result) => {
                var count = result.length;
                connection.query(`SELECT * FROM users where ${params.key} = "${params.value}" order by id desc limit ${(params.page - 1) * params.limit} , ${params.limit};`, (error, result) => {
                    connection.destroy();
                    if (error) {
                        common.reqError(res);
                    } else {
                        res.send({
                            code: 0,
                            msg: "",
                            count: count,
                            data: result
                        })
                    }
                });
            });
        } else {
            common.reqError(res);
        }
    });
})
// 查询所有投注
route.get('/table/bet', (req, res) => {
    conf.pool.getConnection(function (err, connection) {
        var params = req.query;
        if (err) {
            common.reqError(res);
        } else if (common.oc(req)) {
            connection.query(`SELECT * FROM bet order by id desc;`, (error, result) => {
                connection.destroy();
                if (error) {
                    common.reqError(res);
                } else {
                    res.send({
                        code: 0,
                        msg: "",
                        count: result.length,
                        data: result
                    })
                }
            });
        } else {
            common.reqError(res);
        }
    });
})

// 提供一个 field name 和 value 到 bet 表 pagination 分页 查用户投注记录
// /table/bet/search?telegramid=&
route.get('/table/bet/search', (req, res) => {
    conf.pool.getConnection(function (err, connection) {
        var params = req.query;
        if (err) {
            common.reqError(res);
        } else if (common.oc(req)) {
            connection.query(`SELECT * FROM bet where ${params.key} = "${params.value}" order by id desc;`, (error, result) => {
                if (!result) {
                    common.reqError(res);
                }
                var count = result.length;
                connection.destroy();
                if (error) {
                    common.reqError(res);
                } else {
                    res.send({
                        code: 0,
                        msg: "",
                        count: count,
                        data: result
                    })
                }
            });
        } else {
            common.reqError(res);
        }
    });
})

route.get('/table/result', (req, res) => {
    conf.pool.getConnection(function (err, connection) {
        if (err) {
            common.reqError(res);
        } else if (common.oc(req)) {
            connection.query(`SELECT * FROM result order by result_time desc;`, (error, result) => {
                connection.destroy();
                if (error) {
                    common.reqError(res);
                } else {
                    res.send({
                        code: 0,
                        msg: "",
                        count: result.length,
                        data: result
                    })
                }
            });
        } else {
            common.reqError(res);
        }
    });
})

route.get('/table/result/search', (req, res) => {
    conf.pool.getConnection(function (err, connection) {
        var params = req.query;
        if (err) {
            common.reqError(res);
        } else if (common.oc(req)) {
            connection.query(`SELECT * FROM result where ${params.key} = "${params.value}";`, (error, result) => {
                var count = result.length;
                connection.query(`SELECT * FROM result where ${params.key} = "${params.value}" order by result_time desc limit ${(params.page - 1) * params.limit} , ${params.limit};`, (error, result) => {
                    connection.destroy();
                    if (error) {
                        common.reqError(res);
                    } else {
                        res.send({
                            code: 0,
                            msg: "",
                            count: count,
                            data: result
                        })
                    }
                });
            });
        } else {
            common.reqError(res);
        }
    });
})


module.exports = route;