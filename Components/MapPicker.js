import React from 'react';
import {server_url,id_app,baseUrl,GOOGLE_MAPS_APIKEY,DEFAULT_LOCATION,DELTA,app_name} from './../Config.js';
import {getLabel,asyncGet,getLocationByAddress} from "./../API.js";
import {View,Picker,Modal,TouchableOpacity,Text,Image,Platform,Alert} from 'react-native';
import {loading,mainButtonColor,mainColor,mainTextColor,pageBackground} from "./../style.js";
import equal from 'fast-deep-equal';
import { Button,Icon,Input,Spinner} from 'native-base';
import MapView from 'react-native-maps';

import {Dimensions} from 'react-native';
const { width: viewportWidth, height: viewportHeight } = Dimensions.get('window');
const { width: screenWidth, height: screenHeight } = Dimensions.get('screen');


class ModelMap extends React.Component{
  constructor(props){
    super(props);
    this.onLocationChange = this.onLocationChange.bind(this);
    this.onAddressChanged = this.onAddressChanged.bind(this);
    this.onMapPress = this.onMapPress.bind(this);
    this.search = this.search.bind(this);
    this.ok = this.ok.bind(this);
    this.state ={
      location:this.props.location,
      address:this.props.address,
      modalVisible:false
    }
  }
  componentDidMount(){
    this.mounted = true;
  }
  componentWillUnmount(){
    this.mounted = false;
  }
  componentDidUpdate(oldProps){
  }

  close(){
    if(this.mounted) this.setState({
      modalVisible:false
    })
  }
  open(){
    if(this.mounted) this.setState({address:this.props.address,location:this.props.location,modalVisible:true});
    if(!this.props.location && this.props.address){
      this.onAddressChanged(this.props.address);
    }
  }
  ok(){
    if(!this.state.location){
      Alert.alert(app_name,getLabel("Chương trình không tìm thấy vị trí của địa chỉ này. Hãy chọn một vị trí trên bản đồ."));
      return;
    }
    if(this.props.onValueChanged){
      this.props.onValueChanged(this.state.location,this.state.address);
    }
    this.close();
  }
  onMapPress(e){
    if(this.props.readOnly!=true) this.onLocationChange(e.nativeEvent.coordinate)
  }
  onLocationChange(location){
    if(this.mounted) this.setState({location:location});
    if(this.mounted && this.map && location) this.map.animateToRegion({
      latitude:location.latitude,
      longitude:location.longitude,
      latitudeDelta: DELTA.latitudeDelta,
      longitudeDelta: DELTA.longitudeDelta
    }, 100)
  }
  onAddressChanged(address){
    if(this.mounted) this.setState({address:address});
    if(address && address.trim().length>0){
      if(this.mounted) this.setState({running:true});
      getLocationByAddress(address).then((rs)=>{
        this.onLocationChange(rs);
        if(this.mounted) this.setState({running:false});
      }).catch(e=>{
        console.log("Error when getting the location of address",e);
        if(this.mounted) this.setState({running:false});
      })
    }
  }
  search(){
    this.onAddressChanged(this.state.address);
  }
  render(){
    if(!this.state.modalVisible){
      return null;
    }
    return (
      <Modal
          animationType="fade"
          transparent={false}
          visible={this.state.modalVisible}
          onRequestClose={() => this.close()}>
          <View style={{width:'100%',height:'100%'}}>
            <View style={{width:'100%',height:'100%'}}>
                <MapView ref={ref=>this.map = ref}
                    provider={null}
                    scrollEnabled={this.props.readOnly!=true}
                    style={{ top: 0,left:0,right:0,bottom:0,position:'absolute' }}
                    initialRegion={{
                      latitude: (this.state.location || DEFAULT_LOCATION).latitude,
                      longitude: (this.state.location || DEFAULT_LOCATION).longitude,
                      latitudeDelta: DELTA.latitudeDelta,
                      longitudeDelta: DELTA.longitudeDelta
                    }}
                    onPress={(e)=>this.onMapPress(e)}>
                    {this.state.location &&
                      <MapView.Marker coordinate={(this.state.location)}>
                      </MapView.Marker>
                    }
                </MapView>
                {this.state.running?
                  <View style={loading}>
                    <Spinner />
                  </View>
                  :null
                }
            </View>
            {this.props.readOnly!=true &&
              <View style={{position:'absolute',top:20,left:5,right:5,paddingTop:5,paddingBottom:5,flexDirection:"row",alignItems:"center",backgroundColor:"white",borderColor:'#DDDDDD',borderRadius:100,borderWidth:1}}>

                <Button  small transparent>
                  <Icon name="ios-search" style={{color:"#DDDDDD"}}/>
                </Button>

                <Input placeholder={getLabel("số nhà tên đường (phố), phường xã, quận huyện, tỉnh thành")} style={{flex:1,height:"100%",textAlign:"center"}}   clearButtonMode ={'while-editing'} autoCorrect ={false} value={this.state.address}
                  onChangeText={address=>this.setState({address})}
                  onEndEditing={()=>this.search()}
                />


                {Platform.OS!=="ios" &&
                  <Button small transparent onPress={()=>this.setState({address:''})}>
                    <Icon name="ios-close" style={{color:"#DDDDDD"}}/>
                  </Button>
                }
              </View>
            }
            <View style={{position:'absolute',borderTopColor:"#DDDDDD",borderTopWidth:1,padding:10,bottom:0,left:0,right:0,flexDirection:'row',justifyContent:'center',alignItems:'center',backgroundColor:pageBackground.backgroundColor}}>

              <View style={{flex:3,flexDirection:'row',justifyContent:'center',alignItems:'center'}}>
                <Button small transparent onPress={()=>this.close()}>
                  <Text  style={{color:"black"}}>{getLabel("Quay lại")}</Text>
                </Button>
              </View>
              <View style={{flex:4}}>
                {this.props.readOnly!==true &&
                  <Button full rounded onPress={()=>this.ok()}  style={{backgroundColor:mainButtonColor}}>
                    <Text style={{color:mainTextColor}}>{getLabel("Chọn")}</Text>
                  </Button>
                }
              </View>
              <View style={{flex:3}}/>

            </View>
          </View>
        </Modal>
    )
  }
}
class myPicker extends React.Component{
  constructor(props){
    super(props)
    this.pick = this.pick.bind(this);
    this.convertCoordinate = this.convertCoordinate.bind(this);
    let coords = this.convertCoordinate(this.props.selectedValue || this.props.location);
    this.state ={
      location:coords,
      address:this.props.address,
      modalVisible:false
    }
  }
  async componentDidMount(){
    this.mounted = true;
  }
  componentWillUnmount(){
    this.mounted = false;
  }
  convertCoordinate(data){
    let cord;
    if(data){
      if(Array.isArray(data) && data.length===2){
        cord ={
          longitude:data[0],
          latitude:data[1]
        }
      }else{
        cord = data;
      }
    }
    return cord;
  }
  componentDidUpdate(oldProps){
    if(!equal(oldProps.selectedValue,this.props.selectedValue)){
      if(this.mounted) this.setState({location:this.convertCoordinate(this.props.selectedValue)});
    }
    if(!equal(oldProps.location,this.props.location)){
      if(this.mounted) this.setState({location:this.convertCoordinate(this.props.location)});
    }
    if(!equal(oldProps.address,this.props.address)){
      if(this.mounted) this.setState({address:this.props.address});
    }
  }
  pick(){
    this.fullmap.open();
  }
  onValueChanged(location,address){
    this.props.location= location;
    this.props.address= address;
    if(this.mounted) this.setState({location:location,address:address});

    if(this.mounted && this.map) this.map.animateToRegion({
      latitude:location.latitude,
      longitude:location.longitude,
      latitudeDelta: 0.0122,
      longitudeDelta: 0.0421
    }, 100)

    if(this.props.onLocationChange){
      this.props.onLocationChange(location);
    }
    if(this.props.onAddressChanged){
      this.props.onAddressChanged(address);
    }
  }
  render(){
    return (
      <View style={this.props.style}>
          {this.props.showMinimap!==false?
            <View>
              <View style={{flexDirection:'row',justifyContent:'center',alignItems:'center'}}>
                <MapView ref={ref=>this.map = ref} style={{ width:viewportWidth-40,height:200 }} initialRegion={{
                    latitude: (this.state.location || DEFAULT_LOCATION).latitude,
                    longitude: (this.state.location || DEFAULT_LOCATION).longitude,
                    latitudeDelta: DELTA.latitudeDelta,
                    longitudeDelta: DELTA.longitudeDelta
                  }}
                    scrollEnabled={false}
                    liteMode ={true}
                    cacheEnabled ={true}
                    zoomEnabled={false}
                  >
                  <MapView.Marker coordinate={(this.state.location || DEFAULT_LOCATION)}>
                  </MapView.Marker>
                </MapView>
              </View>
              <View style={{paddingTop:10,paddingBottom:10}}>
                <Button full rounded light  onPress={()=>this.pick()}>
                  <Text>{this.props.title || getLabel("Chọn một vị trí khác")}</Text>
                </Button>
              </View>
            </View>
            :
            <Button small={this.props.small} transparent={!this.props.rounded} rounded={this.props.rounded} danger  onPress={()=>this.pick()}>
              <Icon name="ios-map"/>
            </Button>
          }
          <ModelMap ref={ref=>this.fullmap=ref} address={this.state.address} readOnly = {this.props.readOnly} location = {this.state.location} onValueChanged ={(location,address)=>this.onValueChanged(location,address)} />
      </View>
    )

  }
}
export default myPicker;
