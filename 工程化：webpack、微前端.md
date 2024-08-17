[webpack 笔记](https://www.qcqx.cn/article/764f33bc.html)          webpack 视频：  [链接](https://www.bilibili.com/video/BV1kP41177wp?p=66&spm_id_from=pageDriver&vd_source=ceba6fa4ea92478c52c3119bd474a7ab )   

#### webpack相关
[性能优化基础操作细节](https://ibb.co/F8y14zz)  
webpack prefetch/preload js文件原理：[链接](https://www.bilibili.com/video/BV11T41167vf/?spm_id_from=333.999.0.0&vd_source=ceba6fa4ea92478c52c3119bd474a7ab)      
preload 预加载，解析 html 文档同时开始下载资源，prefetch 预拉取，页面加载完成才会加载
`preload` 用于高优先级加载资源，这些资源是页面在渲染时立即需要的。通过 `preload`，浏览器可以提前加载这些资源，以减少加载时间并提高页面的首次渲染速度。
`prefetch` 用于低优先级加载资源，这些资源是用户未来可能需要的。浏览器在空闲时间会低优先级预取这些资源，从而在用户导航到相应页面时更快地加载资源。
可以通过魔法注释：/*webpackPrefetch: 999*/ 提高prefetch的加载权重
script 加载
	1、做到了充分按需引入，用到的时候在加载，不用永不加载，充分节省了带宽
	2、最大问题在于，切换需要等待，体验不是很流畅
prefetch
	1、充分利用使用者不占用带宽的浏览时间，切换到异步加载的页面是可能已经加载好了，用户体验更流畅
	2、一些本次行为不会打开的页面也会加载，一定程度上浪费了带宽

页面加载耗时排查方案：[链接](https://www.bilibili.com/video/BV16j411877x/?spm_id_from=autoNext&vd_source=ceba6fa4ea92478c52c3119bd474a7ab)   
	资源加载（大头）
	 代码执行（有可能会慢）
	 页面绘制（通常较快）
	 重点关注网络（资源加载时间）、js脚本时间、渲染时间、可以勾选屏幕截图和内存选项
资源加载慢的一般解决思路
	1、找到是哪个文件过大导致
	2、如果存在一些文件比较大，又不是马上需要，可以异步加载（prefetch、动态导入）
	3、利用好 tree-shaking，尽量使用**按需引入**，升级库到支持按需引入的版本
	4、进行 gzip 压缩
	5、利用 webpack，vite 对代码进行压缩


webpack分包：[webpack分包实现按需加载](https://www.bilibili.com/video/BV1kP41177wp?p=68&vd_source=ceba6fa4ea92478c52c3119bd474a7ab)     
	多入口打包：适用于传统的多页应用
	esmodule 动态导入：动态导入会自动分包， js、css 文件均可以动态导入
webpack 魔法注释：[链接](https://www.bilibili.com/video/BV1kP41177wp?p=72&vd_source=ceba6fa4ea92478c52c3119bd474a7ab) ，给动态导入模块起名字
webpack 提取公共模块：[链接](https://www.bilibili.com/video/BV1kP41177wp?p=70&vd_source=ceba6fa4ea92478c52c3119bd474a7ab) 
	比如某些 js、css 文件，比如：配置 optimization: { splitChunks: { chunks: 'all' } }
	 https://ibb.co/v1G06Sc 

webpack publicPath详解：[webpack publicPath详解](https://www.bilibili.com/video/BV1kP41177wp/?p=24&spm_id_from=pageDriver&vd_source=ceba6fa4ea92478c52c3119bd474a7ab)      

webpack-loader 实现：[实现一个markdown loader](https://www.bilibili.com/video/BV1kP41177wp/?p=30&spm_id_from=pageDriver&vd_source=ceba6fa4ea92478c52c3119bd474a7ab)   

webpack-plugins 实现：[实现一个webpack -plugins](https://www.bilibili.com/video/BV1kP41177wp/?p=37&spm_id_from=pageDriver&vd_source=ceba6fa4ea92478c52c3119bd474a7ab)       

#### web自动化测试 puppeteer [🔗视频链接](https://www.bilibili.com/video/BV17s421N72k/?spm_id_from=333.337.search-card.all.click)         
项目的 package.json 配置 bin 命令
```javascript
// 可以直接在项目根目录执行 bin 快捷命令：pptest https://www.baidu.com，（参数是需要测试的网页地址），脚本里面通过 process.agrv[2] 获取该参数注入到 puppeteer运行环境
{
	"name": "nodejs",
	"version": "1.0.0",
	"description": "",
	"main": "index.js",
	"scripts": {
		"start": "nodemon index.ts",
		"build": "npm build groq.js",
		"test": "echo \"Error: no test specified\" && exit 1",
		// 也可执行：npm run ytest https://www.baidu.com
		"ytest": "node ./puppeteer/puppeteer.mjs"
	},
	// 用于配合对应的 js 脚本文件一起使用，简化操作命令
	"bin": {
		"pptest": "./puppeteer/puppeteer.mjs"
	}
}

#! /usr/bin/env node
// 配合package.json里面的 bin：pptest 命令使用，告诉电脑执行环境使用node，必须写在第一行
// 由于没有发布到npm仓库，所以本地运行的时候需要执行 npm link 一下，再执行 pptest
import * as pp from 'puppeteer-core';

async function run() {
	const browser = await pp.launch({
		headless: false,
		defaultViewport: {
		width: 1280,
		height: 800,
	},
	executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
	});
	const page = await browser.newPage();
	const startTime = performance.now();
	try {
		console.log('pptest携带的参数：', process.argv);
		await page.goto(process.argv[2] || 'http://127.0.0.1:5500/nodejs/web3.html'); // 换成本地运行地址即可
		// 1、测试页面某个列表渲染完成的 时间
		// await page.waitForSelector('.list-item');
		// const listTiming = JSON.parse(
		// await page.evaluate(() => JSON.stringify(window.performance.timing))
		// );
		// console.log('列表渲染时间：', performance.now - startTime, 'ms');
		// 2、测试某个链路的完成时间：比如从用户登录之后到进入首页渲染完成的时间
		const username = await page.waitForSelector('#username');
		await username.type('admin');
		const password = await page.$('#password');
		await password.type('1234567');
		const loginBtn = await page.$('#login'); // $ 获取页面上已经存在的元素
		await loginBtn.click();
		// 登陆之后页面会发生跳转，需要等待跳转完成
		await page.waitForNavigation({ waitUntil: 'networkidle0' });
		console.log('流程运行时间：', performance.now() - startTime);
	} catch (error) {
		console.error('An error occurred:', error);
	}
	browser.close(); // 测试完成关闭浏览器
	// const windowTiming = JSON.parse(
	// await page.evaluate(() => JSON.stringify(window.performance.timing))
	// );
	// console.log('白屏时间：', windowTiming.domLoading - windowTiming.navigationStart, 'ms');
	// console.log('网页打开时间：', performance.now() - startTime);
}
run();
```


#### husky 原理
git hooks，实现lint 代码检查 代码规范化

#### 前端工程化、工作流、埋点监控、性能、部署、CI/CD、
项目规范：`ESlint`，`stylelint`， `prettier`， `commitlint`

埋点监控：对于错误监控，可以了解 Sentry，原理简单来说就是通过 `window.onerror` 和 `window.addEventListener('unhandledrejection', ...)` 去分别捕获同步和异步错误，然后通过错误信息和 `sourceMap` 来定位到源码。

性能监控：可以通过 `window.performance`、`PerformanceObserver` 等 API 收集页面性能相关的指标，除此之外，还需要关注接口的响应时间。

最后，收集到信息之后，还要考虑数据上报的方案，比如使用 `navigator.sendBeacon` 还是 Fetch、AJAX？是批量上报，实时上报，还是延迟上报？上报的数据格式等等。



#### Vue / React
Vue 可以说简单高效轻量级，面试必会问你为什么，你就开始说 Vue 的响应式系统，依赖收集等。

React 可以说 JSX、Hooks 很灵活，那你必然要考虑 JSX 怎么编译， Hooks 实现方式等




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

#### qiankun微前端框架
qiankun框架publicPath写死问题：[https://github.com/umijs/qiankun/issues/218](https://github.com/umijs/qiankun/issues/218) 
vue3版本qiankun2.0尝鲜：[https://juejin.cn/post/6844904143413313549#heading-22](https://juejin.cn/post/6844904143413313549#heading-22)      


