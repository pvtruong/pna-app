import React from 'react';
import {server_url,id_app,baseUrl} from './../Config.js';
import {getLabel} from "./../API.js";
import {mainButtonColor,mainColor,mainTextColor} from "./../style.js";
import {View,Picker,Modal,TouchableOpacity,Text,Platform,Alert} from 'react-native';
import equal from 'fast-deep-equal';
import { Button,Icon} from 'native-base';
import Moment from "moment";
const DEFAULT_DAYS=[
  {index:0,name:"CN",sel:false},
  {index:1,name:"T2",sel:false},
  {index:2,name:"T3",sel:false},
  {index:3,name:"T4",sel:false},
  {index:4,name:"T5",sel:false},
  {index:5,name:"T6",sel:false},
  {index:6,name:"T7",sel:false}
]
const DayOfWeek = ({name,backgroundColor,color,onPress=()=>{},options={size:50}})=>{
  if(!options.size) options.size = 20;
  return (
    <TouchableOpacity style={[{backgroundColor:backgroundColor,borderRadius:50,padding:6,borderColor:'silver',borderWidth:0.5}]} onPress={()=>onPress()}>
      <Text style={{color:color}}>{name}</Text>
    </TouchableOpacity>
  )
}
class myPicker extends React.Component{
  constructor(props){
    super(props)
    this.dayPress = this.dayPress.bind(this);
    this.setDays = this.setDays.bind(this);

    let days = this.setDays(this.props.days);
    this.state ={
      days: days
    }

    if(this.props.onValueChange){
      this.props.onValueChange(days);
    }
  }
  componentDidUpdate(oldProps){
    if(!equal(oldProps.days,this.props.days)){
      let days = this.setDays(this.props.days)
      this.setState({days:days});

      if(this.props.onValueChange){
        this.props.onValueChange(days);
      }
    }
  }
  setDays(days){
    let defaultDate = JSON.parse(JSON.stringify(DEFAULT_DAYS));
    if(days){
      days.forEach(day=>{
        let _d = defaultDate.find(d=>d.index===day.index);
        if(_d) _d.sel = day.sel;
      })
    }
    return defaultDate;
  }
  dayPress(day){
    let _sel = !day.sel;
    if(this.props.max){
      if(this.props.max===1){
        this.state.days.forEach(d=>{
          d.sel = false;
        })
        if(this.props.min>0){
          _sel = true;
        }
      }else{
        if(_sel && this.state.days.filter(d=>d.sel).length=== this.props.max){
          return;
        }
      }
    }
    day.sel = _sel;
    this.setState({days:this.state.days});
    if(this.props.onDayPress){
      this.props.onDayPress(day);
    }
    if(this.props.onValueChange){
      this.props.onValueChange(this.state.days);
    }
    if(this.props.onStartDateChange){
      let startDate = this.calcDateStart();
      this.props.onStartDateChange(startDate)
    }
  }
  calcDateStart(date){
    if(!date) date = new Date();
    date = new Date(date.toString());

    let currentDay = date.getDay();
    let distances = this.state.days.filter(d=>d.sel).map(d=>{
      return (d.index + 7 - currentDay) % 7;
    }).sort((a,b)=>a-b);
    if(distances.length>0){
      date.setDate(date.getDate()+distances[0]);
    }
    return date;
  }
  render(){
    return (
      <View style={[{flexDirection:"row",alignItems:"center",justifyContent:"space-between",width:"100%"},this.props.style]}>
        {this.state.days.map(day=>{
          return <DayOfWeek key={day.name} name={day.name} backgroundColor={day.sel?mainColor:null} color={day.sel?mainTextColor:null} onPress={()=>this.dayPress(day)}/>
        })}
      </View>
    )
  }
}
export default myPicker;
