import React from 'react';
import {server_url,id_app,baseUrl} from './../Config.js';
import {getLabel,asyncOrders} from "./../API.js";
import {View,Modal,TouchableOpacity,Platform,Alert} from 'react-native';
import {loading,mainButtonColor,mainColor,mainTextColor,pageBackground} from "./../style.js";
import { Button,H1,Text} from 'native-base';
import * as SMS from 'expo-sms';
import PropTypes from 'prop-types';
class ModelSms extends React.PureComponent{
  constructor(props){
    super(props);
    this.state ={
      modalVisible:false,
      templates:[]
    }
  }
  async componentDidMount(){
    this.mounted = true;
    const condition={voucher_code:'SMS',status:true}
    const templates = await asyncOrders(this.context.userInfo.token,condition,1,"templatevoucher",id_app,10);
    if(this.mounted) this.setState({templates})
  }
  componentWillUnmount(){
    this.mounted = false;
  }
  close(){
    if(this.mounted) this.setState({
      modalVisible:false
    })
  }
  open(phone){
    if(!phone) return;
    this.phone =phone;
    if(this.mounted) this.setState({modalVisible:true});
  }
  async send(msg){
    const isAvailable = await SMS.isAvailableAsync();
    if (isAvailable) {
      const { result } = await SMS.sendSMSAsync([this.phone],msg||"");
      console.log("send sms result",result)
      if(result!=="cancelled"){
        this.close();
      }
    }else {
      console.log("sms not available");
      this.close();
    }
  }
  render(){
    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={this.state.modalVisible}
        onRequestClose={() => this.close()}>
        <View style={{flex:1}}>
          <View style={{opacity:0.8,flex:1,backgroundColor:'black'}}>
          </View>
          <View style={{position:'absolute',top:0,bottom:0,left:0,right:0,flexDirection:"row",justifyContent:'center',alignItems:'center'}}>
            <View style={{backgroundColor:"white",borderRadius:5,width:"80%"}}>
              <Text note style={{marginTop:10,textAlign:"center"}}>{getLabel("Chọn một tin nhắn mẫu")}</Text>
              {this.state.templates.map(m=>m.title).map((m,index)=>{
                return (
                  <TouchableOpacity key={index.toString()} style={{flexDirection:"row",alignItems:"center",borderBottomWidth:1,borderBottomColor:"#DDDDDD",paddingTop:15,paddingBottom:15}} onPress={()=>this.send(m)}>
                    <Text style={{color:"black"}}>{m}</Text>
                  </TouchableOpacity>
                )
              })}
              <TouchableOpacity style={{flexDirection:"row",alignItems:"center",borderBottomWidth:1,borderBottomColor:"#DDDDDD",paddingTop:15,paddingBottom:15}} onPress={()=>this.send()}>
                <Text style={{color:"black"}}>{getLabel("Khác")}</Text>
              </TouchableOpacity>
              <View style={{padding:10,flexDirection:'column'}}>
                <Button full rounded transparent onPress={()=>this.close()} style={{marginTop:10}}>
                  <Text>{getLabel("Đóng")}</Text>
                </Button>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    )
  }
}
ModelSms.propTypes={
}
import Context  from '../Context';
ModelSms.contextType= Context;
export default ModelSms;
