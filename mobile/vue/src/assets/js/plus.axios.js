
//TODO:App访问网络的方式
//API参考 https://www.html5plus.org/doc/zh_cn/xhr.html
const server = window.Server;
const plus = window.plus;
const axios = {
    get(url, data) {
        let promise = new Promise((resolve, reject) => {
            let xhr = new plus.net.XMLHttpRequest();
            xhr.open("get", `${server}${url}`);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.responseType = "json";
            xhr.onload = (e) => {
                const data = {
                    data: e.target.response
                }
                resolve(data)
            }
            xhr.onerror = (e) => {
                //统一处理服务器报错
                reject(e)
            }
            if (data) {
                xhr.send(JSON.stringify(data));
            } else {
                xhr.send();
            }
        })
        return promise
    },
    post(url, data) {
        let promise = new Promise((resolve, reject) => {
            let xhr = new plus.net.XMLHttpRequest();
            xhr.open("post", `${server}${url}`);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.responseType = "json";
            xhr.onload = (e) => {
                const data = {
                    data: e.target.response
                }
                resolve(data)
            }
            xhr.onerror = (e) => {
                //统一处理服务器报错
                reject(e)
            }
            if (data) {
                xhr.send(JSON.stringify(data));
            } else {
                xhr.send();
            }
        })
        return promise;
    }
};
export default axios;