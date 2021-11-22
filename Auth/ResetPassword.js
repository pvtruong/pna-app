import React from 'react';
import {server_url,baseUrl} from './../Config.js';
import {Alert,View,ScrollView,ActivityIndicator,StyleSheet,Image} from 'react-native';
import {textCenter,loading,screenCenter,headerPageStyle,linearBackgroundColor,pageBackground} from "./../style.js";
import {asyncResetPassword,getLabel} from "./../API.js";
import { Container,Left,Right,Body,Text,Title,Icon,Button,Thumbnail,Segment,Form,Label,Input,Item,Toast,H3 } from 'native-base';
import { LinearGradient } from 'expo-linear-gradient';
import KeyboardAvoidingContent from '../Components/KeyboardAvoidingContent';
import GoogleReCaptchaModal from '../Components/GoogleReCaptchaModal';

import Content from '../Components/Content';
import Header from "../Components/Header.js";
import Footer from "../Components/Footer.js";

export default class ResetPassword extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      header:null
    };
  };
  constructor(props){
    super(props);
    this.navigate = this.props.navigation.navigate;
    this.state={
      email:''
    }
  }
  async send(){
    if(!this.state.email){
      return Alert.alert("Please fill your email");
    }
    this.setState({running:true});
    this.verifyCaptcha.show(true);
  }
  async runReset(_token_captcha){
    try{
      let rs = await asyncResetPassword(this.state.email,_token_captcha);
      this.setState({running:false});
      Alert.alert(rs);
      this.navigate("Loginlocal");
    }catch(e){
      this.setState({running:false});
      Alert.alert(e.message);
    }
  }
  render() {
    return (
      <Container>
        <Header  navigation={this.props.navigation} onLeftPress={()=>this.props.navigation.goBack()} title ={getLabel("Khôi phục mật khẩu")}  icon="ios-arrow-back" navigation = {this.props.navigation}/>
        <Content scrollable={false}>
            <KeyboardAvoidingContent style={{flexGrow:1,padding:10,justifyContent:'center',alignItems:'center'}}>
                <Form  style={{backgroundColor:"white",borderRadius:10,width:"100%"}}>
                  <Item style={{backgroundColor:'white'}}>
                    <Icon active={false} name='ios-mail' />
                    <Input placeholder="Email" autoFocus ={true} autoCapitalize={'none'} clearButtonMode ={'while-editing'} autoCorrect ={false} value={this.state.email} onChangeText={(email)=>this.setState({email : email})}/>
                  </Item>
                  <View style={{flexDirection:'row',justifyContent:'center',marginTop:30}}>
                    <Button danger onPress={()=>this.send()}>
                      <Text style={{marginLeft:30,marginRight:30}}>{getLabel("Yêu cầu khôi phục mật khẩu")}</Text>
                    </Button>
                  </View>
                </Form>
                <GoogleReCaptchaModal onSuccess={(_token)=>this.runReset(_token)} ref={_ref=>this.verifyCaptcha = _ref}/>
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
