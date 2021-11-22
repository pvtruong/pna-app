import React from 'react';
import { Alert,View,AsyncStorage,Image,StyleSheet,ScrollView,ActivityIndicator} from 'react-native';
import { Container,Left,Right,Body,Text,Title,Icon,Button,Form,Item,Label,Input,H1,H2,H3 } from 'native-base';
import {Spinner} from 'native-base';
import {asyncLoginAPI,asyncGet,getLabel,getLanguage,asyncSetLang,cachedData} from "./../API.js";
import {facebook_app_id,google_app_id,server_url,id_app,group_id} from "./../Config";
import {textCenter,screenCenter,headerPageStyle,linearBackgroundColor,pageBackground,mainColor,mainTextColor} from "./../style.js";
import {NavigationActions} from 'react-navigation';
import { LinearGradient } from 'expo-linear-gradient';
import KeyboardAvoidingContent from '../Components/KeyboardAvoidingContent';
import * as Animatable from 'react-native-animatable';
import Context  from '../Context';
const validate = require("validate.js");
const  constraints = {
  user: {
    presence: {allowEmpty: false,message: '^' + getLabel("Bạn chưa nhập tên truy cập")},
  },
  password: {
    presence: {allowEmpty: false,message: '^' + getLabel("Bạn chưa nhập mật khẩu")},
    length: {
      minimum: 3,
      message: '^' + getLabel("Mật khẩu phải ít nhất 3 ký tự")
    }
  }
};

class LoginlocalWidget extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      header: null
    }
  };
  constructor(props){
    super(props);
    this.state={
      user:"",
      password:"",
      error:"",
      running:false
    }
  }
  async componentDidMount() {
    this.redirect_to = this.props.redirectTo || cachedData.redirectTo ||'Home';
    this.redirect_params = Object.assign(this.props.redirectParams || cachedData.redirectParams||{});
    delete cachedData.redirectTo;
    delete cachedData.redirectParams;
  }
  async login(){
    let user = this.state.user;
    let password = this.state.password;

    let valid = validate({user:user,password:password}, constraints,{format: "flat"});
    if(valid){
      let error=valid.join(", ");
      Alert.alert(error);
      return;
    }

    this.setState({running:true});
    try{
      let userInfo = await asyncLoginAPI(user,password);
      await AsyncStorage.setItem('token', userInfo.token);
      this.redirect_params.userInfo = userInfo;
      let rs = await this.context.setUserInfo(userInfo);
      if(!rs) return;
      if(this.props.navigation && this.redirect_to!="self"){
        this.props.navigation.navigate('App',{},NavigationActions.navigate({ routeName: this.redirect_to,params:this.redirect_params}));
      }
    }catch(error){
      this.setState({
        error:error.message,
        running:false
      })
      Alert.alert(error.message);
    }
  }
  async setLang(){
    if(getLanguage()==="vi"){
      await asyncSetLang("en");
    }else{
      await asyncSetLang("vi");
    }
    this.props.navigation.navigate("AuthLoading");
  }
  render() {
    return (
        <View style={{flex:1,width:'100%'}}>
            {this.state.running?
              <View style={{flex:1,flexDirection:"column",justifyContent:"center",alignItems:"center"}}>
                <Spinner />
              </View>
              :
              <KeyboardAvoidingContent style={{flex:1,flexDirection:'column',justifyContent:"center",alignItems:"center"}}>
                  <Form style={{padding:20,width:'100%',maxWidth:480}}>
                      <View style={{marginTop:10}}>


                        <View style={{marginTop:5,padding:5,flexDirection:"column"}}>
                          <Label>{getLabel("Tên người dùng")} <Text style={{color:"red"}}>(*)</Text></Label>
                          <Input style={{backgroundColor:"white",padding:5,marginTop:5,borderColor:'silver',borderRadius:5,borderWidth:1}}  autoCapitalize={'none'}  clearButtonMode ={'while-editing'} autoCorrect ={false} value={this.state.user}  onChangeText={(user)=>this.setState({user})}/>
                        </View>

                        <View style={{marginTop:5,padding:5,flexDirection:"column"}}>
                          <Label>{getLabel("Mật khẩu")} <Text style={{color:"red"}}>(*)</Text></Label>
                          <Input style={{backgroundColor:"white",padding:5,marginTop:5,borderColor:'silver',borderRadius:5,borderWidth:1}}  autoCapitalize={'none'}  clearButtonMode ={'while-editing'} secureTextEntry autoCorrect ={false} value={this.state.password}  onChangeText={(password)=>this.setState({password})}/>
                        </View>


                        <View style={{marginTop:25,padding:10,flexDirection:'row',justifyContent:'center',alignItems:'center'}}>
                          <Button rounded success onPress={()=>this.login()} style={{padding:30}}>
                            <Text>{getLabel("Đăng nhập")}</Text>
                          </Button>

                        </View>
                      </View>
                  </Form>
              </KeyboardAvoidingContent>
            }
        </View>

    );
  }
}
LoginlocalWidget.contextType = Context
export default LoginlocalWidget
