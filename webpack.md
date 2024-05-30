[webpack 笔记](https://www.qcqx.cn/article/764f33bc.html)        

https://www.bilibili.com/video/BV1kP41177wp?p=66&spm_id_from=pageDriver&vd_source=ceba6fa4ea92478c52c3119bd474a7ab

框架库源码网站：  https://unpkg.com/


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