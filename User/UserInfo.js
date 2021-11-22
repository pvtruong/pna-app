import React from 'react';
import {server_url,baseUrl,group_id_partner,SLUG_APP_FOR_CUSTOMER,app_name} from './../Config.js';
import {Alert,View,AsyncStorage,TouchableOpacity,ActivityIndicator,StyleSheet,ScrollView,ImageBackground} from 'react-native';
import {textCenter,headerPageStyle,screenCenter,pageBackground,mainColor,mainTextColor,loading,mainButtonColor} from "./../style.js";
import {asyncPost,asyncGetUserInfoByToken,asyncUploadAvatar,getLabel,cachedData,asyncLogoutAPI} from "./../API.js";
import {Left,Right,Body,Text,Icon,Button,Thumbnail,Form,Label,Input,Item,Toast,Textarea,Spinner } from 'native-base';
import * as ImagePicker from 'expo-image-picker';
import * as Permissions from 'expo-permissions';
import KeyboardAvoidingContent from '../Components/KeyboardAvoidingContent';
import Header from "../Components/Header.js";
import Footer from "../Components/Footer.js";
import Content from "../Components/Content.js";
import Container from "../Components/Container.js";
import Context from "../Context";
import Constants from 'expo-constants';
import { TabView,TabBar } from 'react-native-tab-view';
import { Image } from 'react-native-elements';
import equal from 'fast-deep-equal';
class UserInfo extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      header:null
    }
  };
  constructor(props){
    super(props);
    this.navigate = this.props.navigation.navigate;
    this.renderContent = this.renderContent.bind(this);
    this.renderProfiles = this.renderProfiles.bind(this);
    this.captureImage = this.captureImage.bind(this);
    this.uploadImage = this.uploadImage.bind(this);
    this.updateUserInfo = this.updateUserInfo.bind(this);
    this.save = this.save.bind(this);
    this.logout = this.logout.bind(this);
    this.state={
      userInfo:{},
      tabview:{
        index:0,
        routes:[
          {key:0,title:getLabel("Thông tin tài khoản")},
          {key:1,title:getLabel("Hồ sơ người thân")}
        ]
      }
    }
  }
  async componentDidMount() {
    this.mounted = true;
  }
  async componentWillUnmount(){
    this.mounted = false;
  }
  tabIndexChanged(index){
    this.state.tabview.index = index;
    if(this.mounted)this.setState({tabview:this.state.tabview})
  }
  updateUserInfo(e){
    this.state.userInfo = Object.assign(this.state.userInfo,e);
    this.setState({userInfo:this.state.userInfo});
  }
  async uploadImage(){
    let { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
    if (status !== 'granted') {
      console.log('Permission to access image library was denied');
      return;
    }
    try{
      let result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [4, 3],
      });

      if (!result.cancelled) {
        if(this.mounted) this.setState({running:true});
        let rs = JSON.parse(await asyncUploadAvatar(this.context.userInfo.token,result.uri));
        this.updateUserInfo({picture:rs.image});
      }
    }catch(e){
      Alert.alert(e.message);
    }finally{
      if(this.mounted) this.setState({running:false});
    }

  }
  async captureImage(){
    let { status } = await Permissions.askAsync(Permissions.CAMERA);
    if (status !== 'granted') {
      console.log('Permission to access camera was denied');
      return;
    }
    try{
      let result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
      });

      if (!result.cancelled) {
        if(this.mounted) this.setState({running:true});
        let rs = JSON.parse(await asyncUploadAvatar(this.context.userInfo.token,result.uri));
        this.updateUserInfo({picture:rs.image});
      }
    }catch(e){
      Alert.alert(e.message);
    }finally{
      if(this.mounted) this.setState({running:false});
    }
  }

  async save(){
    let data = Object.assign({},this.context.userInfo,this.state.userInfo);
    delete data.local;
    if(!data.name){
      Alert.alert(getLabel("Bạn chưa cập nhật tên của bạn"));
      return;
    }
    if(!data.phone){
      Alert.alert(getLabel("Bạn chưa cập nhật số điện thoại"));
      return;
    }
    if(this.mounted) this.setState({running:true})
    let url = server_url + "/api/updateprofile?access_token=" + this.context.userInfo.token;
    try{
      await asyncPost(url,null,data);
      const userInfo  = await asyncGetUserInfoByToken(this.context.userInfo.token);
      userInfo.token = this.context.userInfo.token;
      this.context.setUserInfo(Object.assign({},userInfo));
      this.setState({userInfo:Object.assign({},userInfo)});
      Alert.alert(app_name,getLabel("Thông tin cá nhân của bạn đã được cập nhật thành công"));
    }catch(e){
      Alert.alert(getLabel(e.message));
    }finally{
      if(this.mounted) this.setState({running:false})
    }
  }
  async logout(){
    this.context.logout();
  }
  renderContent(_userInfo){
    const userInfo = Object.assign({},_userInfo,this.state.userInfo);
    if(userInfo.picture===undefined || userInfo.picture==null) userInfo.picture =""
    if(this.state.tabview.index!==0) return <View style={{flex:1,backgroundColor:"white"}}/>;
    return (
      <View style={{flex:1}}>
        <View style={{flex:1,backgroundColor:"white"}}>
          <KeyboardAvoidingContent>
              <View  style={{marginTop:10,flexDirection:"row",justifyContent:"center",alignItems:"center"}}>

                <View style={{width:128,height:128,position:"relative"}}>
                  <TouchableOpacity style={{position:"absolute",top:0,left:0,right:0,bottom:0,overflow: "hidden",borderRadius:128/2}}  onPress={()=>this.captureImage()}>
                    <Image style={{width:128,height:128}} resizeMode="cover" source={!userInfo.picture?require("../assets/avatar.png"):{uri: userInfo.picture.indexOf("http")>=0?userInfo.picture:server_url + userInfo.picture}}   placeholderStyle={{backgroundColor:"transparent"}} PlaceholderContent={<ActivityIndicator />}/>
                  </TouchableOpacity>
                  <View style={{position:"absolute",right:-5,bottom:8}}>
                    <TouchableOpacity style={{backgroundColor:"white",width:32,height:32,overflow: "hidden",borderRadius:48/2,justifyContent:"center",flexDirection:'row',alignItems:'center',borderColor:'silver',borderWidth:0.5}} small onPress={()=>this.uploadImage()}>
                      <Icon type="FontAwesome" name="file-image-o" style={{fontSize:18,color:"#ECEEF0"}}/>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
              <Form style={{padding:5}}>
                <View style={{padding:5,flexDirection:"column"}}>
                  <Label>{getLabel("Username")} <Text style={{color:"red"}}>(*)</Text></Label>
                  <Input style={{backgroundColor:"white",padding:5,marginTop:5,borderColor:'silver',borderRadius:5,borderWidth:1}}  clearButtonMode ={'while-editing'} autoCorrect ={false} disabled value={userInfo.email}/>
                </View>
                <View style={{marginTop:5,padding:5,flexDirection:"column"}}>
                  <Label>{getLabel("Họ và tên")} <Text style={{color:"red"}}>(*)</Text></Label>
                  <Input style={{backgroundColor:"white",padding:5,marginTop:5,borderColor:'silver',borderRadius:5,borderWidth:1}} clearButtonMode ={'while-editing'} autoCorrect ={false} value={userInfo.name} onChangeText={(name)=>this.updateUserInfo({name})}/>
                </View>

                <View style={{marginTop:5,padding:5,flexDirection:"column"}}>
                  <Label>{getLabel("Điện thoại")} <Text style={{color:"red"}}>(*)</Text></Label>
                  <Input style={{backgroundColor:"white",padding:5,marginTop:5,borderColor:'silver',borderRadius:5,borderWidth:1}}  keyboardType ={'phone-pad'}   clearButtonMode ={'while-editing'} autoCorrect ={false} value={userInfo.phone}  onChangeText={(phone)=>this.updateUserInfo({phone})}/>
                </View>

                <View style={{marginTop:5,padding:5,flexDirection:"column"}}>
                  <Label>{getLabel("Địa chỉ")}</Label>
                  <Input multiline={true}  style={{height:60,backgroundColor:"white",padding:5,marginTop:5,borderColor:'silver',borderRadius:5,borderWidth:1}}   clearButtonMode ={'while-editing'} autoCorrect ={false} value={userInfo.address}  onChangeText={(address)=>this.updateUserInfo({address})}/>
                </View>

                <View style={{marginTop:5,padding:5,flexDirection:"column"}}>
                  <Label>{getLabel("Email")}</Label>
                  <Input style={{backgroundColor:"white",padding:5,marginTop:5,borderColor:'silver',borderRadius:5,borderWidth:1}}   clearButtonMode ={'while-editing'} autoCorrect ={false} value={userInfo.email2}  onChangeText={(email2)=>this.updateUserInfo({email2})}/>
                </View>
              </Form>

              <View  style={{marginTop:20,flexDirection:"column",alignItems:"center",justifyContent:'center'}} >
                {!equal(this.context.userInfo,userInfo) &&
                  <View style={{}}>
                    <Button rounded onPress={()=>this.save()} style={{backgroundColor:mainButtonColor,color:mainTextColor}}  disabled={this.state.running}>
                      <Text>{getLabel("Cập nhật")}</Text>
                    </Button>
                  </View>
                }
                <View style={{margin:20}}>
                  <Button transparent  onPress={()=>this.logout()} style={{marginTop:5}}  disabled={this.state.running}>
                    <Text>{getLabel("Đăng xuất")}</Text>
                  </Button>
                </View>
              </View>
          </KeyboardAvoidingContent>
        </View>
      </View>
    )
  }
  renderProfiles(){
    if(this.state.tabview.index!==1) return <View style={{flex:1,backgroundColor:"white"}}/>;
    return (
      <ProfileWidget navigation={this.props.navigation}  onScrollEndDrag={event=>this.onScrollEndDrag(event)}/>
    )
  }
  renderTabs(){
    if(Constants.manifest.slug !== SLUG_APP_FOR_CUSTOMER && 1==1){
      return this.renderContent(this.context.userInfo)
    }
    return (
      <TabView
        navigationState={this.state.tabview}

        renderTabBar={props =>
          <TabBar
            {...props}
            renderLabel={({ route, focused, color }) => (
              <Text style={{color:"white"}}>
                {route.title}
              </Text>
            )}
            onTabPress={({ route, preventDefault }) => {
              preventDefault();
              props.jumpTo(route.key)
              props.jumpTo(route.key)

            }}
            indicatorStyle={{ }}
            style={{backgroundColor:'transparent'}}
          />
        }
        renderScene = {({ route }) =>{
          if(route.key===0){
            return this.renderContent(this.context.userInfo)
          }else{
            return this.renderProfiles()
          }
        }}
        onIndexChange={index => this.tabIndexChanged(index)}
      />
    )
  }
  render() {
    return (
      <Container hasBackgroundView={true}>
        <Header hide={this.state.hideHeader}  navigation={this.props.navigation} color="white" onLeftPress={()=>this.props.navigation.goBack()} icon="ios-arrow-back" title={getLabel("Profile")}/>
        <Content navigation={this.props.navigation} scrollable={false} padder requireLogin>
          {this.renderTabs()}
          {this.state.running &&
            <View style={loading}>
              <Spinner />
            </View>
          }
        </Content>
        <Footer navigation={this.props.navigation} path="User"/>
      </Container>
    );
  }
}
UserInfo.contextType = Context;
export default UserInfo;
