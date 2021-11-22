import React from 'react';
import {Platform} from 'react-native';
import Constants from 'expo-constants';

const server_url = "http://118.69.63.90:1986";//http://serverhcm.ddns.net:1986";//"http://118.69.63.90:1986";//
const server_url_report = server_url;
const appInfo = {
  "_id": "pna",
  "address": "205/5 Đoàn Văn Bơ, Phường 13, Quận 4, TP.HCM",
  "name":"CÔNG TY CỔ PHẦN PHÚC NGỌC ANH"
}
const id_app =appInfo._id;
const app_name ="PNA"
import {Icon} from 'native-base';

const group_id="";
const group_id_partner=""; //caregiver, partner
const public_token=""; //username:public

const facebook_app_id="<not use>";
const google_app_id="<not use>";

const currency="đ";
const baseUrl = (Platform.OS=='ios'?undefined:'');

const GOOGLE_MAPS_APIKEY = "AIzaSyCU1C8qA_ufYUH-j6OqDv8M35tDEmZM1_8";

const GOOGLE_RECAPTCHA_SITE_KEY =  '6LfC5rAUAAAAAASnfRem8Q0Ame4KccFp0b9Twa8N';

const SLUG_APP_FOR_CUSTOMER = "PNACUST";
const SLUG_APP_FOR_PARTNER = "PNA";


const DEFAULT_LOCATION={
  longitude:105.85101320000001,
  latitude:21.027964
}
const DELTA={
  latitudeDelta: 0.005,
  longitudeDelta: 0.001
}
const funcs =[
  {
    title:'Home',
    path:'Home',
    home:false,
    visible:true
  },
  //vouchers
  {
    title:'Đơn hàng',
    path:'SO1',
    code:'SO1',
    home:true,
    group:"Chứng từ",
    visible:true
  },
  {
    title:'Hoá đơn bán hàng',
    path:'HD2',
    code:'HD2',
    home:true,
    group:"Chứng từ",
    visible:true
  },
  {
    title:'Phiếu nhập mua hàng',
    path:'PN1',
    code:'PN1',
    home:true,
    group:"Chứng từ",
    visible:true
  },
  {
    title:'Phiếu chi',
    path:'PC1',
    code:'PC1',
    home:true,
    group:"Chứng từ",
    visible:true
  },
  {
    title:'Báo nợ',
    path:'BN1',
    code:'BN1',
    home:true,
    group:"Chứng từ",
    visible:true
  },
  {
    title:'Phiếu thu',
    path:'PT1',
    code:'PT1',
    home:true,
    group:"Chứng từ",
    visible:true
  },
  {
    title:'Báo có',
    path:'BC1',
    code:'BC1',
    home:true,
    group:"Chứng từ",
    visible:true
  },
  //reports
  {
    title:'Sổ chi tiết công nợ',
    path:'Sctcnkh',
    code:'rSoCtCnKh',
    home:true,
    group:"Báo cáo",
    visible:true
  },
  {
    title:'Cân đối công nợ',
    path:'Cdpskh',
    code:'rBaCdPsCnKh',
    home:true,
    group:"Báo cáo",
    visible:true
  },
  {
    title:'Tổng hợp NXT',
    path:'Thnxt',
    code:'rstocksummary',
    home:true,
    group:"Báo cáo",
    visible:true
  },
  {
    title:'Sổ chi tiết vật tư',
    path:'Sctvt',
    code:'sochitietvattu',
    home:true,
    group:"Báo cáo",
    visible:true
  },
  {
    title:'Bảng giá sản phẩm',
    path:'Dmgiaban',
    code:'dmgiaban',
    home:true,
    group:"Báo cáo",
    visible:true
  },
  {
    title:'Doanh số bán hàng',
    path:'Doanhsobanhang',

    home:true,
    group:"Báo cáo",
    visible:false
  },
  {
    title:'Sổ quỹ tiền mặt',
    path:'Soquy',
    code:'rsoquyth',
    home:true,
    group:"Báo cáo",
    visible:true
  },
  {
    title:'Sổ tiền gửi ngân hàng',
    path:'Sotiengui',
    code:'rsotiengui',
    home:true,
    group:"Báo cáo",
    visible:true
  },
  //list
  {
    title:'Danh mục sản phẩm',
    path:'Dmvt',
    code:'dmvt',
    home:true,
    group:"Danh mục",
    visible:true
  },
  {
    title:'Danh mục khách hàng',
    path:'Dmkh',
    code:'dmkh',
    home:true,
    group:"Danh mục",
    visible:true
  },
  //others
  {
    title:'Về PNA',
    path:'About',

    home:false,
    visible:false
  },
  {
    title:'Đăng xuất',
    onPress:(nva,userInfo,context)=>{
      if(context) context.logout();
    },
    home:false,
    visible:true
  },
]
const ds_gia_ban=[

]

const ds_gia_thue=[

]

const ds_dien_tich=[

]
const ds_phong_ngu=[

]

const ds_khoang_thoi_gian=[

]
const stepStyles = {
  stepIndicatorSize: 25,
  currentStepIndicatorSize:30,
  separatorStrokeWidth: 2,
  currentStepStrokeWidth: 3,
  stepStrokeCurrentColor: '#fe7013',
  stepStrokeWidth: 3,
  stepStrokeFinishedColor: '#fe7013',
  stepStrokeUnFinishedColor: '#aaaaaa',
  separatorFinishedColor: '#fe7013',
  separatorUnFinishedColor: '#aaaaaa',
  stepIndicatorFinishedColor: '#fe7013',
  stepIndicatorUnFinishedColor: '#ffffff',
  stepIndicatorCurrentColor: '#ffffff',
  stepIndicatorLabelFontSize: 13,
  currentStepIndicatorLabelFontSize: 13,
  stepIndicatorLabelCurrentColor: '#fe7013',
  stepIndicatorLabelFinishedColor: '#ffffff',
  stepIndicatorLabelUnFinishedColor: '#aaaaaa',
  labelColor: '#999999',
  labelSize: 9,
  currentStepLabelColor: '#fe7013'
}
const orderSteps=["Chọn gói","Hồ sơ","Lịch","Thanh toán"];
const TASK_CONFIG={
  progress:{
    start:1,
    finish:2,
    cancel:4
  },
  reviews:["Kinh khủng", "tệ", "tạm được", "được", "tốt", "Rất tốt", "Tuyệt vời","Trên cả tuyệt vời", "Không thể tin được"]
}
export {
  TASK_CONFIG,SLUG_APP_FOR_PARTNER,SLUG_APP_FOR_CUSTOMER,orderSteps,stepStyles,app_name,server_url,server_url_report,appInfo,id_app,group_id,group_id_partner,facebook_app_id,currency,baseUrl,GOOGLE_MAPS_APIKEY,GOOGLE_RECAPTCHA_SITE_KEY,DEFAULT_LOCATION,DELTA,funcs,public_token,google_app_id,ds_gia_ban,ds_gia_thue,ds_dien_tich,ds_phong_ngu,ds_khoang_thoi_gian
}
