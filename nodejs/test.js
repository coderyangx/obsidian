// 所有应用：https://kuaida.it.test.sankuai.com/admin/myapp
// 获取应用列表 -> 获取表单 schema -> 获取表单的数量

// 封装休眠函数
function sleep(ms) {
  //测试环境可将下面代码注释掉以增加调试速度
  return new Promise((resolve) => setTimeout(resolve, ms));
}

let testURL = 'https://kuaida.sankuai.com';

// 请求App列表
const fetchApplications = (
  await fetch(
    `${testURL}/api/zeroconsole/app/list?pageNo=1&pageSize=10000` //暂定最多10000个项目，若更多可根据需要调整
  ).then((response) => response.json())
).data.pageList.map((item) => item.code);

// 请求每一个App中表单列表
let fetchFormCodeList = [];
let sleepCount = 0;
for (let i in fetchApplications) {
  if (sleepCount == 50) {
    //每50个请求休眠800ms，可根据需求修改
    await sleep(800);
    sleepCount = 0;
  }
  sleepCount++;
  await fetch(`${testURL}/api/zeroconsole/form/list?appCode=${fetchApplications[i]}`)
    .then((response) => response.json())
    .then((data) => {
      fetchFormCodeList.push(data.data.nodes);
    });
}

let componentNameArray = {};
let componentNameArray1 = {};
let tableList = [];
let tableList1 = [];
let componentNameTotal = 0;
let componentNameTotal1 = 0;

// 找叶子结点中的componentName
function findComponentName(obj, billNum) {
  if (!obj) return;
  for (let key in obj) {
    if (typeof obj[key] === 'object') {
      findComponentName(obj[key], billNum);
    } else if (key == 'componentName') {
      if (!componentNameArray[obj[key]])
        (componentNameArray[obj[key]] = 1), (componentNameArray1[obj[key]] = billNum);
      else componentNameArray[obj[key]]++, (componentNameArray1[obj[key]] += billNum);
      componentNameTotal++;
      componentNameTotal1 += billNum;
    }
  }
}

let formCodeID = [];
fetchFormCodeList.forEach((formCodeList) => {
  formCodeList.forEach((item) => {
    formCodeID.push(item);
  });
});

// 建立表单名和id的映射
let formCodeName = new Map();
formCodeID.forEach((item) => {
  formCodeName.set(item.formCode, item.name);
});

// 建立表单中单据数量和id的映射
let formCodeNum = new Map();

sleepCount = 0;
// 请求每一个表单中单据数量
for (let i in formCodeID) {
  if (sleepCount == 50) {
    //每50个请求休眠800ms，可根据需求修改
    await sleep(800);
    sleepCount = 0;
  }
  sleepCount++;
  await fetch(`${testURL}/api/zeroconsole/table/${formCodeID[i].formCode}?pageNo=1&pageSize=20`)
    .then((response) => response.json())
    .then((data) => {
      formCodeNum.set(formCodeID[i].formCode, data.data.page.totalCount);
    });
}

sleepCount = 0;
// 请求每一个表单中表头数据
for (let i in formCodeID) {
  if (sleepCount == 50) {
    //每50个请求休眠800ms，可根据需求修改
    await sleep(800);
    sleepCount = 0;
  }
  sleepCount++;
  await fetch(`${testURL}/api/zeroweb/form/get/${formCodeID[i].formCode}`)
    .then((response) => response.json())
    .then((data) => {
      if (formCodeNum.get(formCodeID[i].formCode) >= 10) {
        if (!data.data?.schema) {
          return;
        }

        let schema = JSON.parse(data.data?.schema || '{}');
        if (schema && schema != '') {
          let schemaObject = schema?.pages[0]?.layout?.children;
          schemaObject.forEach((node) => {
            resComponentNameTotal = findComponentName(
              node,
              formCodeNum.get(formCodeID[i].formCode)
            );
          });
        }
      }
    });
}

for (let type in componentNameArray) {
  let percentage = ((componentNameArray[type] / componentNameTotal) * 100).toFixed(1);
  tableList.push({
    组件: type,
    占比: percentage,
    具体占比: `${componentNameArray[type]}/${componentNameTotal}`,
    percentage,
  });
}

for (let type in componentNameArray1) {
  let percentage = ((componentNameArray1[type] / componentNameTotal1) * 100).toFixed(1);
  tableList1.push({
    组件: type,
    占比: percentage,
    具体占比: `${componentNameArray1[type]}/${componentNameTotal1}`,
    percentage,
  });
}

tableList.sort(function (a, b) {
  return b.percentage - a.percentage;
});

tableList1.sort(function (a, b) {
  return b.percentage - a.percentage;
});

//第一个为表单级别组件占比，第二个为单据级别组件占比
console.table(tableList, ['组件', '占比', '具体占比']);
console.table(tableList1, ['组件', '占比', '具体占比']);
