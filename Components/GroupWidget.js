import React from 'react';
import {server_url,id_app,baseUrl} from './../Config.js';
import {Alert,View,TouchableOpacity,RefreshControl,ActivityIndicator,FlatList,Image,InteractionManager,StyleSheet} from 'react-native';
import {moneyStyle,discountStyle,linearBackgroundColor,groupItemStyle,screenCenter,pageBackground} from "./../style.js";
import {asyncGet} from "./../API.js";
import Numeral from "numeral";
import equal from 'fast-deep-equal';
import Moment from "moment";
import PropTypes from 'prop-types';
import { LinearGradient } from 'expo-linear-gradient';
//Numeral.locale('vi');
import {
  Content,Left,Right,Body
  ,Text,Title,Icon,Button,Spinner,Thumbnail
  ,Card,CardItem,CheckBox,Segment,Label,Input,Item,Toast
} from 'native-base';

import {Dimensions} from 'react-native';
const { width: viewportWidth, height: viewportHeight } = Dimensions.get('window');
let _w = (viewportWidth-60-20)/3;
let _h = _w;

class GroupWidget extends React.Component {
  constructor(props){
    super(props);
    this.navigate = this.props.navigation.navigate;
    this.userInfo=this.props.navigation.state.params.userInfo;
    this.token = this.userInfo.token;
    this.page=1;
    this.state={
      Group:[]
    }
  }
  componentDidMount() {
    InteractionManager.runAfterInteractions(() => {
      this.loadGroup(this.page);
    });
  }
  componentWillUnmount(){
  }
  componentDidUpdate(prevProps) {
  }
  openGroup(g){
    this.props.onPress(g);
  }
  async loadGroup(page,append=false){
    this.setState({refreshing: true});
    let condition={status:true,group_type:this.props.groupType};
    if(!page) page =1;
    let url = `${server_url}/api/${id_app}/group?page=${page}&q=${JSON.stringify(condition)}&access_token=${this.token}`;
    //
    let Group;
    try{
      Group = await asyncGet(url);
      Group = JSON.parse(Group);
      if(append){
        Group = (this.state.Group||[]).concat(Group);
      }
      this.setState({Group:Group});
    }catch(e){
      Alert.alert(e.message);
    }
    //
    this.setState({refreshing: false});
  }
  onEndReached() {
      if(this.state.Group.length<20*this.page){
        return;
      }
      if (!this.state.refreshing) {
        this.page = this.page+1;
        this.loadGroup(this.page,true)
      }
  }
  render() {
    if(!this.state.Group){
      return (
        <View style={screenCenter}>
          <ActivityIndicator />
        </View>
      )
    }

    return (
      <View style={{flexDirection:'row',justifyContent:'space-between',flexWrap:'wrap'}}>
        {this.state.Group.map(g=>(
          <TouchableOpacity onPress={()=>this.openGroup(g)}  key={g._id} style={{width:_w,height:_h,marginTop:10}}>
            <LinearGradient colors={groupItemStyle.colors} style={groupItemStyle.style}>
              <Text>{g.group_name}</Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </View>
    );
  }
}
GroupWidget.propTypes={
  groupType:PropTypes.string.isRequired,
  onPress:PropTypes.func.isRequired
}
export default GroupWidget;
