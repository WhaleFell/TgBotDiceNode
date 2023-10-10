const express = require('express');
const mysql = require('mysql');
const conf = require('../config/conf');
const common = require('../config/common');

var fs = require('fs');
//const { createCanvas, registerFont } = require('canvas')

const route = express.Router();

/*route.get('/chart/kaijiang',(req,res)=>{ 
    conf.pool.getConnection(function(err, connection) {
        connection.query(`SELECT * FROM result order by result_time desc LIMIT 20;`,(error, result)=> {
            if (error) throw error;
            connection.destroy()
            
            registerFont('./fount/wryh.ttf', { family: 'wryh' })
            const canvas = createCanvas(497, 651)
            const ctx = canvas.getContext('2d')
            ctx.fillStyle = '#353535';
            ctx.fillRect(0, 0, canvas.width, 35)
        
            ctx.fillStyle = '#f2f2f2';
            ctx.fillRect(330, 35, canvas.width, canvas.height-35)
        
            ctx.font = '17px wryh'
            ctx.fillStyle  = 'rgb(255,255,255)'
            ctx.fillText('回合', 40, 25)
        
            ctx.font = '17px wryh'
            ctx.fillStyle  = 'rgb(255,255,255)'
            ctx.fillText('结果', 175, 25)
        
            ctx.font = '17px wryh'
            ctx.fillStyle  = 'rgb(255,255,255)'
            ctx.fillText('特码', 280, 25)
        
            ctx.font = '17px wryh'
            ctx.fillStyle  = 'rgb(255,255,255)'
            ctx.fillText('双面', 350, 25)
        
            ctx.font = '17px wryh'
            ctx.fillStyle  = 'rgb(255,255,255)'
            ctx.fillText('形态', 420, 25)
        
            for (let index = 0; index < result.length; index++) {
                ctx.font = '17px Microsoft YaHei'
                ctx.fillStyle  = 'rgb(0,0,0)'
                ctx.fillText(result[index].id, 10, (2+index)*30)
        
                
                ctx.beginPath();
                ctx.arc(155,(2+index)*30-5,13,0,2*Math.PI);
                ctx.fillStyle  = '#960000'
                ctx.fill();
                ctx.closePath();
        
                ctx.beginPath();
                ctx.arc(194,(2+index)*30-5,13,0,2*Math.PI);
                ctx.fillStyle  = '#960000'
                ctx.fill();
                ctx.closePath();
        
                ctx.beginPath();
                ctx.arc(233,(2+index)*30-5,13,0,2*Math.PI);
                ctx.fillStyle  = '#960000'
                ctx.fill();
                ctx.closePath();
        
                ctx.font = '17px wryh'
                ctx.fillStyle  = '#ffffff'
                ctx.fillText(`${result[index].one}      ${result[index].two}      ${result[index].three} `, 150, (2+index)*30)
        
                ctx.font = '17px wryh'
                ctx.fillStyle  = '#000000'
                ctx.fillText(`${(result[index].one+result[index].two+result[index].three<10?"0"+(result[index].one+result[index].two+result[index].three):result[index].one+result[index].two+result[index].three)}`, 287, (2+index)*30)
                
                if (result[index].baozi!=1) {
                    ctx.font = '17px wryh'
                    if (result[index].big==1) {
                        ctx.fillStyle  = '#ea3335'
                        ctx.fillText(`大`, 350, (2+index)*30)
                    } else {
                        ctx.fillStyle  = '#123692'
                        ctx.fillText(`小`, 350, (2+index)*30)
                    }
                    if (result[index].odd==1) {
                        ctx.fillStyle  = '#123692'
                        ctx.fillText(`单`, 370, (2+index)*30)
                    } else {
                        ctx.fillStyle  = '#ea3335'
                        ctx.fillText(`双`, 370, (2+index)*30)
                    } 
                }else{
                    ctx.fillStyle  = '#000000'
                        ctx.fillText(`无`, 360, (2+index)*30)
                }
                ctx.font = '17px wryh'
                if (result[index].baozi==1) {
                    ctx.fillStyle  = '#8d0405'
                    ctx.fillText(`豹子`, 420, (2+index)*30)
                } else if (result[index].duizi==1) {
                    ctx.fillStyle  = '#f8a137'
                    ctx.fillText(`对子`, 420, (2+index)*30)
                }else if (result[index].shunzi==1) {
                    ctx.fillStyle  = '#390bce'
                    ctx.fillText(`顺子`, 420, (2+index)*30)
                }else{
                    ctx.fillStyle  = '#66c96c'
                    ctx.fillText(`杂六`, 420, (2+index)*30)
                }
                ctx.strokeStyle = '#e4e4e4'
                ctx.beginPath()
                ctx.lineTo(0, (2+index)*30+10)
                ctx.lineTo(canvas.width, (2+index)*30+10)
                ctx.stroke()
            }
            
            res.send({
                stateCode:200,
                message:canvas.toDataURL()
            })
        
            
        })
    })
    
})*/
route.get('/chart/jryl',(req,res)=>{ 
    conf.pool.getConnection(function(err, connection) {
        var params = req.query;
        if(err){
            common.reqError(res);
        }else if(common.oc(req)){
            connection.query(`SELECT * FROM bet where time LIKE CONCAT(CURDATE(), '%');`,(error, result)=> {
                connection.destroy();
                if (error){
                    common.reqError(res);
                }else{
                    var jrylAmount = 0;
                    for (let index = 0; index < result.length; index++) {
                        jrylAmount = jrylAmount + result[index].amount - result[index].result - result[index].amountreturn;
                    }
                    res.send({
                        stateCode:200,
                        message:jrylAmount
                    })
                }
            });
        }else{
            common.reqError(res);
        }
    });
})


route.get('/chart/jrtzcs',(req,res)=>{ 
    conf.pool.getConnection(function(err, connection) {
        var params = req.query;
        if(err){
            common.reqError(res);
        }else if(common.oc(req)){
            connection.query(`SELECT * FROM bet where time LIKE CONCAT(CURDATE(), '%');`,(error, result)=> {
                connection.destroy();
                if (error){
                    common.reqError(res);
                }else{
                    res.send({
                        stateCode:200,
                        message:result.length
                    })
                }
            });
        }else{
            common.reqError(res);
        }
    });
})

route.get('/chart/xzcwj',(req,res)=>{ 
    conf.pool.getConnection(function(err, connection) {
        var params = req.query;
        if(err){
            common.reqError(res);
        }else if(common.oc(req)){
            connection.query(`SELECT * FROM users where register_time LIKE CONCAT(CURDATE(), '%');`,(error, result)=> {
                connection.destroy();
                if (error){
                    common.reqError(res);
                }else{
                    res.send({
                        stateCode:200,
                        message:result.length
                    })
                }
            });
        }else{
            common.reqError(res);
        }
    });
})

route.get('/chart/jrcz',(req,res)=>{ 
    conf.pool.getConnection(function(err, connection) {
        var params = req.query;
        if(err){
            common.reqError(res);
        }else if(common.oc(req)){
            connection.query(`SELECT * FROM pay where applytime LIKE CONCAT(CURDATE(), '%') and state = 1;`,(error, result)=> {
                connection.destroy();
                if (error){
                    common.reqError(res);
                    console.log(error);
                    
                }else{
                    var jrczAmount = 0;
                    for (let index = 0; index < result.length; index++) {
                        jrczAmount = jrczAmount + result[index].amount;
                    }
                    res.send({
                        stateCode:200,
                        message:jrczAmount
                    })
                }
            });
        }else{
            common.reqError(res);
        }
    });
})

route.get('/chart/jrtx',(req,res)=>{ 
    conf.pool.getConnection(function(err, connection) {
        var params = req.query;
        if(err){
            common.reqError(res);
        }else if(common.oc(req)){
            connection.query(`SELECT * FROM withdrawal where applytime LIKE CONCAT(CURDATE(), '%') and state = 1;`,(error, result)=> {
                connection.destroy();
                if (error){
                    common.reqError(res);
                }else{
                    var jrtxAmount = 0;
                    for (let index = 0; index < result.length; index++) {
                        jrtxAmount = jrtxAmount + result[index].amount;
                    }
                    res.send({
                        stateCode:200,
                        message:jrtxAmount
                    })
                }
            });
        }else{
            common.reqError(res);
        }
    });
})

route.get('/chart/dczczsq',(req,res)=>{ 
    conf.pool.getConnection(function(err, connection) {
        var params = req.query;
        if(err){
            common.reqError(res);
        }else if(common.oc(req)){
            connection.query(`SELECT * FROM pay where applytime LIKE CONCAT(CURDATE(), '%') and state = 0;`,(error, result)=> {
                connection.destroy();
                if (error){
                    common.reqError(res);
                }else{
                    res.send({
                        stateCode:200,
                        message:result.length
                    })
                }
            });
        }else{
            common.reqError(res);
        }
    });
})

route.get('/chart/dcztxsq',(req,res)=>{ 
    conf.pool.getConnection(function(err, connection) {
        var params = req.query;
        if(err){
            common.reqError(res);
        }else if(common.oc(req)){
            connection.query(`SELECT * FROM withdrawal where applytime LIKE CONCAT(CURDATE(), '%') and state = 0;`,(error, result)=> {
                connection.destroy();
                if (error){
                    common.reqError(res);
                }else{
                    res.send({
                        stateCode:200,
                        message:result.length
                    })
                }
            });
        }else{
            common.reqError(res);
        }
    });
})

/************************all******************************************* */
route.get('/chart/jrls/all',(req,res)=>{ 
    conf.pool.getConnection(function(err, connection) {
        var params = req.query;
        if(err){
            common.reqError(res);
        }else if(common.oc(req)){
            connection.query(`SELECT * FROM bet;`,(error, result)=> {
                connection.destroy();
                if (error){
                    common.reqError(res);
                }else{
                    var jrlsAmount = 0;
                    for (let index = 0; index < result.length; index++) {
                        jrlsAmount = jrlsAmount + result[index].amount;
                    }
                    res.send({
                        stateCode:200,
                        message:jrlsAmount
                    })
                }
            });
        }else{
            common.reqError(res);
        }
    });
})

route.get('/chart/jryl/all',(req,res)=>{ 
    conf.pool.getConnection(function(err, connection) {
        var params = req.query;
        if(err){
            common.reqError(res);
        }else if(common.oc(req)){
            connection.query(`SELECT * FROM bet;`,(error, result)=> {
                connection.destroy();
                if (error){
                    common.reqError(res);
                }else{
                    var jrylAmount = 0;
                    for (let index = 0; index < result.length; index++) {
                        jrylAmount = jrylAmount + result[index].amount - result[index].result - result[index].amountreturn;
                    }
                    res.send({
                        stateCode:200,
                        message:jrylAmount
                    })
                }
            });
        }else{
            common.reqError(res);
        }
    });
})


route.get('/chart/jrtzcs/all',(req,res)=>{ 
    conf.pool.getConnection(function(err, connection) {
        var params = req.query;
        if(err){
            common.reqError(res);
        }else if(common.oc(req)){
            connection.query(`SELECT * FROM bet ;`,(error, result)=> {
                connection.destroy();
                if (error){
                    common.reqError(res);
                }else{
                    res.send({
                        stateCode:200,
                        message:result.length
                    })
                }
            });
        }else{
            common.reqError(res);
        }
    });
})

route.get('/chart/xzcwj/all',(req,res)=>{ 
    conf.pool.getConnection(function(err, connection) {
        var params = req.query;
        if(err){
            common.reqError(res);
        }else if(common.oc(req)){
            connection.query(`SELECT * FROM users ;`,(error, result)=> {
                connection.destroy();
                if (error){
                    common.reqError(res);
                }else{
                    res.send({
                        stateCode:200,
                        message:result.length
                    })
                }
            });
        }else{
            common.reqError(res);
        }
    });
})

route.get('/chart/jrcz/all',(req,res)=>{ 
    conf.pool.getConnection(function(err, connection) {
        var params = req.query;
        if(err){
            common.reqError(res);
        }else if(common.oc(req)){
            connection.query(`SELECT * FROM pay where state = 1;`,(error, result)=> {
                connection.destroy();
                if (error){
                    common.reqError(res);
                    console.log(error);
                    
                }else{
                    var jrczAmount = 0;
                    for (let index = 0; index < result.length; index++) {
                        jrczAmount = jrczAmount + result[index].amount;
                    }
                    res.send({
                        stateCode:200,
                        message:jrczAmount
                    })
                }
            });
        }else{
            common.reqError(res);
        }
    });
})

route.get('/chart/jrtx/all',(req,res)=>{ 
    conf.pool.getConnection(function(err, connection) {
        var params = req.query;
        if(err){
            common.reqError(res);
        }else if(common.oc(req)){
            connection.query(`SELECT * FROM withdrawal where state = 1;`,(error, result)=> {
                connection.destroy();
                if (error){
                    common.reqError(res);
                }else{
                    var jrtxAmount = 0;
                    for (let index = 0; index < result.length; index++) {
                        jrtxAmount = jrtxAmount + result[index].amount;
                    }
                    res.send({
                        stateCode:200,
                        message:jrtxAmount
                    })
                }
            });
        }else{
            common.reqError(res);
        }
    });
})

route.get('/chart/dczczsq/all',(req,res)=>{ 
    conf.pool.getConnection(function(err, connection) {
        var params = req.query;
        if(err){
            common.reqError(res);
        }else if(common.oc(req)){
            connection.query(`SELECT * FROM pay where state = 0;`,(error, result)=> {
                connection.destroy();
                if (error){
                    common.reqError(res);
                }else{
                    res.send({
                        stateCode:200,
                        message:result.length
                    })
                }
            });
        }else{
            common.reqError(res);
        }
    });
})

route.get('/chart/dcztxsq/all',(req,res)=>{ 
    conf.pool.getConnection(function(err, connection) {
        var params = req.query;
        if(err){
            common.reqError(res);
        }else if(common.oc(req)){
            connection.query(`SELECT * FROM withdrawal where state = 0;`,(error, result)=> {
                connection.destroy();
                if (error){
                    common.reqError(res);
                }else{
                    res.send({
                        stateCode:200,
                        message:result.length
                    })
                }
            });
        }else{
            common.reqError(res);
        }
    });
})
module.exports = route;