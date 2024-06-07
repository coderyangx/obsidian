
```html
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Document</title>
</head>
<body>
<!-- <script type="module" src="./groq.js"></script> -->
	<div id="id">
	输入你的问题：<input type="text">
	</div>

	<div>测试自定义元素</div>
	<my-element id="myEle">my-element</my-element>
  

	<button id="sendPost">发送请求</button>
  
	<div style="margin-top: 50px;">
		<h3>上传文件</h3>
		<input type="file" id="fileInput">
	</div>

<!-- 表单上传成功之后会触发页面刷新 -->
<!-- <form action="http://localhost:3000/upload" style="margin-top: 50px;">
表单上传
<input type="file" id="fileInput">
</form> -->
	
	<h3 style="margin-top: 50px;">选择文本高亮显示</h3>
	<div id="content">
		这是一段示例文本，<span>您可以尝试选取其中的一部分</span>，然后点击上方的按钮来高亮显示您选择的文本。
	</div>

<h3 style="margin-top: 50px;">获取焦点自动定位</h3>
<input type="text" style="width: 400px;" value="鼠标自动定位到position 10." id="ipt">
</div>
  
	<h3>当容器设置flex或grid，margin不会塌陷 collapse</h3>
	<div>创建BFC - 为父元素加边框也可以</div>
	<div style="margin-top: 20px;border: 1px solid red;">
	<div style="margin-top: 20px;margin-right: 20px;background: skyblue;width: 200px;height: 50px">1</div>
	<div style="margin-top: 20px;margin-left: 20px;background: gray;width: 200px;height: 50px">2</div>
	
</div>
</body>
<script>

// ** 惰性函数
{
	let count = 0;
	let lazyFunction = () => {
		console.log('count----', ++count);
		lazyFunction = typeof Promise !== 'undefined' ? () => {
			console.log('approve Promise')
		} : () => {
			console.log('no Promise')
		}
		lazyFunction()
	}
	lazyFunction()
	lazyFunction()

	let lazyFun = (() => {
		console.log('count----', ++count);
		return typeof Promise !== 'undefined' ? () => {
			console.log('approve Promise')
		} : () => { console.log('no Promise') }
	})()
	lazyFun()
	lazyFun()
}


// ** 级联函数
{
	function Person() {
		this.name = '';
		this.age = 0;
		this.weight = 10;
		this.say = () => { console.log('say'); return this };
		this.go = function () { console.log('go'); }
	}
	const person = new Person();
	person.say().go()
}

  
// ** 通过 getSelection() 实现文本高亮显示，获取选中文字，固定光标位置
// 将光标放在第三个字符上 // 注意：字符索引从0开始，所以第三个字符的索引是2 inputRef.current.setSelectionRange(2, 2);
{
	document.addEventListener('mouseup', function () {
		var selection = window.getSelection();
		if (!selection.rangeCount) {
			return; // 如果没有选中任何文本，则不执行任何操作
		}
		if (!selection.isCollapsed) { // 检查是否有文本被选中
			highlightSelection(selection);
		}
		function highlightSelection(selection) {
			var range = selection.getRangeAt(0);
			console.log('获取到的 selection', selection, 
				selection.toString(), 
				range.cloneContents()
			);
			var span = document.createElement('span');
			span.style.background = 'pink'
			// 跨节点选中会报错，要求所选内容必须完全包含在一个节点内
			range.surroundContents(span);
		}
	});
}

  
// ** 表单获取焦点自动focus到某一位置
{
	const ipt = document.querySelector('#ipt');
	// ipt.onselect = () => {}
	ipt.onfocus = function () {
		setTimeout(() => {
			// 如果 start=end，则光标就会在该位置
			ipt.selectionStart = ipt.selectionEnd = 10;
		});
	}
}


console.table('\n=-----------=\n\n')
// ** 上传文件
{
	const fileEle = document.getElementById('fileInput')
	fileEle.onchange = async (e) => {
		e.preventDefault();
		const file = e.target.files[0];
		const formData = new FormData();
		formData.append('file', file); // 'file'是后端接收文件的参数名
		formData.append('name', '测试文件上传');
		formData.append('age', 18);
		try {
			const response = await fetch('http://localhost:3000/upload', {
			method: 'POST',
			body: formData, // 将构建的FormData对象作为请求体
			contentType: 'multipart/form-data'
			// 注意：当使用FormData时，不需要手动设置Content-Type头部，浏览器会自动处理
			});
			console.log('上传成功--formData：', formData, 'response：', response);
			// if (response.ok) {
			// const result = await response.json();
			// console.log('上传成功', result);
			// }
		} catch (error) {
			console.error('上传发生错误', error);
		}
	};
}
  

// ** 往数据库新增数据
const btn = document.querySelector('#sendPost')
btn.addEventListener('click', () => {
	fetch('//localhost:3000/user/login', {
		method: 'POST',
		body: JSON.stringify({
			name: '测试' + Math.random() * 1000,
			age: 18,
			sex: '男',
			address: '上海市徐汇区'
		})
	}).then(res => res.json()).then(data => {
		console.log(data)
	})
})

// btn.click();

const GROQ_API_KEY = 'gsk_BLhwzOqRXrn5zmAo84A0WGdyb3FY61JOmef9xypZAG5UUZ8WYWK0e'
// console.log(document.getElementById(
// "myEle",
// ), document.getElementById(
// "myEle",
// ).textContent);
const div = document.getElementById("id");
console.log((div), div.textContent);
// 创建一个 shadow root，可以实现css隔离
const shadowRoot = div.attachShadow({
	mode: "open"
})

shadowRoot.innerHTML = `
	<style>
		div {
		color: green;
		}
	</style>
	<div>hello world</div>
`

// 创建自定义customElement
class MyElement extends HTMLElement {
	constructor() {
		super()
		this.innerHTML = ' 自定义innerHTML --'
		// 创建一个 shadow root，可以实现css隔离
		// this.attachShadow({ mode: "open" }) 
	}
	// 当元素被插入到DOM中时调用
	connectedCallback() {
	const template = document.getElementById("myEle");
	console.log('connected--', template, template.textContent);
	
	// this.shadowRoot.innerHTML = `
	// <style>
	// div {
	// color: red;
	// }
	// </style>
	// <div>hello world</div>
	// `
	}
	
	// 当元素被移除时调用
	disconnectedCallback() {
		console.log('disconnected')
	}
	// 当元素的属性被添加、移除或更改时调用
	static get observedAttributes() {
		return ['name']
	}

// 当元素的属性被添加、移除或更改时调用
	attributeChangedCallback(name, oldValue, newValue) {
		console.log(name, oldValue, newValue)
	}
}

customElements.define('my-element', MyElement)
customElements.whenDefined('my-element').then(() => {
console.log('my-element 被定义了')
console.log(document.getElementById("myEle"), document.getElementById("myEle").textContent)})

</script>
</html>
```

