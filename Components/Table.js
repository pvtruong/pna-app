import React from 'react';
import {server_url,id_app,baseUrl} from './../Config.js';
import {getLabel,asyncGet} from "./../API.js";
import {View,ScrollView,Picker,TouchableOpacity,Image,Platform,Alert,FlatList} from 'react-native';
import {loading,mainButtonColor,mainColor,mainTextColor,pageBackground} from "./../style.js";
import equal from 'fast-deep-equal';
import { Button,H1,H2,H3,Text} from 'native-base';
import { Col, Row, Grid } from "react-native-easy-grid";
import {Dimensions} from 'react-native';
const { width: viewportWidth, height: viewportHeight } = Dimensions.get('window');
import Context  from '../Context';
class Table extends React.Component{
  constructor(props){
    super(props);
    this.renderCellData = this.renderCellData.bind(this);
    this.renderCellHeader = this.renderCellHeader.bind(this);
    let rowsPerPage = this.props.rowsPerPage||20;
    this.state ={
      columns:this.props.columns||[],
      data:this.props.data||[],
      rowsPerPage:rowsPerPage,
      totalRows:this.props.totalRows,
      totalPages:this.calcTotalPages((this.props.data||[]).length,rowsPerPage),
      page:1
    }
  }
  componentDidMount(){
    this.mounted = true;
    if(this.props.onLoad && this.state.totalRows>0){
      this.props.onLoad(1);
    }
  }
  componentWillUnmount(){
    this.mounted = false;
  }
  shouldComponentUpdate(nextProps,nextState){
    return true;
  }
  componentDidUpdate(oldProps){
    if(!equal(oldProps.data,this.props.data)){
      let _s ={data:this.props.data||[]};
      if(!this.props.onLoad){
        _s.totalRows = _s.data.length;
        _s.page =1;
        _s.totalPages = this.calcTotalPages(_s.totalRows,this.state.rowsPerPage);
      }
      this.setState(_s);
    }
    if(this.props.onLoad && !equal(oldProps.totalRows,this.props.totalRows)){
      this.setState({page:1,totalRows:this.props.totalRows,totalPages:this.calcTotalPages(this.props.totalRows,this.state.rowsPerPage)},()=>{
        if(this.props.onLoad){
          this.props.onLoad(1);
        }
      });
    }
  }
  calcTotalPages(totalRows,rowsPerPage=20){
    let totalPages = Math.round(totalRows/rowsPerPage);
    if(totalPages * rowsPerPage<totalRows){
      totalPages = totalPages+1;
    }
    return totalPages||1;
  }
  gotoPage(page){
    if(page<1 || page>this.state.totalPages || page===this.state.page) return;
    this.setState({page});
    if(this.props.onLoad){
      this.props.onLoad(page);
    }
  }
  renderCellHeader(col,index,lastColumn){
    return (
      <Col size={col.size} key={col.id} style={!col.columns?[{borderColor:'gray',borderWidth:1,borderLeftWidth:0,borderRightWidth:(lastColumn?0:1),padding:10}]:null}>
        {col.columns && col.columns.length>0?
          <Grid>{col.columns.map((column,_index)=>this.renderCellHeader(column,_index,col.columns.length-1===_index))}</Grid>
          :
          <H3 style={col.style}>{col.label}</H3>
        }
      </Col>
    )
  }
  renderCellData(row,index,col,c_index,lastColumn,_styleCell){
    let styleCell = Object.assign({},_styleCell);
    styleCell.borderRightWidth=(lastColumn?0:1)
    return (
      <Col size={col.size} key={`${index}-${col.id}`}  style={!col.columns || col.columns.length===0?[styleCell,col.style]:null}>
        <View>{!!col.format?col.format(row,index):<Text>{row[col.id]}</Text>}</View>
        {col.columns && col.columns.length>0  &&
           <Grid>{col.columns.map((column,c_index)=>this.renderCellData(row,index,column,c_index,c_index===col.columns.length-1,styleCell))}</Grid>
         }
      </Col>
    )
  }
  renderList(data,onPress){
    return(
      <FlatList
        data={data}
        style={{flex:1}}
        numColumns={1}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({item,index})=>{
          return(
            <TouchableOpacity key={index.toString()}  onPress={()=>onPress(item)}>
              <Grid style={{borderLeftWidth:1,borderLeftColor:'gray',borderRightWidth:.5,borderRightColor:'gray'}}>
                {this.state.columns.map((col,c_index)=>{
                  const styleCell = {borderColor:'#dddddd',borderWidth:1,borderLeftWidth:0,borderBottomColor:'gray'};
                  if(!col.columns){
                    styleCell.borderTopWidth = 0;
                    styleCell.borderColor = 'gray';
                  }
                  return this.renderCellData(item,index,col,c_index,c_index===this.state.columns.length-1,styleCell);
                })}
              </Grid>
            </TouchableOpacity>
          )

        }
      }
      />
    )
  }
  renderBody(tableWidth){
    let {page,rowsPerPage,totalPages} = this.state;
    let data;
    if(this.props.onLoad){
      data = this.state.data;
    }else{
      data = this.state.data.slice((page-1) *rowsPerPage, page *rowsPerPage + 1);
    }
    let columns = this.state.columns.filter(c=>!c.hide);

    if(data.length===1 && (data[0].info || data[0].error)) return <View style={{flex:1,flexDirection:"row",justifyContent:'center',alignItems:'center'}}><Text style={{color:data[0].error?"red":null}}>{data[0].info || data[0].error}</Text></View>
    let onPress = this.props.onPress;
    if(!onPress) onPress = ()=>{}
    if(columns.length===1){
      return this.renderList(data,onPress)
    }else{
      return (
        <View  style={{flex:1,flexDirection:'column',width:tableWidth?tableWidth:'100%'}}>
          {/*render columns*/}
          <View style={{height:45,width:'100%',backgroundColor:'#dddddd'}}>
            <Grid style={{borderLeftWidth:1,borderLeftColor:'gray',borderRightWidth:.5,borderRightColor:'gray'}}>
              {columns.map((col,index)=>this.renderCellHeader(col,index,this.state.columns.length-1===index))}
            </Grid>
          </View>
          {/*render rows*/}
          <ScrollView style={{flexGrow:1,width:'100%'}}>
            {data.map((row,index)=>{
              return (
                <TouchableOpacity  key={index.toString()} onPress={()=>onPress(row)}>
                  <Grid style={{borderLeftWidth:1,borderLeftColor:'gray',borderRightWidth:.5,borderRightColor:'gray'}}>
                    {columns.map((col,c_index)=>{
                      const styleCell = {borderColor:'#dddddd',borderWidth:1,padding:10,borderLeftWidth:0,borderBottomColor:'gray'};
                      if(!col.columns){
                        styleCell.borderTopWidth = 0;
                        styleCell.borderColor = 'gray';
                      }
                      return this.renderCellData(row,index,col,c_index,c_index===this.state.columns.length-1,styleCell);
                    })}
                  </Grid>
                </TouchableOpacity>
              )
            })}
          </ScrollView>
        </View>
      )
    }
  }
  renderFooter(){
    let {page,rowsPerPage,totalPages} = this.state;
    if(totalPages<2 || this.props.noPage) return null;
    return(
      <View style={{width:'100%',flexDirection:'row',justifyContent:'center',alignItems:'center',padding:20,backgroundColor:'#dddddd'}}>
        <Button small rounded  light onPress={()=>this.gotoPage(1)} style={{marginRight:5}}>
          <Text>{getLabel('Đầu')}</Text>
        </Button>
        <Button small rounded  light onPress={()=>this.gotoPage(page-1)}  style={{marginRight:5}}>
          <Text>{getLabel('Trước')}</Text>
        </Button>
        <Button small transparent style={{marginRight:5}}><Text>{page}/{totalPages}</Text></Button>
        <Button small rounded light onPress={()=>this.gotoPage(page+1)}  style={{marginRight:5}}>
          <Text>{getLabel('Tiếp theo')}</Text>
        </Button>
        <Button small rounded  light onPress={()=>this.gotoPage(totalPages)}>
          <Text>{getLabel('Cuối')}</Text>
        </Button>
      </View>
    )
  }
  render(){
    let tableWidth = this.props.tableWidth;
    if(tableWidth && this.props.columns.length>1) tableWidth =this.props.columns.map(c=>c.size * 120).reduce((a,b)=>a+b,0);
    if(tableWidth<viewportWidth) tableWidth= viewportWidth;
    return (
      <View style={[{flex:1,flexDirection:'column'},this.props.style]}>
        {tableWidth>viewportWidth?
          <ScrollView style={{flexGrow:1,width:'100%'}} horizontal>
            {this.renderBody(tableWidth)}
          </ScrollView>
          :
          <View style={{flexGrow:1,width:'100%'}}>
            {this.renderBody(tableWidth)}
          </View>
        }
        {this.renderFooter()}
      </View>
    )
  }
}
Table.contextType = Context
export default Table;
