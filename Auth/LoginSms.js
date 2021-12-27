import React from 'react';
import {server_url,baseUrl,app_name,id_app} from './../Config.js';
import {Alert,View,ScrollView,ActivityIndicator,StyleSheet,Image} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {textCenter,loading,screenCenter,headerPageStyle,linearBackgroundColor,pageBackground,mainColor} from "./../style.js";
import {getLabel,asyncLoginSms,asyncVerifyOTP,asyncGetUserInfoByToken,cachedData,asyncGet,asyncPost} from "./../API.js";
import { Container,Left,Right,Body,Text,Title,Icon,Button,Thumbnail,Segment,Form,Label,Input,Item,Toast,H1,H3 } from 'native-base';
import { LinearGradient } from 'expo-linear-gradient';
import KeyboardAvoidingContent from '../Components/KeyboardAvoidingContent';
import GoogleReCaptchaModal from '../Components/GoogleReCaptchaModal';
import Content from '../Components/Content';
import Context  from '../Context';
import Header from "../Components/Header.js";
import Footer from "../Components/Footer.js";
import LoginSmsWidget from "./LoginSmsWidget";
import {NavigationActions} from 'react-navigation';
import * as Animatable from 'react-native-animatable';
class LoginSms extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      header:null
    };
  };
  constructor(props){
    super(props);
    this.navigate = this.props.navigation.navigate;
    this.state={

    }
  }
  componentDidMount(){
  }
  render() {
    return (
      <Container>
        {/*<Header  navigation={this.props.navigation} onLeftPress={()=>this.props.navigation.navigate('App',{},NavigationActions.navigate({ routeName: this.redirect_to,params:this.redirect_params}))} title ={getLabel("Đăng nhập")}  icon="ios-close" navigation = {this.props.navigation}/>*/}
        <Content scrollable={false}>
          <LoginSmsWidget navigation = {this.props.navigation}/>
        </Content>
        {/*<Footer  path="User" navigation={this.props.navigation}/>*/}
      </Container>
    );
  }
}
LoginSms.contextType = Context
export default LoginSms
