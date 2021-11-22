import React from 'react';
import {server_url,baseUrl,id_app,mainColor} from './../Config.js';
import {Alert,Image,StyleSheet,View,ScrollView,Modal,ActivityIndicator} from 'react-native';
import {headerPageStyle,pageBackground,loading} from './../style.js';
import {getLabel,asyncGet,asyncGetGridInfo,asyncGetReportInfo,asyncGetVoucher,asyncGetVoucherInfo,asyncUpdateVoucher} from "./../API.js";
import {Left,Right,Body,Text,Form,Icon,Button,Thumbnail,Label,Input,Item,Toast,Spinner,H3 } from 'native-base';
import Picker from "../Components/Picker.js";
import Voucher from "../Components/InputBase.js";
import DateTimePicker from "../Components/DateTimePicker.js";
import AutoCompleteInput from "../Components/AutoCompleteInput.js";
import Context from "../Context";
import Moment from 'moment';
import Numeral from 'numeral'
import {Dimensions} from 'react-native';
const { width: viewportWidth, height: viewportHeight } = Dimensions.get('window');
const tableWidth = viewportWidth<1000?0:viewportWidth;
class HD2 extends React.Component {
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
      let voucherInfo = await asyncGetVoucherInfo(this.context.userInfo.token,"HD2",this.context.userInfo.email);
      this.setState({voucherInfo})
    }catch(e){
      Alert.alert(e.message || "Chứng từ này không tồn tại");
    }
  }
  async componentWillUnmount(){
    this.mounted = false;
  }
  render() {
    if(!this.state.voucherInfo) return null;
    let otherColumns = this.state.voucherInfo.master.columns.filter(c=>c.id!="dien_giai" && c.id!="status" && c.id!="sel"  && c.id!="so_ct" && c.id!="ngay_ct" && !c.hide);
    return (
      <Voucher navigation = {this.props.navigation}
        title={getLabel("Hoá đơn bán hàng")}
        tableWidth={tableWidth}
        voucherInfo = {this.state.voucherInfo}
        columns={[
          {id:'dien_giai',label:'Diễn giải',size:3,hideWhen:row=>!row.dien_giai && !row.so_ct,
            format:(d)=>{
              return (
                <View style={{flexDirection:'column',width:'100%'}}>
                  <H3 style={{fontWeight:d.bold?'bold':'normal'}}>{d.dien_giai}</H3>
                  <Text>Số chứng từ: {d.so_ct}, ngày: {Moment(d.ngay_ct).format("DD/MM/YYYY")}</Text>
                  <View>
                      <Picker disableItems = {this.state.voucherInfo.statusDisable}  items={this.state.voucherInfo.statusList} valueField="Inds" labelField="Text" selectedValue={Number(d.status)}
                        onValueChange={async status=>{
                          if(status.toString()==d.status.toString()) return;
                          try{
                            this.context.setProcessing(true);
                            await asyncUpdateVoucher(this.context.userInfo.token,this.state.voucherInfo.voucherid,d.stt_rec,{status:status});
                            d.status = status.toString();
                          }catch(e){
                            let error = e.message;
                            if(error.includes("{") && error.includes("}")){
                              try{
                                error = JSON.parse(error);
                              }catch(e){
                                error ={message:error}
                              }
                            }else{
                              error ={message:error}
                            }
                            this.context.alert(error.message || "Không thể cập nhật chứng từ này");
                          }finally{
                            this.context.setProcessing(false);
                          }
                        }}
                      />
                  </View>
                </View>

              )
            }
          }
        ].concat(otherColumns)}
        details={this.state.voucherInfo.details}
        getUrl={condition=>{
          let url = `${server_url}/api/${id_app}/voucher/${this.state.voucherInfo.master.voucherid}?user=${this.context.userInfo.email}`;
          if(condition){
            let where = `1=1`;
            if(condition.tu_ngay){
              let tu_ngay= Moment(condition.tu_ngay).format("YYYY-MM-DD");
              where =`${where} and ngay_ct>='${tu_ngay}'`
            }
            if(condition.den_ngay){
              let den_ngay= Moment(condition.den_ngay).format("YYYY-MM-DD");
              where =`${where} and ngay_ct<='${den_ngay}'`
            }
            if(condition.stt_rec){
              where =`${where} and stt_rec='${condition.stt_rec}'`
            }
            url = `${url}&so_ct=${condition.so_ct||''}%&ma_kh=${(condition.kh||{}).ma_kh||''}%&where=${where}`;
          }
          url =`${url}&limit=20&sort=ngay_ct desc,so_ct desc`
          return url;
        }}
        condition ={this.props.navigation.getParam("condition") || {
          kh:{},
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
                <Label>{getLabel("Số chứng từ")}</Label>
                <Input editable={true}  autoCapitalize={'none'}  clearButtonMode ={'while-editing'} autoCorrect ={false} value={condition.so_ct} onChangeText={(so_ct)=>updateCondition(condition,{so_ct})}/>
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
            </Form>
          )
        }}
      />
    );
  }
}
HD2.contextType = Context;
export default HD2
