import React from 'react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import {View,Platform} from 'react-native';
class KeyboardAvoidingContent extends React.Component {
  constructor(props){
    super(props);
    this.style={
    }
    if(this.props.padder){
      this.style.padding=10
    }
    if(this.props.full){
      this.style.flex =1;
    }
    if(this.props.style){
      this.style = Object.assign(this.style,this.props.style);
    }
  }
  render() {
    return (
      <KeyboardAwareScrollView
        extraScrollHeight={Platform.OS==='ios'?0:120}
        enableOnAndroid={true}
        keyboardShouldPersistTaps='handled'
        onScroll={e=>{
          if(this.props.onScrollEndDrag){
            this.props.onScrollEndDrag(e.nativeEvent)
          }
        }}
        scrollEnabled={this.props.scrollable!=false}  contentContainerStyle={{flexGrow:1,flexDirection:'column',justifyContent:'space-between'}}>
          <View style={[this.style]}>
            {this.props.children}
          </View>
      </KeyboardAwareScrollView>
    )
  }
}
export default  KeyboardAvoidingContent;
