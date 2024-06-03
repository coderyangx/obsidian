[webpack 笔记](https://www.qcqx.cn/article/764f33bc.html)        

webpack 视频： https://www.bilibili.com/video/BV1kP41177wp?p=66&spm_id_from=pageDriver&vd_source=ceba6fa4ea92478c52c3119bd474a7ab 

框架库源码网站：  https://unpkg.com/

webpack分包：[webpack分包实现按需加载](https://www.bilibili.com/video/BV1kP41177wp?p=68&vd_source=ceba6fa4ea92478c52c3119bd474a7ab)     
	多入口打包：适用于传统的多页应用
	esmodule 动态导入：动态导入会自动分包， js、css 文件均可以动态导入
webpack 魔法注释：[链接](https://www.bilibili.com/video/BV1kP41177wp?p=72&vd_source=ceba6fa4ea92478c52c3119bd474a7ab) ，给动态导入模块起名字
webpack 提取公共模块：[链接](https://www.bilibili.com/video/BV1kP41177wp?p=70&vd_source=ceba6fa4ea92478c52c3119bd474a7ab) 
	比如某些 js、css 文件，比如：配置 optimization: { splitChunks: { chunks: 'all' } }
	 https://ibb.co/v1G06Sc 

webpack publicPath详解：[webpack publicPath详解](https://www.bilibili.com/video/BV1kP41177wp/?p=24&spm_id_from=pageDriver&vd_source=ceba6fa4ea92478c52c3119bd474a7ab)      

loader 实现：[实现一个markdown loader](https://www.bilibili.com/video/BV1kP41177wp/?p=30&spm_id_from=pageDriver&vd_source=ceba6fa4ea92478c52c3119bd474a7ab)   

plugins 实现：[实现一个webpack -plugins](https://www.bilibili.com/video/BV1kP41177wp/?p=37&spm_id_from=pageDriver&vd_source=ceba6fa4ea92478c52c3119bd474a7ab)       

#### qiankun微前端框架
qiankun框架publicPath写死问题：[https://github.com/umijs/qiankun/issues/218](https://github.com/umijs/qiankun/issues/218) 
vue3版本qiankun2.0尝鲜：[https://juejin.cn/post/6844904143413313549#heading-22](https://juejin.cn/post/6844904143413313549#heading-22) 


#### webpack模块热替换
![[Pasted image 20240526212329.png]]

 HMR - hot module replacement 模块热替换
 因为如果始终设置的是页面自动刷新，导致状态丢失，会导致有些时候不好调试，需要写死一部分逻辑， 因此推荐使用热更新，而不是热刷新， 
 监视模块变动后重新打包、自动刷新会导致页面的一些状态丢失（输入的文本内容），如果能让页面不刷新，模块也能更新，这样的开发体验会好很多

模块热替换HMR(Hot Module Replacement)可以实现无刷更新模块，「webpack 核心特性」模块热替换(HMR)
HMR作用：
保留在完全重新加载页面期间丢失的应用程序状态。
只更新变更内容，以节省宝贵的开发时间。
在源代码中 CSS/JS 产生修改时，会立刻在浏览器中进行更新，这几乎相当于在浏览器 devtools 直接更改样式。
```javascript
devServer: {
  hot: true, // 开启HMR
  // 在构建失败时不刷新页面作为回退
  // hot: 'only',
}
```