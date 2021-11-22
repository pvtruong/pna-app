import React from 'react';
import {server_url,currency,id_app,baseUrl} from './../Config.js';
import {Alert,View,TouchableOpacity,RefreshControl,ActivityIndicator,FlatList,Image,Linking} from 'react-native';
import {textCenter,headerPageStyle,moneyStyle,pageBackground,cardSylte,mainColor} from "./../style.js";
import {asyncGetList,cacheImages,getLabel,getLanguage,cachedData} from "./../API.js";
import Numeral from "numeral";
import Moment from "moment";
import PropTypes from 'prop-types';

//Numeral.locale('vi');
import { Container,Header,Footer,Content,Left,Right,Body
  ,Text,Title,Icon,Button
  ,Spinner,Thumbnail,ListItem,List
  ,CheckBox,Segment,Label,Input
  ,Item,Toast,Badge
  ,Form,FooterTab,H2,H3,Grid,Col,Row
} from 'native-base';
class Support extends React.Component {
  constructor(props){
    super(props);
    this.navigate = this.props.navigation.navigate;
    this.userInfo = cachedData.userInfo;
    this.token = this.userInfo.token;
    this.idLink = this.props.idLink;
    this.id_app = this.props.id_app || id_app;
    this.state={}
  }
  async componentDidMount() {
    this.mounted = true;
    this.willFocusSubscription = this.props.navigation.addListener(
      'willFocus',
      payload => {
        this.mounted = true;
      }
    );
    this.didBlurSubscription = this.props.navigation.addListener(
      'didBlur',
      payload => {
        this.mounted = false;
      }
    );

    await this.loadSupports();
  }
  componentWillUnmount(){
    this.mounted = false;
    this.willFocusSubscription.remove();
    this.didBlurSubscription.remove();
  }
  async loadSupports(){
    try{
      let Supports = await asyncGetList(this.userInfo.token,"support",{condition:{id_link:this.idLink},id_app:this.id_app});
      let _avatar =[];
      Supports.forEach(item=>{
        if(item.picture){
          if(item.picture.indexOf("http")===0){
            _avatar.push(`${item.picture}`);
          }else{
            _avatar.push(`${server_url}${item.picture}`);
          }

        }

      })
      Promise.all([...cacheImages(_avatar)]).then(rs=>{

      }).catch(e=>{
        console.log("Error cache images",_avatar);
      })

      if(this.mounted){
        this.setState({
          Supports:Supports
        })
      }

    }catch(e){
      Alert.alert(e.message);
    }
  }
  call(number){
    if(this.userInfo.email==='public'){
      Alert.alert(
        getLabel("Yêu cầu đăng nhập"),
        getLabel("Chức năng này yêu cầu phải đăng nhập hệ thống. Bạn có muốn đăng nhập không?"),
        [
          {text: getLabel('Đăng nhập'), onPress: () =>{
            cachedData.redirectTo=  (this.props.object||{}).appUrl;
            cachedData.redirectParams=  {obj:{id:(this.props.object||{}).id}};
            this.navigate("Loginlocal");
          }},
          {
            text: getLabel('Quay ra'),
            style: 'cancel',
          }
        ],
        {cancelable: false},
      );
      return;
    }
    if(!number) return;
    Linking.openURL(`tel:${number}`);
  }
  sms(user){
    if(this.userInfo.email==='public'){
      Alert.alert(
        getLabel("Yêu cầu đăng nhập"),
        getLabel("Chức năng này yêu cầu phải đăng nhập hệ thống. Bạn có muốn đăng nhập không?"),
        [
          {text: getLabel('Đăng nhập'), onPress: () => {
            cachedData.redirectTo=  (this.props.object||{}).appUrl;
            cachedData.redirectParams=  {obj:{id:(this.props.object||{}).id}};
            this.navigate("Loginlocal");
          }},
          {
            text: getLabel('Quay ra'),
            style: 'cancel',
          }
        ],
        {cancelable: false},
      );
      return;
    }

    this.navigate("Chat",{userInfo:this.userInfo,userChat:user,object:this.props.object});
  }
  renderItem(item){
    let avatar;
    if(item.picture){
      if(item.picture.indexOf("http")===0){
        avatar ={uri:`${item.picture}`}
      }else{
        avatar ={uri:`${server_url}${item.picture}`}
      }
    }else{
      avatar= require("../assets/avatar.png");
    }
    return (
      <View key={item._id} style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginTop:10,width:'100%'}}>
        <View style={{flexDirection:'row',alignItems:'center'}}>
          <Thumbnail source={avatar}/>
          <View  style={{marginLeft:10}}>
            <H3>{item.support_name}</H3>
            <Text>{getLanguage()==='vi'?item.ten_chuc_vu:(item.ten_chuc_vu_en||item.ten_chuc_vu)}</Text>
          </View>
        </View>
        <Text></Text>
        <View style={{position:'absolute',flexDirection:'row',right:0,top:2}}>
          <Button transparent small rounder onPress={()=>this.sms(item)}>
            <Icon type='FontAwesome' name="comment-o"/>
          </Button>
          <Button transparent small rounder onPress={()=>this.call(item.phone)}>
            <Icon name='ios-call'/>
          </Button>
        </View>
      </View>
    )
  }
  render() {
    if(!this.state.Supports || this.state.Supports.length===0) return null;
    return (
      <View style={[cardSylte,{padding:10},this.props.contentContainerStyle]}>
        {this.props.notShowTitle?
          null
          :
          <H3 style={{color:mainColor}}>{this.props.title||getLabel("Hỗ trợ dự án")}</H3>
        }
        {this.state.Supports.map(item=>this.renderItem(item))}
      </View>
    );
  }
}
Support.propTypes={
  idLink:PropTypes.string.isRequired
}
export default  Support;
