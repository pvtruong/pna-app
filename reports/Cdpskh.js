import React from 'react';
import {server_url,baseUrl,id_app,mainColor} from './../Config.js';
import {Alert,Image,StyleSheet,View,ScrollView,Modal,ActivityIndicator} from 'react-native';
import {headerPageStyle,pageBackground,loading} from './../style.js';
import {getLabel,asyncGet,asyncGetGridInfo,asyncGetReportInfo,asyncGetVoucher,asyncGetVoucherInfo} from "./../API.js";
import {Left,Right,Body,Text,Form,Icon,Button,Thumbnail,Label,Input,Item,Toast,Spinner,H3 } from 'native-base';
import Picker from "../Components/Picker.js";
import Report from "../Components/ReportBase.js";
import DateTimePicker from "../Components/DateTimePicker.js";
import AutoCompleteInput from "../Components/AutoCompleteInput.js";
import Context from "../Context";
import Moment from 'moment';
import Numeral from 'numeral'
import {Dimensions} from 'react-native';
const { width: viewportWidth, height: viewportHeight } = Dimensions.get('window');
const tableWidth = viewportWidth<1000?0:viewportWidth;
class Cdpskh extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      header:null
    }
  };
  constructor(props){
    super(props);
    this.state={}
  }
  async componentDidMount(){
    this.mounted = true;
    try{
      let rptInfo = await asyncGetReportInfo(this.context.userInfo.token,"rBaCdPsCnKh");
      if(this.mounted) this.setState({rptInfo})
    }catch(e){
      Alert.alert(e.message || "Báo cáo này không tồn tại");
    }
  }
  async componentWillUnmount(){
    this.mounted = false;
  }
  render() {
    if(!this.state.rptInfo) return null;
    let otherColumns = this.state.rptInfo.columns.filter(c=>c.id!="ma_kh" && c.id!="stt"  && c.id!="ten_kh" && !c.hide);
    return (
      <Report navigation = {this.props.navigation}
        title={getLabel("Cân đối phát sinh công nợ")}
        tableWidth={tableWidth}
        onPress={(row,_condition)=>{
          if(!row.ma_kh) return;
          let condition =Object.assign({},_condition);
          condition.kh = {ma_kh:row.ma_kh,ten_kh:row.ten_kh}
          this.props.navigation.navigate("Sctcnkh",{condition:condition,drilldown:true})
        }}
        columns={[
          {id:'dien_giai',label:'Khách hàng',size:2,hideWhen:row=>!row.ma_kh && !row.ten_kh,
            format:(d)=>{
              return (
                <H3 style={{fontWeight:d.bold?'bold':'normal'}}>{`${d.ten_kh.trim()}${!!d.ma_kh? " (" + d.ma_kh + ")":''}`}</H3>
              )
            }
          }
        ].concat(otherColumns)}
        getUrl={condition=>{
          if(!condition.tk){
            return {error:"Bạn chưa nhập tài khoản"}
          }
          let tu_ngay= Moment(condition.tu_ngay).format("YYYY-MM-DD");
          let den_ngay = Moment(condition.den_ngay).format("YYYY-MM-DD");
          let url = `${server_url}/api/${id_app}/report/${this.state.rptInfo.code}/1?ngon_ngu=Vi&user=${this.context.userInfo.email}&ma_kh=${(condition.kh||{}).ma_kh||''}&nh_kh1=${(condition.nkh1||{}).ma_nhom||''}&nh_kh2=${(condition.nkh2||{}).ma_nhom||''}&nh_kh3=${(condition.nkh3||{}).ma_nhom||''}&tk=${condition.tk}&tu_ngay=${tu_ngay}&den_ngay=${den_ngay}`;
          return {url};
        }}
        condition ={this.props.navigation.getParam("condition") || {
          tk:'131',
          kh:{},nkh1:{},nkh2:{},nkh3:{},
          tu_ngay:Moment().startOf("month").toDate(),
          den_ngay:Moment().endOf("month").toDate()
        }}
        renderConditionForm={(condition,updateCondition)=>{
          return (
            <Form style={{backgroundColor:"white",borderRadius:10,width:"100%"}}>
              <Item stackedLabel>
                <Label>{getLabel("Từ ngày")} (*)</Label>
                <View style={{width:'100%',marginTop:15}}>
                  <DateTimePicker  value={condition.tu_ngay} onValueChange={tu_ngay=>updateCondition(condition,{tu_ngay})} mode='date' icon="pencil-square-o" typeIcon ="FontAwesome"/>
                </View>
              </Item>
              <Item stackedLabel>
                <Label>{getLabel("Đến ngày")} (*)</Label>
                <View style={{width:'100%',marginTop:15}}>
                  <DateTimePicker  value={condition.den_ngay} onValueChange={den_ngay=>updateCondition(condition,{den_ngay})} mode='date' icon="pencil-square-o" typeIcon ="FontAwesome"/>
                </View>
              </Item>
              <Item stackedLabel>
                <Label>{getLabel("Tài khoản")} (*)</Label>
                <Input editable={true}  autoCapitalize={'none'}  clearButtonMode ={'while-editing'} autoCorrect ={false} value={condition.tk} onChangeText={(tk)=>updateCondition(condition,{tk})}/>
              </Item>
              <Item stackedLabel>
                <Label>{getLabel("Khách hàng")}</Label>
                <View style={{width:'100%',marginTop:15}}>
                  <AutoCompleteInput title="Danh mục khách hàng" placeholder="Nhập mã hoặc tên khách hàng" valueField="ma_kh" labelField="ten_kh"
                    value ={condition.kh}
                    getUrl={query=>{
                      let where = encodeURI(`trang_thai=1 and (ma_kh like '${query}%' or ten_kh like N'%${query}%' or ma_so_thue like N'%${query}%')`)
                      let url =`${server_url}/api/${id_app}/list/dmkh?limit=20&fields=ma_kh,ten_kh&where=${where}&access_token=${this.context.userInfo.token}`
                      return url;
                    }}
                    onValueChange={item=>updateCondition(condition,{kh:item})}
                    icon="list" typeIcon ="FontAwesome"/>
                </View>
              </Item>

              <Item stackedLabel>
                <Label>{getLabel("Nhóm khách hàng 1")}</Label>
                <View style={{width:'100%',marginTop:15}}>
                  <AutoCompleteInput title="Danh mục nhóm khách hàng 1" placeholder="Nhập mã hoặc tên nhóm" valueField="ma_nhom" labelField="ten_nhom"
                    value ={condition.nkh1}
                    getUrl={query=>{
                      let where = encodeURI(`trang_thai=1 and loai_nhom=1 and (ma_nhom like '${query}%' or ten_nhom like N'%${query}%')`)
                      let url =`${server_url}/api/${id_app}/list/dmnhkh?limit=20&fields=ma_nhom,ten_nhom&where=${where}&access_token=${this.context.userInfo.token}`
                      return url;
                    }}
                    onValueChange={item=>updateCondition(condition,{nkh1:item})}
                    icon="list" typeIcon ="FontAwesome"/>
                </View>
              </Item>
              <Item stackedLabel>
                <Label>{getLabel("Nhóm khách hàng 2")}</Label>
                <View style={{width:'100%',marginTop:15}}>
                  <AutoCompleteInput title="Danh mục nhóm khách hàng 2" placeholder="Nhập mã hoặc tên nhóm" valueField="ma_nhom" labelField="ten_nhom"
                    value ={condition.nkh2}
                    getUrl={query=>{
                      let where = encodeURI(`trang_thai=1 and loai_nhom=2 and (ma_nhom like '${query}%' or ten_nhom like N'%${query}%')`)
                      let url =`${server_url}/api/${id_app}/list/dmnhkh?limit=20&fields=ma_nhom,ten_nhom&where=${where}&access_token=${this.context.userInfo.token}`
                      return url;
                    }}
                    onValueChange={item=>updateCondition(condition,{nkh2:item})}
                    icon="list" typeIcon ="FontAwesome"/>
                </View>
              </Item>
              <Item stackedLabel>
                <Label>{getLabel("Nhóm khách hàng 3")}</Label>
                <View style={{width:'100%',marginTop:15}}>
                  <AutoCompleteInput title="Danh mục nhóm khách hàng 3" placeholder="Nhập mã hoặc tên nhóm" valueField="ma_nhom" labelField="ten_nhom"
                    value ={condition.nkh3}
                    getUrl={query=>{
                      let where = encodeURI(`trang_thai=1 and loai_nhom=3 and (ma_nhom like '${query}%' or ten_nhom like N'%${query}%')`)
                      let url =`${server_url}/api/${id_app}/list/dmnhkh?limit=20&fields=ma_nhom,ten_nhom&where=${where}&access_token=${this.context.userInfo.token}`
                      return url;
                    }}
                    onValueChange={item=>updateCondition(condition,{nkh3:item})}
                    icon="list" typeIcon ="FontAwesome"/>
                </View>
              </Item>
            </Form>
          )
        }}
      />
    );
  }
}
Cdpskh.contextType = Context;
export default Cdpskh
