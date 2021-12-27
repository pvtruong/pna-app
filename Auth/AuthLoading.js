import React from 'react';
import {StatusBar,View} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {screenCenter} from "./../style.js";
import {asyncGetUserInfoByToken,cachedData} from "./../API.js";
import Context  from '../Context';
import {Spinner} from 'native-base';
class AuthLoading extends React.Component {
  constructor() {
    super();
  }

  async componentDidMount() {
    this.bootstrapAsync();
  }
  // Fetch the token from storage then navigate to our appropriate place
  async bootstrapAsync(){
    this.context.setNavigate(this.props.navigation.navigate);
    this.context.setUserInfo(null);
    let userToken = await AsyncStorage.getItem('token');
    let opened = await AsyncStorage.getItem('opened');
    // This will switch to the App screen or Auth screen and this loading
    // screen will be unmounted and thrown away.
    if(!userToken){
       this.props.navigation.navigate('Auth');
      /*if(opened){
         this.props.navigation.navigate('Auth');
      }else{
         this.props.navigation.navigate('Splash1');
      }*/
      return;
    }
    try{
      let userInfo = await asyncGetUserInfoByToken(userToken);
      let rs = await this.context.setUserInfo(userInfo);
      if(rs){
        this.props.navigation.navigate('Home');
        /*if(opened){
          this.props.navigation.navigate('Home');
        }else{
          this.props.navigation.navigate('Splash1');
        }*/
      }else{
        this.props.navigation.navigate('Auth');
      }

    }catch(e){
      console.log("Error:",e.message);
      this.props.navigation.navigate('Auth');
      /*if(opened){
        this.props.navigation.navigate('Auth');
      }else{
        this.props.navigation.navigate('Splash1');
      }*/
    }
  };
  //
  render() {
    return (
      <View style={{width:'100%',height:'100%'}}>
        <View style={screenCenter}>
          <Spinner />
          <StatusBar barStyle="default" />
        </View>
      </View>
    );
  }
}
AuthLoading.contextType = Context
export default AuthLoading
