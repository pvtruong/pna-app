import React from 'react';
import {Platform,ScrollView,View,TouchableOpacity,Text,ActivityIndicator} from 'react-native';
import ImageViewer from 'react-native-image-view';
import { Image } from 'react-native-elements';
class ImageView extends React.Component {
  constructor(props){
    super(props);
    this.state={
      isModalOpened:false
    }
  }
  showModel(){
    if(typeof this.props.source === "number") return;
    this.setState({isModalOpened:true});
  }
  render(){
    if(!this.props.source) return null;
    let images =[{source:this.props.source}]
    return (
      <View>
        <TouchableOpacity onPress={()=>this.showModel()}>
          <Image  resizeMode={this.props.resizeMode || 'cover'} source={this.props.source}  style={this.props.style} placeholderStyle={{backgroundColor:"transparent"}}  PlaceholderContent={<ActivityIndicator />}/>
        </TouchableOpacity>
        <ImageViewer
           images={images}
           isVisible={this.state.isModalOpened}
           onClose={() => this.setState({isModalOpened: false})}
        />
      </View>
    )
  }
}
export default  ImageView;
