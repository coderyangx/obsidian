const express = require('express');
const app = express();
const userRoutes = require('./routes/user');

app.use(express.json()); // 用于解析JSON请求体

// 使用路由
app.use('/users', userRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`服务器运行在 - ${PORT}`);
});
