const express = require('express');
const mysql = require('mysql');
const conf = require('../config/conf');
const common = require('../config/common');

var fs = require('fs');

const route = express.Router();

// ================= Day 今日数据 =======================

// 今日盈利
route.get('/chart/jryl', (req, res) => {
    conf.pool.getConnection(function (err, connection) {
        var params = req.query;
        if (err) {
            common.reqError(res);
        } else if (common.oc(req)) {
            connection.query(`SELECT * FROM bet where time LIKE CONCAT(CURDATE(), '%');`, (error, result) => {
                connection.destroy();
                if (error) {
                    common.reqError(res);
                } else {
                    var jrylAmount = 0;
                    for (let index = 0; index < result.length; index++) {
                        jrylAmount = jrylAmount + result[index].amount - result[index].result - result[index].amountreturn;
                    }
                    res.send({
                        stateCode: 200,
                        message: jrylAmount
                    })
                }
            });
        } else {
            common.reqError(res);
        }
    });
})

// 今日投注次数
route.get('/chart/jrtzcs', (req, res) => {
    conf.pool.getConnection(function (err, connection) {
        var params = req.query;
        if (err) {
            common.reqError(res);
        } else if (common.oc(req)) {
            connection.query(`SELECT * FROM bet where time LIKE CONCAT(CURDATE(), '%');`, (error, result) => {
                connection.destroy();
                if (error) {
                    common.reqError(res);
                } else {
                    res.send({
                        stateCode: 200,
                        message: result.length
                    })
                }
            });
        } else {
            common.reqError(res);
        }
    });
})

// 今日注册玩家
route.get('/chart/xzcwj', (req, res) => {
    conf.pool.getConnection(function (err, connection) {
        var params = req.query;
        if (err) {
            common.reqError(res);
        } else if (common.oc(req)) {
            connection.query(`SELECT * FROM users where register_time LIKE CONCAT(CURDATE(), '%');`, (error, result) => {
                connection.destroy();
                if (error) {
                    common.reqError(res);
                } else {
                    res.send({
                        stateCode: 200,
                        message: result.length
                    })
                }
            });
        } else {
            common.reqError(res);
        }
    });
})

// 今日充值
route.get('/chart/jrcz', (req, res) => {
    conf.pool.getConnection(function (err, connection) {
        var params = req.query;
        if (err) {
            common.reqError(res);
        } else if (common.oc(req)) {
            connection.query(`SELECT * FROM pay where applytime LIKE CONCAT(CURDATE(), '%') and state = 1;`, (error, result) => {
                connection.destroy();
                if (error) {
                    common.reqError(res);
                    console.log(error);

                } else {
                    var jrczAmount = 0;
                    for (let index = 0; index < result.length; index++) {
                        jrczAmount = jrczAmount + result[index].amount;
                    }
                    res.send({
                        stateCode: 200,
                        message: jrczAmount
                    })
                }
            });
        } else {
            common.reqError(res);
        }
    });
})

// 今日提现
route.get('/chart/jrtx', (req, res) => {
    conf.pool.getConnection(function (err, connection) {
        var params = req.query;
        if (err) {
            common.reqError(res);
        } else if (common.oc(req)) {
            connection.query(`SELECT * FROM withdrawal where applytime LIKE CONCAT(CURDATE(), '%') and state = 1;`, (error, result) => {
                connection.destroy();
                if (error) {
                    common.reqError(res);
                } else {
                    var jrtxAmount = 0;
                    for (let index = 0; index < result.length; index++) {
                        jrtxAmount = jrtxAmount + result[index].amount;
                    }
                    res.send({
                        stateCode: 200,
                        message: jrtxAmount
                    })
                }
            });
        } else {
            common.reqError(res);
        }
    });
})

// route.get('/chart/dczczsq', (req, res) => {
//     conf.pool.getConnection(function (err, connection) {
//         var params = req.query;
//         if (err) {
//             common.reqError(res);
//         } else if (common.oc(req)) {
//             connection.query(`SELECT * FROM pay where applytime LIKE CONCAT(CURDATE(), '%') and state = 0;`, (error, result) => {
//                 connection.destroy();
//                 if (error) {
//                     common.reqError(res);
//                 } else {
//                     res.send({
//                         stateCode: 200,
//                         message: result.length
//                     })
//                 }
//             });
//         } else {
//             common.reqError(res);
//         }
//     });
// })

// route.get('/chart/dcztxsq', (req, res) => {
//     conf.pool.getConnection(function (err, connection) {
//         var params = req.query;
//         if (err) {
//             common.reqError(res);
//         } else if (common.oc(req)) {
//             connection.query(`SELECT * FROM withdrawal where applytime LIKE CONCAT(CURDATE(), '%') and state = 0;`, (error, result) => {
//                 connection.destroy();
//                 if (error) {
//                     common.reqError(res);
//                 } else {
//                     res.send({
//                         stateCode: 200,
//                         message: result.length
//                     })
//                 }
//             });
//         } else {
//             common.reqError(res);
//         }
//     });
// })

/************************all******************************************* */
// ALL 总的

// 总流水
route.get('/chart/jrls/all', (req, res) => {
    conf.pool.getConnection(function (err, connection) {
        var params = req.query;
        if (err) {
            common.reqError(res);
        } else if (common.oc(req)) {
            connection.query(`SELECT * FROM bet;`, (error, result) => {
                connection.destroy();
                if (error) {
                    common.reqError(res);
                } else {
                    var jrlsAmount = 0;
                    for (let index = 0; index < result.length; index++) {
                        jrlsAmount = jrlsAmount + result[index].amount;
                    }
                    res.send({
                        stateCode: 200,
                        message: jrlsAmount
                    })
                }
            });
        } else {
            common.reqError(res);
        }
    });
})

// 总盈利
route.get('/chart/jryl/all', (req, res) => {
    conf.pool.getConnection(function (err, connection) {
        var params = req.query;
        if (err) {
            common.reqError(res);
        } else if (common.oc(req)) {
            connection.query(`SELECT * FROM bet;`, (error, result) => {
                connection.destroy();
                if (error) {
                    common.reqError(res);
                } else {
                    var jrylAmount = 0;
                    for (let index = 0; index < result.length; index++) {
                        jrylAmount = jrylAmount + result[index].amount - result[index].result - result[index].amountreturn;
                    }
                    res.send({
                        stateCode: 200,
                        message: jrylAmount
                    })
                }
            });
        } else {
            common.reqError(res);
        }
    });
})

// 总投注次数
route.get('/chart/jrtzcs/all', (req, res) => {
    conf.pool.getConnection(function (err, connection) {
        var params = req.query;
        if (err) {
            common.reqError(res);
        } else if (common.oc(req)) {
            connection.query(`SELECT * FROM bet ;`, (error, result) => {
                connection.destroy();
                if (error) {
                    common.reqError(res);
                } else {
                    res.send({
                        stateCode: 200,
                        message: result.length
                    })
                }
            });
        } else {
            common.reqError(res);
        }
    });
})

// 总玩家
route.get('/chart/xzcwj/all', (req, res) => {
    conf.pool.getConnection(function (err, connection) {
        var params = req.query;
        if (err) {
            common.reqError(res);
        } else if (common.oc(req)) {
            connection.query(`SELECT * FROM users ;`, (error, result) => {
                connection.destroy();
                if (error) {
                    common.reqError(res);
                } else {
                    res.send({
                        stateCode: 200,
                        message: result.length
                    })
                }
            });
        } else {
            common.reqError(res);
        }
    });
})

// 总充值总额
route.get('/chart/jrcz/all', (req, res) => {
    conf.pool.getConnection(function (err, connection) {
        var params = req.query;
        if (err) {
            common.reqError(res);
        } else if (common.oc(req)) {
            connection.query(`SELECT * FROM pay where state = 1;`, (error, result) => {
                connection.destroy();
                if (error) {
                    common.reqError(res);
                    console.log(error);

                } else {
                    var jrczAmount = 0;
                    for (let index = 0; index < result.length; index++) {
                        jrczAmount = jrczAmount + result[index].amount;
                    }
                    res.send({
                        stateCode: 200,
                        message: jrczAmount
                    })
                }
            });
        } else {
            common.reqError(res);
        }
    });
})

// 总提现总额
route.get('/chart/jrtx/all', (req, res) => {
    conf.pool.getConnection(function (err, connection) {
        var params = req.query;
        if (err) {
            common.reqError(res);
        } else if (common.oc(req)) {
            connection.query(`SELECT * FROM withdrawal where state = 1;`, (error, result) => {
                connection.destroy();
                if (error) {
                    common.reqError(res);
                } else {
                    var jrtxAmount = 0;
                    for (let index = 0; index < result.length; index++) {
                        jrtxAmount = jrtxAmount + result[index].amount;
                    }
                    res.send({
                        stateCode: 200,
                        message: jrtxAmount
                    })
                }
            });
        } else {
            common.reqError(res);
        }
    });
})

// 待操作充值申请
route.get('/chart/dczczsq/all', (req, res) => {
    conf.pool.getConnection(function (err, connection) {
        var params = req.query;
        if (err) {
            common.reqError(res);
        } else if (common.oc(req)) {
            connection.query(`SELECT * FROM pay where state = 0;`, (error, result) => {
                connection.destroy();
                if (error) {
                    common.reqError(res);
                } else {
                    res.send({
                        stateCode: 200,
                        message: result.length
                    })
                }
            });
        } else {
            common.reqError(res);
        }
    });
})

// 待操作提现申请
route.get('/chart/dcztxsq/all', (req, res) => {
    conf.pool.getConnection(function (err, connection) {
        var params = req.query;
        if (err) {
            common.reqError(res);
        } else if (common.oc(req)) {
            connection.query(`SELECT * FROM withdrawal where state = 0;`, (error, result) => {
                connection.destroy();
                if (error) {
                    common.reqError(res);
                } else {
                    res.send({
                        stateCode: 200,
                        message: result.length
                    })
                }
            });
        } else {
            common.reqError(res);
        }
    });
})
module.exports = route;