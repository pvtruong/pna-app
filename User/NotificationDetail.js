import React from 'react';
import {server_url,baseUrl} from './../Config.js';
import {Alert,View,ScrollView,TouchableOpacity,RefreshControl,ActivityIndicator,FlatList,Image,StyleSheet} from 'react-native';
import {DeviceEventEmitter} from 'react-native';
import {textCenter,headerPageStyle,pageBackground} from "./../style.js";
import {getCart,asyncDelete,asyncPut,getLabel} from "./../API.js";
import Numeral from "numeral";
import Moment from "moment";
import WebView from '../Components/WebView';
import Header from "../Components/Header.js";
import Content from "../Components/Content.js";
import Container from "../Components/Container.js";

//Numeral.locale('vi');
import {Left,Right,Body
  ,Text,Title,Icon,Button,Footer
  ,Spinner,Thumbnail,ListItem
  ,Label,Input
  ,Item,Toast,Badge
  ,DeckSwiper, Card, CardItem,H3,FooterTab
} from 'native-base';
export default class NotificationDetail extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      header:null
    }
  }
  constructor(props){
    super(props);
    this.navigate = this.props.navigation.navigate;
    this.userInfo = this.props.navigation.state.params.userInfo;
    this.Notification = this.props.navigation.getParam("notification")||{};
    this.token = this.userInfo.token;
    this.page=1;
    this.state={
    }
  }
  async componentDidMount() {
    /*if(this.Notification.read) return;
    let url = `${server_url}/api/notification/${this.Notification._id}?access_token=${this.token}`;
    try{
      await asyncPut(url,null,{read:true});
      this.Notification.read = true;
      DeviceEventEmitter.emit("notificationRead",this.Notification);
    }catch(e){
      console.log(e.message);
    }*/
  }
  componentWillUnmount(){
  }
  async removeNotification(){
    Alert.alert(
      'Do you want to delete this notification?',
      '',
      [
        {text: 'Okey', onPress: async () => {
          try{
            let url = `${server_url}/api/notification/${this.Notification._id}?access_token=${this.token}`;
            await asyncDelete(url);
            DeviceEventEmitter.emit("notificationRemoved",this.Notification);
            this.props.navigation.goBack();
          }catch(e){
            Alert.alert(e.message);
          }
        }},
        {text: 'Cancel', style: 'cancel'}
      ],
      { cancelable: false }
    )
  }
  render() {
    return (
      <Container hasBackgroundView={true}>
        <Header  navigation={this.props.navigation} color="white" onLeftPress={()=>this.props.navigation.goBack()} icon="ios-arrow-back" title={getLabel("Chi tiết thông báo")}>
        </Header>
        <Content navigation={this.props.navigation} scrollable={false} padder  style={pageBackground}>
          <View style={{flex:1}}>
            <ScrollView  style={{flex:1}} contentContainerStyle={{flexGrow:1,padding:10,justifyContent:'center',alignItems:'center'}}>
              <View style={{padding:10,borderRadius:5}}>
                <H3 style={{textAlign:'center',padding:5}}>{this.Notification.title}</H3>
                {this.Notification.content!==this.Notification.title && <WebView source={{html: `${this.Notification.content||''}`}} />}
                <View style={{flexDirection:'row',justifyContent:'flex-end'}}>
                  <Text note>{Moment(this.Notification.date_created).format("DD/MM/YY hh:mm a")}</Text>
                </View>
              </View>
            </ScrollView>
            <View style={{flexDirection:'row',justifyContent:'center',alignItems:'center',marginBottom:20}}>
              <Button danger rounded onPress={()=>this.removeNotification()}>
                <Icon type="FontAwesome" name="trash-o"/>
                <Text>{getLabel("Xoá")}</Text>
              </Button>
            </View>
          </View>
        </Content>
      </Container>
    );
  }
}
