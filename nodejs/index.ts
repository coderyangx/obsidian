import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import Groq from 'groq-sdk';

import indexRouter from './routes/index';
import userRouter from './routes/user';
import loginRouter from './routes/login';
import uploadRouter from './routes/upload';

const groq = new Groq({
  apiKey: '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', // process.env.GROQ_API_KEY,
});

const app = express();
app.use(cors());
app.set('views', path.join(__dirname, 'views')); // 设置存放模板文件的目录
app.set('view engine', 'ejs'); // 设置模板引擎为 ejs

// 设置跨域访问
app.all('*', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Content-Type, Content-Length, Authorization, Accept, X-Requested-With'
  );
  res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    res.send(200);
  } else {
    next();
  }
});

// 提供静态文件 css 图片 js 等; localhost:3000/static/xxx 访问
app.use('/static', express.static('public'));

app.use(bodyParser.json()); // 创建 application/json 解析
app.use(bodyParser.urlencoded({ extended: false })); // 创建 application/x-www-form-urlencoded 解析
app.use(bodyParser.json({ type: 'application/*+json' })); // 创建 application/json 解析


/** 中间件 中间件的加载顺序很重要 通常日志中间件放到比较靠前的位置 */
app.use((req, res, next) => {
  const { url, method } = req;
  console.log('request: ', url, method);
  // console.log('middleware 1');
  next();
  // next(new Error('error'));
});
// app.use((req, res, next) => {
//   console.log('middleware 2');
//   res.status(200); // .end();
//   next();
// });

/* 统一的错误处理 */
app.use((err: any, req: any, res: any, next: any) => {
  console.error('发生错误---', err.stack);
  // error page
  res.status(500).render('5xx');
});

/* 注册路由 */
app.use('/', indexRouter);
app.use('/user', userRouter);
app.use('/l', loginRouter);
app.use('/upload', uploadRouter);

app.get('/5', (req, res) => {
  res.redirect('/redirect')
  // res.status(505).render('5xx');
});

// 404中间件 express不会将404视为错误，需要单独处理
app.use((req, res, next) => {
  res.status(404).send('该页面不存在--------');
});

app.listen(3000, () => {
  console.log('服务器运行在端口 3000');
});



app.get('/groq', async (req, res) => {
  // console.log('req', req.query);
  const result = await groq.chat.completions.create({
    messages: [
      {
        role: 'user',
        content: req.query.q as string, // '请用中文给我讲一个笑话',
      },
    ],
    model: 'mixtral-8x7b-32768',
    temperature: 0.5,
    max_tokens: 1024,
    top_p: 1,
    // stream: true,
    stop: null,
  });
  const com = await result;
  const res_ = com.choices[0]?.message?.content;
  console.log('answer', com.choices[0]?.message?.content);
  res.send(res_);
});
