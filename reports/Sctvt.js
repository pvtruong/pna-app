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
const tableWidth = viewportWidth<720?0:viewportWidth;
class Sctvt extends React.Component {
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
      let rptInfo = await asyncGetReportInfo(this.context.userInfo.token,"sochitietvattu");
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
    let otherColumns = this.state.rptInfo.columns.filter(c=>c.id!="dien_giai" && c.id!="so_ct"  && c.id!="ngay_ct" && !c.hide);
    return (
      <Report navigation = {this.props.navigation}
        title={getLabel("Sổ chi tiết vật tư")}
        tableWidth={tableWidth}
        columns={[
          {id:'dien_giai',label:'Diễn giải',hideWhen:row=>!row.dien_giai && !row.so_ct,
            format:(d)=>{
              return (
                <View style={{flexDirection:'column'}}>
                  <H3 style={{fontWeight:d.bold?'bold':'normal'}}>{d.dien_giai.trim()}</H3>
                  {!!d.so_ct &&
                    <H3>Số chứng từ: {d.so_ct.trim()}, ngày: {Moment(d.ngay_ct).format("DD/MM/YYYY")}</H3>
                  }
                </View>
              )
            }
          }
        ].concat(otherColumns)}
        getUrl={condition=>{
          if(!(condition.vt||{}).ma_vt){
            return {error:getLabel("Bạn chưa chọn một vật tư")};
          }
          let tu_ngay= Moment(condition.tu_ngay).format("YYYY-MM-DD");
          let den_ngay = Moment(condition.den_ngay).format("YYYY-MM-DD");
          let url = `${server_url}/api/${id_app}/report/${this.state.rptInfo.code}/1?cLan=Vi&user=${this.context.userInfo.email}&cItem=${(condition.vt||{}).ma_vt||''}&cSite=${(condition.kho||{}).ma_kho||''}&dFrom=${tu_ngay}&dTo=${den_ngay}&cOrder=Ngay_ct,nxt`;
          return {url};
        }}
        condition ={this.props.navigation.getParam("condition") || {
          vt:{},
          kho:{},
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
                <Label>{getLabel("Vật tư")} (*)</Label>
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
                <Label>{getLabel("Kho")}</Label>
                <View style={{width:'100%',marginTop:15}}>
                  <AutoCompleteInput title="Danh mục kho" placeholder="Nhập mã hoặc tên kho" valueField="ma_kho" labelField="ten_kho"
                    value ={condition.kho}
                    getUrl={query=>{
                      let where = encodeURI(`trang_thai=1 and (ma_kho like '${query}%' or ten_kho like N'%${query}%')`)
                      let url =`${server_url}/api/${id_app}/list/dmkho?limit=20&where=${where}&access_token=${this.context.userInfo.token}`
                      return url;
                    }}
                    onValueChange={item=>updateCondition(condition,{kho:item})}
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
Sctvt.contextType = Context;
export default Sctvt
