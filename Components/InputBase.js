import React from 'react';
import {server_url,baseUrl,id_app} from './../Config.js';
import {Alert,View,AsyncStorage} from 'react-native';
import {headerPageStyle,pageBackground,loading,mainColor} from './../style.js';
import {getLabel,asyncGet,asyncUpdateVoucher} from "./../API.js";
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
import FormView from "./FormView";
import withTourGuide from "./withTourGuide";
import FormCondition from "./FormCondition";
import Moment from 'moment';
import Numeral from 'numeral'
import PropTypes from 'prop-types';
import {Dimensions} from 'react-native';
import { TabView,TabBar } from 'react-native-tab-view';
import equal from 'fast-deep-equal';
const { width: viewportWidth, height: viewportHeight } = Dimensions.get('window');
import { Col, Row, Grid } from "react-native-easy-grid";
class InputBase extends React.Component {
  constructor(props){
    super(props);
    this.state={
      details:{
        routes:this.props.details //{key,title,id,columns}
      },
      data:[]
    }
    if(this.props.tableWidth===0){
      this.columns=[{
        id:"onecolumn",
        label:"",
        format:(d,row_index)=>{
          return (
            <View>
              {this.props.columns.map((col,index)=>{
                if(!col.hideWhen) col.hideWhen =(row)=>!row[col.id];
                if(col.hideWhen(d)) return null;
                let has_no_label = (index===0 && col.id==="dien_giai") || (!col.label);
                return (
                  <Grid key={index.toString()} id={col.id} style={{borderTopWidth:index===0?0:.5,borderTopColor:'#dddddd'}}>
                    {has_no_label?
                      null
                      :
                      <Col size={1} style={{padding:5,borderRightColor:'#dddddd',borderRightWidth:.5}}>
                        <Text style={{fontWeight:d.bold?'bold':'normal'}}>{col.label}</Text>
                      </Col>
                    }
                    <Col size={2} style={{padding:5,flexWrap:"wrap",flexDirection:"row",justifyContent:has_no_label?"flex-start":"flex-end"}}>
                      {col.format?col.format(d):<Text style={{textAlgin:'right'}}>{d[col.id]}</Text>}
                    </Col>
                  </Grid>
                )
              })}
            </View>
          )
        }
      }]
    }else{
      this.columns=[].concat(this.props.columns);
    }
    this.getUrl = this.props.getUrl;
    this.countUrl = this.props.countUrl;
  }
  async componentDidMount(){
    this.mounted = true;
    await this.search(this.props.navigation.getParam("condition") || {});
  }
  componentWillUnmount(){
    this.mounted = false;
  }
  async getData(url){
    this.context.setProcessing(true);
    try{
      let data = JSON.parse(await asyncGet(url));
      if(data.length===0) data =[{info:getLabel("Không có dữ liệu")}];
      if(this.mounted) this.setState({data:data});
      this.context.setProcessing(false)
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
  async countData(url){
    this.context.setProcessing(true);
    if(this.mounted){
      this.setState({totalRows:-1,data:[]});
    }
    try{
      const data = JSON.parse(await asyncGet(url));
      let totalRows=0;
      if(data.forEach){
        totalRows = data[0].totalRows;
      }else{
        totalRows = data.totalRows;
      }
      if(this.mounted) this.setState({totalRows:totalRows});
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
  openFormSearch(){
    const condition = this.condition || this.props.condition||{};
    delete condition.stt_rec;
    this.formConditionRef.open(condition);
  }
  add(){
    if(!this.props.defaultData) return;
    this.formViewRef.open(this.state.details.routes,this.props.defaultData,this.props.master,async (rs)=>{
      let url = this.getUrl({stt_rec:rs});
      let rows = JSON.parse(await asyncGet(`${url}&access_token=${this.context.userInfo.token}`));
      let {data} = this.state;
      data =  rows.concat(data);
      this.setState({data});
    });
  }
  async onSearch(condition){
    this.condition = condition;
    await this.search(condition)
  }
  async search(condition){
    if(!condition){
      condition = this.condition;
    }
    this.condition_search = condition;
    let url ;
    if(this.countUrl){
      url = this.countUrl(condition);
    }else{
      url = this.getUrl(condition);
      url = url + "&count=1"
    }
    await this.countData(`${url}&access_token=${this.context.userInfo.token}`)
  }
  async load(page){
    let condition = this.condition_search;
    let url = this.getUrl(condition);
    await this.getData(`${url}&page=${page}&access_token=${this.context.userInfo.token}`)
  }
  async saveDetail(){
    if(this.mounted) this.setState({modalDetailVisible:false});
  }
  onPress(row){
    this.formViewRef.open(this.state.details.routes,row,this.props.master,async (rs)=>{
      let url = this.getUrl({stt_rec:rs});
      let rows = JSON.parse(await asyncGet(`${url}&access_token=${this.context.userInfo.token}`));
      rows.forEach((item) => {
        for(let key in item){
          row[key] = item[key];
        }
      });
      let {data} = this.state;
      this.setState({data});
    });
  }
  render() {
    let data = this.state.data;
    return (
      <Container hasBackgroundView={true}>
        <Header  navigation={this.props.navigation} color="white"  hotline={false}
          onLeftPress={()=>this.props.navigation.goBack()} icon="ios-arrow-back" title={this.props.title}
          rightButton={()=>{
            return (
              <View style={{flexDirection:"row",textAlgin:"center"}}>
                {this.props.allowAdd &&
                  <Button transparent  onPress={()=>this.add()} style={{marginRight:10}}>
                    <Icon  name='ios-add' style={{color:"white"}}/>
                  </Button>
                }
                <Button transparent  onPress={()=>this.openFormSearch()}>
                  <Icon  name='ios-search' style={{color:"white"}}/>
                </Button>
              </View>
            )
          }}
        />
        <Content navigation={this.props.navigation} scrollable={false} requireLogin>
          <View style={{flex:1,backgroundColor:'white'}}>
            <Table totalRows={this.state.totalRows} onLoad={this.load.bind(this)} tableWidth={viewportWidth>(this.props.tableWidth||0)?viewportWidth:this.props.tableWidth} columns={this.columns} data={data}  onPress={this.onPress.bind(this)}/>
          </View>
          <FormView {...this.props.inputForms} saveData ={this.props.saveData} defaultData = {this.props.defaultData} constraints={this.props.constraints} tableWidth={this.props.tableWidth} ref={ref=>this.formViewRef=ref}/>
          <FormCondition renderConditionForm = {this.props.renderConditionForm} onSearch={this.onSearch.bind(this)} ref={ref=>this.formConditionRef=ref}/>
        </Content>
        <Footer navigation={this.props.navigation} path={this.props.path || "Input"}/>
      </Container>
    );
  }
}
InputBase.contextType = Context;
InputBase.propTypes={
  navigation:PropTypes.any.isRequired,
  title:PropTypes.string.isRequired,
  renderConditionForm:PropTypes.any.isRequired,
  getUrl:PropTypes.any.isRequired,
  columns:PropTypes.array.isRequired,
  details:PropTypes.array,
  master:PropTypes.any,
  allowAdd:PropTypes.bool,
}
export default withTourGuide(InputBase);
