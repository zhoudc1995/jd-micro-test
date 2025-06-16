import microApp, { EventCenterForMicroApp } from '@micro-zoe/micro-app';
import axios from 'axios';
// 创建容器
document.body.innerHTML = `
  <div id="app-container">
    <h1>Micro App 主应用</h1>
  </div>    
`;
// 启动 micro-app
microApp.start({
   
    fetch(url, options) {
      axios.defaults.headers.common["Accept"] = "*/*";
      return axios({ url, ...options }).then((res) => {
        return res.data;
      });
    },
    excludeAssetFilter (assetUrl) {
      console.log('excludeAssetFilter111', assetUrl);
      if (assetUrl.includes('cocos-js')) {
        return true // 返回true则micro-app不会劫持处理当前文件
      }
      return false
    }
});


const container = document.getElementById('app-container');
const url = location.href.includes('https') ? location.origin + '/testMicro/cocos.html' : location.origin + '/cocos.html';

  microApp.renderApp({
    name: 'subapp',
    url: url,
    inline: true,
    container: container,
    disableSandbox: true,
    destory: true,
    lifeCycles: {
      created: () => {
        console.log('micro-app元素被创建');
      },
      beforemount: () => {
        console.log('即将被渲染');
      },
      mounted: () => {
        console.log('渲染完毕');
      },
      unmount: () => {
        console.log('已经卸载');
      },
      error: (e) => {
        console.log('渲染出错', e);
      },
    },
  });
// 渲染子应用
 


