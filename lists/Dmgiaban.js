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
class Dmgiaban extends React.Component {
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
      let listInfo = await asyncGetListInfo(this.context.userInfo.token,"dmgiaban");
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
        title={getLabel("Chính sách giá bán")}
        tableWidth={tableWidth}
        columns={[
          {id:'dien_giai',label:'Sản phẩm',size:2,hideWhen:row=>!row.ma_vt && !row.ten_vt,
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
            if(condition.tu_ngay){
              let tu_ngay= Moment(condition.tu_ngay).format("YYYY-MM-DD");
              where =`${where} and tu_ngay<='${tu_ngay}'`
            }
            if(condition.den_ngay){
              let den_ngay= Moment(condition.den_ngay).format("YYYY-MM-DD");
              where =`${where} and den_ngay>='${den_ngay}'`
            }
            url = `${url}&ma_vt=${(condition.vt||{}).ma_vt||''}%&where=${encodeURI(where)}`;
          }
          url =`${url}&limit=20&sort=tu_ngay desc`
          return url;
        }}
        condition ={{
          vt:{}
        }}
        renderConditionForm={(condition,updateCondition)=>{
          return (
            <Form style={{backgroundColor:"white",borderRadius:10,width:"100%"}}>
              <Item stackedLabel>
                <Label>{getLabel("Sản phẩm")}</Label>
                <View style={{width:'100%',marginTop:15}}>
                  <AutoCompleteInput title="Danh mục sản phẩm" placeholder="Nhập mã hoặc tên sản phẩm" valueField="ma_vt" labelField="ten_vt"
                    value ={condition.ma_vt}
                    getUrl={query=>{
                      let where = encodeURI(`trang_thai=1 and (ma_vt like '${query}%' or ten_vt like N'%${query}%')`)
                      let url =`${server_url}/api/${id_app}/list/dmvt?limit=20&fields=ma_vt,ten_vt&where=${where}&access_token=${this.context.userInfo.token}`
                      return url;
                    }}
                    onValueChange={item=>updateCondition(condition,{vt:item})}
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
Dmgiaban.contextType = Context;
export default Dmgiaban
