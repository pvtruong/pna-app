import React from 'react';
import {server_url,id_app,baseUrl} from './../Config.js';
import {ScrollView,Image,StyleSheet,View} from 'react-native';
import {pageBackground,mainColor} from "./../style.js";
import { BlurView } from 'expo-blur';
import Context  from '../Context';
import RequireLoginWidget from "./RequireLoginWidget.js";

class ContentApp extends React.PureComponent {
  constructor(props){
    super(props);
    this.style ={
      flex:1,
      flexDirection:'column',

    }
    if(this.props.padder){
      this.style.position ='absolute';
      this.style.top =0;
      this.style.left =0;
      this.style.right =0;
      this.style.bottom =0;

      this.style.borderRadius=0;
      this.style.borderColor="silver";
      this.style.borderWidth=0;
    }
    this.state={
      show:false
    }
  }
  renderContent(){
    return (
      <View style={{flex:1}}>
        <Context.Consumer>
          {({userInfo})=>{
              if((!userInfo || userInfo.email==='public') && this.props.requireLogin){
                return (
                  <View style={[this.style,this.props.style]}>
                    <RequireLoginWidget navigation = {this.props.navigation}/>
                  </View>
                )
              }else{
                return (
                  <View style={StyleSheet.absoluteFill}>
                    {this.props.scrollable!==false?
                      <ScrollView contentContainerStyle={this.props.style} style={this.style}>
                        {this.props.children}
                      </ScrollView>
                      :
                      <View style={[this.style,this.props.style]}>
                        {this.props.children}
                      </View>
                    }
                  </View>
                )
              }
            }
          }
        </Context.Consumer>
      </View>
    )
  }
  componentDidMount() {
    this.mounted = true;
    setTimeout(()=>{
      if(this.mounted) this.setState({show:true})
    },0)
  }
  componentWillUnmount(){
    this.mounted = false;
  }

  render() {
    if(!this.state.show) return <View style={{flex:1,backgroundColor:"white"}}/>;
    return this.renderContent();
  }
}
ContentApp.contextType = Context;
export default  ContentApp;
