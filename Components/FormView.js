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
const validate = require("validate.js");
const { width: viewportWidth, height: viewportHeight } = Dimensions.get('window');
import { Col, Row, Grid } from "react-native-easy-grid";
import equal from 'fast-deep-equal';

import _ from "lodash";

class FormView extends React.Component {
  constructor(props){
    super(props);
    this.state={
      running:false,
      data:null,
      modalDetailVisible:false,
      details:{
        index:0,
        routes:null
      }
    }
  }
  componentDidUpdate(oldProps){
  }

  updateData(tabData,value){
    const {data} =  this.state;
    for(let key in value){
      tabData[key] = value[key];
    }
    this.setState({data});
  }
  removeRow(id,row_index){
    const {data} =  this.state;
    let tabData  = data["tab_"+id];
    if(tabData){
      tabData.splice(row_index,1);
      this.setState({data});
    }
  }
  addRow(id,defaultData){
    let {data} =  this.state;
    let tabData  = data["tab_"+id];
    if(tabData){
      tabData = tabData.concat([{...defaultData}]);
      data["tab_"+id] = tabData;
      this.setState({data});
    }
  }
  open(_details,data,master,callbackSave){
    data = _.cloneDeep(data);
    this.callbackSave = callbackSave;
    let routes = [];//{key,title,id,columns}
    if(master){
      let r = {...master};
      r.title="T.T chung";
      routes.push(r);
    }
    if(_details){
        routes=  routes.concat(_details);
    }
    routes.forEach((route,index)=>{
      route.key = index;
      let id = route.id
      if(id){
        let dataDetail = data["tab_"+id.toLowerCase()];
        if(typeof(dataDetail)==="string"){
          try{
            dataDetail = JSON.parse(dataDetail);
            data["tab_"+id.toLowerCase()] = dataDetail
          }catch(e){
            console.error(e.message)
          }
        }
      }
    })
    let {details} = this.state;
    details.routes = routes;
    details.index=0;
    this.setState({modalDetailVisible:true,data,details})
  }
  saveDetail(){
    let {data} = this.state;
    //check data
    if(this.props.constraints){
      for(let key in this.props.constraints){
        let constraints = this.props.constraints[key];
        let dataCheck;
        if(key==="master"){
          dataCheck = data;
        }else{
          dataCheck = data["tab_"+key.toLowerCase()];
        }
        if(dataCheck){
          if(Array.isArray(dataCheck)){
            let error;
            dataCheck.forEach(row=>{
              let valid = validate(row, constraints,{format: "flat"});
              if(valid){
                error= valid.join(", ");
                Alert.alert(error);
                return;
              }
            })
            if(error) return;
          }else{
            let valid = validate(dataCheck, constraints,{format: "flat"});
            if(valid){
              let error= valid.join(", ");
              Alert.alert(error);
              return;
            }
          }

        }
      }
    }
    //callback
    if(this.props.saveData){
      this.setState({running:true});
      let _data = _.cloneDeep(data);
      this.props.saveData(_data,(e,rs)=>{
        this.setState({running:false});
        if(e) return Alert.alert(e.message);
        this.setState({modalDetailVisible:false});
        if(this.callbackSave) this.callbackSave(rs);
      })
    }
  }
  tabIndexChanged(index){
    this.state.details.index = index;
  }
  render(){
    if(!this.state.data ||  !this.state.details.routes || !this.state.modalDetailVisible) return null;
    return(
      <Modal
        animationType="fade"
        transparent={true}
        visible={this.state.modalDetailVisible}
        onRequestClose={() => {
          this.setState({modalDetailVisible:false})
        }}>
        <View style={{flex:1}}>
          <View style={{opacity:0.8,flex:1,backgroundColor:'black'}}>
          </View>
          <View style={{position:'absolute',paddingTop:20,paddingBottom:20,top:0,bottom:0,left:0,right:0,flex:1,justifyContent:'center',alignItems:'center'}}>
            <View style={{width:'100%',flex:1,backgroundColor:"white",borderRadius:10,overflow:'hidden'}}>
              {this.state.details.routes && this.state.details.routes.length>0 &&
                <View style={{flexGrow:1,backgroundColor:mainColor}}>
                    <TabView
                      navigationState={this.state.details}
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

                        let dataDetail,id;
                        id =route.id;
                        if(!id){
                          dataDetail = this.state.data;
                          id ="master"
                        }else{
                          id = id.toLowerCase();
                          dataDetail = this.state.data["tab_"+id];
                        }

                        let idForm = `${id}Form`;
                        let form =this.props[idForm];
                        if(form){
                          let _renderForm = form(dataDetail,this.updateData.bind(this),this.removeRow.bind(this),this.addRow.bind(this));
                          return (
                            <View style={{flex:1,backgroundColor:'#ddd'}}>
                              <KeyboardAvoidingContent style={{flexGrow:1}}>
                                {_renderForm?_renderForm:<Text>Somethink broke</Text>}
                              </KeyboardAvoidingContent>
                            </View>
                          )
                        }
                        if(!Array.isArray(dataDetail)){
                          dataDetail = [dataDetail];
                        }
                        let columns =route.columns;
                        if(this.props.tableWidth===0){
                          columns=[{
                            id:"onecolumn",
                            label:"",
                            format:d=>{
                              return (
                                <View>
                                  {route.columns.map((col,index)=>{
                                    if(!col.hideWhen) col.hideWhen =(row)=>!row[col.id];
                                    if(col.hideWhen(d)) return null;
                                    let has_no_label = (index===0 && col.id==="dien_giai") || (!col.label);
                                    return (
                                      <Grid key={index.toString()} id={col.id} style={{borderTopWidth:index===0?0:.5,borderTopColor:'#dddddd'}}>
                                        {has_no_label ?
                                          null
                                          :
                                          <Col size={1} style={{padding:5,borderRightColor:'#dddddd',borderRightWidth:.5}}><Text style={{fontWeight:d.bold?'bold':'normal'}}>{col.label}</Text></Col>
                                        }
                                        <Col size={2} style={{padding:5,flexWrap:"wrap",flexDirection:"row",justifyContent:has_no_label?"flex-start":"flex-end"}}>{col.format?col.format(d):<Text style={{textAlgin:"right"}}>{d[col.id]}</Text>}</Col>
                                      </Grid>
                                    )
                                  })}
                                </View>
                              )
                            }
                          }]
                        }

                        return(
                          <View style={{flex:1,backgroundColor:'white'}}>
                            <Table noPage tableWidth={viewportWidth>(this.props.tableWidth||0)?viewportWidth:this.props.tableWidth}  columns={columns} data={dataDetail}/>
                          </View>
                        )
                      }}
                      onIndexChange={index => this.tabIndexChanged(index)}
                    />
                 </View>
                }
              <View  style={{margin:10,flexDirection:'row',justifyContent:'center',alignItems:'center'}}>
                <Button rounded success onPress={()=>this.saveDetail()}>
                  <Text style={{paddingLeft:50,paddingRight:50,color:"white"}}>{getLabel("Lưu")}</Text>
                </Button>
                <Button rounded light onPress={()=>this.setState({modalDetailVisible:false})} style={{marginLeft:10}}>
                  <Text style={{paddingLeft:50,paddingRight:50}}>{getLabel("Đóng")}</Text>
                </Button>
              </View>

            </View>
          </View>
        </View>
        {this.state.running && <View style={{flex:1,position:'absolute',padding:0,top:0,bottom:0,left:0,right:0}}>
          <View style={{opacity:0.0,flex:1,backgroundColor:'black'}}>
            </View>
            <View style={{position:'absolute',padding:20,top:0,bottom:0,left:0,right:0,flex:1,justifyContent:'center',alignItems:'center'}}>
                <View style={{padding:5, paddingLeft:30,paddingRight:30,borderRadius:10,backgroundColor:"#dddddd"}}><Spinner/></View>
            </View>
        </View>}
      </Modal>
    )
  }
}
FormView.contextType = Context;
export default FormView
