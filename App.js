import React,{Component} from 'react';
import {Root,StyleProvider} from  'native-base';
//register locale for numeral
import numeral from "numeral";
numeral.register('locale', 'vi', {
    delimiters: {
        thousands: ',',
        decimal: '.'
    }
});
numeral.locale('vi');
//
import parallel from 'async/parallel';
//import { SafeAreaProvider } from 'react-native-safe-area-context';
//import { useScreens } from 'react-native-screens';
//useScreens();
import AppProvider from './Provider';
import {server_url,funcs,id_app,appInfo,public_token} from './Config.js';
import getTheme from './native-base-theme/components';
import commonColor from './native-base-theme/variables/commonColor';
import {asyncGet,cacheImages,cacheDatas,getLabelsList,asyncLoadLang} from "./API.js";
import {Animated,Easing,Text} from 'react-native';
import { AppearanceProvider } from 'react-native-appearance';
import { StatusBar } from 'expo-status-bar';
import { createSwitchNavigator,createAppContainer } from 'react-navigation';
import {createStackNavigator} from 'react-navigation-stack';
import Home from  './Home.js';
import About from  './About.js';
import Login from './Auth/Login.js';
import Loginlocal from './Auth/Loginlocal.js';
import AuthLoading from './Auth/AuthLoading.js';
import { LogBox } from 'react-native';
//import LoginSms from './Auth/LoginSms.js';

import User from './User/UserInfo.js';

import Dmgiaban from './lists/Dmgiaban.js';
import Dmkh from './lists/Dmkh.js';
import Dmvt from './lists/Dmvt.js';

import PC1 from './vouchers/PC1.js';
import BN1 from './vouchers/BN1.js';
import PT1 from './vouchers/PT1.js';
import BC1 from './vouchers/BC1.js';
import SO1 from './vouchers/SO1.js';
import HD2 from './vouchers/HD2.js';
import HD1 from './vouchers/HD1.js';
import PN1 from './vouchers/PN1.js';
import PKT from './vouchers/PKT.js';

import Sctcnkh from './reports/Sctcnkh.js';
import Cdpskh from './reports/Cdpskh.js';
import Thnxt from './reports/Thnxt.js';
import Sctvt from './reports/Sctvt.js';
import Soquy from './reports/Soquy.js';
import Sotiengui from './reports/Sotiengui.js';
import AppLoading from 'expo-app-loading';

import { Asset } from 'expo-asset';

import * as Font from "expo-font";
import * as Animatable from 'react-native-animatable';
LogBox.ignoreAllLogs();
const  AppStack = createStackNavigator({
  Home:{screen:Home},
  About:{screen:About},

  Dmgiaban:{screen:Dmgiaban},
  Dmkh:{screen:Dmkh},
  Dmvt:{screen:Dmvt},

  PC1:{screen:PC1},
  BN1:{screen:BN1},
  PT1:{screen:PT1},
  BC1:{screen:BC1},
  SO1:{screen:SO1},
  HD2:{screen:HD2},
  HD1:{screen:HD1},
  PN1:{screen:PN1},
  PKT:{screen:PKT},

  Sctcnkh:{screen:Sctcnkh},
  Cdpskh:{screen:Cdpskh},
  Thnxt:{screen:Thnxt},
  Sctvt:{screen:Sctvt},
  Soquy:{screen:Soquy},
  Sotiengui:{screen:Sotiengui},

  User:{screen:User,navigationOptions: {gesturesEnabled: true}},
},{
  initialRouteName: 'Home',
  defaultNavigationOptions:{
    gesturesEnabled:true
  },
  transitionConfig: () => ({
      transitionSpec: {
        duration: 300,
        easing: Easing.out(Easing.poly(4)),
        timing: Animated.timing,
      },
      screenInterpolator: sceneProps => {
        const { layout, position, scene } = sceneProps;
        const { index } = scene;

        const height = layout.initHeight;
        const translateY = position.interpolate({
          inputRange: [index - 1, index, index + 1],
          outputRange: [height, 0, 0],
        });

        const width = layout.initWidth;
        const translateX = position.interpolate({
          inputRange: [index - 1, index, index + 1],
          outputRange: [width, 0, 0],
        });

        const opacity = position.interpolate({
          inputRange: [index - 1, index - 0.99, index],
          outputRange: [0, 1, 1],
        });

        return { opacity, transform: [{ translateX }] };
      },
    })
})

const AuthStack = createStackNavigator({
  Loginlocal:{screen:Loginlocal},
  Login:{screen:Login},
})

const App = createSwitchNavigator({
  AuthLoading:AuthLoading,
  Auth:AuthStack,
  App:AppStack
},{
  initialRouteName: 'AuthLoading',
})
const AppContainer = createAppContainer(App);
export default class HomeNav extends Component {
  _cacheSplashResourcesAsync = async () => {
    const bg = require('./assets/background.png');
    await Asset.fromModule(bg).downloadAsync();
  }
  async _loadAssetsAsync() {
    const p = new Promise((resolve,reject)=>{
      parallel({
        splash:(cb)=>{
          this._cacheSplashResourcesAsync().then(rs=>{
              cb();
          })
        },
        font:(cb)=>{
          Font.loadAsync({
            Roboto: require("native-base/Fonts/Roboto.ttf"),
            Roboto_medium: require("native-base/Fonts/Roboto_medium.ttf")
          }).then(rs=>{
            cb();
          })
        },
        image1:async (cb)=>{
          try{
            let images = funcs.filter(f=>f.image).map(f=>f.image);
            images.push(require("./assets/notification.png"));
            images.push(require("./assets/avatar.png"));
            images.push(require("./assets/bg_no_data.png"));
            let imageAssets = cacheImages(images);
            await Promise.all([...imageAssets]);
          }catch(e){
            console.log("error cache images and data",e.message)
          }
          cb();
        },
        lang:async (cb)=>{
          try{
            await asyncLoadLang();
            await getLabelsList();
          }catch(e){
            console.log("error load lang package",e.message)
          }
          cb();
        }
      },(e,rs)=>{
        resolve();
      })
    });
    let rs = await p;
  }
  constructor(props) {
    super(props);
    this._loadAssetsAsync = this._loadAssetsAsync.bind(this);
    this._cacheSplashResourcesAsync = this._cacheSplashResourcesAsync.bind(this);
    this.state = { loading: true,isAppReady:false,isSplashReady: false };
  }
  async componentDidMount() {
    //SplashScreen.preventAutoHide();
    /*try {
      const update = await Expo.Updates.checkForUpdateAsync();
      if (update.isAvailable) {
        Expo.Updates.fetchUpdateAsync();
        // ... notify user of update ...
        //Expo.Updates.reloadFromCache();
        console.log("have update");
      }
    } catch (e) {
      console.log("error check update",e)
      // handle or log error
    }*/
  }
  render() {
    if (!this.state.isSplashReady) {
      return (
        <Root>
          <AppLoading
            startAsync={this._loadAssetsAsync}
            onFinish={() =>{
              this.setState({ loading: false,isSplashReady: true });
            }}
            onError={(e)=>console.log("error loading",e.message)}
          />
        </Root>
      );
    }
    return (
      <Root>
        <AppearanceProvider>
          <AppProvider appInfo={appInfo} exchangeRate={this.exchangeRate}>
            <StyleProvider style={getTheme(commonColor)}>
              <AppContainer />
            </StyleProvider>
          </AppProvider>
        </AppearanceProvider>
        <StatusBar style="light" />
      </Root>
    );
  }
}
