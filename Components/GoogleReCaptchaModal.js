import React from 'react';
import {KeyboardAvoidingView,Platform,ScrollView,View} from 'react-native';
import {GOOGLE_RECAPTCHA_SITE_KEY,server_url} from './../Config.js';
import { WebView } from 'react-native-webview';

const patchPostMessageJsCode = `(${String(function() {
  var originalPostMessage = window.postMessage
  var patchedPostMessage = function(message, targetOrigin, transfer) {
      //originalPostMessage(message, targetOrigin, transfer)
      window.ReactNativeWebView.postMessage(message)
  }
  patchedPostMessage.toString = function() {
      return String(Object.hasOwnProperty).replace('hasOwnProperty', 'postMessage')
  }
  window.postMessage = patchedPostMessage
})})();`

class GoogleReCaptchaModal extends React.Component {
  constructor(props){
    super(props);
    this.state={
      visible:false
    }
    this.html =
    `<HTML>
      <head>
          <script src='https://www.google.com/recaptcha/api.js?render=${GOOGLE_RECAPTCHA_SITE_KEY}'></script>
          <script>
            grecaptcha.ready(function() {
              grecaptcha.execute('${GOOGLE_RECAPTCHA_SITE_KEY}', {action: '${this.props.action||"resetpassword"}'})
              .then(function(captcha_token) {
                window.postMessage(captcha_token, "*");
              },function(error){
              })
            })
          </script>
      </head>
      <body>
        <h1>Check ReCaptcha...</h1>
      </body>
    </HTML>
    `
  }
  _onMessage( event ) {
    this.show(false);
    //console.log(event.nativeEvent.data);
    if(this.props.onSuccess){
      this.props.onSuccess(event.nativeEvent.data,this.state.action,this.state.data);
    }
  }

  show(_show,action,data){
    this.setState({
      visible:_show,
      action:action,
      data:data
    })
  }

  render(){
    if(!this.state.visible){
      return null;
    }
    return (
      <View  style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center',opacity:0}}>
        <WebView source={{html: this.html, baseUrl: server_url}}
          useWebKit={true}
          originWhitelist={["*"]}
          mixedContentMode={'always'}
          javaScriptEnabled={true}
          injectedJavaScript={patchPostMessageJsCode}
          automaticallyAdjustContentInsets
          onMessage={event=>this._onMessage(event)}
          style={{flex:1,width:200,height:200}}
         />
      </View>
    )
  }
}
export default  GoogleReCaptchaModal;
