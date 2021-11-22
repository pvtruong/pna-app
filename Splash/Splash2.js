import React from 'react';
import {server_url,funcs,id_app} from '../Config.js';
import {inputStyle,headerPageStyle,textCenter,cardHeader,pageBackground,linearBackgroundColor,mainColor,headerColor,cardSylte} from '../style.js';
import {TouchableOpacity,View,Image,ScrollView,ImageBackground,Alert,FlatList,Platform,Linking} from 'react-native';

import {asyncProducts,registerForPushNotificationsAsync,asyncGetOrderDetail,asyncGetPromotionDetail,asyncGet,asyncGetDataById,asyncGetDataByIdShared,getLabel,asyncSetLang,getLanguage,cachedData} from "../API.js";
import Header from "../Components/Header.js";
import Footer from "../Components/Footer.js";
import Content from "../Components/Content.js";
import Container from "../Components/Container.js";

import {Text,Icon,Thumbnail,Input,Badge,Toast,Button,H3,H1,H2} from 'native-base';


import {Dimensions} from 'react-native';
const { width: viewportWidth, height: viewportHeight } = Dimensions.get('window');

import Context  from '../Context';
class Splash2 extends React.Component {
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
  render() {
    return (
      <Content scrollable={false}>
        <View style={{flexGrow:1}}>
          <Image source={require("../assets/splash2.png")} style={{width:viewportWidth,height:viewportHeight/2}}/>
          <H1 style={{textAlign:"center",fontWeight:"bold",marginTop:10,color:mainColor}}>AegisCare</H1>
          <Text style={{textAlign:"center",fontWeight:"bold",marginTop:10,color:"#ACACAC"}}>{getLabel("Dịch vụ từ trái tim")}</Text>
          <Text style={{textAlign:"center",marginTop:30,paddingLeft:10,paddingRight:10}}>{getLabel("Ứng dụng đặt dịch vụ cực nhanh và tiện lợi")}</Text>
        </View>
        <View style={{flexDirection:"row",justifyContent:"space-between"}}>
          <Button transparent >
            <Text style={{color:"white"}}>{getLabel("Tiếp theo")}</Text>
          </Button>
          <View style={{flexGrow:1,flexDirection:"row",justifyContent:"center",alignItems:"center"}}>
            <View style={{width:5,height:5,backgroundColor:"silver",borderRadius:5/2}}></View>
            <View style={{width:5,height:5,marginLeft:5,backgroundColor:"black",borderRadius:5/2}}></View>
            <View style={{width:5,height:5,marginLeft:5,backgroundColor:"silver",borderRadius:5/2}}></View>
          </View>
          <Button transparent onPress={()=>this.navigate("Splash3")}>
            <Text>{getLabel("Tiếp theo")}</Text>
          </Button>
        </View>
      </Content>
    );
  }
}
Splash2.contextType = Context
export default Splash2
