import { message,Modal } from 'antd';

// function uploadWithProgress(url,data,onProgress,errorback,token) {//data是数据列表
//     console.log('post-请求接口:' + url);
//     console.log('请求参数:' + data);
//     let this_=this;
//     if (!data) {
//         console.log('未选择文件');
//         return;
//     }
//
//     let xhrArr=[];
//     for (let i = 0; i < this.state.data.length; i++) {
//         let xhr = new XMLHttpRequest();
//         xhrArr.push(xhr)
//     }
//
//     xhrArr.forEach(function (el, index) {
//         let form = new FormData();
//         form.append('file', data[index]);
//         el.upload.addEventListener('progress', uploadProgress.bind(this_,index), false);  // 第三个参数为useCapture?，是否使用事件捕获/冒泡
//         // el.addEventListener('abort', function () {}, false);
//         // el.addEventListener('error', function () {}, false);
//         // el.addEventListener('timeout', function () {}, false);
//         // el.addEventListener('loadend', function () {}, false);
//         el.addEventListener('readystatechange',function(e){console.log(e)},false);
//         el.open('POST', url, true);  // 第三个参数为async?，异步/同步
//         el.setRequestHeader('accessToken', token);
//         el.send(form);
//     });
//
//     function uploadProgress(index,e){
//         if (e.lengthComputable) {
//             let progress = Math.round((e.loaded / e.total) * 100);
//             let arr=this_.state.progressArr;
//             arr[index]=progress;
//             this_.setState({progressArr:arr});
//             if (progress === 100) {
//                 xhrArr[index].upload.removeEventListener('progress', uploadProgress.bind(this_,index), false)
//             }
//             onProgress?onProgress(arr):null;//返回进度数据组
//         }
//     }
//
// }

function uploadForImage(url,data,callback,token) {//data是文件对象
    let xhr = new XMLHttpRequest();
    let form = new FormData();
    form.append('file', data);
    function uploadProgress(e) {
        if (e.lengthComputable) {
            let progress = Math.round((e.loaded / e.total) * 100);
            callback(progress);
        }
    }
    /*
    * 监听请求的进度并在回调中传入进度参数*/
    xhr.upload.addEventListener('progress',uploadProgress, false);  // 第三个参数为useCapture?，是否使用事件捕获/冒泡
    /*
    * 监听readyState的变化，完成时回调后端返回的response
    * */
    xhr.addEventListener('readystatechange',function(e){
        console.log(e);
        let response=e.currentTarget.response?JSON.parse(e.currentTarget.response):null;
        if (e.currentTarget.readyState===4&&response) {
            callback(100,response);
            xhr.upload.removeEventListener('progress', uploadProgress, false)
        }
    },false);

    xhr.open('POST', url, true);  // 第三个参数为async?，异步/同步
    xhr.setRequestHeader("accessToken",token);
    xhr.send(form);
}

export default {
    uploadForImage:uploadForImage//原生js开始上传并监听上传进度
};