import React from 'react';
import {server_url,id_app,baseUrl} from './../Config.js';
import {ScrollView,Image,StyleSheet,View} from 'react-native';
import {pageBackground,mainColor,linearBackgroundColor} from "./../style.js";
import { BlurView } from 'expo-blur';
import Context  from '../Context';
import RequireLoginWidget from "./RequireLoginWidget.js";
import { LinearGradient } from 'expo-linear-gradient';
import {Dimensions} from 'react-native';
const { width: viewportWidth, height: viewportHeight } = Dimensions.get('window');

const { width: screenWidth, height: screenHeight } = Dimensions.get('screen');
/*const backgroundViewHeight = viewportHeight * 1/3 + 25;
const style ={
  background:{
    position:"absolute",
    top:-backgroundViewHeight/4,
    left:-backgroundViewHeight/4,
    right:-backgroundViewHeight/4,
    height:backgroundViewHeight,
    borderRadius:0/2
  }
}*/

const backgroundViewHeight = viewportHeight * 1/4 ;
const style ={
  background:{
    position:"absolute",
    top:0,
    left:0,
    right:0,
    height:backgroundViewHeight
  }
}
class MyContainer extends React.Component {
  constructor(props){
    super(props);
  }
  renderContent(){
    return (
      <View style={{flex:1,flexDirection:"column",backgroundColor:pageBackground.backgroundColor}}>
        {this.props.hasBackgroundView &&
          <LinearGradient colors={linearBackgroundColor} style={style.background}>
          </LinearGradient>
        }
        <View style={{position:"absolute",top:0,bottom:0,left:0,right:0,flexDirection:"column"}}>
          {this.props.children}
        </View>

      </View>
    )
  }
  componentDidMount() {

  }
  componentWillUnmount(){

  }
  render() {
    return this.renderContent()
  }
}
MyContainer.contextType = Context;
export default  MyContainer;
