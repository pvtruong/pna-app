import React from 'react';
import { Alert,View,AsyncStorage,Image} from 'react-native';
import { Container,Header,Footer,Content,Left,Right,Body,Text,Title,Icon,Button,Form,Item,Label,Input } from 'native-base';
import {asyncLoginAPI,asyncGet} from "./../API.js";
import {facebook_app_id,server_url,id_app,group_id} from "./../Config";
import {textCenter,screenCenter,headerPageStyle,linearBackgroundColor,pageBackground} from "./../style.js";
import { LinearGradient } from 'expo-linear-gradient';
export default class Login extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      header: null,
      headerStyle: headerPageStyle,
      headerTitle: "Sign in",
    }
  };
  constructor(props){
    super(props);
  }
  async logInFacebook() {
    const { type, token } = await Expo.Facebook.logInWithReadPermissionsAsync(facebook_app_id, {
        permissions: ['public_profile','email'],
      });
    if (type === 'success') {
      let urlProfile = `${server_url}/createUser/facebook?id_app=${id_app}&group_id=${group_id}&access_token=${token}`;
      try{
        let profileUser = JSON.parse(await asyncGet(urlProfile));
        if(profileUser.error){
          //requre input user and password
          console.log(profileUser)
          this.props.navigation.navigate('Signup',{facebook_token:token,name:profileUser.name,email:profileUser.email});
        }else{
          await AsyncStorage.setItem('token', token);
          profileUser.token = token;
          this.props.navigation.navigate('Home',{userInfo:profileUser});
        }

      }catch(error){
        Alert.alert(error.message);
      }
    }
  }
  render() {
    return (
        <LinearGradient
          colors={linearBackgroundColor}
          style={[{  alignItems: 'center',flex:1 },screenCenter]}>
              <Form>
                <View>
                  <Image source={require("../assets/icon-a.png")} style={{width:200,height:200}}/>
                </View>
                <View style={{marginTop:100}}>
                  <Button  full rounded onPress={()=>this.logInFacebook()}>
                    <Text>
                      Sign in by Facebook
                    </Text>
                  </Button>
                </View>
                <View style={{marginTop:20}}>
                  <Button  full danger rounded onPress={()=>this.props.navigation.navigate("Loginlocal")}>
                    <Text>
                      Sign in by your account
                    </Text>
                  </Button>
                </View>
              </Form>
        </LinearGradient>
    );
  }
}
