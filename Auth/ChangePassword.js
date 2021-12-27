import React from 'react';
import {server_url,id_app,group_id,baseUrl} from './../Config.js';
import {Alert,View,ActivityIndicator,Image,StyleSheet,ScrollView} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {textCenter,loading,screenCenter,headerPageStyle,linearBackgroundColor,pageBackground,mainTextColor} from "./../style.js";
import {asyncGet,getLabel,asyncChangePassword,cachedData} from "./../API.js";
import { Container,Left,Right,Body,Text,Title,Icon,Button,Thumbnail,Segment,Form,Label,Input,Item,Toast,H3 } from 'native-base';
import { LinearGradient } from 'expo-linear-gradient';
import KeyboardAvoidingContent from '../Components/KeyboardAvoidingContent';
import GoogleReCaptchaModal from '../Components/GoogleReCaptchaModal';

import Content from '../Components/Content';
import Header from "../Components/Header.js";
import Footer from "../Components/Footer.js";

export default class ChangePassword extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      header: null
    };
  };
  constructor(props){
    super(props);
    this.navigate = this.props.navigation.navigate;
    this.state={
      userInfo:{},
      running:false
    }
  }
  updateUserInfo(e){
    for(let k in e){
      this.state.userInfo[k] = e[k];
    }
    this.setState({
      userInfo:this.state.userInfo
    })
  }
  async save(){
    if(!this.state.userInfo.oldPassword || !this.state.userInfo.newPassword || this.state.userInfo.newPassword.length<6  || this.state.userInfo.newPassword!==this.state.userInfo.reNewPassword){
      return  Alert.alert(getLabel("Mật khẩu không có giá trị"));
    }
    this.setState({running:true});
    try{
      let userInfo = await asyncChangePassword(cachedData.userInfo.token,this.state.userInfo);
      this.setState({running:false});
      Alert.alert(getLabel("Bạn đã thay đổi mật khẩu thành công"))
      this.props.navigation.goBack();
    }catch(e){
      Alert.alert(getLabel(e.message))
      this.setState({running:false});
    }
  }
  render() {
    return (
      <Container>
        <Header  navigation={this.props.navigation} onLeftPress={()=>this.props.navigation.goBack()} title ={getLabel("Đổi mật khẩu")}  icon="ios-arrow-back" navigation = {this.props.navigation}/>
        <Content scrollable={false}  navigation={this.props.navigation}>
            <KeyboardAvoidingContent>
                <Form style={{padding:10}}>
            
                  <Item style={{marginTop:10,backgroundColor:'white'}}>
                    <Icon active={false} name='ios-lock' />
                    <Input placeholder={getLabel("Mật khẩu hiện tại")}   secureTextEntry autoCapitalize={'none'} clearButtonMode ={'while-editing'} autoCorrect ={false} value={this.state.userInfo.oldPassword} onChangeText={(oldPassword)=>this.updateUserInfo({oldPassword})}/>
                  </Item>

                  <Item style={{marginTop:10,backgroundColor:'white'}}>
                    <Icon active={false} name='ios-lock' />
                    <Input placeholder={getLabel("Mật khẩu mới")}   secureTextEntry autoCapitalize={'none'} clearButtonMode ={'while-editing'} autoCorrect ={false} value={this.state.userInfo.password} onChangeText={(newPassword)=>this.updateUserInfo({newPassword})}/>
                  </Item>

                  <Item style={{marginTop:10,backgroundColor:'white'}}>
                    <Icon active={false} name='ios-lock' />
                    <Input placeholder={getLabel("Xác nhận mật khẩu")} secureTextEntry autoCapitalize={'none'} clearButtonMode ={'while-editing'} autoCorrect ={false} value={this.state.userInfo.rePassword} onChangeText={(reNewPassword)=>this.updateUserInfo({reNewPassword})}/>
                  </Item>


                  <View  style={{marginTop:30,flexDirection:'row',justifyContent:'center'}}>
                    <Button rounded success onPress={()=>this.save()}>
                      <Text style={{marginLeft:40,marginRight:40}}>{getLabel("Đổi mật khẩu")}</Text>
                    </Button>
                  </View>
                </Form>
              {this.state.running?
                <View style={loading}>
                  <ActivityIndicator />
                </View>
                :null
              }
            </KeyboardAvoidingContent>
        </Content>
        <Footer  path="User" navigation={this.props.navigation}/>
      </Container>
    );
  }
}
