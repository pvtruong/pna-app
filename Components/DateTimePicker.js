import React from 'react';
import {server_url,id_app,baseUrl} from './../Config.js';
import {getLabel} from "./../API.js";
import {mainButtonColor,mainColor} from "./../style.js";
import {View,Picker,Modal,TouchableOpacity,Text,Platform} from 'react-native';
import equal from 'fast-deep-equal';
import { Button,Icon} from 'native-base';
import { Appearance } from 'react-native-appearance';
//import DateTimePicker from 'react-native-modal-datetime-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import Moment from "moment";
class myPicker extends React.Component{
  constructor(props){
    super(props)
    this.pickDate = this.pickDate.bind(this);
    this.state ={
      isDatePickerVisible:false,
      value:this.props.value,
    }
    this.format = this.props.format
    if(!this.format) this.format = (this.props.mode=="time"?"hh:mm A":"DD/MM/YYYY");
  }
  componentDidUpdate(oldProps){
    if(!equal(oldProps.value,this.props.value)){
      this.setState({value:this.props.value})
    }
  }
  pickDate(date){
    if(this.props.onValueChange){
      this.setState({isDatePickerVisible:false});
      this.props.onValueChange(date);
    }
  }
  onChange(selectedDate){
    this.setState({value:selectedDate});
  }
  render(){
    let date = new Date((this.state.value|| new Date()).toString());
    let colorScheme = Appearance.getColorScheme();
    let background = (colorScheme==="light"?'white':"black");
    return (
      <View style={[this.props.style]}>
        <TouchableOpacity onPress={()=>this.setState({isDatePickerVisible:true})}  style={[{flexDirection:"row",alignItems:"center"},this.props.contentStyle]}>
          <Text style={{color:mainColor,flexGrow:1}}>{this.state.value?Moment(this.state.value).format(this.format):this.format}</Text>
          {this.props.icon &&
            <Text style={{marginLeft:5}}><Icon type={this.props.typeIcon} name={this.props.icon} style={{fontSize:18,color:mainButtonColor}}/></Text>
          }
        </TouchableOpacity>
        {!this.props.readonly &&
          <Modal
            animationType="fade"
            transparent={true}
            visible={this.state.isDatePickerVisible}
            onRequestClose={() => {
              this.setState({isDatePickerVisible:false});
            }}
          >
            <View style={{flex:1}}>
              <View style={{opacity:0.5,flex:1,backgroundColor:'black'}}>
              </View>
              <View style={{position:'absolute',padding:20,top:0,bottom:0,left:0,right:0,flex:1,justifyContent:'center',alignItems:'center'}}>
                <View style={{width:'100%',backgroundColor:background,borderRadius:10,maxWidth:480}}>
                  <Text style={{padding:10,textAlign:"center",color:mainColor}}>{getLabel("Chọn một ngày")}</Text>
                  <DateTimePicker
                    style={{ width: '100%'}}
                    value={date}
                    display={"spinner"}
                    mode={this.props.mode||"date"}
                    is24Hour={true}
                    onChange={(event, selectedDate)=>this.onChange(selectedDate)}/>
                  <View  style={{margin:10,flexDirection:'row',justifyContent:'center',alignItems:'center'}}>
                    <Button rounded primary onPress={()=>this.pickDate(date)} style={{marginRight:10,padding:35}}><Text>{getLabel("Chọn")}</Text></Button>
                    <Button rounded light onPress={()=>this.setState({isDatePickerVisible:false})}  style={{padding:35}}><Text>{getLabel("Thoát")}</Text></Button>
                  </View>
                </View>
              </View>
            </View>
          </Modal>
        }
      </View>
    )
  }
}
export default myPicker;


/*<DateTimePicker
  date = {date}
  minimumDate ={this.props.minimumDate}
  maximumDate ={this.props.maximumDate}
  isVisible={this.state.isDatePickerVisible}
  mode ={this.props.mode||"datetime"}
  onConfirm={(date)=>this.pickDate(date)}
  onCancel={()=>this.setState({isDatePickerVisible:false})}
/>*/
