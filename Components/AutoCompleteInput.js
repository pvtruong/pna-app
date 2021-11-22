import React from 'react';
import {server_url,id_app,baseUrl} from './../Config.js';
import {mainButtonColor,mainColor} from "./../style.js";
import {View,Picker,Modal,TouchableOpacity,Text,Platform,Keyboard} from 'react-native';
import equal from 'fast-deep-equal';
import { Button,Icon,Label} from 'native-base';
import Autocomplete from 'react-native-autocomplete-input';
import PropTypes from 'prop-types';
import {getLabel,asyncGet} from "./../API.js";
class AutoCompleteInput extends React.Component{
  constructor(props){
    super(props)
    this.pickItem = this.pickItem.bind(this);
    this.state ={
      isPickerVisible:false,
      data:this.props.data||[],
      value:this.props.value||{},
      query:''
    }
  }
  componentDidUpdate(oldProps){
    if(!equal(oldProps.value,this.props.value)){
      this.setState({value:this.props.value})
    }
  }
  pickItem(item){
    if(this.props.onValueChange){
      this.setState({isPickerVisible:false,value:item});
      this.props.onValueChange(item);
      Keyboard.dismiss();
    }
  }
  async fetchData(query){
    this.setState({query:query});
    let url = this.props.getUrl(query);
    try{
      let data = await asyncGet(url);
      this.setState({data:JSON.parse(data)});
    }catch(e){
      console.warn(e.message);
    }
  }
  showList(){
    this.fetchData("");
    this.setState({isPickerVisible:true})
  }
  render(){
    let valueField = this.props.valueField;
    let labelField = this.props.labelField || valueField;
    return (
      <View style={[{backgroundColor:'white'},this.props.style]}>
        <View style={[{flexDirection:"row",alignItems:'center'},this.props.contentStyle]}>
          <TouchableOpacity onPress={()=>this.showList()} style={{flexGrow:1,marginRight:35}}>
            <Text style={{color:mainColor,flexWrap: "wrap"}}>{this.state.value[valueField]||'-'} - {this.state.value[labelField]||'-'}</Text>
          </TouchableOpacity>
          {this.state.value && this.state.value[valueField] &&
            <Button small transparent style={{position:'absolute',right:-15,top:-5}}  onPress={()=>this.pickItem({})}>
              <Icon type="FontAwesome" name="close" style={{fontSize:18,color:'silver'}}/>
            </Button>
          }
        </View>
        {!this.props.readonly &&
          <Modal
            animationType="fade"
            transparent={true}
            visible={this.state.isPickerVisible}
            onRequestClose={() => {
              this.setState({isPickerVisible:false})
            }}>
            <View style={{flex:1}}>
              <View style={{opacity:0.8,flex:1,backgroundColor:'black'}}>
              </View>
              <View style={{position:'absolute',padding:20,top:25,bottom:0,left:0,right:0,flex:1,flexDirection:'column',justifyContent:'flex-start',alignItems:'center'}}>
                <View style={{backgroundColor:'white',flexDirection:'row',alignItems:'center',width:'100%',padding:5}}>
                  <Text style={{fontWeight:'bold',flexGrow:1}}>{this.props.title||"Danh sách"}</Text>
                  <Button small transparent onPress={()=>this.setState({isPickerVisible:false})}>
                    <Icon type="FontAwesome" name="close" style={{fontSize:18,color:mainButtonColor}}/>
                  </Button>
                </View>
                <Autocomplete
                  autoCapitalize="none"
                  containerStyle={{width:'100%'}}
                  placeholder={this.props.placeholder}
                  data={this.state.data}
                  defaultValue={this.state.query}
                  keyExtractor = {(item, i)=>{
                    return item[valueField].toString()
                  }}
                  onChangeText={text => this.fetchData(text)}
                  renderItem={({ item, index }) => (
                    <TouchableOpacity  onPress={() => this.pickItem(item)} style={{borderBottomWidth:1,borderBottomColor:'silver',padding:5}}>
                      <Text>{item[valueField]} - {item[labelField]}</Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            </View>
          </Modal>
        }
      </View>
    )
  }
}
AutoCompleteInput.propTypes={
  valueField:PropTypes.string.isRequired,
  labelField:PropTypes.string.isRequired,
  getUrl:PropTypes.any.isRequired,
}
export default AutoCompleteInput;
