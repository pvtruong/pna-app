import React from 'react';
import { Alert,View,AsyncStorage,Image,StyleSheet,ScrollView,ActivityIndicator} from 'react-native';
import {Container,Text,Icon,Button,Form,Item,Label,Input,H1,H2,H3 } from 'native-base';
import {asyncLoginAPI,asyncGet,getLabel,getLanguage,asyncSetLang,cachedData} from "./../API.js";
import {facebook_app_id,google_app_id,server_url,id_app,group_id,app_name} from "./../Config";
import {textCenter,screenCenter,headerPageStyle,linearBackgroundColor,pageBackground,mainColor,mainTextColor} from "./../style.js";
import {NavigationActions} from 'react-navigation';
import * as GoogleSignIn from 'expo-google-sign-in';
import * as Facebook from 'expo-facebook';
import { LinearGradient } from 'expo-linear-gradient';
import KeyboardAvoidingContent from '../Components/KeyboardAvoidingContent';
import Content from '../Components/Content';
import * as Animatable from 'react-native-animatable';
import Context  from '../Context';

import Header from "../Components/Header.js";
import Footer from "../Components/Footer.js";
import LoginLocalWidget from "./LoginLocalWidget.js";

class Loginlocal extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      header: null
    }
  };
  constructor(props){
    super(props);
  }
  render() {
    return (
      <Container>
        <Content scrollable={false}>
          <View style={{flex:1,flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
            <LoginLocalWidget navigation={this.props.navigation}/>
          </View>
        </Content>
      </Container>
    );
  }
}
export default Loginlocal
