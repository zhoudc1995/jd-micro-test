(function () {
    // 客户端传过来的游戏数据11
    let gameData;
    let syncData;

    main();
    function main() {
        window.parent &&
          window.parent.postMessage(
            {
              type: "onEvent",
              data: {
                command: "gameContainerLoadEnd",
                param: {},
              },
            },
            "*"
          );
        // 监听消息事件
        window.addEventListener("message", function (event) {
            if (!event || !event.data) return;

            const msgType = event.data.type;
            const msgData = event.data.data;
            switch (msgType) {
                case "onEvent":
                    notifyEventMessage(msgData);
                    break;
                case "postTeacherPomeloMessage":
                    notifyTeacherPomeloMessage(msgData);
                    break;
            }
        });
    }

    // loadIframe 函数
    function loadGameIframe(data) {
        gameData = data;
        syncData = data.syncData;
        window.cocosGameMessage && window.cocosGameMessage.removeAll();
        addGameEventListener();
        let gameIframe = document.getElementById("gameIframe");
        // 清空原有的 iframe
        while (gameIframe && gameIframe.firstChild) {
            gameIframe.removeChild(gameIframe.firstChild);
        }
        // 创建新的 iframe
        let iframe = document.createElement("iframe");
        let url = new URL('./cocos.html', location.href);
        url.searchParams.set("from", "observer");
        url.searchParams.set("role", "observer");
        iframe.src = url;
        // 将 iframe 添加到容器中
        gameIframe.appendChild(iframe);
    }

    function notifyEventMessage(data) {
        const { id, command, param } = data;
        switch (command) {
            case "loadGameIframe":
                loadGameIframe(param);
                break;
        }
    }

    function notifyTeacherPomeloMessage(data) {
        const { id, command, param } = data;
        switch (command) {
            case "sendGameSyncAction":
                recvSyncData(param);
                break;
            case "sendGameState":
                recvHeartBreak(param);
                break;
        }
    }

    function addGameEventListener() {
        window.cocosGameMessage &&
            window.cocosGameMessage.on("cocosToMcc", cocosToMcc, this);
    }

    /**
     * @description: 向游戏发送消息
     * @param {{eventName: string, data: any}} data
     */
    function sendMessageToGame(data) {
        window.cocosGameMessage &&
            window.cocosGameMessage.dispatch("mccToCocos", data);
    }

    /**
     * @description: 发送消息给客户端
     */
    function sendToNative(data) {
        window.parent && window.parent.postMessage(data, "*");
    }

    function cocosToMcc(e) {
        if (!e) return;

        const eventName = e.eventName;
        const data = e.data;
        const callback = e.callback;
        switch (eventName) {
            // 主包加载完成
            case "mainGameInitDone":
                const params = getGameUrlParams();
                callback && callback(params);
                break;
            // 框架加载完成
            case "frameGameInitDone":
                callback && callback({ msg: "success" });
                changeGamePage();
                break;
            /**游戏开始 */
            case "gameStart":
                const data = getGameStartResultData();
                callback && callback(data);
                break;
            // 交互游戏同步消息
            case "send_sync_data":
                // 目前不处理监课端发出的同步消息，后续有需求再补充
                onGameSyncData(e);
                break;
            
            case "request_game_to_client":
                // 游戏发给端的消息，容器层先不处理
                // const gameData = {};
                // this.sendToNative(gameData);
                break;
        }
    }

    function getGameUrlParams() {
        const params = {
            frameUrl: gameData.frameUrl,
            isLoadFromLocal: gameData.isLoadFromLocal,
            localRootPath: gameData.localRootPath,
            cdnRootPathList: gameData.cdnRootPathList,
        };
        return params;
    }

    function changeGamePage() {
        sendMessageToGame({
            eventName: "pageChanged",
            data: {
                curPage: gameData.pageData,
                nextPage: null,
            }
        });
    }

    function getGameStartResultData() {
        const data = { isMaster: false, syncData: syncData, interactAction: null };

        return data;
    }

    function onGameSyncData(param) {
    }

    /**
     * @description: 接收到pomelo广播的游戏操作数据
     * @param {*} param
     */
    function recvSyncData(param) {
        if (!param) return;
        const data = param.data;
        if (!data) return;

        sendMessageToGame({ eventName: "recv_sync_data", data });
    }

    /**
     * @description: 接收到pomelo广播的游戏心跳数据
     * @param {*} param
     */
    function recvHeartBreak(param) {
        if (!param) return;
        const data = param.data;
        if (!data) return;

        const sData = data.actions?.[0]?.syncData;
        if (sData) {
            syncData = sData;
        }

        sendMessageToGame({ eventName: "recv_heart_break", data });
    }
})();
