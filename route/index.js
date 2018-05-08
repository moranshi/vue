/**
 * Created by zhanghui on 2018/5/8.
 */
const express = require('express');
const mysql = require('mysql');
const db = mysql.createPool({
  host: '101.200.52.61',
  user: 'root',
  password: 'xiaoche2018',
  database: 'xiaoche'
});
const redis = require('redis'),
  RDS_PORT = 6379,                //端口号
  RDS_HOST = '127.0.0.1',    //服务器IP  要连接的A服务器redis
  RDS_PWD = '',     //密码
  RDS_OPTS = {},                //设置项
  client = redis.createClient(RDS_PORT, RDS_HOST, RDS_OPTS);
module.exports = ()=> {
  function redisAdd(key,value,expire){
    client.set(key, value, redis.print);
    client.expire(key, expire);
  }
  function redisGet(key){
    return new Promise(function(resolve,reject){
      client.get(key, function (err, res) {
        resolve(res);
      });
    })
  }
  const route = express.Router();
  route.get('/carList', (req, res)=> {
    const sql = 'select * from `car` where `status`=1';
    getCarList(sql, res);
  })
  function getCarList(sql, res) {
    db.query(sql, (err, data)=> {
      if (err) {
        res.status(500).send('database err').end();
      } else {
        client.set("key---------", "value-------")
        res.send(data);
      }
    })
  }

  // 发送验证码
  route.post('/get/smsCode', (req, res)=> {
    let obj = req.body;
    let parRes=res;
    redisGet(obj.cell).then((res)=>{
      if (res != null) {
        parRes.send({
          'code': 100,
          'success': true,
          'message': "您的验证码为" + res + ",有效时间30分钟"
        });
      } else {
        res = (Math.random() * 1000000).toFixed(0);
        redisAdd(obj.cell, res,30 * 60);
        parRes.send({
          'code': 100,
          'success': true,
          'message': "您的验证码为" + res + ",有效时间30分钟"
        });
      }
    });
  });
  return route;
};
