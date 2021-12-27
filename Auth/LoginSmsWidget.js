import React from 'react';
import {server_url,baseUrl,app_name,id_app,SLUG_APP_FOR_CUSTOMER} from './../Config.js';
import {Alert,View,ScrollView,ActivityIndicator,StyleSheet,Image} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {textCenter,loading,screenCenter,headerPageStyle,linearBackgroundColor,pageBackground,mainColor,mainTextColor,mainButtonColor} from "./../style.js";
import {getLabel,asyncLoginSms,asyncVerifyOTP,asyncGetUserInfoByToken,cachedData,asyncGet,asyncPost} from "./../API.js";
import { Container,Left,Right,Body,Text,Title,Icon,Button,Thumbnail,Segment,Form,Label,Input,Item,Toast,H1,H3,Spinner } from 'native-base';
import KeyboardAvoidingContent from '../Components/KeyboardAvoidingContent';
import GoogleReCaptchaModal from '../Components/GoogleReCaptchaModal';
import Context  from '../Context';
import {NavigationActions} from 'react-navigation';
import * as Animatable from 'react-native-animatable';
import Constants from 'expo-constants';

class LoginSmsWidget extends React.Component {
  constructor(props){
    super(props);
    this.state={
      phone:'',
      isVerify:false,
      isLogin:true,
      isInvite:false
    }
  }
  componentDidMount(){
    this.redirect_to = this.props.redirectTo || cachedData.redirectTo||'Home';
    this.redirect_params = Object.assign(this.props.redirectParams || cachedData.redirectParams||{});
    delete cachedData.redirectTo;
    delete cachedData.redirectParams;
  }
  async send(){
    if(!this.state.phone){
      return Alert.alert(app_name,getLabel("Bạn chưa nhập số điện thoại"));
    }
    this.setState({running:true});
    this.verifyCaptcha.show(true);
  }
  async sendSmsToken(_token_captcha){
    try{
      let rs = await asyncLoginSms(this.state.phone,_token_captcha);
      this.setState({running:false,isVerify:true,isLogin:false,otp:rs});
    }catch(e){
      this.setState({running:false});
      Alert.alert(app_name,getLabel(e.message));
    }
  }
  async verify(){
    if(!this.state.otp){
      this.setState({isVerify:false});
      return;
    }
    this.setState({running:true});
    try{
      let rs = await asyncVerifyOTP(this.state.otp._id,this.state.smsToken);
      let token = rs.token;
      let userInfo = await asyncGetUserInfoByToken(token);
      userInfo.token = token;
      await AsyncStorage.setItem('token', userInfo.token);
      this.redirect_params.userInfo = userInfo;
      if(Constants.manifest.slug === SLUG_APP_FOR_CUSTOMER && (rs.is_new || userInfo.email===userInfo.name)){
        this.setState({
          isInvite:rs.is_new,
          running:false,
          isVerify:false,
          isUpdateProfile:userInfo.email===userInfo.name
        })
      }else{
        this.gotoHome();
      }

    }catch(e){
      this.setState({running:false,smsToken:""});
      Alert.alert(app_name,getLabel(e.message));
    }
  }

  async introducer(){
    let userInfo = this.redirect_params.userInfo;
    if(userInfo && this.state.invitePhone){
      this.setState({running:true});
      let data ={
        id_app:id_app,
        be_introduced_by:this.state.invitePhone,
        be_introduced:userInfo.email
      }
      let token = userInfo.token;
      let url = `${server_url}/api/${id_app}/introducer?access_token=${userInfo.token}`;
      try{
        let rs = await asyncPost(url,null,data);
        this.setState({running:false});
        this.gotoHome();
      }catch(e){
        this.setState({running:false});
        Alert.alert(app_name,getLabel(e.message));
      }
    }
  }
  async updateProfile(){
    this.setState({running:true})
    let url = server_url + "/api/updateprofile?access_token=" + this.redirect_params.userInfo.token;
    try{
      await asyncPost(url,null,{name:this.state.name});
      this.redirect_params.userInfo.name = this.state.name;
      this.setState({isUpdateProfile:false,running:false});
      if(!this.state.isInvite){
        return this.gotoHome()
      }
    }catch(e){
      this.setState({running:false})
      Alert.alert(app_name,getLabel(e.message));
    }
  }
  async gotoHome(){
    if(this.redirect_params.userInfo){
      let rs = await this.context.setUserInfo(this.redirect_params.userInfo);
      if(!rs){
        Alert.alert(app_name,getLabel("Bạn không có quyền sử dụng chương trình này."));
        this.setState({running:false,isLogin:true,isVerify:false,isInvite:false,smsToken:""});
        return;
      }
      if(this.props.navigation && this.redirect_to!="self"){
        setTimeout(()=>{
          this.props.navigation.navigate('App',{},NavigationActions.navigate({ routeName: this.redirect_to,params:this.redirect_params}));
        },0)
      }
    }
  }
  render() {
    return (
        <KeyboardAvoidingContent style={{flexGrow:1,padding:10,justifyContent:'center',alignItems:'center',width:'100%'}}>
          <View style={{borderRadius:10,padding:10,width:'100%'}}>
              <Form style={[{paddingTop:5}]}>
                <View style={{flexDirection:"column",justifyContent:"center",alignItems:"center"}}>
                  <Image source={require("../assets/avatar.png")} style={{width:128,height:128}}/>
                  <H1 style={{textAlign:"center",color:mainButtonColor,marginTop:10,fontWeight:"bold"}}>{getLabel("Đăng nhập").toUpperCase()}</H1>
                </View>
                {this.state.isLogin &&
                  <View>
                    <Item rounded style={{paddingLeft:10,backgroundColor:'white',marginTop:20}}>
                      <Input textAlign='center' keyboardType ={'phone-pad'} placeholder={getLabel("Nhập số điện thoại của bạn")} autoFocus ={false} autoCapitalize={'none'} clearButtonMode ={'while-editing'} autoCorrect ={false} value={this.state.phone} onChangeText={(phone)=>this.setState({phone : phone})}/>
                    </Item>

                    <View style={{flexDirection:'row',justifyContent:'center',marginTop:30}}>
                      <Button rounded success onPress={()=>this.send()} disabled={!this.state.phone || this.state.running}>
                        <Text style={{marginLeft:30,marginRight:30,fontWeight:"bold"}}>{getLabel("Đăng nhập").toUpperCase()}</Text>
                      </Button>
                    </View>
                    {Constants.manifest.slug !== SLUG_APP_FOR_CUSTOMER && this.props.navigation &&
                      <View style={{flexDirection:'row',justifyContent:'center',marginTop:30}}>
                        <Button transparent onPress={()=>this.props.navigation.navigate("Dkcongtacvien")} disabled={this.state.running}>
                          <Text>{getLabel("Đăng ký điều dưỡng viên")}</Text>
                        </Button>
                      </View>
                    }
                  </View>
                }
                {this.state.isVerify &&
                  <Animatable.View animation="zoomInUp" duration ={100}>
                    <Item rounded style={{paddingLeft:10,backgroundColor:'white',marginTop:20}}>
                      <Input textAlign="center"  keyboardType ={'phone-pad'} placeholder={getLabel("Nhập mã số xác thực nhận được")} autoFocus ={false} autoCapitalize={'none'} clearButtonMode ={'while-editing'} autoCorrect ={false} value={this.state.smsToken} onChangeText={(smsToken)=>this.setState({smsToken : smsToken})}/>
                    </Item>

                    <View style={{flexDirection:'row',justifyContent:'center',marginTop:30}}>
                      <Button rounded onPress={()=>this.verify()} disabled={!this.state.smsToken || this.state.running}>
                        <Text style={{marginLeft:30,marginRight:30}}>{getLabel("Xác thực")}</Text>
                      </Button>
                    </View>

                    <View style={{flexDirection:'row',justifyContent:'center',marginTop:30}}>
                      <Button transparent onPress={()=>this.setState({isVerify:false,isLogin:true})}>
                        <Text style={{marginLeft:30,marginRight:30}}>{getLabel("Quay lại")}</Text>
                      </Button>
                    </View>
                  </Animatable.View >
                }
                {this.state.isUpdateProfile &&
                  <Animatable.View animation="zoomInUp" duration ={100}>
                    <Item rounded style={{paddingLeft:10,backgroundColor:'white',marginTop:20}}>
                      <Input textAlign="center" placeholder={getLabel("Nhập họ và tên đầy đủ của bạn")} autoFocus ={true} autoCapitalize={'none'} clearButtonMode ={'while-editing'} autoCorrect ={false} value={this.state.name} onChangeText={(name)=>this.setState({name : name})}/>
                    </Item>

                    <View style={{flexDirection:'row',justifyContent:'center',marginTop:30}}>
                      <Button rounded danger onPress={()=>this.updateProfile()} disabled={!this.state.isUpdateProfile || this.state.running || !this.state.name}>
                        <Text style={{marginLeft:30,marginRight:30}}>{getLabel("Lưu")}</Text>
                      </Button>
                    </View>
                  </Animatable.View >
                }

                {this.state.isInvite && !this.state.isUpdateProfile &&
                  <Animatable.View animation="zoomInUp" duration ={100}>
                    <H3 style={{textAlign:'center',marginTop:10}}>{getLabel("Người giới thiệu")}</H3>
                    <Item rounded style={{paddingLeft:10,backgroundColor:'white',marginTop:20}}>
                      <Input textAlign="center"  keyboardType ={'phone-pad'} placeholder={getLabel("Số điện thoại người giới thiệu")} autoFocus ={false} autoCapitalize={'none'} clearButtonMode ={'while-editing'} autoCorrect ={false} value={this.state.invitePhone} onChangeText={(invitePhone)=>this.setState({invitePhone : invitePhone})}/>
                    </Item>

                    <View style={{flexDirection:'row',justifyContent:'center',marginTop:30}}>
                      <Button rounded onPress={()=>this.introducer()} disabled={!this.state.invitePhone || this.state.running}>
                        <Text style={{marginLeft:30,marginRight:30}}>{getLabel("Xác nhận")}</Text>
                      </Button>
                    </View>

                    <View style={{flexDirection:'row',justifyContent:'center',marginTop:30}}>
                      <Button transparent onPress={()=>this.gotoHome()}>
                        <Text style={{marginLeft:30,marginRight:30}}>{getLabel("Bỏ qua")}</Text>
                      </Button>
                    </View>
                  </Animatable.View >
                }

              </Form>
              <GoogleReCaptchaModal onSuccess={(_token)=>this.sendSmsToken(_token)} ref={_ref=>this.verifyCaptcha = _ref} action="sendotp"/>
              {this.state.running &&
                <View style={loading}>
                  <Spinner />
                </View>
              }
          </View>
        </KeyboardAvoidingContent>
    );
  }
}
LoginSmsWidget.contextType = Context
export default LoginSmsWidget
