import React from 'react';
import {server_url,baseUrl,id_app} from './../Config.js';
import {Alert,Image,StyleSheet,View,ScrollView,Modal} from 'react-native';
import {headerPageStyle,pageBackground,loading,mainColor} from './../style.js';
import {getLabel,asyncGet} from "./../API.js";
import {Text,Form,Icon,Button,Label,Input,Item,Toast,Spinner } from 'native-base';
import Picker from "../Components/Picker.js";
import KeyboardAvoidingContent from './KeyboardAvoidingContent';
import Header from "./Header.js";
import Footer from "./Footer.js";
import Content from "./Content.js";
import Container from "./Container.js";
import Table from "./Table.js";
import DateTimePicker from "./DateTimePicker.js";
import Context from "../Context";
import Moment from 'moment';
import Numeral from 'numeral'
import PropTypes from 'prop-types';
import {Dimensions} from 'react-native';
import { TabView,TabBar } from 'react-native-tab-view';
const { width: viewportWidth, height: viewportHeight } = Dimensions.get('window');
import { Col, Row, Grid } from "react-native-easy-grid";
import equal from 'fast-deep-equal';
class FormCondition extends React.Component {
  constructor(props){
    super(props);
    this.state={
      modalConditionVisible:false,
    }
  }
  componentDidUpdate(oldProps){
  }
  open(condition,callback){
    this.setState({modalConditionVisible:true,condition:condition},callback)
  }
  close(callback){
    this.setState({modalConditionVisible:false},callback);
  }
  updateCondition(condition,data){
    condition = Object.assign(condition,data);
    this.setState({condition:condition});
  }
  search(){
    this.close(()=>{
      if(this.props.onSearch){
        this.props.onSearch(this.state.condition);
      }
    });
  }
  render(){
    if(!this.props.renderConditionForm || !this.state.condition || !this.state.modalConditionVisible) return null;
    let {condition} = this.state;
    return(
      <Modal
        animationType="slide"
        transparent={true}
        visible={this.state.modalConditionVisible}
        onRequestClose={() => {
          this.setState({modalConditionVisible:false})
        }}>
        <View style={{flex:1}}>
          <View style={{opacity:0.8,flex:1,backgroundColor:'black'}}>
          </View>
          <View style={{position:'absolute',padding:20,top:0,bottom:0,left:0,right:0,flex:1,justifyContent:'center',alignItems:'center'}}>
            <View style={{width:'100%',backgroundColor:'white',borderRadius:10,maxWidth:480}}>
              <Text style={{padding:10,textAlign:"center",color:mainColor}}>{getLabel("Điều kiện lọc")}</Text>
              <View style={{flexGrow:1}}>
                {/*
                  <KeyboardAvoidingContent style={{flexGrow:1,padding:10,justifyContent:'center',alignItems:'center'}}>
                      {this.props.renderConditionForm(condition,this.updateCondition.bind(this))}
                  </KeyboardAvoidingContent>
                */}
                {this.props.renderConditionForm(condition,this.updateCondition.bind(this))}
              </View>
              <View  style={{margin:10,flexDirection:'row',justifyContent:'center',alignItems:'center'}}>
                <Button rounded success onPress={()=>this.search()}>
                  <Text style={{paddingLeft:50,paddingRight:50,color:"white"}}>{getLabel("Tìm")}</Text>
                </Button>
                <Button rounded light onPress={()=>this.setState({modalConditionVisible:false})} style={{marginLeft:10}}>
                  <Text style={{paddingLeft:50,paddingRight:50}}>{getLabel("Huỷ")}</Text>
                </Button>
              </View>

            </View>
          </View>
        </View>
      </Modal>
    )
  }
}
FormCondition.contextType = Context;
export default FormCondition
