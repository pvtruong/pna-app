import React from 'react';
import {server_url,baseUrl} from './../Config.js';
import {Alert,View,TouchableOpacity,Image,StyleSheet,ScrollView} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {DeviceEventEmitter} from 'react-native';

import {textCenter,sidebarHeaderStyle,headerPageStyle,pageBackground,mainColor,mainTextColor} from "./../style.js";
import {asyncLogoutAPI,getNumberUnReadNotifications,asyncGetUserInfoByToken,getLabel,cachedData} from "./../API.js";
import { Container,Left,Right,Body,Text,Title,Icon,Button,Thumbnail,Form,Label,Input,Item,Toast,List,ListItem ,Badge,H3,Drawer} from 'native-base';
import Header from "../Components/Header.js";
import Footer from "../Components/Footer.js";
import Content from "../Components/Content.js";
import RequireLoginWidget from "../Components/RequireLoginWidget.js";

Drawer.defaultProps.styles.mainOverlay.elevation = 0;
import SideBar from '../SideBar';
import Context from '../Context';

class User extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      header:null
    };
  };
  constructor(props){
    super(props);
    this.navigate = this.props.navigation.navigate;
    this.state={
      numberNotifications:0
    }
  }
  async logout(){
    try{
      await asyncLogoutAPI(this.context.userInfo);
      await AsyncStorage.clear();
      await AsyncStorage.setItem('opened',"1");
      this.navigate("AuthLoading");
    }catch(e){
      Alert.alert(e.message);
    }
  }
  async componentDidMount() {
    this.mounted = true
  }
  componentWillUnmount(){
    this.mounted = false
  }
  render() {
    let mainTextColor ="black";
    return (
      <Drawer
        ref={(ref) => { this.drawer = ref; }}
        content={<SideBar navigation={this.props.navigation} drawer={this.drawer} />}
        onClose={() => this.drawer._root.close()}>
        <Container>
          <Header  navigation={this.props.navigation}  onLeftPress={()=>this.drawer._root.open()}  title={getLabel("Profile")}/>
          <Content navigation={this.props.navigation}>
            <Context.Consumer>
              {({appInfo,userInfo})=>{
                  if(!userInfo || userInfo.email==='public'){
                    return <RequireLoginWidget navigation={this.props.navigation} redirectTo="User"/>
                  }else{
                    return <View style={{flex:1,flexDirection:"column",justifyContent:"center"}}>
                      <TouchableOpacity style={{marginTop:20,flexDirection:"column",justifyContent:"center",alignItems:"center"}}  onPress={()=>this.navigate("UserInfo",{userInfo:userInfo})}>

                        <View style={{width:128,height:128,position:"relative"}} >
                          <View style={{position:"absolute",top:0,left:0,right:0,bottom:0}}>
                            <Image style={{width:128,height:128,overflow: "hidden",borderRadius:128/2}} resizeMode="cover" source={{uri: userInfo.picture.indexOf("http")>=0?userInfo.picture:server_url + userInfo.picture}}/>
                          </View>
                        </View>

                        <View>
                          <H3 style={{marginTop:10,textAlign:'center',color:mainTextColor}}>
                            {userInfo.name}
                          </H3>
                          <Text style={{textAlign:'center',color:mainTextColor}}>{userInfo.email}</Text>
                        </View>
                      </TouchableOpacity>

                      <List style={{marginBottom:20}}>
                        <ListItem icon onPress={()=>this.navigate("UserInfo",{userInfo:userInfo})}>
                          <Left>
                            <Button transparent>
                              <Icon  type="FontAwesome" name="user-circle-o"  style={{color:mainTextColor}} />
                            </Button>
                          </Left>
                          <Body>
                            <Text style={{color:mainTextColor}}>{getLabel("Hồ sơ cá nhân")}</Text>
                          </Body>
                          <Right>
                            <Icon name="ios-arrow-forward" />
                          </Right>
                        </ListItem>

                      {/*
                        <ListItem icon onPress={()=>this.navigate("Wallet",{userInfo:userInfo})}>
                          <Left>
                            <Button transparent>
                              <Icon  type="FontAwesome" name="money"  style={{color:mainTextColor}} />
                            </Button>
                          </Left>
                          <Body>
                            <Text style={{color:mainTextColor}}>{getLabel("Điểm thưởng")}</Text>
                          </Body>
                          <Right>
                            <Icon name="ios-arrow-forward" />
                          </Right>
                        </ListItem>
                        */}

                          {/*<ListItem icon onPress={()=>this.navigate("Notifications",{userInfo:userInfo})}>
                            <Left>
                              <Button transparent>
                                <Icon  name='ios-notifications'  style={{color:mainTextColor}} />
                              </Button>
                            </Left>
                            <Body>
                              <Text style={{color:mainTextColor}}>{getLabel("Thông báo")}</Text>
                            </Body>
                            <Right>
                              <Badge><Text>{this.state.numberNotifications>9?'9+':this.state.numberNotifications}</Text></Badge>
                            </Right>
                          </ListItem>*/}


                          <ListItem icon  onPress={()=>this.navigate("ChangePassword",{userInfo:userInfo})}>
                            <Left>
                              <Button transparent>
                                <Icon    name="ios-cog" style={{color:mainTextColor}} />
                              </Button>
                            </Left>
                            <Body>
                              <Text style={{color:mainTextColor}}>{getLabel("Đổi mật khẩu")}</Text>
                            </Body>
                            <Right>
                              <Icon name="ios-arrow-forward" />
                            </Right>
                          </ListItem>

                          <ListItem icon  onPress={()=>this.logout()}>
                            <Left>
                              <Button transparent>
                                <Icon  type="FontAwesome"  name="sign-out" style={{color:mainTextColor}} />
                              </Button>
                            </Left>
                            <Body>
                              <Text style={{color:mainTextColor}}>{getLabel("Đăng xuất")}</Text>
                            </Body>
                            <Right>
                              <Icon name="ios-arrow-forward" />
                            </Right>
                          </ListItem>
                      </List>
                    </View>
                  }
              }}
            </Context.Consumer>
          </Content>
          <Footer navigation={this.props.navigation} path="User"/>
      </Container>
    </Drawer>
    );
  }
}
User.contextType = Context;
export default User;
