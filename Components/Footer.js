import React from 'react';
import {server_url,id_app,baseUrl,SLUG_APP_FOR_CUSTOMER} from './../Config.js';
import {Alert,View,TouchableOpacity,RefreshControl,ActivityIndicator,FlatList,Image} from 'react-native';
import {DeviceEventEmitter} from 'react-native';
import {moneyStyle,discountStyle,pageBackground,mainColor} from "./../style.js";
import {asyncGet,getCart,getNumberUnReadNotifications,getLabel,cachedData} from "./../API.js";
import {Platform} from 'react-native';
import Context  from '../Context';
import Constants from 'expo-constants';
import PropTypes from 'prop-types';
//Numeral.locale('vi');
import {
  Content,Left,Right,Body,Footer,FooterTab
  ,Text,Title,Icon,Button,Spinner,Thumbnail
  ,Card,CardItem,CheckBox,Segment,Label,Input,Item,Toast,Badge
} from 'native-base';
class FooterApp extends React.PureComponent {
  constructor(props){
    super(props);
    this.navigate =  this.props.navigation.navigate;
    this.state={
    }
  }
  componentDidMount() {
    this.mounted = true;
  }
  componentWillUnmount(){
    this.mounted = false;
  }
  renderOther(){
    if(!this.props.onExtraButtonClick) return null;
    return (
      <Button danger rounded small onPress={()=>this.props.onExtraButtonClick()}>
        <Text style={{color:'white'}}>{Platform.OS==='ios'?this.props.path:this.props.path.substring(0,2)}</Text>
      </Button>
    )
  }
  render() {
    return null;
    if(this.props.children){
      return this.props.children
    }
    return (
      <Footer>
        <FooterTab>
          <Button active={this.props.path==='Home'}   onPress={()=>this.navigate('Home')}>
              <Icon name='ios-home' style={{color:this.props.path==='Home'?mainColor:null}}/>
              <Text style={{fontSize:8}}>{getLabel("Home")}</Text>
          </Button>
          {this.renderOther()}
          {Constants.manifest.slug === SLUG_APP_FOR_CUSTOMER?
            <Context.Consumer>
              {({cart})=>{
                return (
                  <Button active={this.props.path==='Cart'}  badge onPress={()=>this.navigate('cartModal',{userInfo:this.context.userInfo})}>
                    <Badge><Text>{cart.length>9?'9+':cart.length}</Text></Badge>
                    <Icon  name='ios-cart'  style={{color:this.props.path==='Cart'?mainColor:null}}/>
                    <Text style={{fontSize:8}}>{getLabel("Giỏ hàng")}</Text>
                  </Button>
                )
              }}
            </Context.Consumer>

            :
            <Button active={this.props.path==='TaskList'}  onPress={()=>this.navigate('TaskList')}>
              <Icon  name='ios-calendar'  style={{color:this.props.path==='TaskList'?mainColor:null}}/>
              <Text style={{fontSize:8}}>{getLabel("Lịch")}</Text>
            </Button>
          }

          <Button active={this.props.path==='Wallet'}  onPress={()=>this.navigate('Wallet')}>
            <Icon  name='ios-wallet'  style={{color:this.props.path==='Wallet'?mainColor:null}}/>
            <Text  style={{fontSize:8}}>{getLabel("Ví")}</Text>
          </Button>
          <Button   active={this.props.path==='User'}  onPress={()=>this.navigate('User')}>
            <Icon ios='ios-contact' android="md-contact"   style={{color:this.props.path==='User'?mainColor:null}}/>
            <Text style={{fontSize:8}}>{getLabel("Cá nhân")}</Text>
          </Button>
        </FooterTab>
      </Footer>
    )
  }
}
FooterApp.contextType = Context;
FooterApp.propTypes={
  navigation:PropTypes.object.isRequired
}
export default  FooterApp;
