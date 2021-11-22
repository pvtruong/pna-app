import React from 'react';
import {server_url,id_app,baseUrl} from './../Config.js';
import {getLabel,asyncGet} from "./../API.js";
import {View,Picker,Modal,TouchableOpacity,Image,Platform,Alert} from 'react-native';
import {loading,mainButtonColor,mainColor,mainTextColor,pageBackground} from "./../style.js";
import equal from 'fast-deep-equal';
import { Button,H1,Text} from 'native-base';
import { Rating,AirbnbRating } from 'react-native-elements';
const DEFAULT_REVIEWS = ["Kém", "Trung bình","Được", "Tốt", "Tuyệt vời"];
class ModelRating extends React.Component{
  constructor(props){
    super(props);
    this.ok = this.ok.bind(this);
    this.onFinishRating = this.onFinishRating.bind(this);
    this.currentRating =3;
    this.state ={
      modalVisible:false,
      value:this.props.value
    }
  }
  componentDidMount(){
    this.mounted = true;
  }
  componentWillUnmount(){
    this.mounted = false;
  }
  componentDidUpdate(oldProps){
    if(oldProps.value!=this.props.value){
      if(this.mounted) this.setState({value:this.props.value});
    }
  }

  close(){
    if(this.mounted) this.setState({
      modalVisible:false
    })
  }
  open(){
    if(this.mounted) this.setState({modalVisible:true});
  }
  ok(){
    if(this.props.onValueChanged){
      this.props.onValueChanged(this.currentRating);
    }
    this.close();
  }
  onFinishRating(rating){
    this.currentRating = rating;
  }
  render(){
    return (
      <View>
        {this.state.value?
          <View style={this.props.style}>
            {this.props.title?<Text  style={{marginBottom:5}} note>{this.props.title}</Text>:null}
            <View style={{flexDirection:"row",alignItems:"center"}}>
              <Rating
                readonly
                showRating={this.props.showRating}
                startingValue={this.state.value}
                ratingCount={(this.props.reviews || DEFAULT_REVIEWS).length}
                imageSize={this.props.size||30}
                style={{alignSelf: "flex-start"}}
              />
              <Text note>({(this.props.reviews || DEFAULT_REVIEWS)[this.state.value-1]||"Trên cả tuyệt vời"})</Text>
            </View>
          </View>
          :
          null
        }
        {this.state.modalVisible &&
          <Modal
            animationType="fade"
            transparent={true}
            visible={this.state.modalVisible}
            onRequestClose={() => this.close()}>
            <View style={{flex:1}}>
              <View style={{opacity:0.8,flex:1,backgroundColor:'black'}}>
              </View>
              <View style={{position:'absolute',top:0,bottom:0,left:0,right:0,flexDirection:"row",justifyContent:'center',alignItems:'center'}}>
                <View style={{backgroundColor:"white",borderRadius:5}}>
                  <H1 style={{textAlign:"center",margin:10}}>{this.props.title || getLabel("Đánh giá")}</H1>
                  <View style={{flexDirection:"row",justifyContent:"center",alignItems:"center",padding:20}}>
                    <AirbnbRating
                      showRating
                      count={(this.props.reviews || DEFAULT_REVIEWS).length}
                      reviews={this.props.reviews || DEFAULT_REVIEWS}
                      defaultRating={this.currentRating}
                      onFinishRating={this.onFinishRating}
                     />

                  </View>
                  <View style={{padding:20,flexDirection:'column'}}>
                    <Button full rounded onPress={()=>this.ok()}  style={{backgroundColor:mainButtonColor}}>
                      <Text style={{color:mainTextColor}}>{getLabel("Chọn")}</Text>
                    </Button>
                    <Button full rounded transparent onPress={()=>this.close()} style={{marginTop:10}}>
                      <Text>{getLabel("Đóng")}</Text>
                    </Button>
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
export default ModelRating;
