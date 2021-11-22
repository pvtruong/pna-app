import React from 'react';
import {server_url,id_app,baseUrl} from './Config.js';
import {Alert,View,TouchableOpacity,RefreshControl,ActivityIndicator,FlatList,InteractionManager} from 'react-native';
import {headerPageStyle,pageBackground} from "./style.js";
import {asyncProducts,getCart,saveCart,asyncGet,followList,getLabel,cachedData} from "./API.js";

import FloorsWidget from "./Floor/FloorsWidget";

import KeyboardAvoidingContent from './Components/KeyboardAvoidingContent';

import Numeral from "numeral";

import Header from "./Components/Header.js";
import Footer from "./Components/Footer.js";
import Content from "./Components/Content.js";
import RequireLoginWidget from "./Components/RequireLoginWidget.js";
//Numeral.locale('vi');
import {
  Container,Left,Right,Body
  ,Text,Title,Icon,Button,Spinner,Thumbnail
  ,ListItem,CheckBox,Segment,Label,Input,Item,Toast,Badge,Drawer,FooterTab
  ,Tab, Tabs, ScrollableTab
} from 'native-base';
Drawer.defaultProps.styles.mainOverlay.elevation = 0;
export default class Favorites extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      header:null
    }
  }
  constructor(props){
    super(props);

    this.navigate = this.props.navigation.navigate;

    this.userInfo=cachedData.userInfo;

    this.token = this.userInfo.token;
    this.page=1;
    this.state={
      groups:[]
    }
    this.didFocusSubscription = this.props.navigation.addListener('willFocus',async (payload) => {
      this.loadFavorites();
    })
  }
  componentDidMount() {
    this.mounted = true;
    this.loadFavorites();
  }
  componentWillUnmount(){
    this.mounted = false;
    this.didFocusSubscription.remove();
  }
  async loadFavorites(){
    try{
      let fs = await followList(this.token,this.userInfo.email,"floordetail");
      let id_objects = fs.map(f=>f.id_object);
      let condition ={
        _id:{$in:id_objects}
      }
      if(this.mounted) this.setState({condition:condition});
    }catch(e){
      Alert.alert(e.message)
    }
  }
  renderDetail(){
    if(this.userInfo.email==='public') return <RequireLoginWidget navigation={this.props.navigation}  redirectTo="Favorites"/>
    if(!this.state.condition){
      return (
        <View style={{flex:1,flexDirection:"row",height:'100%',justifyContent:'center',alignItems:'center'}}>
          <ActivityIndicator />
        </View>
      )
    }else{
      return(
        <FloorsWidget
          style={{padding:0}}
          navigation={this.props.navigation}
          condition={this.state.condition}
          emptyComponent={()=>{
            return (
              <View style={{flex:1,justifyContent:'center'}}>
                <Text style={{textAlign:'center'}}>{getLabel("Bạn chưa thêm sản phẩm yêu thích nào")}</Text>
              </View>
            )
          }}
        />
      )
    }
  }
  render() {
    return (
      <Container>
        <Header onLeftPress={()=>this.props.navigation.goBack()} title ={getLabel("Sản phẩm yêu thích")}  icon="ios-arrow-back"  navigation = {this.props.navigation}/>
        <Content scrollable={false} navigation={this.props.navigation}>
          {this.renderDetail()}
        </Content>
        <Footer  path={"Favorites"} navigation={this.props.navigation}/>
      </Container>
    )
  }
}
