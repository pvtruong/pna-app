import React from 'react';
import {server_url,id_app,baseUrl} from './../Config.js';
import {Alert,View,TouchableOpacity,RefreshControl,ActivityIndicator,FlatList,InteractionManager,Animated} from 'react-native';
import {DeviceEventEmitter} from 'react-native';
import {moneyStyle,discountStyle,screenCenter,pageBackground,listItem,mainTextColor,mainColor,mainButtonColor,loading} from "./../style.js";
import {asyncGet,asyncPut,asyncDelete,getLabel} from "./../API.js";
import Numeral from "numeral";
import equal from 'fast-deep-equal';
import Moment from "moment";
import Context  from '../Context';
import { Image } from 'react-native-elements';
//import { GestureHandler } from 'expo';
//Numeral.locale('vi');
console.disableYellowBox = true;
import {
  Content,Left,Right,Body
  ,Text,Title,Icon,Button,Spinner,Thumbnail
  ,ListItem,CheckBox,Segment,Label,Input,Item,Toast,ActionSheet
} from 'native-base';
class NotificationWidget extends React.Component {
  constructor(props){
    super(props);
    this.navigate = this.props.navigation.navigate;
    this.condition = this.props.condition;
    this.page=1;
    this.state={
      notifications:[],
      refreshing:true
    }
  }
  async componentDidMount() {
    this.mounted = true;
    this.page=1;
    this.loadNotifications(this.condition,this.page);
    this.listenerNotificationRemoved = DeviceEventEmitter.addListener("notificationRemoved",(e)=>{
      this.state.notifications = this.state.notifications.filter(f=>f._id!==e._id);
      if(this.mounted) this.setState({notifications:this.state.notifications});
    })

    this.listenerNotificationRead = DeviceEventEmitter.addListener("notificationRead",(e)=>{
      this.state.notifications.forEach(n=>{
        if(n._id===e._id){
          n.read= true;
        }
      })
      if(this.mounted) this.setState({notifications:this.state.notifications});
    })

    this.listenerNotificationChanged = DeviceEventEmitter.addListener("notificationAdded",async (e)=>{
      let url = `${server_url}/api/notification/${e._id}?access_token=${this.context.userInfo.token}`;
      try{
        let n = await asyncGet(url,null);
        this.state.notifications.unshift(n);
        if(this.mounted) this.setState({notifications:this.state.notifications})
      }catch(e){
        console.log(e.message);
      }
    })
  }
  componentWillUnmount(){
    this.mounted = false;
    DeviceEventEmitter.removeListener('notificationRemoved');
    DeviceEventEmitter.removeListener('notificationRead');
    DeviceEventEmitter.removeListener('notificationAdded');
  }
  componentDidUpdate(prevProps) {
    if(!equal(prevProps.condition,this.props.condition)){
      this.page = 1;
      this.condition = this.props.condition;
      this.loadNotifications(this.condition,this.page);
    }
  }
  async loadNotifications(condition,page,append=false){
    if(this.mounted) this.setState({refreshing: true});
    if(!condition) condition={};
    if(!page) page =1;
    let url = `${server_url}/api/notification?page=${page}&q=${JSON.stringify(condition)}&access_token=${this.context.userInfo.token}`;
    //
    let notifications;
    try{
      notifications = await asyncGet(url);
      notifications = JSON.parse(notifications);
      this.page = page;
      this.condition = condition;
      notifications.forEach(item=>{
        this.setRead(item);
      })
      if(append){
        notifications = (this.state.notifications||[]).concat(notifications);
      }
      if(this.mounted) this.setState({notifications:notifications});
    }catch(e){
      Alert.alert(e.message);
    }finally{
      if(this.mounted) this.setState({refreshing: false});
    }
  }
  async setRead(item){
    if(item.read) return;
    let url = `${server_url}/api/notification/${item._id}?access_token=${this.context.userInfo.token}`;
    try{
      await asyncPut(url,null,{read:true});
      setTimeout(()=>{
        item.read = true;
        DeviceEventEmitter.emit("notificationRead",item);
      },5000)
    }catch(e){
      console.log(e.message);
    }
  }
  async detail(p){
    if(p.exfields && p.exfields._id && p.exfields.code && p.exfields.code.toLowerCase()==="so3"){
      this.navigate("BookingDetail",{order:p.exfields});
      return;
    }
    if(p.exfields && p.exfields._id && p.exfields.code && p.exfields.code.toLowerCase()==="transaction"){
      this.navigate("Wallet",{});
      return;
    }
    this.navigate("NotificationDetail",{userInfo:this.context.userInfo,notification:p});
  }
  async deleteNotify(item){
    if(this.mounted) this.setState({running: true});
    try{
      let url = `${server_url}/api/notification/${item._id}?access_token=${this.context.userInfo.token}`;
      await asyncDelete(url);
      DeviceEventEmitter.emit("notificationRemoved",item);
    }catch(e){
      Alert.alert(e.message);
    }finally{
      if(this.mounted) this.setState({running: false});
    }
  }
  onEndReached() {
      if(this.state.notifications.length<20*this.page){
        return;
      }
      if (!this.state.refreshing) {
        this.page = this.page+1;

        this.loadNotifications(this.condition,this.page,true)
      }
  }
  sheetAction(item){
    ActionSheet.show(
      {
        options: [getLabel("Chi tiết"),getLabel("Xoá"),getLabel("Đóng")],
        cancelButtonIndex: 2,
        destructiveButtonIndex: 1
      },
      buttonIndex => {
        if(buttonIndex===1){
          return this.deleteNotify(Object.assign({},item));
        }
        if(buttonIndex===0){
          this.detail(Object.assign({},item));
        }
      }
    )
  }
  render() {
     if(!this.state.refreshing && this.state.notifications.length===0)
     return (
       <View style={{flex:1,flexDirection:"column",justifyContent:"center",alignItems:"center"}}>
         <Text style={{textAlign:"center",marginBottom:10}}>{getLabel("Không có thông báo nào.")}</Text>
         <Image source={require("../assets/bg_no_data.png")} style={{width:150,height:150}} resizeMode="contain"    placeholderStyle={{backgroundColor:"transparent"}} PlaceholderContent={<ActivityIndicator />}/>
       </View>
     )

    return (
      <View style={{flex:1}}>
        {this.state.running?
          <View style={loading}>
            <Spinner />
          </View>
          :null
        }
        <FlatList
          ListFooterComponent={() => { return this.state.refreshing?<Spinner small/>:<Text></Text> }}
          onEndReached={()=>this.onEndReached()}
          onEndReachedThreshold={0.01}
          data={this.state.notifications}
          keyExtractor={(item, index) => item._id}
          style={{flex:1}}
          renderItem={({item,index})=>
            <TouchableOpacity onPress={()=>this.detail(item)} onLongPress={()=>this.sheetAction(item)}
              style={{padding:10,borderBottomColor:"silver",borderBottomWidth:.5,marginBottom:0,flexDirection:"row",alignItems:"center"}}>
                <View style={{flexDirection:"column",flex:1}}>
                  <View>
                    <Text style={{fontWeight:item.read?'normal':'bold'}}>{item.title}</Text>
                  </View>
                  <Text note>{Moment(item.date_created).format("DD/MM/YY hh:mm a")}</Text>
                </View>
                <View style={{flexDirection:"row",justifyContent:"center",alignItems:"center"}}>
                  <Button transparent success  onPress={()=>this.sheetAction(item)}>
                      <Icon name="ios-cog"/>
                  </Button>
                </View>
            </TouchableOpacity>
          }
        />
      </View>
    );
  }
}
NotificationWidget.contextType = Context;
export default NotificationWidget;
