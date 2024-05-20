import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
  const { url, method } = req;
  // 设置缓存过期时间
  const result = {
    code: 200,
    data: {
      userInfo: { name: '我是返回数据', age: 18 },
      request: { url: req.url, method: req.method },
      profession: '我是专业经理人',
    },
  };
  // res.json(result);
  res.send(result);
});

router.get('/test', (req, res) => {
  res.setHeader('Cache-Control', 'max-age=3600');
  // 自定义响应头，首字母不区分大小写
  res.setHeader('Yangxu', 66666);
  res.send(`<h4>我是返回的 h1</h4>`);
});

export default router;
