import React from 'react';
import {View,Modal} from 'react-native';
import {Text,Button,H3 } from 'native-base';
import {getLabel} from "./API.js"
class Alert extends React.Component {
  constructor(props){
    super(props);
    this.state={
      title:""
    }
  }
  open(title,callback){
    this.callback=callback;
    this.setState({title:title})
  }
  close(){
    this.setState({title:""},()=>{
      if(this.callback) this.callback();
    });
  }
  render(){
    if(!this.state.title) return null;
    return(
      <View style={{flex:1,position:'absolute',padding:0,top:0,bottom:0,left:0,right:0}}>
        <View style={{opacity:0.8,flex:1,backgroundColor:'black'}}>
        </View>
        <View style={{position:'absolute',padding:20,top:0,bottom:0,left:0,right:0,flex:1,justifyContent:'center',alignItems:'center'}}>
            <View style={{padding:30,backgroundColor:"white",borderColor:"transparent",borderRadius:10,borderWidth:1,flexDirection:"column",justifyContent:'center',alignItems:'center'}}>
              <H3>{this.state.title}</H3>
              <View style={{flexDirection:"row",justifyContent:'center',alignItems:'center'}}>
                <Button rounded light style={{marginTop:20}} onPress={()=>this.close()}><Text style={{paddingLeft:30,paddingRight:30}}>{getLabel("Đóng")}</Text></Button>
              </View>
            </View>
        </View>
      </View>
    )
  }
}
export default Alert
