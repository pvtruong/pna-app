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
import FormCondition from "./FormCondition";
import DateTimePicker from "./DateTimePicker.js";
import Context from "../Context";
import Moment from 'moment';
import Numeral from 'numeral'
import PropTypes from 'prop-types';
import {Dimensions} from 'react-native';
import { Col, Row, Grid } from "react-native-easy-grid";
const { width: viewportWidth, height: viewportHeight } = Dimensions.get('window');
class Report extends React.Component {
  constructor(props){
    super(props);
    this.state={
    }
    if(this.props.tableWidth===0){
      this.columns=[{
        id:"onecolumn",
        label:"",
        format:d=>{
          return (
            <View>
              {this.props.columns.map((col,index)=>{
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
                    <Col size={2} style={{padding:5,flexWrap:"wrap",flexDirection:"row",justifyContent:has_no_label?"flex-start":"flex-end"}}>
                      {col.format?col.format(d):<Text style={{textAlgin:"right"}}>{d[col.id]}</Text>}
                    </Col>
                  </Grid>
                )
              })}
            </View>
          )
        }
      }]
    }else{
      this.columns=this.props.columns;
    }
    this.getUrl = this.props.getUrl;
  }
  async componentDidMount(){
    this.mounted = true;
    if(this.props.navigation.getParam("drilldown")){
      let rs = this.ok(this.props.condition||{});
      if(rs.error) this.context.alert(rs.error);
    }else{
      setTimeout(()=>{
        this.openFormSearch()
      },0)

    }
  }
  componentWillUnmount(){
    this.mounted = false;
  }
  async getData(url){
    this.context.setProcessing(true);
    try{
      let data = JSON.parse(await asyncGet(url));
      if(data.length===0) data.push({info:getLabel("Không có dữ liệu")});
      if(this.mounted) this.setState({data:data});
      this.context.setProcessing(false);
    }catch(e){
      let error;
      try{
        error = JSON.parse(e.message);
      }catch(_e){
        error = e;
      }
      this.context.alert(error.message || error);
    }
  }
  async ok(condition){
    if(!condition){
      condition = this.condition||{}
    }
    let rs = this.getUrl(condition);
    if(rs && rs.url){
      await this.getData(`${rs.url}&access_token=${this.context.userInfo.token}`);
    }
    return rs;
  }
  openFormSearch(condition){
    if(!condition) condition = this.condition || this.props.condition||{};
    this.formConditionRef.open(condition);
  }
  async onSearch(condition){
    this.condition = condition;
    let rs = await this.ok(condition);
    if(rs.error){
      this.context.alert(rs.error,()=>{
        this.formConditionRef.open(condition);
      });
    }
  }
  onPress(row){
    if(this.props.onPress){
      this.props.onPress(row,this.condition)
    }else{
      if(row.stt_rec && row.ma_ct){
        this.props.navigation.navigate(row.ma_ct.toUpperCase(),{condition:{stt_rec:row.stt_rec}})
        return;
      }
    }
  }
  renderReport(){
    let data = this.state.data
    return(
      <View style={{flex:1,backgroundColor:'white'}}>
        <Table tableWidth={viewportWidth>(this.props.tableWidth||0)?viewportWidth:this.props.tableWidth} columns={this.columns} data={data}  onPress={this.onPress.bind(this)}/>
      </View>
    )
  }
  render() {
    return (
      <Container hasBackgroundView={true}>
        <Header  navigation={this.props.navigation} color="white"  hotline={false}
          onLeftPress={()=>this.props.navigation.goBack()} icon="ios-arrow-back" title={this.props.title}
          rightButton={()=>{
            return (
              <Button transparent  onPress={()=>this.openFormSearch()}>
                <Icon  name='ios-search' style={{color:"white"}}/>
              </Button>
            )
          }}
        />
        <Content navigation={this.props.navigation} scrollable={false} requireLogin>
          {this.renderReport()}
          <FormCondition renderConditionForm = {this.props.renderConditionForm} onSearch={this.onSearch.bind(this)} ref={ref=>this.formConditionRef=ref}/>
        </Content>
        <Footer navigation={this.props.navigation} path="RPT"/>
      </Container>
    );
  }
}
Report.contextType = Context;
Report.propTypes={
  navigation:PropTypes.any.isRequired,
  title:PropTypes.string.isRequired,
  renderConditionForm:PropTypes.any.isRequired,
  getUrl:PropTypes.any.isRequired,
  columns:PropTypes.array.isRequired,
}
export default Report
