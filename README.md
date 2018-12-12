js实现图片上传功能，实现的效果，先见图来压压惊
![图片上传.gif](https://upload-images.jianshu.io/upload_images/11565434-1129622d7c340824.gif?imageMogr2/auto-orient/strip)

### 原理：

#### 结构部分：input标签

之前你可能没有注意到，input标签还有这个作用。
1.type属性为file
2.accept为允许选择的文件格式（如果是图片，则选择弹框里不会出现其他格式的文件），
3.onChange回调函数的参数是我们所选择的文件对象数据。
如下：

```
<input  type='file'  accept='image/*'  onChange={this.handleSelectFile.bind(this,this.state.uploadUrl)} />
```
#### js部分：ajax请求

通过实例化XMLHttpRequest对象，发起ajax请求，并监听进度和readyState值，获取后端返回值，完成上传。

#### 注意：

1.该图片上传功能，可以将选择过程和上传过程分离，比如你选择了一个图片，可以预览图片，可以多次选择和预览，最终再确认上传！

2.可以自行对代码进行修改，就可以适用于上传视频或者其他文件！

该图片上传功能的UI部分是基于antd实现的，如果不使用antd也可以在对应位置进行替代。

### 具体代码：

#### JSX:

```import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { message,Modal,Icon,Progress } from 'antd';
import uploadFunction from "./js/uploadFunction";


class App extends Component {
    constructor(props){
        super(props);
        this.state={
            file:{},//保存文件对象内容
            src:"",//保存图片的url
            progress:0,//上传进度
            uploadUrl:"http://192.168.1.20:13003/fileDetail/upImg/1/3139",//上传地址
        }
    }
  /*
    点击上传时触发input的点击事件
  */
  clickUploadBtn(){
      this.refs.uploadInput.click();
  }
  /*
  * 选择要上传的图片
  * */
  handleSelectFile(uploadUrl,e){
      const file = e.target.files[0];
      if (!file) {
          return;
      }
      let src;
      // 匹配类型为image/开头的字符串
      if (file.type==="image/png"||file.type==="image/jpeg") {
          src = URL.createObjectURL(file);
      }else{
          message.error("图片上传只支持JPG/PNG格式,请重新上传！");
          return;
      }
      if (file.size/1024/1024>5) {
          message.error("图片上传大小不要超过5MB,请重新上传！");
          return;
      }
      this.setState({
          file:file,
          src:src
      });
      this.startUpload(uploadUrl,file);
  }
  /*
  * 开始上传图片
  * */
  startUpload(uploadUrl,file){
      let this_=this;
      /*
      * 调用上传图片的封装方法
      * */
      uploadFunction.uploadForImage(
          uploadUrl,
          file,
          function (progress,response) {//回调函数处理进度和后端返回值
              this_.setState({
                  progress:progress
              });
              if (response&&response.code === 200) {
                  message.success("上传成功！");
              }else if (response && response.code !== 200) {
                  message.error(response.msg)
              }
          },
          localStorage.getItem("access_token"));
  }

  render() {
    return (
      <div className="App">
          <div style={{float:"left"}}>
              {this.state.src?
                  <div className="imgBox">
                      <img src={this.state.src} alt=""/>
                      {this.state.progress===100?null:
                          <div className="mask">
                              <div className="fileName">
                                  {this.state.file.name}
                              </div>
                              <div className="progress">
                                  <Progress
                                      percent={this.state.progress}
                                      size="small"
                                      status="active"
                                      showInfo={false}
                                      strokeColor="#31c060"
                                      strokeWidth={3}
                                  />
                              </div>
                          </div>
                      }
                  </div>
                  :
                  <div
                      className="uploadBox"
                      onClick={this.clickUploadBtn.bind(this)}
                  >
                      <Icon type="plus" style={{lineHeight:"150px",fontSize:"40px",color:"#999"}}/>
                  </div>
              }
              <input
                  ref="uploadInput"
                  type='file'
                  accept='image/*'
                  style={{width:"100px",border:"none",visibility:"hidden"}}
                  onChange={this.handleSelectFile.bind(this,this.state.uploadUrl)}
              />
          </div>

      </div>
    );
  }
}

export default App;
```
#### 上面引入的uploadFunction函数如下:

 ```
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
 ```