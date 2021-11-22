import React from 'react'
import DefaultContext  from "./Context";
import {server_url,funcs,id_app,public_token,group_id_partner,SLUG_APP_FOR_CUSTOMER,app_name} from './Config.js';
import {DeviceEventEmitter,Alert,Platform,AsyncStorage,View} from 'react-native';
import {Spinner } from 'native-base';
import io from 'socket.io-client'
import equal from 'fast-deep-equal';
import { Toast} from 'native-base';
import Constants from 'expo-constants';
import {loading} from './style.js';
import MyAlert from './Alert.js';
import Progress from './Progress.js';
import {asyncGetAppInfo,asyncLogoutAPI,registerForPushNotificationsAsync,asyncGet,getLabel,asyncSetLang,getLanguage,cachedData,asyncGetUserInfoByToken,asyncGetList} from "./API.js";
import * as Notifications from 'expo-notifications';
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});
export default class Provider extends React.Component{
  constructor(props){
    super(props);
    this.logout = this.logout.bind(this);
    this.setUserInfo =  this.setUserInfo.bind(this);
    this.updateUserInfo = this.updateUserInfo.bind(this);
    this.getAppInfo =  this.getAppInfo.bind(this);
    this._handleNotificationResponse = this._handleNotificationResponse.bind(this);
    this._handleNotification = this._handleNotification.bind(this);
    this.setNavigate = this.setNavigate.bind(this);
    this.navigate = this.navigate.bind(this);
    this.countUnreadNotifications = this.countUnreadNotifications.bind(this);

    this.state={
      logout:this.logout,
      getAppInfo:this.getAppInfo,
      updateUserInfo:this.updateUserInfo,
      setUserInfo:this.setUserInfo,
      setNavigate:this.setNavigate,
      userInfo:null,
      appInfo:this.props.appInfo,
      exchangeRate:this.props.exchangeRate,
      numberNotifications:0,
      numberMessagesChanged:0,
      setProcessing:this.setProcessing.bind(this),
      alert:this.alert.bind(this)
    }
  }
  async componentDidMount(){
  }
  setProcessing(processing,callback){
    if(processing){
      this.progressRef.open(callback)
    }else{
      this.progressRef.close(callback)
    }
  }
  alert(title,callback){
    this.progressRef.close()
    this.alertRef.open(title,callback);
  }
  setNavigate(_navigate){
    this._navigate = _navigate;
    if(_navigate && this.redirect){
      _navigate(this.redirect.path,this.redirect.options);
      delete this.redirect;
    }
  }
  navigate(path,options){
    if(this._navigate){
      this._navigate(path,options);
    }else{
      this.redirect ={
        path,
        options
      }
    }
  }
  async logout(){
    try{
      await asyncLogoutAPI(this.state.userInfo);
    }catch(e){
      Alert.alert(e.message);
    }
    await AsyncStorage.clear();
    await AsyncStorage.setItem('opened',"1");
    this.navigate("AuthLoading");
  }
  async countUnreadNotifications(userInfo){
    if(!userInfo) userInfo = this.state.userInfo
    if(userInfo && userInfo.email!=="public"){
      //tinh so luong notifications
      this.setState({numberNotifications:0});
    }else{
      this.setState({numberNotifications:0});
    }
  }
  updateUserInfo(e){
    if(!this.state.userInfo) return;
    for(let k in e){
      this.state.userInfo[k] = e[k];
    }
    this.setState({userInfo:this.state.userInfo});
  }
  async getAppInfo(token,fields="",notfields=""){
    return asyncGetAppInfo(token);
  }
  async setUserInfo(userInfo){
    if(!userInfo){
      this.setState({
        userInfo:userInfo
      })
      return true;
    }
    if(!userInfo.token){
      Alert.alert("UserInfo miss token");
      return false;
    }
    if(equal(this.state.userInfo,userInfo)) return true;
    //
    const currentToken = (this.state.userInfo?this.state.userInfo.token:"");

    if(!userInfo.picture){
      userInfo.picture = "/images/avatar.png";
    }
    //deprecated
    cachedData.userInfo =  userInfo;
    //count notifications
    this.countUnreadNotifications(userInfo);
    //init socket
    if(userInfo.token!=currentToken){
      console.log("register notifications");
      this.initSocket(userInfo)
    }
    //set userinfo
    this.setState({
      userInfo:userInfo
    })
    return true;
  }
  async initSocket(userInfo) {
    const _provider = this;
    if(!userInfo || userInfo.email==="public"){
      return;
    }
    //register notification service
    try{
      await registerForPushNotificationsAsync(userInfo);
      //receiver notification
      //this._notificationSubscription = Notifications.addListener(this.receiverNotifications);

      Notifications.addNotificationReceivedListener(this._handleNotification);
      Notifications.addNotificationResponseReceivedListener(this._handleNotificationResponse);
    }catch(e){
      Alert.alert(e.message);
    }
  }
  _handleNotification(notification){
    console.log("received notificaiton",notification)
    let title = ((notification.request||{}).content||{}).title;
    Toast.show({
      text: title||getLabel("Bạn có thông báo mới"),
      buttonText: "Okay",
      duration: 3000,
      type: "danger",
      position: "top"
    })
  }
  async _handleNotificationResponse(response){
    console.log("press on notification",response)
    if(!this.state.userInfo) return;
    let data = response.notification.request.content.data.body;
    let ma_ct = data.ma_ct;
    let stt_rec = data.stt_rec;
    if(ma_ct  && stt_rec){
      console.log("go to",ma_ct,stt_rec)
      DeviceEventEmitter.emit(data.__event,data);
      this.navigate(ma_ct.toUpperCase(),{condition:{stt_rec:stt_rec}});
      return;
    }
    /*if(ma_ct  && stt_rec){
      DeviceEventEmitter.emit(event.data.__event,event);
      if(event.origin==='selected'){
        this.navigate(ma_ct.toUpperCase(),{condition:{stt_rec:stt_rec}});
      }
      return;
    }
    if(event.data.__event.indexOf("notify:new")>=0  && event.data._id){
      DeviceEventEmitter.emit("notificationAdded",{_id:event.data._id});
      if(event.origin==='selected'){
        //xu ly khi thong bao moi duoc click
      }
      return;
    }
    if(event.origin==='received'){
      Toast.show({
        text: event.data.title||getLabel("Bạn có thông báo mới"),
        buttonText: "Okay",
        duration: 3000,
        type: "danger",
        position: "top"
      })
    }*/
  }
  render(){
    return (
      <DefaultContext.Provider  value={this.state}>
        {this.props.children}
        <Progress ref={ref=>this.progressRef=ref}/>
        <MyAlert ref={ref=>this.alertRef=ref}/>
      </DefaultContext.Provider>
    )
  }
}
