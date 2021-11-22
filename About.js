import React from 'react';
import {server_url,funcs,id_app} from './Config.js';
import {inputStyle,headerPageStyle,textCenter,cardHeader,pageBackground,linearBackgroundColor,mainColor,headerColor} from './style.js';
import {TouchableOpacity,View,ScrollView,Alert,FlatList,Platform,Linking,ActivityIndicator} from 'react-native';
import { Image } from 'react-native-elements';
import {asyncProducts,registerForPushNotificationsAsync,asyncGetOrderDetail,asyncGetPromotionDetail,asyncGet,asyncGetDataById,asyncGetDataByIdShared,getLabel,asyncSetLang,getLanguage,cachedData} from "./API.js";
import Header from "./Components/Header.js";
import Footer from "./Components/Footer.js";
import Content from "./Components/Content.js";
import Container from "./Components/Container.js";
import Constants from 'expo-constants';

import {Text,Title,Icon,Thumbnail,Drawer,Input,Badge,Toast,Button,Card,CardItem,H3,H1,H2} from 'native-base';

import Context  from './Context';

import SideBar from './SideBar';
class About extends React.Component {
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
    let appInfo = this.context.appInfo||{};
    return (
      <Container  hasBackgroundView={true}>
        <Header title={getLabel("Về chúng tôi")} color="white"  onLeftPress={()=>this.props.navigation.goBack()} icon="ios-arrow-back" navigation={this.props.navigation}/>
        <Content scrollable={false} padder>
          <View style={{flex:1,flexDirection:"column",justifyContent:"center",padding:10,backgroundColor:pageBackground.backgroundColor}}>
              <View style={{marginBottom:0,flexDirection:'column',alignItems:'center'}}><Image source={require("./assets/splash.png")} style={{width:200,height:200}}   placeholderStyle={{backgroundColor:"transparent"}} PlaceholderContent={<ActivityIndicator />}/></View>
              <H3 style={{textAlign:"center",color:mainColor,marginTop:10}}>{appInfo.name}</H3>
              <View style={{marginTop:10}}><Text style={{textAlign:"center"}}>{getLabel("Address")}: {appInfo.address}</Text></View>
              <Text note style={{marginTop:10,textAlign:"center"}}>Version {Constants.manifest.version}</Text>
          </View>
        </Content>
        <Footer navigation={this.props.navigation} path="Home"/>
      </Container>
    );
  }
}
About.contextType = Context
export default About
