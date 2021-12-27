import React from 'react';
import {server_url,id_app,group_id,baseUrl} from './../Config.js';
import {Alert,View,ActivityIndicator,Image,StyleSheet,ScrollView} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {textCenter,loading,screenCenter,headerPageStyle,linearBackgroundColor,pageBackground,mainColor,mainTextColor} from "./../style.js";
import {asyncSignup,asyncGet,getLabel} from "./../API.js";
import { Container,Left,Right,Body,Text,Title,Icon,Button,Thumbnail,Segment,Form,Label,Input,Item,Toast,H3 } from 'native-base';
import { LinearGradient } from 'expo-linear-gradient';
import KeyboardAvoidingContent from '../Components/KeyboardAvoidingContent';
import GoogleReCaptchaModal from '../Components/GoogleReCaptchaModal';

import Content from '../Components/Content';
import Header from "../Components/Header.js";
import Footer from "../Components/Footer.js";

import * as Animatable from 'react-native-animatable';
const validate = require("validate.js");
const  constraints = {
  email: {
    presence: {allowEmpty: false,message: '^' + getLabel("Email")},
  },
  name: {
    presence: {allowEmpty: false,message: '^' + getLabel("Họ và tên đầy đủ")}
  },
  /*address: {
    presence: {allowEmpty: true,message: '^' + getLabel("Địa chỉ")}
  },
  phone: {
    presence: {allowEmpty: true,message: '^' + getLabel("Điện thoại liên hệ")}
  },*/
  password: {
    presence: {allowEmpty: false,message: '^' + getLabel("Mật khẩu")},
    length: {
      minimum: 6,
      message: '^' + getLabel("Mật khẩu phải ít nhất 6 ký tự")
    }
  },
  rePassword: {
    presence: {allowEmpty: false,message: '^' + getLabel("Xác nhận mật khẩu")},
    equality: {
      attribute:"password",
      message:'^' + getLabel("Hai mật khẩu không khớp nhau")
    }
  }
};

export default class Signup extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      header: null
    };
  };
  constructor(props){
    super(props);
    this.navigate = this.props.navigation.navigate;
    if(!this.props.navigation.state ){
      this.props.navigation.state={}
    }
    if(!this.props.navigation.state.params){
      this.props.navigation.state.params={}
    }
    this.state={
      userInfo:{name:this.props.navigation.state.params.name,email:this.props.navigation.state.params.email}
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
    let data={
      email:this.state.userInfo.email,
      name:this.state.userInfo.name,
      password:this.state.userInfo.password,
      rePassword:this.state.userInfo.rePassword,
      address:this.state.userInfo.address,
      phone:this.state.userInfo.phone
    }
    let valid = validate(data, constraints,{format: "flat"});
    if(valid){
      let error=getLabel("Bạn chưa nhập: ") + valid.join(", ");
      Alert.alert(error);
      return;
    }

    if(this.props.navigation.state.params.facebook_token){
      let urlProfile = `${server_url}/createUser/facebook?id_app=${id_app}&group_id=${group_id}&access_token=${this.props.navigation.state.params.facebook_token}&email=${this.state.userInfo.email}&password=${this.state.userInfo.password}`;
      try{
        let profileUser = JSON.parse(await asyncGet(urlProfile));
        if(profileUser.error){
          Alert.alert(profileUser.error);
          return;
        }
        await AsyncStorage.setItem('token', this.props.navigation.state.params.facebook_token);
        profileUser.token = this.props.navigation.state.params.facebook_token;
        this.props.navigation.navigate('Home',{userInfo:profileUser});
      }catch(e){
        Alert.alert(e.message);
      }
    }else{
      if(this.props.navigation.state.params.google_id_token){
        let urlProfile = `${server_url}/createUser/google?id_app=${id_app}&group_id=${group_id}&id_token=${this.props.navigation.state.params.google_id_token}&email=${this.state.userInfo.email}&password=${this.state.userInfo.password}`;
        try{
          let profileUser = JSON.parse(await asyncGet(urlProfile));
          if(profileUser.error){
            Alert.alert(profileUser.error);
            return;
          }
          await AsyncStorage.setItem('token', urlProfile.access_token);
          profileUser.token = urlProfile.access_token;
          this.props.navigation.navigate('Home',{userInfo:profileUser});
        }catch(e){
          Alert.alert(e.message);
        }
      }else{
        this.verifyCaptcha.show(true);
      }
    }
  }
  async createUser(_token){
    try{
      this.state.userInfo['g-recaptcha-response'] = _token;
      let userInfo = await asyncSignup(this.state.userInfo);
      //goto login page
      Alert.alert(getLabel("Bạn đã tạo tài khoản thành công"))
      this.navigate("Loginlocal");
    }catch(e){
      Alert.alert(e.message);
    }
  }
  render() {
    return (
      <Container>
        <Header onLeftPress={()=>this.props.navigation.goBack()}  icon="ios-arrow-back" title ={getLabel("Sign up")}/>
        <Content scrollable={false}  navigation={this.props.navigation}>
            <KeyboardAvoidingContent style={{flexGrow:1,padding:10,justifyContent:'center',alignItems:'center'}}>
                <Form style={{backgroundColor:"white",borderRadius:10,width:"100%"}}>
                  <Item style={{backgroundColor:'white'}}>
                    <Icon active={false} name='ios-mail' />
                    <Input placeholder={getLabel("Email hoặc username")} autoFocus ={!this.props.navigation.state.params.email} editable={!this.props.navigation.state.params.email}  autoCapitalize={'none'}  clearButtonMode ={'while-editing'} autoCorrect ={false} value={this.state.userInfo.email} onChangeText={(email)=>this.updateUserInfo({email})}/>
                  </Item>
                  <Item style={{marginTop:10,backgroundColor:'white'}}>
                    <Icon active={false} name='ios-person' />
                    <Input placeholder={getLabel("Họ và tên")} clearButtonMode ={'while-editing'} editable={!this.props.navigation.state.params.name} autoCorrect ={false} value={this.state.userInfo.name} onChangeText={(name)=>this.updateUserInfo({name})}/>
                  </Item>

                  <Item style={{marginTop:10,backgroundColor:'white'}}>
                    <Icon active={false} name='ios-lock' />
                    <Input placeholder={getLabel("Mật khẩu")} autoFocus ={!(!this.props.navigation.state.params.email)}  secureTextEntry autoCapitalize={'none'} clearButtonMode ={'while-editing'} autoCorrect ={false} value={this.state.userInfo.password} onChangeText={(password)=>this.updateUserInfo({password})}/>
                  </Item>

                  <Item style={{marginTop:10,backgroundColor:'white'}}>
                    <Icon active={false} name='ios-lock' />
                    <Input placeholder={getLabel("Nhập lại mật khẩu")} secureTextEntry autoCapitalize={'none'} clearButtonMode ={'while-editing'} autoCorrect ={false} value={this.state.userInfo.rePassword} onChangeText={(rePassword)=>this.updateUserInfo({rePassword})}/>
                  </Item>

                  {/*<Item stackedLabel>
                    <Label >Phone</Label>
                    <Input clearButtonMode ={'while-editing'} autoCorrect ={false} value={this.state.userInfo.phone}  onChangeText={(phone)=>this.updateUserInfo({phone})}/>
                  </Item>
                  <Item stackedLabel>
                    <Label >Address</Label>
                    <Input clearButtonMode ={'while-editing'} autoCorrect ={false} value={this.state.userInfo.address}  onChangeText={(address)=>this.updateUserInfo({address})}/>
                  </Item>*/}
                  <View  style={{marginTop:25,flexDirection:'row',justifyContent:'center'}}>
                    <Button success onPress={()=>this.save()}>
                      <Text style={{marginLeft:40,marginRight:40}}>{getLabel("Đăng ký")}</Text>
                    </Button>
                  </View>
                </Form>
              {this.state.running?
                <View style={loading}>
                  <ActivityIndicator />
                </View>
                :null
              }
              <GoogleReCaptchaModal onSuccess={(_token)=>this.createUser(_token)} ref={_ref=>this.verifyCaptcha = _ref}/>
            </KeyboardAvoidingContent>
        </Content>
      <Footer  path="User" navigation={this.props.navigation}/>
    </Container>
    );
  }
}
