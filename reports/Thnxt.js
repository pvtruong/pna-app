import React from 'react';
import {server_url,baseUrl,id_app,mainColor} from './../Config.js';
import {Alert,Image,StyleSheet,View,ScrollView,Modal,ActivityIndicator} from 'react-native';
import {headerPageStyle,pageBackground,loading} from './../style.js';
import {getLabel,asyncGet,asyncGetReportInfo} from "./../API.js";
import {Left,Right,Body,Text,Form,Icon,Button,Thumbnail,Label,Input,Item,Toast,Spinner,H3 } from 'native-base';
import Picker from "../Components/Picker.js";
import Report from "../Components/ReportBase.js";
import DateTimePicker from "../Components/DateTimePicker.js";
import AutoCompleteInput from "../Components/AutoCompleteInput.js";
import Context from "../Context";
import Moment from 'moment';
import Numeral from 'numeral'
import { CheckBox } from 'react-native-elements'

import {Dimensions} from 'react-native';
const { width: viewportWidth, height: viewportHeight } = Dimensions.get('window');
const tableWidth = viewportWidth<1000?0:viewportWidth;

class Thnxt extends React.Component {
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
      let rptInfo = await asyncGetReportInfo(this.context.userInfo.token,"rstocksummary");
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
    let otherColumns = this.state.rptInfo.columns.filter(c=>c.id!="ma_vt" && c.id!="stt"  && c.id!="ten_vt" && !c.hide);

    return (
      <Report navigation = {this.props.navigation}
        title={getLabel("Tổng hợp nhập xuất tồn")}
        tableWidth={tableWidth}
        onPress={(row,_condition)=>{
          if(!row.ma_vt) return;
          let condition =Object.assign({},_condition);
          condition.vt = {ma_vt:row.ma_vt,ten_vt:row.ten_vt}
          this.props.navigation.navigate("Sctvt",{condition:condition,drilldown:true})
        }}
        columns={[
          {id:'dien_giai',label:'Vật tư',hideWhen:row=>!row.ma_vt && !row.ten_vt,
            format:(d)=>{
              return (
                <View style={{flexDirection:'column'}}>
                  <H3 style={{fontWeight:d.bold?'bold':'normal'}}>{`${d.ten_vt.trim()}${!!d.ma_vt? ' (' + d.ma_vt + ')':''}`}</H3>
                </View>
              )
            },

          }
        ].concat(otherColumns)}
        getUrl={condition=>{
          let tu_ngay= Moment(condition.tu_ngay).format("YYYY-MM-DD");
          let den_ngay = Moment(condition.den_ngay).format("YYYY-MM-DD");
          let url = `${server_url}/api/${id_app}/report/${this.state.rptInfo.code}/1?ngon_ngu=Vi&user=${this.context.userInfo.email}&ma_vt=${(condition.vt||{}).ma_vt||''}&ma_nhom_vt=${(condition.nvt||{}).ma_nhom||''}&ma_kho=${(condition.kho||{}).ma_kho||''}&tu_ngay=${tu_ngay}&den_ngay=${den_ngay}&inctdc=${condition.inctdc||0}&cOrder=ma_vt&nhom_theo=${(condition.kieuNhom||{}).codeid||''}`;
          return {url};
        }}
        condition ={this.props.navigation.getParam("condition") || {
          vt:{},
          kho:{},
          nvt:{},
          kieuNhom:{},
          inctdc:false,
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
                <Label>{getLabel("Kho")}</Label>
                <View style={{width:'100%',marginTop:15}}>
                  <AutoCompleteInput title="Danh mục kho" placeholder="Nhập mã hoặc tên kho" valueField="ma_kho" labelField="ten_kho"
                    value ={condition.kho}
                    getUrl={query=>{
                      let where = encodeURI(`trang_thai=1 and (ma_kho like '${query}%' or ten_kho like N'%${query}%')`)
                      let url =`${server_url}/api/${id_app}/list/dmkho?fields=ma_kho,ten_kho&where=${where}&access_token=${this.context.userInfo.token}`
                      return url;
                    }}
                    onValueChange={item=>updateCondition(condition,{kho:item})}
                    icon="list" typeIcon ="FontAwesome"/>
                </View>
              </Item>
              <Item stackedLabel>
                <Label>{getLabel("Vật tư")}</Label>
                <View style={{width:'100%',marginTop:15}}>
                  <AutoCompleteInput title="Danh mục vật tư" placeholder="Nhập mã hoặc tên vật tư" valueField="ma_vt" labelField="ten_vt"
                    value ={condition.vt}
                    getUrl={query=>{
                      let where = encodeURI(`trang_thai=1 and (ma_vt like '${query}%' or ten_vt like N'%${query}%')`)
                      let url =`${server_url}/api/${id_app}/list/dmvt?limit=20&fields=ma_vt,ten_vt&where=${where}&access_token=${this.context.userInfo.token}`
                      return url;
                    }}
                    onValueChange={item=>updateCondition(condition,{vt:item})}
                    icon="list" typeIcon ="FontAwesome"/>
                </View>
              </Item>

              <Item stackedLabel>
                <Label>{getLabel("Nhóm vật tư")}</Label>
                <View style={{width:'100%',marginTop:15}}>
                  <AutoCompleteInput title="Danh mục nhóm vật tư" placeholder="Nhập mã hoặc tên nhóm vật tư" valueField="ma_nhom" labelField="ten_nhom"
                    value ={condition.nvt}
                    getUrl={query=>{
                      let where = encodeURI(`trang_thai=1 and (ma_nhom like '${query}%' or ten_nhom like N'%${query}%')`)
                      let url =`${server_url}/api/${id_app}/list/dmnhvt?limit=20&fields=ma_nhom,ten_nhom&where=${where}&access_token=${this.context.userInfo.token}`
                      return url;
                    }}
                    onValueChange={item=>updateCondition(condition,{nvt:item})}
                    icon="list" typeIcon ="FontAwesome"/>
                </View>
              </Item>

              <Item stackedLabel>
                <View style={{flexDirection:'row',width:'100%',alignItems:'center'}}>
                  <CheckBox checked={condition.inctdc} onPress={()=>updateCondition(condition,{inctdc:!condition.inctdc})}/>
                  <Text>{getLabel("In chứng từ điều chuyển")}</Text>
                </View>
              </Item>

              <Item stackedLabel>
                <Label>{getLabel("Nhóm dữ liệu theo")}</Label>
                <View style={{width:'100%',marginTop:15}}>
                  <AutoCompleteInput title="Nhóm dữ liệu theo" placeholder="Nhập mã hoặc tên kiểu nhóm" valueField="codeid" labelField="txt"
                    value ={condition.kieuNhom}
                    getUrl={query=>{
                      let where = encodeURI(`type =2 and rptid ='rstocksummary' and (codeid like '${query}%' or headerV like N'%${query}%')`)
                      let url =`${server_url}/api/${id_app}/optgroupby?where=${where}&access_token=${this.context.userInfo.token}`
                      return url;
                    }}
                    onValueChange={item=>updateCondition(condition,{kieuNhom:item})}
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
Thnxt.contextType = Context;
export default Thnxt
