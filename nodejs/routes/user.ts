import express from 'express';
import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const router = express.Router();

router.post('/login', async (req: Request, res: Response) => {
  const { name, age, sex, address = '' } = req.body;
  console.log('login请求体：', req.body);
  // 创建用户
  // const user = await prisma.user.create({
  //   data: {
  //     name,
  //     age: Number(age),
  //     sex,
  //     address,
  //   },
  // });
  // 查询所有用户
  const user = await prisma.user.findMany();
  res.json({
    data: user,
    code: 200,
  });
  // res.send('发起 POST 请求 ' + name + ' ' + tel);
});

// 通过调用 res.render 函数渲染 ejs 模板，res.render 第一个参数是模板的名字，
// users 则匹配 views/user.ejs，第二个参数是传给模板的数据，这里传入 name，
// 则在 ejs 模板中可使用 name。 res.render 的作用就是将模板和数据结合生成 html，
// 同时设置响应头中的 Content-Type: text/html，告诉浏览器我返回的是 html，不是纯文本，要按 html 展示。
router.get('/page', (req, res) => {
  res.render('user', {
    name: 'haha',
  });
});

router.get('/params/:name', (req, res) => {
  res.send('hello, router/user' + req.params.name);
});

export default router;
