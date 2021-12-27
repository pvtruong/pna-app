import React from 'react';
import {server_url,id_app,baseUrl} from './../Config.js';
import {mainColor,mainButtonColor} from './../style.js';
import {getLabel} from "./../API.js";
import {View,Picker,Modal,TouchableOpacity,Text,Platform} from 'react-native';
import equal from 'fast-deep-equal';
import { Button,Icon,H3} from 'native-base';
class myPicker extends React.Component{
  constructor(props){
    super(props)
    this.pick = this.pick.bind(this);
    this.state ={
      selectedValue:this.props.selectedValue,
      modalVisible:false,
      items:this.props.items
    }
  }
  componentDidUpdate(oldProps){
    if(!equal(oldProps.items,this.props.items)){
      this.setState({items:this.props.items},()=>{
        this.setDefaultValue();
      });
    }
    if(oldProps.selectedValue!==this.props.selectedValue){
      this.oldValue = this.props.selectedValue;
      this.setState({selectedValue:this.props.selectedValue},()=>{
        this.setDefaultValue();
      })
    }
  }
  setDefaultValue(){
    if(Platform.OS==="android" && this.props.items && this.props.items.length>0 && !this.state.selectedValue){
      let p = this.props.items[0];
      this.onValueChange(this.props.valueField?p[this.props.valueField]:p)
    }
  }
  pick(){
    let items = (this.state.items||[]).filter(item=>{
      if(this.props.disableItems){
        return !this.props.disableItems.find(dis=>{
          return item[this.props.valueField] === dis
        })
      }
      return true;
    });
    if(items.length===0) return;
    if(this.state.selectedValue==null || this.state.selectedValue==undefined){
      let p = items[0];
      this.onValueChange(this.props.valueField?p[this.props.valueField]:p,()=>{
        this.setState({
          modalVisible:true
        })
      })
    }else{
      this.setState({
        modalVisible:true,
        selectedValueTMP:this.state.selectedValue
      })
    }
  }
  onValueChange(v,callback){
    this.setState({
      selectedValueTMP:v
    },callback)
  }
  ok(){
    this.setState({
      modalVisible:false,
      selectedValue:this.state.selectedValueTMP
    },()=>{
      if(this.props.onValueChange){
        this.props.onValueChange(this.state.selectedValue);
      }
    })
  }
  cancel(){
    this.setState({
      modalVisible:false
    })
  }
  selectedLabel(){
    if(this.state.selectedValue==undefined || this.state.selectedValue==null  || this.state.items.length==0) return this.props.placeholder||"";
    let selectedItem = this.state.items.find(i=>(this.props.valueField?i[this.props.valueField]:i)===this.state.selectedValue);
    if(selectedItem || selectedItem==0){
      return this.props.valueField?selectedItem[this.props.labelField || this.props.valueField]:selectedItem.toString()
    }else{
      return this.props.placeholder||this.state.selectedValue||"";
    }
  }
  renderPicker(){
    let items = this.state.items.filter(item=>{
      if(this.props.disableItems){
        return !this.props.disableItems.find(dis=>{
          return item[this.props.valueField] === dis
        })
      }
      return true;
    });
    if(Platform.OS==="android"){
      return items.map(p=>
        <TouchableOpacity
          style={{marginBottom:10,padding:5}}
          onPress={()=>this.onValueChange(this.props.valueField?p[this.props.valueField]:p)}
          key={this.props.valueField?p[this.props.valueField]:p.toString()}>
          <Text style={{color:this.state.selectedValueTMP===(this.props.valueField?p[this.props.valueField]:p)?mainColor:null}}>{this.props.valueField?p[this.props.labelField|| this.props.valueField]:p.toString()}</Text>
        </TouchableOpacity>
      )
    }else{
      return(
        <Picker
          mode ="dialog"
          style={{width:'100%'}}
          selectedValue={this.state.selectedValueTMP}
          onValueChange={(selectedValue)=>this.onValueChange(selectedValue)}>
            {items.map(p=>
              <Picker.Item label={this.props.valueField?p[this.props.labelField|| this.props.valueField]:p.toString()} value={this.props.valueField?p[this.props.valueField]:p} key={this.props.valueField?p[this.props.valueField]:p.toString()} />
            )}
        </Picker>
      )
    }
  }
  render(){
    if(!this.props.items) return <Text style={{color:"red",padding:10}}>This component require properties: items,valueField(options),labelField(option)</Text>;
    return (
      <View>
        <TouchableOpacity onPress={this.pick} style={[{height:30,flexDirection:'row',justifyContent:'space-between',alignItems:'center'},this.props.style]}>
          <Text style={[{color:mainButtonColor},this.props.itemStyle]}>{this.selectedLabel()}</Text>
          <Icon name="caret-down-outline" style={{marginLeft:10}} />
        </TouchableOpacity>
        <Modal
            animationType="fade"
            transparent={true}
            visible={this.state.modalVisible}
            onRequestClose={() => {
              this.setState({modalVisible:false})
            }}>
            <View style={{flex:1}}>
              <View style={{opacity:0.8,flex:1,backgroundColor:'black'}}>

              </View>
              <View style={{position:'absolute',padding:30,top:0,bottom:0,left:0,right:0,flex:1,justifyContent:'center',alignItems:'center'}}>
                <View style={{width:'100%',backgroundColor:'white',borderRadius:10}}>
                  <Text style={{padding:10,textAlign:"center",color:mainColor}}>{this.props.placeholder}</Text>
                  {this.renderPicker()}
                  <View  style={{padding:10,flexDirection:'column',justifyContent:'center',alignItems:'center',width:"100%"}}>
                    <Button full rounded success onPress={()=>this.ok()}>
                      <Text style={{paddingLeft:50,paddingRight:50,color:"white"}}>{getLabel("OK")}</Text>
                    </Button>
                    <Button full transparent default onPress={()=>this.cancel()} style={{marginTop:10}}>
                      <Text style={{paddingLeft:50,paddingRight:50}}>{getLabel("Huỷ")}</Text>
                    </Button>
                  </View>

                </View>
              </View>
            </View>
          </Modal>
      </View>
    )

  }
}
export default myPicker;
