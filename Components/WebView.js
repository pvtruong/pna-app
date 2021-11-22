import React from 'react';
import { Header as NavHeader } from 'react-navigation';
import {KeyboardAvoidingView,Platform,ScrollView,View,Dimensions} from 'react-native';
import HTML from 'react-native-render-html';
class WebView extends React.Component {
  constructor(props){
    super(props);
  }
  render(){
    if(!this.props.source.html) return null
    return (
      <HTML html={this.props.source.html} ignoredStyles={["font-family"]} baseFontStyle={{fontSize:16}} imagesMaxWidth={Dimensions.get('window').width}/>
    )
  }
}
export default  WebView;
