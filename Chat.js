import React from 'react';
import {server_url,server_url_report,id_app,baseUrl,ds_gia_ban,ds_dien_tich,ds_phong_ngu} from './Config.js';
import {Alert,View,TouchableOpacity,RefreshControl,ActivityIndicator,FlatList,StyleSheet,ScrollView,Clipboard,Platform,Linking} from 'react-native';

import {DeviceEventEmitter} from 'react-native';

import {headerPageStyle,pageBackground,mainColor} from "./style.js";
import {asyncProducts,addToCart,asyncGet,asyncPut,asyncPost,asyncDelete,getLabel,asyncUploadAvatar,cachedData} from "./API.js";
import FloorsWidget from "./Floor/FloorsWidget";
import Numeral from "numeral";
import * as Animatable from 'react-native-animatable';
import Header from "./Components/Header.js";
import Footer from "./Components/Footer.js";
import Content from "./Components/Content.js";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { GiftedChat,InputToolbar,Actions,Send,MessageText } from 'react-native-gifted-chat'

import {Location } from 'expo';
import MapView from 'react-native-maps';
import * as ImagePicker from 'expo-image-picker';
import * as Permissions from 'expo-permissions';
import RequireLoginWidget from "./Components/RequireLoginWidget.js";
//Numeral.locale('vi');
import {
  Container,Left,Right,Body
  ,Text,Title,Icon,Button,Spinner,Thumbnail
  ,ListItem,CheckBox,Segment,Label,Input,Item,Toast,Badge,Drawer,Picker,ActionSheet
  ,Tab, Tabs, ScrollableTab,FooterTab,Form
} from 'native-base';
export default class Chat extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      header:null
    }
  }
  constructor(props){
    super(props);
    this.onPressPhoneNumber = this.onPressPhoneNumber.bind(this);
    this.onPressUrl = this.onPressUrl.bind(this);
    this.onPressEmail = this.onPressEmail.bind(this);
    this.renderCustomActions = this.renderCustomActions.bind(this);
    this.renderCustomView =  this.renderCustomView.bind(this);
    this.renderMessageText =  this.renderMessageText.bind(this);
    this.uploadImage = this.uploadImage.bind(this);
    this.sendMyLocation = this.sendMyLocation.bind(this);

    this.navigate = this.props.navigation.navigate;
    this.userInfo=cachedData.userInfo;
    this.userChat=this.props.navigation.state.params.userChat;
    this.token = this.userInfo.token;
    this.page=1;
    this.object = (this.props.navigation.state.params.object||{});

    let conditionChat = this.props.navigation.state.params.conditionChat||{};
    this.state={
      messages: []
    }
  }
  componentDidMount() {
    this.listenerCommentChanged = DeviceEventEmitter.addListener(this.userChat.support_user + 'MessageAdded', async (data)=>{
      try{
        if(this.state.messages.find(m=>m._id===data._id)){
          return;
        }
        let message = this.convertData2Message(data);
        this.setState(previousState => ({
          messages: GiftedChat.append(previousState.messages, [message]),
        }))
        await this.setRead(data);
      }catch(e){
        Alert.alert(e.message)
      }
    })
    this.loadMessages();
  }
  hideCondition(){
  }
  componentWillUnmount(){
    DeviceEventEmitter.removeListener(this.userChat.support_user + 'MessageAdded');
  }
  componentWillMount() {
  }
  async setRead(data){
    try{
      let url = `${server_url_report}/api/message/${data._id}?access_token=${this.userInfo.token}`;
      data.read = true;
      await asyncPut(url,null,{read:true});
    }catch(e){
    }
  }
  onLoadEarlier(){
    this.loadMessages(this.currentPage?this.currentPage+1:1);
  }
   convertData2Message(data){
    let msg= {
      _id: data._id,
      text: (data.image || data.location || data.audio || data.video?'':data.content),
      location:data.location,
      image:(data.image?`${server_url_report}${data.image}?access_token=${this.token}&size=S`:null),
      video:(data.video?`${server_url_report}${data.video}?access_token=${this.token}`:null),
      audio:(data.audio?`${server_url_report}${data.audio}?access_token=${this.token}`:null),
      object:(data.object||{}),
      user: {
        _id: data.email_sender,
        name: data.name_sender||data.email_sender,
        avatar: `${server_url}/api/avatar?email=${data.email_sender}&access_token=${this.userInfo.token}`,
      }
    }
    if(!data.date_created){
      msg.createdAt = new Date();
    }else{
      msg.createdAt = new Date(data.date_created);
    }
    if(!data.read){
      this.setRead(data);
    }
    return msg;
  }
  async loadMessages(page=1){
    //load messages
    try{
      this.setState({isLoadingEarlier:true});
      let sort ={date_created:-1};
      let url = `${server_url}/api/message/chat/${this.userChat.support_user}?sort=${JSON.stringify(sort)}&page=${page}&access_token=${this.userInfo.token}`;
      let _mss =  JSON.parse(await asyncGet(url));
      this.setState({isLoadingEarlier:false});
      let messages = _mss.map(data=>{
        return this.convertData2Message(data);
      });
      this.currentPage = page;
      if(page>1){
        messages = this.state.messages.concat(messages);
      }
      this.setState({
        messages:messages
      })

    }catch(e){
      this.setState({isLoadingEarlier:false});
      Alert.alert(e.message)
    }
  }
  async deleteMessage(message){
    try{
      let url = `${server_url}/api/message/${message._id}?access_token=${this.userInfo.token}`;
      await asyncDelete(url);
      this.setState({
        messages:this.state.messages.filter(m=>m._id!==message._id)
      })
    }catch(e){
      Alert.alert(e.message);
    }
  }
  async onSave(message){
    let url = `${server_url}/api/message?access_token=${this.userInfo.token}`;
    let _msg ={
      email_sender: this.userInfo.email,
      email_receiver: this.userChat.support_user,
      title: message.text,
      content: message.text,
      image:message.image,
      audio:message.audio,
      video:message.video,
      location:message.location,
      object:this.object,
      read: false
    }
    try{
      let _rss = await asyncPost(url,null,_msg);
      let _message =  this.convertData2Message(JSON.parse(_rss));
      this.setState(previousState => {
        let messages = previousState.messages.filter(m=>m._id!==message._id);
        return  {
          messages: GiftedChat.append(messages, [_message]),
        }
      })
    }catch(e){
      message.error = e.message;
      this.setState(previousState => {
        let messages = previousState.messages.filter(m=>m._id!==message._id);
        return  {
          messages: GiftedChat.append(messages, [message]),
        }
      })
    }
  }
  async onSend(messages){
    if(messages.length>0){
      messages[0].sending = true;
      this.setState(previousState => ({
        messages: GiftedChat.append(previousState.messages, messages),
      }))
      await this.onSave(messages[0]);
    }
  }
  renderInputToolbar (props) {
    return <InputToolbar {...props} containerStyle={{}} />
  }
  renderMessageObject(props){
    if(!props.currentMessage.object.title) return null;

    return(
      <TouchableOpacity onPress={()=>{
        if(props.currentMessage.object.appUrl){
          this.navigate(props.currentMessage.object.appUrl,{userInfo:this.userInfo,obj:{_id:props.currentMessage.object.id}})
        }
      }}>
        <Text style={{padding:10,fontSize:13,color:mainColor}}>{props.currentMessage.object.title}</Text>
      </TouchableOpacity>
    )

  }
  renderCustomView(props){
    if(props.currentMessage.sending){
      return (
        <ActivityIndicator />
      )
    }

    if(props.currentMessage.error){
      return (
        <View>
          {this.renderMessageObject(props)}
          <Text style={{padding:10,fontSize:13,color:'red'}}>{getLabel("Can't send this message. Error: ") + props.currentMessage.error}</Text>
        </View>
      )
    }

    if (props.currentMessage.location) {
      return (
        <View style={props.containerStyle}>
          {this.renderMessageObject(props)}
          <MapView
              style={{ width: 150,
                height: 100,
                borderRadius: 13,
                margin: 3}}
              region={{
                latitude: props.currentMessage.location.latitude,
                longitude: props.currentMessage.location.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              }}
              scrollEnabled={false}
              liteMode ={true}
              cacheEnabled ={true}
              zoomEnabled={false}
            >
              <MapView.Marker
                coordinate={{
                latitude: props.currentMessage.location.latitude,
                longitude: props.currentMessage.location.longitude
                }}
              />
            </MapView>
        </View>
      );
    }
    return this.renderMessageObject(props);
  }
  renderMessageText(props){
    return <MessageText {...props}/>
  }
  onLongPress(context, message){
    ActionSheet.show(
      {
        options: ["Copy","Delete","Cancel"],
        cancelButtonIndex: 2,
        destructiveButtonIndex: 1
      },
      buttonIndex => {
        if(buttonIndex===1){
          return this.deleteMessage(Object.assign({},message));
        }
        if(buttonIndex===0){
          Clipboard.setString(message.text);
        }
      }
    )
  }
  onPressPhoneNumber = (phone)=>{
    Linking.openURL(`tel:${phone}`);
  }
  onPressUrl = (url)=>{
    Linking.openURL(`${url}`);
  }
  onPressEmail = (email)=>{
    Linking.openURL(`mailto:${email}`);
  }

  async uploadImage(){
    let { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
    if (status !== 'granted') {
      Alert.alert(getLabel('Bạn phải cho phép chương trình truy cập thư viện hình ảnh'));
      return;
    }
    try{
      let result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [4, 3],
      });
      if (!result.cancelled) {
        let message ={
          user:{
            _id: this.userInfo.email
          },
          sending:true,
          _id:(new Date()).getTime()
        }
        this.setState(previousState => ({
          messages: GiftedChat.append(previousState.messages, [message]),
        }))

        let rs = JSON.parse(await asyncUploadAvatar(this.token,result.uri,"CHAT"));
        message.image = rs.image;
        message.text="Send image";
        await this.onSave(message);
      }
    }catch(e){
      Alert.alert(e.message);
    }
  }
  async sendMyLocation(){
    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== 'granted') {
      Alert.alert(getLabel("Không thể xác định được vị trí hiện tại của bạn. Hãy mở GPS và cho phép chương trình này có quyền truy cập vị trí của bạn"));
      return;
    }

    let message ={
      text:"",
      user:{
        _id: this.userInfo.email
      },
      sending:true,
      _id:(new Date()).getTime()
    }
    this.setState(previousState => ({
      messages: GiftedChat.append(previousState.messages, [message]),
    }))

    let location = await Location.getCurrentPositionAsync({enableHighAccuracy: false});
    let defaultLocaltion =location.coords;
    let myLocation = Object.assign(defaultLocaltion);

    message.location = myLocation;
    message.text="Send location";
    await this.onSave(message);
  };

  renderCustomActions(props) {
    const options = {
      'Send a image': (props) => {
        this.uploadImage();
      },
      'Send my location': (props) => {
        this.sendMyLocation();
      },
      'Cancel': () => {},
    };
    return (
      <Actions
        {...props}
        options={options}
      />
    );
  }
  render() {
    return (
      <Container>
        <Header onLeftPress={()=>this.props.navigation.goBack()}  icon="ios-arrow-back" title ={getLabel("Trò chuyện")} subTitle={this.userChat.support_name}>
        </Header>
        <Content navigation={this.props.navigation}  scrollable={false} >
          {this.userInfo.email==='public'?
            <RequireLoginWidget navigation={this.props.navigation}/>
            :
            <KeyboardAwareScrollView
              extraScrollHeight={Platform.OS==='ios'?0:120}
              enableOnAndroid={true}
              keyboardShouldPersistTaps='handled' contentContainerStyle={{flex:1}}>
              <GiftedChat
                  messages={this.state.messages}
                  onSend={messages => this.onSend(messages)}
                  renderInputToolbar={this.renderInputToolbar}
                  onLongPress = {(context, message)=>this.onLongPress(context, message)}
                  renderUsernameOnMessage={true}
                  onLoadEarlier = {()=>this.onLoadEarlier()}
                  isLoadingEarlier={this.state.isLoadingEarlier}
                  renderActions={this.renderCustomActions}
                  renderCustomView={this.renderCustomView}

                  loadEarlier ={true}
                  user={{
                    _id: this.userInfo.email,
                  }}
                  renderMessageText={this.renderMessageText}
                  renderSend ={(props)=> {
                      return (
                        <View style={{flexDirection:'row'}}>
                          <Send {...props}/>
                          <Button transparent onPress={()=>this.uploadImage()}>
                            <Icon name='ios-photos'/>
                          </Button>
                          <Button transparent onPress={()=>this.sendMyLocation()}>
                            <Icon name='ios-pin'/>
                          </Button>
                        </View>
                      );
                  }}
                />
            </KeyboardAwareScrollView>
          }

        </Content>
      </Container>
    )
  }
}
