var express = require('express');
var mysql = require('mysql');
var TelegramBot = require('node-telegram-bot-api');
var conf = require('../config/conf');
var common = require('../config/common');

var route = express.Router();

route.get('/table/pay/insert',(req,res)=>{ 
    conf.pool.getConnection(function(err, connection) {
        var params = JSON.parse(req.query.data);
        if(err){
            common.reqError(res);
        }else if(common.oc(req)){
            connection.query(`SELECT * FROM users where name = "${params.name}";`,(error, result)=> {
                if (error || result.length==0){
                    common.reqError(res);
                    return
                }
                connection.query(`Insert into pay (telegramid,name,amount,state,way,applytime,changetime) values ("${result[0].telegramid}","${params.name}",${params.amount},"1","${params.way}",now(),now()) ;update users set balance = balance + ${params.amount} where telegramid = ${result[0].telegramid}`,(error, result)=> {
                    connection.destroy();
                    if (error){
                        common.reqError(res);
                    }else{
                        res.send({
                            code:200,
                            msg:result
                        })
                    }
                });
            });
        }else{
            common.reqError(res);
        }
    });
})

route.get('/table/pay/go',(req,res)=>{ 
    conf.pool.getConnection(function(err, connection) {
        var params = JSON.parse(req.query.data);
        if(err){
            common.reqError(res);
        }else if(common.oc(req)){
            connection.query(`update pay set state = 1 , changetime = now() where id = ${params.id};update users set balance = balance + ${params.amount} where telegramid = ${params.telegramid};`,(error, result)=> {
                connection.destroy();
                if (error){
                    common.reqError(res);
                }else{
                    res.send({
                        code:200,
                        msg:result
                    })
                }
            });
        }else{
            common.reqError(res);
        }
    });
})

route.get('/table/pay/refuse',(req,res)=>{ 
    conf.pool.getConnection(function(err, connection) {
        var params = JSON.parse(req.query.data);
        if(err){
            common.reqError(res);
        }else if(common.oc(req)){
            connection.query(`update pay set state = -1 , changetime = now() where id = ${params.id};`,(error, result)=> {
                connection.destroy();
                if (error){
                    common.reqError(res);
                }else{
                    res.send({
                        code:200,
                        msg:result
                    })
                }
            });
        }else{
            common.reqError(res);
        }
    });
})

route.get('/table/pay/apply',(req,res)=>{ 
    conf.pool.getConnection(function(err, connection) {
        var params = req.query;
        if(err){
            common.reqError(res);
        }else if(common.oc(req)){
            connection.query(`SELECT * FROM pay where state = 0 order by id desc;`,(error, result)=> {
                connection.destroy();
                if (error){
                    common.reqError(res);
                }else{
                    res.send({
                        code:0,
                        msg:"",
                        count:result.length,
                        data:result
                    })
                }
            });
        }else{
            common.reqError(res);
        }
    });
})


route.get('/table/pay/apply/search',(req,res)=>{ 
    conf.pool.getConnection(function(err, connection) {
        var params = req.query;
        if(err){
            common.reqError(res);
        }else if(common.oc(req)){
            connection.query(`SELECT * FROM pay where ${params.key} = "${params.value}" AND state = 0;`,(error, result)=> {
                var count = result.length;
                connection.query(`SELECT * FROM pay where ${params.key} = "${params.value}" and state = 0 order by id desc limit ${(params.page-1)*params.limit} , ${params.limit};`,(error, result)=> {
                    connection.destroy();
                    if (error){
                        common.reqError(res);
                    }else{
                        res.send({
                            code:0,
                            msg:"",
                            count:count,
                            data:result
                        })
                    }
                });
            });
        }else{
            common.reqError(res);
        }
    });
})

route.get('/table/pay/update',(req,res)=>{ 
    conf.pool.getConnection(function(err, connection) {
        var params = JSON.parse(req.query.data);
        if(err){
            common.reqError(res);
        }else if(common.oc(req)){
            connection.query(`Update pay set telegramid = "${params.telegramid}",name = "${params.name}",amount = ${params.amount},way = "${params.way}",applytime = "${params.applytime}" WHERE id = ${params.id};`,(error, result)=> {
                connection.destroy();
                if (error){
                    common.reqError(res);
                }else{
                    res.send({
                        code:200,
                        msg:result
                    })
                }
            });
        }else{
            common.reqError(res);
        }
    });
})

route.get('/table/pay/delete',(req,res)=>{ 
    conf.pool.getConnection(function(err, connection) {
        var params = req.query;
        if(err){
            common.reqError(res);
        }else if(common.oc(req)){
            connection.query(`DELETE FROM pay WHERE id = ${params.id};`,(error, result)=> {
                connection.destroy();
                if (error){
                    common.reqError(res);
                }else{
                    res.send({
                        code:200,
                        msg:result
                    })
                }
            });
        }else{
            common.reqError(res);
        }
    });
})

route.get('/table/pay/search',(req,res)=>{ 
    conf.pool.getConnection(function(err, connection) {
        var params = req.query;
        if(err){
            common.reqError(res);
        }else if(common.oc(req)){
            connection.query(`SELECT * FROM pay where ${params.key} = "${params.value}";`,(error, result)=> {
                var count = result.length;
                connection.query(`SELECT * FROM pay where ${params.key} = "${params.value}" order by id desc limit ${(params.page-1)*params.limit} , ${params.limit};`,(error, result)=> {
                    connection.destroy();
                    if (error){
                        common.reqError(res);
                    }else{
                        res.send({
                            code:0,
                            msg:"",
                            count:count,
                            data:result
                        })
                    }
                });
            });
        }else{
            common.reqError(res);
        }
    });
})

route.get('/table/pay',(req,res)=>{ 
    conf.pool.getConnection(function(err, connection) {
        var params = req.query;
        if(err){
            common.reqError(res);
        }else if(common.oc(req)){
            connection.query(`SELECT * FROM pay order by id desc;`,(error, result)=> {
                connection.destroy();
                if (error){
                    common.reqError(res);
                }else{
                    res.send({
                        code:0,
                        msg:"",
                        count:result.length,
                        data:result
                    })
                }
            });
        }else{
            common.reqError(res);
        }
    });
})
/***************withdrawal****************** */
route.get('/table/withdrawal/insert',(req,res)=>{ 
    conf.pool.getConnection(function(err, connection) {
        var params = JSON.parse(req.query.data);
        if(err){
            common.reqError(res);
        }else if(common.oc(req)){
            connection.query(`SELECT * FROM users where name = "${params.name}";`,(error, result)=> {
                if (error || result.length==0){
                    common.reqError(res);
                    return
                }
                connection.query(`Insert into withdrawal (telegramid,name,amount,state,way,applytime,changetime) values ("${result[0].telegramid}","${params.name}",${params.amount},"1","${params.way}",now(),now()) ;update users set balance = balance - ${params.amount} where telegramid = ${result[0].telegramid}`,(error, result)=> {
                    connection.destroy();
                    if (error){
                        common.reqError(res);
                    }else{
                        res.send({
                            code:200,
                            msg:result
                        })
                    }
                });
            });
        }else{
            common.reqError(res);
        }
    });
})

route.get('/table/withdrawal/go',(req,res)=>{ 
    conf.pool.getConnection(function(err, connection) {
        var params = JSON.parse(req.query.data);
        if(err){
            common.reqError(res);
        }else if(common.oc(req)){
            connection.query(`update withdrawal set state = 1, changetime = now() where id = ${params.id};`,(error, result)=> {
                connection.destroy();
                if (error){
                    common.reqError(res);
                }else{
                    res.send({
                        code:200,
                        msg:result
                    })
                }
            });
        }else{
            common.reqError(res);
        }
    });
})

route.get('/table/withdrawal/refuse',(req,res)=>{ 
    conf.pool.getConnection(function(err, connection) {
        var params = JSON.parse(req.query.data);
        if(err){
            common.reqError(res);
        }else if(common.oc(req)){
            connection.query(`update withdrawal set state = -1 , changetime = now() where id = ${params.id};update users set balance = balance + ${params.amount} where telegramid = ${params.telegramid};`,(error, result)=> {
                connection.destroy();
                if (error){
                    common.reqError(res);
                }else{
                    res.send({
                        code:200,
                        msg:result
                    })
                }
            });
        }else{
            common.reqError(res);
        }
    });
})

route.get('/table/withdrawal/apply',(req,res)=>{ 
    conf.pool.getConnection(function(err, connection) {
        var params = req.query;
        if(err){
            common.reqError(res);
        }else if(common.oc(req)){
            connection.query(`SELECT * FROM withdrawal where state = 0 order by id desc;`,(error, result)=> {
                connection.destroy();
                if (error){
                    common.reqError(res);
                }else{
                    res.send({
                        code:0,
                        msg:"",
                        count:result.length,
                        data:result
                    })
                }
            });
        }else{
            common.reqError(res);
        }
    });
})
route.get('/table/withdrawal/apply/search',(req,res)=>{ 
    conf.pool.getConnection(function(err, connection) {
        var params = req.query;
        if(err){
            common.reqError(res);
        }else if(common.oc(req)){
            connection.query(`SELECT * FROM withdrawal where ${params.key} = "${params.value}" AND state = 0;`,(error, result)=> {
                var count = result.length;
                connection.query(`SELECT * FROM withdrawal where ${params.key} = "${params.value}" and state = 0 order by id desc limit ${(params.page-1)*params.limit} , ${params.limit};`,(error, result)=> {
                    connection.destroy();
                    if (error){
                        common.reqError(res);
                    }else{
                        res.send({
                            code:0,
                            msg:"",
                            count:count,
                            data:result
                        })
                    }
                });
            });
        }else{
            common.reqError(res);
        }
    });
})

route.get('/table/withdrawal/search',(req,res)=>{ 
    conf.pool.getConnection(function(err, connection) {
        var params = req.query;
        if(err){
            common.reqError(res);
        }else if(common.oc(req)){
            connection.query(`SELECT * FROM withdrawal where ${params.key} = "${params.value}";`,(error, result)=> {
                var count = result.length;
                connection.query(`SELECT * FROM withdrawal where ${params.key} = "${params.value}" order by id desc limit ${(params.page-1)*params.limit} , ${params.limit};`,(error, result)=> {
                    connection.destroy();
                    if (error){
                        common.reqError(res);
                    }else{
                        res.send({
                            code:0,
                            msg:"",
                            count:count,
                            data:result
                        })
                    }
                });
            });
        }else{
            common.reqError(res);
        }
    });
})

route.get('/table/withdrawal/update',(req,res)=>{ 
    conf.pool.getConnection(function(err, connection) {
        var params = JSON.parse(req.query.data);
        if(err){
            common.reqError(res);
        }else if(common.oc(req)){
            connection.query(`Update withdrawal set telegramid = "${params.telegramid}",name = "${params.name}",amount = ${params.amount},way = "${params.way}",applytime = "${params.applytime}" WHERE id = ${params.id};`,(error, result)=> {
                connection.destroy();
                if (error){
                    common.reqError(res);
                }else{
                    res.send({
                        code:200,
                        msg:result
                    })
                }
            });
        }else{
            common.reqError(res);
        }
    });
})

route.get('/table/withdrawal',(req,res)=>{ 
    conf.pool.getConnection(function(err, connection) {
        var params = req.query;
        if(err){
            common.reqError(res);
        }else if(common.oc(req)){
            connection.query(`SELECT * FROM withdrawal order by id desc;`,(error, result)=> {
                connection.destroy();
                if (error){
                    common.reqError(res);
                }else{
                    res.send({
                        code:0,
                        msg:"",
                        count:result.length,
                        data:result
                    })
                }
            });
        }else{
            common.reqError(res);
        }
    });
})

route.get('/table/users',(req,res)=>{ 
    conf.pool.getConnection(function(err, connection) {
        var params = req.query;
        if(err){
            common.reqError(res);
        }else if(common.oc(req)){
            connection.query(`SELECT * FROM users order by id desc;`,(error, result)=> {
                connection.destroy();
                if (error){
                    common.reqError(res);
                }else{
                    res.send({
                        code:0,
                        msg:"",
                        count:result.length,
                        data:result
                    })
                }
            });
        }else{
            common.reqError(res);
        }
    });
})

route.get('/table/users/search',(req,res)=>{ 
    conf.pool.getConnection(function(err, connection) {
        var params = req.query;
        if(err){
            common.reqError(res);
        }else if(common.oc(req)){
            connection.query(`SELECT * FROM users where ${params.key} = "${params.value}";`,(error, result)=> {
                var count = result.length;
                connection.query(`SELECT * FROM users where ${params.key} = "${params.value}" order by id desc limit ${(params.page-1)*params.limit} , ${params.limit};`,(error, result)=> {
                    connection.destroy();
                    if (error){
                        common.reqError(res);
                    }else{
                        res.send({
                            code:0,
                            msg:"",
                            count:count,
                            data:result
                        })
                    }
                });
            });
        }else{
            common.reqError(res);
        }
    });
})

route.get('/table/bet',(req,res)=>{ 
    conf.pool.getConnection(function(err, connection) {
        var params = req.query;
        if(err){
            common.reqError(res);
        }else if(common.oc(req)){
            connection.query(`SELECT * FROM bet order by id desc;`,(error, result)=> {
                connection.destroy();
                if (error){
                    common.reqError(res);
                }else{
                    res.send({
                        code:0,
                        msg:"",
                        count:result.length,
                        data:result
                    })
                }
            });
        }else{
            common.reqError(res);
        }
    });
})

route.get('/table/bet/search',(req,res)=>{ 
    conf.pool.getConnection(function(err, connection) {
        var params = req.query;
        if(err){
            common.reqError(res);
        }else if(common.oc(req)){
            connection.query(`SELECT * FROM bet where ${params.key} = "${params.value}";`,(error, result)=> {
                var count = result.length;
                connection.query(`SELECT * FROM bet where ${params.key} = "${params.value}" order by id desc limit ${(params.page-1)*params.limit} , ${params.limit};`,(error, result)=> {
                    connection.destroy();
                    if (error){
                        common.reqError(res);
                    }else{
                        res.send({
                            code:0,
                            msg:"",
                            count:count,
                            data:result
                        })
                    }
                });
            });
        }else{
            common.reqError(res);
        }
    });
})

route.get('/table/result',(req,res)=>{ 
    conf.pool.getConnection(function(err, connection) {
        var params = req.query;
        if(err){
            common.reqError(res);
        }else if(common.oc(req)){
            connection.query(`SELECT * FROM result order by result_time desc;`,(error, result)=> {
                connection.destroy();
                if (error){
                    common.reqError(res);
                }else{
                    res.send({
                        code:0,
                        msg:"",
                        count:result.length,
                        data:result
                    })
                }
            });
        }else{
            common.reqError(res);
        }
    });
})

route.get('/table/result/search',(req,res)=>{ 
    conf.pool.getConnection(function(err, connection) {
        var params = req.query;
        if(err){
            common.reqError(res);
        }else if(common.oc(req)){
            connection.query(`SELECT * FROM result where ${params.key} = "${params.value}";`,(error, result)=> {
                var count = result.length;
                connection.query(`SELECT * FROM result where ${params.key} = "${params.value}" order by result_time desc limit ${(params.page-1)*params.limit} , ${params.limit};`,(error, result)=> {
                    connection.destroy();
                    if (error){
                        common.reqError(res);
                    }else{
                        res.send({
                            code:0,
                            msg:"",
                            count:count,
                            data:result
                        })
                    }
                });
            });
        }else{
            common.reqError(res);
        }
    });
})


module.exports = route;