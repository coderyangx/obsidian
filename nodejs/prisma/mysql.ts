// import mysql from 'mysql';
const mysql = require('mysql');

// 创建数据库连接
const connection = mysql.createConnection({
  host: 'localhost', // 数据库地址
  user: 'root', // 数据库用户
  password: '12345678', // 数据库密码
  database: 'testdb', // 数据库名
});

// 连接数据库
connection.connect((err) => {
  if (err) {
    return console.error('连接错误: ' + err.stack);
  }
  console.log('数据库已连接 as id ' + connection.threadId);
});

// 执行查询
connection.query('SELECT 1 + 1 AS solution', (error, results, fields) => {
  if (error) throw error;
  console.log('The solution is: ', results[0].solution);
});

// 断开数据库连接
connection.end();
