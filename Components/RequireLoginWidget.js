import React from 'react';
import {server_url,baseUrl} from './../Config.js';
import {Alert,View,AsyncStorage,TouchableOpacity,Image,StyleSheet,ScrollView} from 'react-native';
import {textCenter,sidebarHeaderStyle,headerPageStyle,pageBackground,mainColor} from "./../style.js";
import {asyncloginAPI,getNumberUnReadNotifications,asyncGetRequireLoginInfoByToken,getLabel,cachedData} from "./../API.js";
import { Container,Left,Right,Body,Text,Title,Icon,Button,Thumbnail,Form,Label,Input,Item,Toast,List,ListItem ,Badge,H3} from 'native-base';
import Loginlocal from "../Auth/LoginLocalWidget";
export default class RequireLoginWidget extends React.Component {
  constructor(props){
    super(props);
    cachedData.redirectTo = this.props.redirectTo||'Home';
    cachedData.redirectParams = this.props.redirectParams;
  }
  render() {
    return (
      <View style={{flex:1,flexDirection:'row',justifyContent:'center',alignItems:'center',padding:20}}>
        <Loginlocal navigation = {this.props.navigation} redirectTo ={this.props.redirectTo||"self"} redirectParams ={this.props.redirectParams}/>
      </View>
    );
  }
}
