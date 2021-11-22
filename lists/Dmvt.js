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
class Dmvt extends React.Component {
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
      let listInfo = await asyncGetListInfo(this.context.userInfo.token,"dmvt");
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
    let otherColumns = this.state.listInfo.columns.filter(c=>c.id!="ma_vt" && c.id!="ten_vt" && c.id!="sel" && !c.hide);
    return (
      <List navigation = {this.props.navigation}
        title={getLabel("Danh mục vật tư")}
        tableWidth={tableWidth}
        columns={[
          {id:'dien_giai',label:'Tên vật tư',size:2,hideWhen:row=>!row.ma_vt && !row.ten_vt,
            format:(d)=>{
              return (
                <View style={{flexDirection:'column',width:'100%'}}>
                  <H3 style={{fontWeight:d.bold?'bold':'normal'}}>{d.ma_vt} - {d.ten_vt}</H3>
                </View>
              )
            }
          }
        ].concat(otherColumns)}
        getUrl={condition=>{
          let url = `${server_url}/api/${id_app}/list/${this.state.listInfo.listid}?ngon_ngu=Vi&user=${this.context.userInfo.email}`;
          if(condition){
            let where = `1=1`;
            if(condition.ma_vt){
              where =`${where} and ma_vt like '%${condition.ma_vt}%'`
            }
            if(condition.ten_vt){
              where =`${where} and ten_vt like N'%${condition.ten_vt}%'`
            }
            url = `${url}&where=${encodeURI(where)}`;
          }
          url =`${url}&limit=20`
          return url;
        }}
        condition ={{
          ma_vt:"",
          ten_vt:"",
          dia_chi:"",
          dien_thoai:"",
          ma_so_thue:""
        }}
        renderConditionForm={(condition,updateCondition)=>{
          return (
            <Form style={{backgroundColor:"white",borderRadius:10,width:"100%"}}>
              <Item stackedLabel>
                <Label>{getLabel("Mã vật tư")}</Label>
                <Input editable={true}  autoCapitalize={'none'}  clearButtonMode ={'while-editing'} autoCorrect ={false} value={condition.ma_vt} onChangeText={(ma_vt)=>updateCondition(condition,{ma_vt})}/>
              </Item>
              <Item stackedLabel>
                <Label>{getLabel("Tên vật tư")}</Label>
                <Input editable={true}  autoCapitalize={'none'}  clearButtonMode ={'while-editing'} autoCorrect ={false} value={condition.ten_vt} onChangeText={(ten_vt)=>updateCondition(condition,{ten_vt})}/>
              </Item>
            </Form>
          )
        }}
      />
    );
  }
}
Dmvt.contextType = Context;
export default Dmvt
