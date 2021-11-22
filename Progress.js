import React from 'react';
import {Alert,Image,StyleSheet,View,ScrollView,Modal} from 'react-native';
import {Text,Form,Icon,Button,Label,Input,Item,Toast,Spinner } from 'native-base';
class Progress extends React.Component {
  constructor(props){
    super(props);
    this.state={
      visiable:false
    }
    this.open = this.open.bind(this);
    this.close = this.close.bind(this);
  }
  open(callback){
    if(this.state.visiable){
      if(callback) callback();
      return;
    }
    this.setState({visiable:true},callback);
  }
  close(callback){
    if(!this.state.visiable){
      if(callback) callback();
      return;
    }
    this.setState({visiable:false},callback);
  }
  render(){
    if(this.state.visiable){
      return (
        <View style={{flex:1,position:'absolute',padding:0,top:0,bottom:0,left:0,right:0}}>
          <View style={{opacity:0.0,flex:1,backgroundColor:'black'}}>
          </View>
          <View style={{position:'absolute',padding:20,top:0,bottom:0,left:0,right:0,flex:1,justifyContent:'center',alignItems:'center'}}>
              <View style={{padding:5, paddingLeft:30,paddingRight:30,borderRadius:10,backgroundColor:"#dddddd"}}><Spinner/></View>
          </View>
        </View>
      )
    }else{
      return null;
    }
  }
}
export default Progress
