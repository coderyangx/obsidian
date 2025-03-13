日历使用了路由懒加载方案，避免加载无关的页面资源。因为路由懒加载，首屏资源的加载过程就变成如下，加载解析到下一层级路由的时候才会请求和加载对应的资源。

理想的情况下，我们希望能并行的下载资源，提高资源下载的效率，如下图

综上结论，找到并行的资源请求方式，并行的请求首屏需要的所有静态资源。

二、 目标
实现方案，保障日程首屏资源能并行请求；
方案能快速扩展给不同业务方使用。

1、 构建路由和资源关系记录
自定义Umi插件，使用 onBuildComplete 钩子 （开发过程验证使用 onDevCompileDone），记录好路由和静态资源的关系， 生成 JSON 文件放到build目录中。
```json
{
  "preloadMap": {
    "/sso/callback": [],
    "/": [
      "layout.chunk.css",
      "layout.js",
      "vendors~p__newWeekly~p__rooms~p__scheduleDetail~p__scheduleEdit.chunk.css",
      "vendors~p__newWeekly~p__rooms~p__scheduleDetail~p__scheduleEdit.js",
      "p__newWeekly~p__rooms~p__scheduleDetail~p__scheduleEdit.chunk.css",
      "p__newWeekly~p__rooms~p__scheduleDetail~p__scheduleEdit.js",
      "p__newWeekly.chunk.css",
      "p__newWeekly.js"
    ],
    "/edit/:id?/:appKey?": [
      "layout.chunk.css",
      "layout.js",
      "vendors~p__newWeekly~p__rooms~p__scheduleDetail~p__scheduleEdit.chunk.css",
      "vendors~p__newWeekly~p__rooms~p__scheduleDetail~p__scheduleEdit.js",
      "p__newWeekly~p__rooms~p__scheduleDetail~p__scheduleEdit.chunk.css",
      "p__newWeekly~p__rooms~p__scheduleDetail~p__scheduleEdit.js",
      "p__scheduleEdit.chunk.css",
      "p__scheduleEdit.js"
    ],
    "/rooms": [
      "layout.chunk.css",
      "layout.js",
      "vendors~p__newWeekly~p__rooms~p__scheduleDetail~p__scheduleEdit.chunk.css",
      "vendors~p__newWeekly~p__rooms~p__scheduleDetail~p__scheduleEdit.js",
      "vendors~p__rooms.chunk.css",
      "vendors~p__rooms.js",
      "p__newWeekly~p__rooms~p__scheduleDetail~p__scheduleEdit.chunk.css",
      "p__newWeekly~p__rooms~p__scheduleDetail~p__scheduleEdit.js",
      "p__rooms.chunk.css",
      "p__rooms.js"
    ],
    "/group": [
      "layout.chunk.css",
      "layout.js",
      "vendors~p__newWeekly~p__rooms~p__scheduleDetail~p__scheduleEdit.chunk.css",
      "vendors~p__newWeekly~p__rooms~p__scheduleDetail~p__scheduleEdit.js",
      "p__newWeekly~p__rooms~p__scheduleDetail~p__scheduleEdit.chunk.css",
      "p__newWeekly~p__rooms~p__scheduleDetail~p__scheduleEdit.js",
      "p__scheduleEdit.chunk.css",
      "p__scheduleEdit.js"
    ],
    "/chat": [
      "layout.chunk.css",
      "layout.js",
      "vendors~p__newWeekly~p__rooms~p__scheduleDetail~p__scheduleEdit.chunk.css",
      "vendors~p__newWeekly~p__rooms~p__scheduleDetail~p__scheduleEdit.js",
      "p__newWeekly~p__rooms~p__scheduleDetail~p__scheduleEdit.chunk.css",
      "p__newWeekly~p__rooms~p__scheduleDetail~p__scheduleEdit.js",
      "p__scheduleEdit.chunk.css",
      "p__scheduleEdit.js"
    ],
    "/detail": [
      "layout.chunk.css",
      "layout.js",
      "vendors~p__newWeekly~p__rooms~p__scheduleDetail~p__scheduleEdit.chunk.css",
      "vendors~p__newWeekly~p__rooms~p__scheduleDetail~p__scheduleEdit.js",
      "p__newWeekly~p__rooms~p__scheduleDetail~p__scheduleEdit.chunk.css",
      "p__newWeekly~p__rooms~p__scheduleDetail~p__scheduleEdit.js",
      "external_detailPopContent~p__scheduleDetail.chunk.css",
      "external_detailPopContent~p__scheduleDetail.js",
      "p__scheduleDetail.chunk.css",
      "p__scheduleDetail.js"
    ],
    "/*": [
      "layout.chunk.css",
      "layout.js",
      "vendors~p__newWeekly~p__rooms~p__scheduleDetail~p__scheduleEdit.chunk.css",
      "vendors~p__newWeekly~p__rooms~p__scheduleDetail~p__scheduleEdit.js",
      "p__newWeekly~p__rooms~p__scheduleDetail~p__scheduleEdit.chunk.css",
      "p__newWeekly~p__rooms~p__scheduleDetail~p__scheduleEdit.js",
      "p__newWeekly.chunk.css",
      "p__newWeekly.js"
    ]
  },
  "publicPath": "/"
  
}
```

```js
方案细节逻辑
import { writeFileSync } from 'fs';
import { join } from 'path';
import { flatten, uniq } from 'lodash';

function normalizeEntry(entry) {
  return entry
    .replace(/^.(\/|\\)/, '')
    .replace(/(\/|\\)/g, '__')
    .replace(/\.jsx?$/, '')
    .replace(/\.tsx?$/, '');
}


function getPreloadKey(route, preloadKeyGenerator) {
  let preloadKey;
  if (preloadKeyGenerator) {
    preloadKey = preloadKeyGenerator(route);
  }
  return preloadKey || route.preloadKey || route.path || '__404'; // __404 是为了配置路由的情况下的 404 页面
}

function patchDataWithRoutes(preloadMap, routes = [], chunkGroupData, parentChunks = [], dva, preloadKeyGenerator) {
  routes.forEach((route) => {
    const key = getPreloadKey(route, preloadKeyGenerator);

    preloadMap[key] = preloadMap[key] || [];
    const webpackChunkName = normalizeEntry(route.component || 'common_component')
      .replace(/^.*src__/, '')
      .replace(/^.*pages__/, 'p__')
      .replace(/^.*page__/, 'p__');
    const chunks = flatten(chunkGroupData.filter((group) => {
      let isMatch = false;
      if (group.name === webpackChunkName) {
        isMatch = true;
      } else if (dva && group.name) {
        // p__user__test__models__data.js.js -> p_user__test
        const groupNameWithoutModel = group.name.replace(/__model.+$/, '');
        if (webpackChunkName.indexOf(groupNameWithoutModel) === 0) {
          // 只要 model 是在路由对应组件的文件夹下（包含上层文件夹下）那么 model 就会被 umi-plugin-dva 自动挂载
          // 这种情况下对应的 model 也需要加到预加载中
          isMatch = true;
        }
      }
      return isMatch;
    }).map(group => group.chunks));
    preloadMap[key] = uniq(preloadMap[key].concat(parentChunks).concat(chunks));
    patchDataWithRoutes(preloadMap, route.routes, chunkGroupData, preloadMap[key], dva, preloadKeyGenerator);
  });
}

function getPreloadData({ compilation }, routes, { useRawFileName, dva, preloadKeyGenerator }, publicPath) {
  const allChunks = compilation.chunkGroups;
  const preloadMap = {};
  const chunkGroupData = allChunks.map((group) => {
    return {
      name: group.name,
      chunks: flatten(group.chunks.map((chunk) => {
        return chunk.files.filter(file => !/(\.map$)|(hot\-update\.js)/.test(file)).map((file) => {
          if (useRawFileName) {
            return file.replace(/\.\w{8}.chunk.css$/, '.css').replace(/\.\w{8}.async.js$/, '.js');
          }
          return file;
        });
      })),
    };
  });
  patchDataWithRoutes(preloadMap, routes, chunkGroupData, [], dva, preloadKeyGenerator);
  return {
    routes: parseRoutesInfo(routes, preloadKeyGenerator),
    preloadMap,
    publicPath
  };
}

function parseRoutesInfo(routes, preloadKeyGenerator) {
  return routes.map((route) => {
    const ret = {
      path: route.path,
      exact: route.exact,
      redirect: route.redirect,
      matchCondition: route.matchCondition,
      preloadKey: getPreloadKey(route, preloadKeyGenerator),
    };
    if (route.routes) {
      ret.routes = parseRoutesInfo(route.routes, preloadKeyGenerator);
    }
    return ret;
  });
}
const PRELOAD_FILENAME = 'preload.json';

export default (api) => {
  api.describe({
    key: 'preloadPages',
    config: {
      schema(joi) {
        return joi.boolean();
      },
    },
  });
  const { paths } = api;

  let routesGlobal = [];
  let publicPath = '';
  const { useRawFileName = false, dva = false, preloadKeyGenerator } = {
    useRawFileName: false,
    dva: false,
    preloadKeyGenerator: null
  };

  function writePreloadData(target, data) {
    writeFileSync(target, JSON.stringify(data, null, 2));
  }

  api.modifyPublicPathStr(() => {
    publicPath = api.config.publicPath;
    return api.config.publicPath;
  });

  console.log(publicPath);

  api.modifyRoutes((routes) => {
    routesGlobal = routes;
    return routes;
  });

  api.onDevCompileDone(({ stats }) => {
    const targetStats = Array.isArray(stats.stats) ? stats.stats[0] : stats;
    const preloadData = getPreloadData(targetStats, routesGlobal, {
      useRawFileName: false,
      dva,
      preloadKeyGenerator,
    }, publicPath);
    const filePath = join(paths.absOutputPath, PRELOAD_FILENAME);
    writePreloadData(filePath, preloadData);
  });

  api.onBuildComplete(({ stats }) => {
    const targetStats = Array.isArray(stats.stats) ? stats.stats[0] : stats;
    const preloadData = getPreloadData(targetStats, routesGlobal, {
      useRawFileName,
      dva,
      preloadKeyGenerator,
    }, publicPath);
    const filePath = join(paths.absOutputPath, PRELOAD_FILENAME);
    writePreloadData(filePath, preloadData);
  });
};
2、 访问的时候读取记录JSON，和当前路由Path确认需要加载的资源
const preloadJson = require('../../build/preload.json');
const { preloadMap } = preloadJson;
publicPath = preloadJson.publicPath;
let keyOptional = '';
let matchItem = null;

Object.keys(preloadMap).forEach(item => {
  if (!item.includes('*')) {
    const re = pathToRegexp(item);
    if (re.test(currentUrl)) {
      matchItem = preloadMap[item];
      console.log(`命中 ${item}`)
      return;
    }
  } else {
    keyOptional = item;
  }
});
// 未命中且路由中有 * 则等于命中 *
if (!matchItem && keyOptional) {
  console.log('命中optional')
  matchItem = preloadMap[keyOptional];
}
if (matchItem) {
  needPreloadFiles = matchItem.filter(itemFileName => {
    // 页面已经有的 不需要预加载了
    // 基于原来的预加载，只需要加载页面和layout
    return !htmlContent.includes(itemFileName)
  });
}
3. 把这些资源插入到模版中返回
// 整理buffer
needPreloadFiles.forEach(item => {
   const asType = item.endsWith('.js') ? 'script' : 'style';
   preloadBuffer += `<link rel='preload' href='${publicPath}${item}' as='${asType}' crossorigin='anonymous'>`;
 })

// 插入到HTML头，返回给客户端
const pageHtmlContent = htmlContent.replace(
    // eslint-disable-next-line no-useless-escape
    /\<\/head\>/,
    `${preloadBuffer}<script>window.__PageData__='${JSON.stringify(
      pageData || {}
    )}'</script></head>`
  );
  return insertPrefetchScript(pageHtmlContent, currentUrl);
```
