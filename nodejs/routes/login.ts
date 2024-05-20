import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    code: 200,
    data: {
      name: 'MCopilot',
      password: '123456',
    },
  });
  // res.send('hello, router/login.ts');
});

export default router;
