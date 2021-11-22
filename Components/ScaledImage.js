import React, { Component, PropTypes } from "react";
import { Image } from "react-native";

export default class ScaledImage extends Component {
constructor(props) {
    super(props);
    let {width,height} =  this.props;
    if(!height) height = width;
    this.state = { source: { uri: this.props.uri },width:width,height:height};
}

componentWillMount() {
  this.mounted = true;
  /*Image.getSize(this.props.uri, (width, height) => {
      if (this.props.width && !this.props.height) {
          if(this.mounted) this.setState({
              width: this.props.width,
              height: height * (this.props.width / width)
          });
      } else if (!this.props.width && this.props.height) {
          if(this.mounted) this.setState({
              width: width * (this.props.height / height),
              height: this.props.height
          });
      } else {
          if(this.mounted) this.setState({ width: width, height: height });
      }
  });*/
}
componentDidMount() {

}
componentWillUnmount(){
  this.mounted = false;
}
render() {
  if(!this.state.width || !this.state.height) return  null;
  return (
        <Image
            source={this.state.source}
            resizeMode="contain"
            style={{ height: this.state.height, width: this.state.width }}
        />
    );
  }
}
