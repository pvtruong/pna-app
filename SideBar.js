import React from 'react';
import {server_url,funcs,id_app} from './Config.js';
import {Alert,View,AsyncStorage,TouchableOpacity,ActivityIndicator} from 'react-native';
import {DeviceEventEmitter} from 'react-native';
import {sidebarHeaderStyle,mainColor,mainTextColor,pageBackground} from "./style.js";
import {asyncLogoutAPI,getNumberUnReadNotifications,getLabel,cachedData,asyncGet} from "./API.js";
import { Container,Text,Title,Icon,Button,Thumbnail,Form,Label,Input,Item,Toast,Badge,H3 } from 'native-base';
import Content from "./Components/Content.js";
import equal from 'fast-deep-equal';
import Context  from './Context';
import { Image } from 'react-native-elements';
class SideBar extends React.PureComponent {
  constructor(props){
    super(props);
    this.navigate = this.props.navigation.navigate;
    this.state={
    }
  }
  async componentDidMount() {
  }
  componentWillUnmount(){
  }
  componentDidUpdate(pre){
  }
  closeSidebar(){
    if(this.props.drawer){
      this.props.drawer._root.close()
    }
  }
  openFunc(func){
    this.closeSidebar();
    if(func.onPress){
      func.onPress(this.navigate,this.context.userInfo,this.context);
      return;
    }
    if(!func.path){
      Alert.alert("Comming soon");
      return;
    }
    this.navigate(func.path,{userInfo:this.context.userInfo});
  }
  render() {
    let _func = funcs.filter(func=>{
      return !func.code || this.context.userInfo.command.find(c=>c.ma_cn.toUpperCase()===func.code.toUpperCase());
    })
    return (
      <Container style={{overflow:'hidden',maxWidth:320}}>
        {/*<View style={{paddingTop:10,paddingBottom:0,marginBottom:0,backgroundColor:pageBackground.backgroundColor,flexDirection:'column',alignItems:'center'}}>
          <Image source={require("./assets/splash.png")} style={{width:128,height:128}} placeholderStyle={{backgroundColor:"transparent"}} PlaceholderContent={<ActivityIndicator />}/>
        </View>*/}
        <Content>
          <View style={{marginTop:50}}>
            {
              _func.filter(f=>(f.path || f.onPress) && f.visible).map((f,index)=>
                <TouchableOpacity key={index.toString()} onPress={()=>this.openFunc(f)} style={{flexDirection:"row",alignItems:"center",padding:8,borderBottomColor:"#DDDDDD",borderBottomWidth:0.5}}>
                  <View style={{width:32,height:32,overflow:"hidden",borderRadius:32/2,borderColor:"#DDDDDD",borderWidth:0.5,flexDirection:"row",justifyContent:"center",alignItems:"center"}}>
                    {f.image && <Image style={{width:24,height:24}}  source={f.image} />}
                    {f.icon && f.icon}
                    {!f.icon && !f.image && <Image style={{width:24,height:24}}  source={require("./assets/icon-small.png")} />}
                  </View>

                  <View style={{padding:8}}>
                    <Text>{getLabel(f.title).toUpperCase()}</Text>
                  </View>
                </TouchableOpacity>
              )
            }
          </View>
        </Content>
      </Container>
    );
  }
}
SideBar.contextType = Context
export default SideBar
