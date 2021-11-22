import React from 'react';
import {server_url,funcs,id_app,group_id_partner,SLUG_APP_FOR_CUSTOMER} from './Config.js';
import {inputStyle,headerPageStyle,textCenter,cardHeader,pageBackground,linearBackgroundColor,mainColor,mainTextColor,headerColor,cardSylte,mainButtonColor} from './style.js';
import {TouchableOpacity,View,ScrollView,Alert,FlatList,Platform,Linking,AsyncStorage} from 'react-native';

import {asyncProducts,registerForPushNotificationsAsync,asyncGetOrderDetail,asyncGetPromotionDetail,asyncGet,asyncGetDataById,asyncGetDataByIdShared,getLabel,asyncSetLang,getLanguage,cachedData} from "./API.js";
import Header from "./Components/Header.js";
import Footer from "./Components/Footer.js";
import Content from "./Components/Content.js";
import Container from "./Components/Container.js";
import {Text,Icon,Thumbnail,Drawer,Input,Toast,Button,H3,H1,H2} from 'native-base';
import Context  from './Context';

import { SectionGrid } from 'react-native-super-grid';

Drawer.defaultProps.styles.mainOverlay.elevation = 0;
import SideBar from './SideBar';
class Home extends React.PureComponent {
  static navigationOptions = ({ navigation }) => {
    return {
      header: null
    };
  }
  constructor(props){
    super(props);
    let navigation = this.props.navigation;
    this.navigate = navigation.navigate;
    this.funcs = funcs;
    this.state={
    }
  }
  async componentDidMount() {
  }
  componentWillUnmount(){
  }
  async setLang(){
    if(getLanguage()==="vi"){
      await asyncSetLang("en");
    }else{
      await asyncSetLang("vi");
    }
    this.navigate("AuthLoading");
  }
  openFunc(func){
    if(func.onPress){
      func.onPress(this.navigate,this.context.userInfo);
      return;
    }
    if(!func.path){
      //Alert.alert("Comming soon");
      return;
    }
    this.navigate(func.path,{userInfo:this.context.userInfo});
  }
  renderSession(){
    let funcs = this.funcs.filter(func=>{
      return !func.code || (func.visible!=false && this.context.userInfo.command.find(c=>c.ma_cn.toUpperCase()===func.code.toUpperCase()));
    })
    let sections = [...new Set(funcs.filter(f=>f.home).map(f=>f.group))].map(group=>{
      return {
        title:group,
        data:funcs.filter(f=>f.home && f.visible && f.group===group).map(group=>{
          group.backgroundColor = group.backgroundColor || "#1abc9c"//getRandomColor().code;
          return group;
        })
      }
    })

    return (
      <SectionGrid
        itemDimension={120}
        // staticDimension={300}
        // fixed
        spacing={5}
        sections={sections}
        style={{flex:1,marginTop:0}}
        renderItem={({ item, section, index }) => (
          <TouchableOpacity onPress={()=>this.openFunc(item)}
            style={{
              alignItems:'center',flexDirection:'column',justifyContent:'center',padding:5,margin:10,
              borderWidth:1,
              borderRadius:10,
              borderColor:item.backgroundColor,
              backgroundColor:item.backgroundColor,
              height: 100,
              fontWeight: '600',
            }}>
            <H3 style={{textAlign:'center',color:item.color||"white"}}>
             {getLabel(item.title)}
            </H3>
          </TouchableOpacity>
        )}
        renderSectionHeader={({ section }) => (
          <Text style={{
            flex: 1,
            fontSize: 15,
            fontWeight: '600',
            alignItems: 'center',
            color: 'black',
            padding: 10,
            textAlign:'center'
          }}>
            {section.title}
          </Text>
        )}
      />
    )
  }
  render() {
    return (
      <Drawer
        ref={(ref) => { this.drawer = ref; }}
        content={<SideBar navigation={this.props.navigation} drawer={this.drawer}/>}
        onClose={() => this.drawer._root.close()}>
        <Container hasBackgroundView={true}>
          <Header onLeftPress={()=>this.drawer._root.open()} color="white"  searchBar={false} hotline={false}  navigation={this.props.navigation}/>
          <Content scrollable={false} requireLogin={true} style={{backgroundColor:pageBackground.backgroundColor}}>
            {this.renderSession()}
          </Content>
          <Footer navigation={this.props.navigation} path="Home"/>
        </Container>
      </Drawer>
    );
  }
}
Home.contextType = Context
export default Home
