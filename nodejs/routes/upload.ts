import express from 'express';
import path from 'path';
import multer from 'multer'; // 引入multer

const router = express.Router();

// 设置存储配置
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // 文件存储路径
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + path.extname(file.originalname)); // 文件名设置
  },
});

const upload = multer({ storage: storage }); // 使用配置

router.post('/', upload.single('file'), (req, res) => {
  // 'file' 是前端表单的name属性值
  console.log(req.file);
  // if (!req.file) {
  //   res.send({
  //     code: 400,
  //     data: '上传失败，请选择文件',
  //   });
  // } else {
    console.log('upload', req.file);
    res.send({
      code: 200,
      data: '上传成功',
      fileInfo: req.file,
    });
  // }
});
// router.post('/', (req, res) => {
//   console.log('upload');
//   res.send({
//     code: 200,
//     data: '上传成功',
//   });
// });

export default router;
