import React, { Component } from 'react';
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
