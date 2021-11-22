import React from 'react';
import {server_url,baseUrl} from './../Config.js';
import {inputStyle,headerPageStyle,pageBackground} from './../style.js';
import {TouchableOpacity,View,StyleSheet,Image} from 'react-native';
import SideBar from './../SideBar';
import {getCart,getLabel} from "./../API.js";
import NotificationWidget from "./NotificationWidget.js";

import Header from "../Components/Header.js";
import Footer from "../Components/Footer.js";
import Content from "../Components/Content.js";
import Context  from '../Context';
import Container  from '../Components/Container';

import {Text,Icon,Input,Button} from 'native-base';
class Notifications extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      header:null
    };
  }
  constructor(props){
    super(props);
    this.state = {
    }
  }
  componentDidMount() {
  }
  componentWillUnmount(){
  }
  render() {
    return (
      <Container hasBackgroundView={true}>
        <Header  navigation={this.props.navigation} color="white" onLeftPress={()=>this.props.navigation.goBack()} icon="ios-arrow-back" title ={getLabel("Thông báo")}/>
        <Content padder navigation={this.props.navigation} scrollable={false} requireLogin  style={pageBackground}>
          <NotificationWidget style={{backgroundColor:'white'}} ref={(ref)=>{this.notificationWidget = ref;}} navigation = {this.props.navigation}/>
        </Content>
        <Footer navigation={this.props.navigation} path="NOTIFICATIONS"/>
      </Container>
    );
  }
}
Notifications.contextType = Context;
export default Notifications;
