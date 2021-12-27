import React from 'react';
import {Image,Platform} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {DeviceEventEmitter,Alert} from 'react-native';
import {Toast,H3} from 'native-base';
import { Buffer } from 'buffer';
import {server_url,server_url_report,id_app,group_id,currency,public_token,app_name} from "./Config.js";
import {delay} from "./utils.js";
import {mainColor} from "./style.js";
import {Text} from 'native-base';
import Moment from 'moment';
import Numeral from 'numeral';
import * as Notifications from 'expo-notifications';
import * as Permissions from 'expo-permissions';
import { Asset } from 'expo-asset';
import * as Localization from 'expo-localization';
const pako = require('pako');
let lang,cachedData={};
function get(url,headers,callback,options={cache:false}){
  if(cachedData[url] && options.cache){
    return callback(null,cachedData[url]);
  }
  var request = new XMLHttpRequest();
  request.onreadystatechange = (e) => {
    if (request.readyState !== 4) {
      return;
    }
    if (request.status === 200) {
      let data =  request.responseText;
      if(options.onProccess){
        data = options.onProccess(data)
      }
      if(options.cache) cachedData[url] = data;
      callback(null,request.responseText);
    } else {
      console.log("error",request.responseText,url);
      let error = request.responseText || "";
      if(error.indexOf(server_url)>=0) error = "Can't connect to server. Please check your internet connection";
      callback(error||"Can't connect to server");
    }
  };
  request.open('GET', url);
  request.setRequestHeader("Accept-Encoding","gzip");
  if(headers){
    headers.forEach(header=>{
      request.setRequestHeader(header.name, header.value);
    })
  }
  request.send();
}
async function asyncGet(url,headers,options={}){
  let p = new Promise((resovle,reject)=>{
    get(url,headers,(e,rs)=>{
      if(e) return reject(new Error(e));
      resovle(rs);
    },options)
  })
  return p;
}
async function asyncGetGridInfo(token,gridid){
  let url = `${server_url}/api/${id_app}/gridinfo/${gridid}_mobile?access_token=${token}`;
  let rs = JSON.parse(await asyncGet(url,null,{cache:true}));
  if(rs.length===0){
    url = `${server_url}/api/${id_app}/gridinfo/${gridid}?access_token=${token}`;
    rs = JSON.parse(await asyncGet(url,null,{cache:true}));
  }
  let columns=[];
  if(rs.length>0){
    let columnsv = rs[0].columnsv.split(",");
    let headersv = rs[0].headersv.split(",");
    let hides = rs[0].hides.split(",");
    let widths = rs[0].widths.split(",");
    let formats = rs[0].formats.split(",");
    let defaultvalues = rs[0].defaultvalues.split(",");
    columnsv.forEach((id, i) => {
      let size = Math.round(Number(widths[i])/100);
      if (size<1) size=1;
      columns.push({
        id:id,
        label:headersv[i],
        hide:hides[i]=="1"?true:false,
        width:Number(widths[i]),
        defaultvalue:defaultvalues[i],
        size:size,
        format:(d)=>{
          let f = formats[i];
          let v = d[id];
          if(!v){
            v='--'
          }else{
            switch (typeof(v)) {
              case "number":
                v = Numeral(v).format();
                break;
              case "string":
                if(v.split("-").length===3){
                  let m = Moment(v,"YYYY-MM-DD");
                  if(m.isValid()){
                    v = m.format("DD/MM/YYYY")
                  }
                }
                break;
              default:

            }
          }
          return <Text style={[{fontWeight:d.bold?'bold':'normal',textAlign:'right'}]}>{v}</Text>
        }
      })
    });
  }
  return columns;
}
async function asyncGetListInfo(token,listid){
  let url = `${server_url}/api/${id_app}/list/${listid}/info?access_token=${token}`
  let rs = JSON.parse(await asyncGet(url,null,{cache:true}));
  if(rs.length===0) throw "Không tồn tại danh mục này"
  let listInfo = rs[0];
  listInfo.columns = await asyncGetGridInfo(token,listInfo.gridid);
  return listInfo;
}
async function asyncGetReportInfo(token,rptid,stt=1){
  let url = `${server_url}/api/${id_app}/report/${rptid}/${stt}/info?access_token=${token}`
  let rs = JSON.parse(await asyncGet(url,null,{cache:true}));
  if(rs.length===0) throw "Không tồn tại báo cáo này"
  let rptInfo = rs[0];
  rptInfo.columns = await asyncGetGridInfo(token,rptInfo.gridid);
  return rptInfo;
}
async function getVoucherDetailInfo(token,tab,index){
  let columns = await asyncGetGridInfo(token,tab.gridid4input);
  tab.key = index;
  tab.id = tab.tablename;
  tab.columns = columns;
  return tab;
}
async function asyncGetStatusList(token,form,type='status'){
  let url = `${server_url}/api/${id_app}/dmitemofcbb/${form}/${type}?access_token=${token}`;
  return JSON.parse(await asyncGet(url,null,{cache:true}));
}
async function asyncGetStatusDisable(token,voucherid,user){
  let url = `${server_url}/api/${id_app}/report/status_not_allow/1?access_token=${token}&voucher_id=${voucherid}&user=${user}`;
  return JSON.parse(await asyncGet(url,null,{cache:true}));
}
async function asyncGetVoucherInfo(token,voucherid,user){
  let url = `${server_url}/api/${id_app}/voucher/${voucherid}/info?access_token=${token}`
  let rs = JSON.parse(await asyncGet(url,null,{cache:true}));
  try{
    let statusList = await asyncGetStatusList(token,voucherid);
    let statusDisable = await asyncGetStatusDisable(token,voucherid,user);
    let master = rs.Table[0];
    master.columns =  await asyncGetGridInfo(token,master.mgridid);
    let info =  {
      voucherid:voucherid,
      statusList:statusList,
      statusDisable:statusDisable,
      master:master,
      details: await Promise.all(rs.Table1.filter(tab=>tab.trang_thai).map((tab,index)=>getVoucherDetailInfo(token,tab,index)))
    }
    return info;
  }catch(e){
    console.error(e.message)
    throw "Không tồn tại chứng tư này"
  }

}

async function asyncGetList(access_token,model_name,options={}){
  let url = `${server_url}/api/${options.id_app||id_app}/list/${model_name}?page=${options.page||1}&access_token=${access_token}`;

  if(options.condition){
    for(let key in options.condition){
      url = `${url}&${key}=${encodeURI(options.condition[key])}`;
    }
  }

  if(options.sort) url = `${url}&sort=${options.sort}`
  if(options.fields)url = `${url}&fields=${options.fields}`;
  if(options.limit)url = `${url}&limit=${options.limit}`;
  if(options.count)url = `${url}&count=1`;

  if(options.log){
    options.log("fetch: " + url);
  }
  let rs = await asyncGet(url,null,options);
  rs = JSON.parse(rs);
  return rs;
}

async function asyncGetVoucher(access_token,model_name,options={}){
  let url = `${server_url}/api/${options.id_app||id_app}/voucher/${model_name}?page=${options.page||1}&access_token=${access_token}`;
  if(options.condition){
    for(let key in options.condition){
      url = `${url}&${key}=${encodeURI(options.condition[key])}`;
    }
  }

  if(options.sort) url = `${url}&sort=${options.sort}`
  if(options.fields)url = `${url}&fields=${options.fields}`;
  if(options.limit)url = `${url}&limit=${options.limit}`;
  if(options.count)url = `${url}&count=1`;

  if(options.log){
    options.log("fetch: " + url);
  }
  let rs = await asyncGet(url,null,options);
  rs = JSON.parse(rs);
  return rs;
}

async function asyncUpdateVoucher(access_token,model_name,stt_rec,data,options={}){
  let url = `${server_url}/api/${options.id_app||id_app}/voucher/${model_name}/update/${stt_rec}?access_token=${access_token}`;
  if(data){
    for(let key in data){
      let value = data[key];
      if(value.getTime){
        value = Moment(value).format("YYYY-MM-DD");
      }
      url = `${url}&${key}=${value}`;
    }
  }
  let rs = await asyncGet(url,null,options);
  return rs;
}

async function asyncPostVoucher(access_token,model_name,data,options={}){
  let url = `${server_url}/api/${options.id_app||id_app}/voucher/${model_name}/save?access_token=${access_token}`;
  let rs = await asyncPost(url,null,data,options);
  return rs;
}


function deleteRequest(url,headers,callback){
  var request = new XMLHttpRequest();
  request.onreadystatechange = (e) => {
    if (request.readyState !== 4) {
      return;
    }
    if (request.status === 200) {
      callback(null,request.responseText);
    } else {
      console.log("error",request.responseText)
      callback(request.responseText||"Can't connect to server");
    }
  };
  request.open('DELETE', url);
  if(headers){
    headers.forEach(header=>{
      request.setRequestHeader(header.name, header.value);
    })
  }
  request.send();
}
async function asyncDelete(url,headers){
  let p = new Promise((resovle,reject)=>{
    deleteRequest(url,headers,(e,rs)=>{
      if(e) return reject(new Error(e));
      resovle(rs);
    })
  })
  return p;
}
function post(url,headers,data,callback){
  var request = new XMLHttpRequest();
  request.onreadystatechange = (e) => {
    if (request.readyState !== 4) {
      return;
    }
    if (request.status === 200) {
      callback(null,request.responseText);
    } else {
      //console.log("error",request.responseText)
      callback(request.responseText||"Can't connect to server");
    }
  };
  request.open("POST", url);
  request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  if(headers){
    headers.forEach(header=>{
      request.setRequestHeader(header.name, header.value);
    })
  }
  if (Platform.OS === 'android') {
    request.send(JSON.stringify(data));
  }else{
    request.setRequestHeader("Content-Encoding", "deflate");
    let zipped = pako.deflate(JSON.stringify(data));
    request.send(zipped);
  }
}
async function asyncPost(url,headers,data){
  return new Promise((resolve,reject)=>{
    post(url,headers,data,(e,rs)=>{
      if(e) return reject(new Error(e));
      resolve(rs);
    })
  })
}
function put(url,headers,data,callback){
  var request = new XMLHttpRequest();
  request.onreadystatechange = (e) => {
    if (request.readyState !== 4) {
      return;
    }
    if (request.status === 200) {
      callback(null,request.responseText);
    } else {
      console.log("error",request.responseText)
      callback(request.responseText||"Can't connect to server");
    }
  };
  request.open("PUT", url);
  request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  if(headers){
    headers.forEach(header=>{
      request.setRequestHeader(header.name, header.value);
    })
  }
  request.send(JSON.stringify(data));
}
async function asyncPut(url,headers,data){
  return new Promise((resolve,reject)=>{
    put(url,headers,data,(e,rs)=>{
      if(e) return reject(new Error(e));
      resolve(rs);
    })
  })
}
async function registerForPushNotificationsAsync(userInfo) {
  await removeEndpoint(userInfo);
  console.log("get permission show notify",userInfo)
  const access_token = userInfo.token;
  const { status: existingStatus } = await Permissions.getAsync(
    Permissions.NOTIFICATIONS
  );
  let finalStatus = existingStatus;
  // only ask if permissions have not already been determined, because
  // iOS won't necessarily prompt the user a second time.
  if (existingStatus !== 'granted') {
    // Android remote notification permissions are granted during the app
    // install, so this will only ask on iOS
    const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
    finalStatus = status;
  }
  // Stop here if the user did not grant permissions
  if (finalStatus !== 'granted') {
    //Alert.alert(getLabel("Chương trình này cần được cấp quyền hiển thị thông báo"))
    return false;
  }
  // Get the token that uniquely identifies this device
  let token = (await Notifications.getExpoPushTokenAsync()).data;
  // POST the token to your backend server from where you can retrieve it to send push notifications.
  if (Platform.OS === 'android') {
    /*console.log("register chat-messages channel for android")
    try{
      Notifications.createChannelAndroidAsync('chat-messages', {
        name: 'chat-messages',
        priority: 'max',
        sound: true,
        vibrate: [0, 250, 250, 250],
      });
      Notifications.createChannelAndroidAsync('default', {
        name: 'default',
        priority: 'max',
        sound: true,
        vibrate: [0, 250, 250, 250],
      });
    }catch(e){
      Alert.alert(e.message)
    }*/

    Notifications.setNotificationChannelAsync('chat-messages', {
      name: 'chat-messages',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });

    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }
  //Alert.alert("register notify token:" + token)
  try{
    let rs = await asyncGet(`${server_url}/api/${id_app}/report/register_endpoint/1?access_token=${access_token}&user=${userInfo.email}&endpoint=${token}`);
    await AsyncStorage.setItem("endpoint",token);
    console.log("register notify token successfull",token)
  }catch(e){
    console.log("can't register notify token",token)
    return false;
  }
  return true;
}

var labels={};
async function getLabelsList(){
}
async function createLabel(condition){
}
async function asyncLoadLang(){
  lang = await AsyncStorage.getItem("lang");
  if(!lang) lang =(Localization.locale.indexOf("vi")===0?'vi':'en');
}
async function asyncSetLang(_lang){
  lang =_lang;
  await AsyncStorage.setItem("lang",_lang);
}
function getLanguage(){
  return lang;
}
function getLabel(textid,defaultv='',defaulte=''){
  if(!textid) return null;
  textid= textid.toString();
  let _default,field;
  if(lang==='vi'){
    _default = defaultv||defaulte||textid;
    field = "textv";
  }else{
    _default = defaulte||defaultv||textid;
    field = "texte";
  }
  try{
    let _label;
    if(labels[textid.toUpperCase()]){
      _label = labels[textid.toUpperCase()][field];
    }
    if(!_label){
      _label = _default||textid;
      //create label default
      let condition={
        labelid:'REALAPP',
        textid:textid.toUpperCase()
      }
      condition.texte = defaulte||defaultv||textid;
      condition.textv = defaultv||defaulte||textid;
      createLabel(condition);
    }
    return _label;
  }catch(e){
    console.log(e.message)
    return _default||textid;
  }
}

function getUserInfoByToken(token,callback){
  let url = `${server_url}/api/${id_app}/userinfo?access_token=${token}`
  get(url,null,(error,rs)=>{
    if(error) return callback(error);
    let userInfo = JSON.parse(rs);
    if(userInfo.length>0){
      const _u = userInfo[0];
      _u.token = token;
      if(!_u.email && _u.id) _u.email = _u.id;
      if(!_u.name && _u.idname) _u.name = _u.idname;
      //get command
      url = `${server_url}/api/${id_app}/report/command_info/1?access_token=${token}&user=${_u.email}`;
      asyncGet(url).then(rs=>{
        _u.command = JSON.parse(rs);
        return callback(null,_u);
      },(e)=>{
        callback(e.message || "Không thể lấy thông tin phân quyền của người dùng này");
      })
    }else{
      callback("Không tồn tại người sử dụng này");
    }
  })
}
async function asyncGetUserInfoByToken(token){
  if(!token){
    token = await AsyncStorage.getItem('token');
  }
  let p = new Promise((resolve,reject)=>{
    getUserInfoByToken(token,(e,rs)=>{
      if(e) return reject(e);
      resolve(rs);
    })
  })
  return await p;
}
async function asyncGetProfile(token,userName){
  let url = `${server_url}/api/${id_app}/report/user_info/1?access_token=${token}&user=${userName}`
  let rs = JSON.parse(await asyncGet(url,null,{cache:true}));
  if(rs.length>0){
    return rs[0];
  }
  throw "Không tồn tại người dùng này"
}
async function asyncGetAppInfo(token,_id_app=id_app){
  let url = `${server_url}/api/${_id_app}/report/app_info/1?access_token=${token}`
  let rs = await asyncGet(url,null);
  rs = JSON.parse(rs);
  const appInfo ={};
  rs.forEach((r, i) => {
    appInfo[r.cty_address] = r.Value1;
  });
  return appInfo;
}
function loginAPI(username,password,callback){
  let url = server_url + "/api/" + id_app + "/token";
  let Authorization = "Basic " + (new Buffer(username + ":" + password).toString("base64"));
  get(url,[{name:'Authorization',value:Authorization}],(error,token)=>{
    if(error){
      try{
        error = JSON.parse(error);
        return callback(error.message);
      }catch(e){
        return callback(error);
      }
    }
    try{
      token = JSON.parse(token);
      token= token.token;
    }catch(e){
    }
    getUserInfoByToken(token,(error,userInfo)=>{
      if(error){
        return callback(error);
      }
      userInfo.token = token;
      callback(null,userInfo);
    })
  })
}

async function asyncLoginAPI(username,password){
  return new Promise((resolve,reject)=>{
    loginAPI(username,password,(e,rs)=>{
      if(e) return reject(new Error(e));
      resolve(rs);
    })
  })
}

async function removeEndpoint(userInfo,callback=()=>{}){
  let ep =  await AsyncStorage.getItem("endpoint");
  await AsyncStorage.setItem("endpoint","");
  if(ep){
    let url = server_url + "/api/" + id_app + "/report/remove_endpoint/1?access_token=" + userInfo.token + "&endpoint=" + ep;
    try{
      let rs = await asyncGet(url);
      callback(null,rs);
      return rs;
    }catch(e){
      callback(e.message);
    }
  }else{
    callback(null,ep);
  }
  return null;
}

function logoutAPI(userInfo,callback){
  removeEndpoint(userInfo,(error,rs)=>{
    if(error) return callback(error);
    console.log("remove endpoint",rs);
    let url =  server_url + "/api/" + id_app + "/logout?access_token=" + userInfo.token;
    get(url,null,(error,rs)=>{
      if(error) return callback(error);
      if(Platform.OS==="IOS"){
        Notifications.setBadgeNumberAsync(0);
      }
      callback(null,rs)
    })
  })
}
async function asyncLogoutAPI(userInfo){
  return new Promise((resolve,reject)=>{
    logoutAPI(userInfo,(e,rs)=>{
      if(e) return reject(new Error(e));
      resolve(rs);
    })
  })
}

function products(access_token,condition,page,fields,callback,_id_app=id_app){
  let url = `${server_url}/api/${_id_app}/list/dmvt?access_token=${access_token}&limit=20&page=${page||1}`;
  if(fields) url = url + '&fields=' + fields;
  if(condition){
    url = url + '&q=' + JSON.stringify(condition)
  }
  get(url,null,(e,rs)=>{
    if(e) return callback(e);
    let products = JSON.parse(rs);
    products.forEach(p=>{
      p.gia_ban_nt = p.gia_ban = p.gia_ban_le;
    })
    callback(null,products);
  })
}
async function asyncProducts(access_token,condition,page,fields){
  return new Promise((resolve,reject)=>{
    products(access_token,condition,page,fields,(e,rs)=>{
      if(e) return reject(new Error(e));
      resolve(rs);
    })
  })
}
async function asyncGetProductByCode(access_token,ma_vt,fields){
  let ps = await asyncProducts(access_token,{ma_vt:ma_vt},null,fields);
  if(ps.length>0){
    return ps[0]
  }else{
    throw new Error(`Product code ${ma_vt} is not exists`);
  }
}
/*order products: SO1*/
function orders(access_token,condition,page,callback,voucherCode='SO1',_id_app=id_app,limit=20){
  let url = `${server_url}/api/${_id_app}/voucher/${voucherCode.toLowerCase()}?access_token=${access_token}&limit=${limit}&page=${page||1}`;
  if(condition){
    url = url + '&q=' + JSON.stringify(condition)
  }
  get(url,null,(e,rs)=>{
    if(e) return callback(e);
    let orders = JSON.parse(rs);
    callback(null,orders);
  })
}
async function asyncOrders(access_token,condition,page,voucherCode='SO1',_id_app=id_app,limit=20){
  return new Promise((resolve,reject)=>{
    orders(access_token,condition,page,(e,rs)=>{
      if(e) return reject(new Error(e));
      resolve(rs);
    },voucherCode,_id_app,limit)
  })
}
function cacheImages(images) {
  return images.map(image => {
    if (typeof image === 'string') {
      return Image.prefetch(image);
    } else {
      return Asset.fromModule(image).downloadAsync();
    }
  });
}
async function cacheDatas(){
  return []
}
//
export {
  loginAPI,asyncLoginAPI,registerForPushNotificationsAsync,
  logoutAPI,asyncLogoutAPI,
  getUserInfoByToken,asyncGetUserInfoByToken,asyncGetProfile,asyncGetAppInfo,
  get,asyncGet,asyncGetGridInfo,asyncGetListInfo,asyncGetList,
  asyncGetVoucherInfo,asyncGetVoucher,asyncUpdateVoucher,asyncPostVoucher,
  asyncGetReportInfo,
  post,asyncPost,
  put,asyncPut,
  asyncDelete,
  products,asyncProducts,asyncGetProductByCode,
  orders,asyncOrders,
  cacheImages,cacheDatas,
  getLabel,getLabelsList,getLanguage,asyncSetLang,asyncLoadLang,cachedData
}
