import React from 'react';
import {server_url,baseUrl,id_app,mainColor} from './../Config.js';
import {Alert,Image,StyleSheet,View,ScrollView,Modal,ActivityIndicator} from 'react-native';
import {headerPageStyle,pageBackground,loading} from './../style.js';
import {getLabel,asyncGet,asyncGetGridInfo,asyncGetReportInfo,asyncGetList,asyncGetListInfo} from "./../API.js";
import {Left,Right,Body,Text,Form,Icon,Button,Thumbnail,Label,Input,Item,Toast,Spinner,H3 } from 'native-base';
import Picker from "../Components/Picker.js";
import List from "../Components/InputBase.js";
import DateTimePicker from "../Components/DateTimePicker.js";
import AutoCompleteInput from "../Components/AutoCompleteInput.js";
import Context from "../Context";
import Moment from 'moment';
import Numeral from 'numeral'
import {Dimensions} from 'react-native';
const { width: viewportWidth, height: viewportHeight } = Dimensions.get('window');
const tableWidth = viewportWidth<1000?0:viewportWidth;
class Dmkh extends React.Component {
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
      let listInfo = await asyncGetListInfo(this.context.userInfo.token,"Dmkh");
      this.setState({listInfo})
    }catch(e){
      Alert.alert(e.message || "Danh mục này không tồn tại");
    }
  }
  async componentWillUnmount(){
    this.mounted = false;
  }

  render() {
    if(!this.state.listInfo) return null;
    let otherColumns = this.state.listInfo.columns.filter(c=>c.id!="ma_kh" && c.id!="ten_kh" && c.id!="sel" && !c.hide);
    return (
      <List navigation = {this.props.navigation}
        title={getLabel("Danh mục khách hàng")}
        tableWidth={tableWidth}
        columns={[
          {id:'dien_giai',label:'Tên khách hàng',size:2,hideWhen:row=>!row.ma_kh && !row.ten_kh,
            format:(d)=>{
              return (
                <View style={{flexDirection:'column',width:'100%'}}>
                  <H3 style={{fontWeight:d.bold?'bold':'normal'}}>{d.ma_kh} - {d.ten_kh}</H3>
                </View>
              )
            }
          }
        ].concat(otherColumns)}
        getUrl={condition=>{
          let url = `${server_url}/api/${id_app}/list/${this.state.listInfo.listid}?ngon_ngu=Vi&user=${this.context.userInfo.email}`;
          if(condition){
            let where = `1=1`;
            if(condition.ma_kh){
              where =`${where} and ma_kh like '%${condition.ma_kh}%'`
            }
            if(condition.ten_kh){
              where =`${where} and ten_kh like N'%${condition.ten_kh}%'`
            }
            if(condition.dia_chi){
              where =`${where} and dia_chi like N'%${condition.dia_chi}%'`
            }
            if(condition.ma_so_thue){
              where =`${where} and ma_so_thue like N'%${condition.ma_so_thue}%'`
            }
            url = `${url}&where=${encodeURI(where)}`;
          }
          url =`${url}&limit=20`
          return url;
        }}
        condition ={{
          ma_kh:"",
          ten_kh:"",
          dia_chi:"",
          dien_thoai:"",
          ma_so_thue:""
        }}
        renderConditionForm={(condition,updateCondition)=>{
          return (
            <Form style={{backgroundColor:"white",borderRadius:10,width:"100%"}}>
              <Item stackedLabel>
                <Label>{getLabel("Mã khách hàng")}</Label>
                <Input editable={true}  autoCapitalize={'none'}  clearButtonMode ={'while-editing'} autoCorrect ={false} value={condition.ma_kh} onChangeText={(ma_kh)=>updateCondition(condition,{ma_kh})}/>
              </Item>
              <Item stackedLabel>
                <Label>{getLabel("Tên khách hàng")}</Label>
                <Input editable={true}  autoCapitalize={'none'}  clearButtonMode ={'while-editing'} autoCorrect ={false} value={condition.ten_kh} onChangeText={(ten_kh)=>updateCondition(condition,{ten_kh})}/>
              </Item>
              <Item stackedLabel>
                <Label>{getLabel("Địa chỉ")}</Label>
                <Input editable={true}  autoCapitalize={'none'}  clearButtonMode ={'while-editing'} autoCorrect ={false} value={condition.dia_chi} onChangeText={(dia_chi)=>updateCondition(condition,{dia_chi})}/>
              </Item>
              <Item stackedLabel>
                <Label>{getLabel("Mã số thuế")}</Label>
                <Input editable={true}  autoCapitalize={'none'}  clearButtonMode ={'while-editing'} autoCorrect ={false} value={condition.ma_so_thue} onChangeText={(ma_so_thue)=>updateCondition(condition,{ma_so_thue})}/>
              </Item>
            </Form>
          )
        }}
      />
    );
  }
}
Dmkh.contextType = Context;
export default Dmkh
