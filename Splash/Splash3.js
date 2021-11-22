import React from 'react';
import {server_url,funcs,id_app} from '../Config.js';
import {inputStyle,headerPageStyle,textCenter,cardHeader,pageBackground,linearBackgroundColor,mainColor,headerColor,cardSylte,mainButtonColor} from '../style.js';
import {TouchableOpacity,View,Image,ScrollView,ImageBackground,Alert,FlatList,Platform,Linking,AsyncStorage} from 'react-native';

import {asyncProducts,registerForPushNotificationsAsync,asyncGetOrderDetail,asyncGetPromotionDetail,asyncGet,asyncGetDataById,asyncGetDataByIdShared,getLabel,asyncSetLang,getLanguage,cachedData} from "../API.js";
import Header from "../Components/Header.js";
import Footer from "../Components/Footer.js";
import Content from "../Components/Content.js";
import Container from "../Components/Container.js";

import {Text,Icon,Thumbnail,Input,Badge,Toast,Button,H3,H1,H2} from 'native-base';


import {Dimensions} from 'react-native';
const { width: viewportWidth, height: viewportHeight } = Dimensions.get('window');

import Context  from '../Context';
class Splash3 extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      header: null
    };
  }
  constructor(props){
    super(props);
    let navigation = this.props.navigation;
    this.navigate = navigation.navigate;
    this.funcs = funcs;
    this.state={
    }
  }
  async componentDidMount() {
  }
  componentWillUnmount(){
  }
  async begin(){
    await AsyncStorage.setItem('opened',"1");
    if(this.context.userInfo){
      this.navigate("Home");
    }else{
      this.navigate("Auth");
    }
  }
  render() {
    return (
      <Content scrollable={false}>
        <View style={{flexGrow:1}}>
          <Image source={require("../assets/splash3.png")} style={{width:viewportWidth,height:viewportHeight/2}}/>
          <H1 style={{textAlign:"center",fontWeight:"bold",marginTop:10,color:mainColor}}>AegisCare</H1>
          <Text style={{textAlign:"center",fontWeight:"bold",marginTop:10,color:"#ACACAC"}}>{getLabel("Dịch vụ từ trái tim")}</Text>
          <Text style={{textAlign:"center",marginTop:30,paddingLeft:10,paddingRight:10}}>{getLabel("Đội ngũ nhân viên lý lịch rõ ràng được đào tạo chuyên môn bài bản")}</Text>
        </View>
        <View style={{flexDirection:"row",justifyContent:"center",padding:20}}>
          <Button style={{backgroundColor:mainButtonColor}} rounded onPress={()=>this.begin()}>
            <Text>{getLabel("Bắt đầu ngay").toUpperCase()}</Text>
          </Button>
        </View>
      </Content>
    );
  }
}
Splash3.contextType = Context
export default Splash3
