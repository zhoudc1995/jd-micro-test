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
    /**
     * 自定义fetch
     * @param {string} url 静态资源地址
     * @param {object} options fetch请求配置项
     * @param {string|null} appName 应用名称
     * @returns Promise<string>
     */
    fetch(url, options) {
      axios.defaults.headers.common["Accept"] = "*/*";
      return axios({ url, ...options }).then((res) => {
        return res.data;
      });
    }
});


const container = document.getElementById('app-container');

// 渲染子应用
microApp.renderApp({
  name: 'subapp',
  url: './cocos.html?templateId=216&openPanel=studentPanel&role=student&gameId=1045371&gameTemplateVersion=1.0.12&tempPlatformFlag=slides&platformFlag=slides&env=test&userId=P107330&slideId=b51a9c74888c48e0aa197f78ee039549',
  inline: true,
  container: container,
  disableSandbox: true,
  lifeCycles: {
    created: () => {
      console.log('micro-app元素被创建');
    },
    beforemount: () => {
      console.log('即将被渲染');
    },
    mounted: () => {
        debugger;
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





// window.eventCenterForCocos = new EventCenterForMicroApp('subapp')


