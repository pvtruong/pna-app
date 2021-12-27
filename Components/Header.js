import React from 'react';
import {linearBackgroundColor,headerBackgroundColor,headerColor,mainTextColor} from '../style.js';
import {View,TouchableOpacity,Linking,TextInput} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Text,Icon,Button,H1,H2,H3,Thumbnail} from 'native-base';
import {getLabel,cachedData} from "../API.js";
import {app_name} from "../Config.js";
//import CartButton from "../Shopping/CartButton.js";
import Context  from '../Context';
import equal from 'fast-deep-equal';
import Constants from 'expo-constants';
import {Badge, withBadge,Image,Avatar } from 'react-native-elements';
import PropTypes from 'prop-types';
const HEIGHT = 55;
const STATUS_BAR_HEIGHT = Constants.statusBarHeight + 0;




class Header extends React.Component {
  constructor(props){
    super(props);
    if(!this.props.onLeftPress){
      this.props.onLeftPress = ()=>{}
    }
    this.gotoSearchPage = this.gotoSearchPage.bind(this);
    
    this.state={
      text4Search:this.props.text4Search,
    }
  }
  componentDidUpdate(oldPros){
    
  }
  /*shouldComponentUpdate(nextProps, nextState){

  }*/

  gotoSearchPage(){
    if(!this.props.pathSearch) return;
    this.props.navigation.navigate(
      this.props.pathSearch,
      {userInfo:this.context.userInfo,conditionSearch:this.props.conditionSearch}
    )
  }
  onTitlePress(){
    if(this.props.onPress){
      this.props.onPress();
    }else{
      if(this.context.appInfo.phone) Linking.openURL(`tel:${this.context.appInfo.phone}`)
    }
  }
  renderSearh(numberNotifications){
    if(this.props.rightButton){
      return this.props.rightButton();
    }

    if(this.props.searchBar) return null;
    if(!this.props.navigation){
      return (
        <Button transparent style={{padding:20}}>

        </Button>
      )
    }
    return (
      <Button transparent  onPress={()=>this.props.navigation.navigate('About')} style={{paddingRight:10}}>
        <Avatar small rounded source={require("../assets/notification.png")}/>
      </Button>
    )
    return (
      <Button transparent  onPress={()=>this.props.navigation.navigate('Notifications')}>
        <Icon  name='ios-notifications' style={{color:"white"}}/>
        <Badge
          status="error"
          value={numberNotifications>9?'9+':numberNotifications}
          containerStyle={{ position: 'absolute', top: 5, right: 5 }}
        />
      </Button>
    )
  }
  search(){
    if(!this.state.text4Search) return;
    if(this.props.onSearch){
      this.props.onSearch(this.state.text4Search);
      return;
    }
    this.props.navigation.navigate(this.props.pathSearch || "SearchEvents",{userInfo:this.context.userInfo,text4Search:this.state.text4Search});
  }
  leftPress(){
    this.props.onLeftPress();
  }
  renderContent(){
    let appInfo = this.context.appInfo || {};
    return (
      <Context.Consumer>
        {({numberNotifications})=>{
            return <View>
              {this.props.children?
                this.props.children:
                <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingBottom:0}}>
                    <Button transparent onPress={()=>this.leftPress()} style={{marginLeft:10}}>
                      {this.props.icon?
                        <Icon name={this.props.icon} style={{color:this.props.color || headerColor,fontWeight:"bold"}}/>:
                        <Icon name={this.props.icon?this.props.icon:'ios-menu'} style={{color:this.props.color || headerColor,fontWeight:"bold"}}/>
                      }
                    </Button>
                    {this.props.searchBar?
                      <View style={{flex:1,height:45,flexDirection:'row',alignItems:'center',borderWidth:1,borderColor:"#DEDEDE",borderRadius:100,marginTop:5,marginBottom:5,marginRight:15,marginLeft:15,paddingLeft:10,paddingRight:10,borderRadius:50}}>
                        <Icon name="ios-search" style={{fontSize:18}} />
                        <TextInput style={{flex:1,marginLeft:10,color:this.props.color}} placeholder={getLabel("Tìm...")} value={this.state.text4Search} onChangeText={(text)=>this.setState({text4Search:text})} clearButtonMode ={'while-editing'}  onEndEditing={()=>this.search()} />
                      </View>
                      :
                      <TouchableOpacity onPress={()=>this.onTitlePress()}>
                        <View>
                          {this.props.subTitle && <Text style={{textAlign:'center',color:this.props.color || headerColor}}>{this.props.subTitle}</Text>}
                          <H3  style={{color:this.props.color || headerColor,textAlign:'center',marginTop:this.props.subTitle?0:0}}>
                            {this.props.title||app_name}
                          </H3>
                        </View>
                      </TouchableOpacity>
                    }


                    {this.renderSearh(numberNotifications)}

                </View>
              }
              {this.props.content?this.props.content:null}
            </View>
        }}
      </Context.Consumer>

    )
  }
  renderHeader(){

    if(this.props.style && this.props.style.position && this.props.style.position==="absolute"){
      return (
        <View  style={[{width:'100%',paddingTop:STATUS_BAR_HEIGHT,flexDirection:'column',justifyContent:'flex-end',position:'absolute',top:0,left:0,right:0,backgroundColor: headerBackgroundColor},this.props.style]}>
          {this.renderContent()}
        </View>
      )
    }
    return(
      <View  style={[{width:'100%',paddingTop:STATUS_BAR_HEIGHT,flexDirection:'column',justifyContent:'flex-end'},this.props.style]}>
          {this.renderContent()}
      </View>
    )
    return (
      <LinearGradient colors={linearBackgroundColor} style={[{width:'100%',paddingTop:STATUS_BAR_HEIGHT,flexDirection:'column',justifyContent:'flex-end'},this.props.style]}>
          {this.renderContent()}
      </LinearGradient>

    )
  }
  render() {
    return (
      <View style={{overflow:"hidden",marginTop: this.heightValue}}>
        {this.renderHeader()}
      </View>
    )
  }
}
Header.contextType = Context;
Header.propTypes={
  //navigation:PropTypes.object.isRequired
}
export default  Header;
