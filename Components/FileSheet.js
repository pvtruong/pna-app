import React from 'react';
import {server_url,server_url_report,currency,id_app,baseUrl,public_token} from './../Config.js';
import {Alert,View,TouchableOpacity,RefreshControl,ActivityIndicator,FlatList,InteractionManager} from 'react-native';
import {textCenter,headerPageStyle,moneyStyle,pageBackground,screenCenter} from "./../style.js";
import {asyncFiles,cacheImages,cachedData} from "./../API.js";
import {Video} from "expo"
import Numeral from "numeral";
import Moment from "moment";
import equal from 'fast-deep-equal';
import PropTypes from 'prop-types';
import Carousel, { Pagination } from 'react-native-snap-carousel';
import ImageViewer from 'react-native-image-view';
import { Image } from 'react-native-elements';
import {Dimensions} from 'react-native';
const { width: viewportWidth, height: viewportHeight } = Dimensions.get('window');
function wp (percentage) {
    const value = (percentage * (viewportWidth)) / 100;
    return Math.round(value);
}
let slideWidth = wp(100);
let itemHorizontalMargin = wp(0.01);
let sliderWidth = viewportWidth;
let itemWidth = slideWidth + itemHorizontalMargin * 2;
let itemHeight= slideWidth*9/16;
//Numeral.locale('vi');
import {
  Text,Title,Icon,Button
  ,Spinner,Thumbnail,ListItem,List
  ,Label,Input
  ,Item
  ,H2,H3
} from 'native-base';
class FileSheet extends React.Component {
  constructor(props){
    super(props);
    this.navigate = this.props.navigation.navigate;
    this.userInfo = cachedData.userInfo;
    this.token = public_token;
    this.id_app = this.props.id_app || id_app;
    this.videoObjects = {};
    if(this.props.margin){
      sliderWidth = sliderWidth - this.props.margin;
      itemWidth = itemWidth - this.props.margin;
    }
    this.state={
      isPlaying:false,
      openModel:false,
      activeSlide:0
    }

  }
  async componentDidMount() {
    this.mounted = true

    this.willFocusSubscription = this.props.navigation.addListener(
      'willFocus',
      payload => {
        this.mounted = true;
      }
    );
    this.didBlurSubscription = this.props.navigation.addListener(
      'didBlur',
      payload => {
        this.mounted = false;
      }
    );

    this.loadFiles();
  }
  async componentWillUnmount(){
    this.mounted = false;
    this.willFocusSubscription.remove();
    this.didBlurSubscription.remove();

    if(this.state.isPlaying){
      try{
        for(let _url in this.videoObjects){
          let videoObject = this.videoObjects[_url];
          await videoObject.stopAsync()
        }
      }catch(e){
        console.log(e.message);
      }
    }
  }
  PlaybackStatusUpdate(playbackStatus){
    if(playbackStatus.isPlaying!==this.state.isPlaying){
      this.setState({
        isPlaying:playbackStatus.isPlaying
      })
    }
  }
  async loadFiles(){
    if(this.mounted){
      this.setState({
        refreshing:true
      })
    }

    try{
      let files = await asyncFiles(public_token,this.props.idLink,this.id_app,this.props.condition,this.props.limit);
      if(this.props.files)
      files = files.concat(this.props.files);
      if(this.mounted){
        this.setState({
          files:files,
          refreshing:false
        })

        if(this.props.onLoadFiles){
          this.props.onLoadFiles(files);
        }
      }


    }catch(e){
      if(this.mounted){
        this.setState({
          refreshing:false
        })
      }

      Alert.alert(e.message);
    }
  }
  componentDidUpdate(prevProps) {
    if(prevProps.idLink!==this.props.idLink){
      this.loadFiles();
    }
  }

  renderVideo(item){
    return null;
    /*let url = `${server_url_report}/api/${this.id_app}/file/download/${item._id}?access_token=${this.token}`;
    return (
      <TouchableOpacity key={item._id} style={{margin:10,height:300,backgroundColor:'black'}} onPress={()=>this.stream(item)}>
        <Video useNativeControls= {true} ref={(ref)=>this.videoObjects[url] = ref}
          source={{ uri: url }}
          rate={1.0}
          volume={1.0}
          isMuted={false}
          resizeMode="cover"
          shouldPlay={false}
          isLooping={false}
          style={{ width: "100%", height: 300 }}
          onPlaybackStatusUpdate={(status)=>this.PlaybackStatusUpdate(status)}
        />
      </TouchableOpacity>
    )*/
  }
  renderImage(item,index){
    let url = item._id?`${server_url_report}/api/${this.id_app}/file/download/${item._id}?size=${this.props.imageSize||'S'}&access_token=${this.token}`:null;
    /*if(url){
      Promise.all([...cacheImages([url])]).then(rs=>{

      }).catch(e=>{
        console.log("error cache image",e.message)
      })
    }*/
    if(this.props.renderImage) return this.props.renderImage(url,item);
    let source=url?{uri:url}:item;
    let numColumns =  this.props.numColumns||1;
    let width = (viewportWidth-20)/numColumns;
    return (
      <TouchableOpacity  style={{padding:10,overflow:'hidden',width:width,flexDirection:'column',alignItems:'center'}} key={item._id} onPress={()=>this.setState({openModel:true,activeSlide:index})}>
          <Image resizeMode="cover"   style={{height:width-20,width:width-20}} source={source} placeholderStyle={{backgroundColor:"white"}} PlaceholderContent={<ActivityIndicator />}/>
          {item.mieu_ta?<Text style={{marginTop:10,marginBottom:10,textAlign:'center'}}>{item.mieu_ta}</Text>:null}
      </TouchableOpacity>

    )
  }
  renderCarouselItem({item,index}){
    let source ;
    if(item._id){
      source ={uri:`${server_url_report}/api/${this.id_app}/file/download/${item._id}?size=${this.props.imageSize||'S'}&access_token=${this.token}`};
    }else{
      source= item;
    }
    return(
      <TouchableOpacity  key={item._id} onPress={()=>this.setState({openModel:true})}>
          <View style={{overflow:'hidden',backgroundColor:"white"}}>
            <Image resizeMode="contain"   style={{width:'100%',height:itemHeight}}
              source={source} placeholderStyle={{backgroundColor:"white"}} PlaceholderContent={<ActivityIndicator />}/>
          </View>
      </TouchableOpacity>
    )
  }

  pagination () {
      const { activeSlide } = this.state;
      return (
          <Pagination
            containerStyle={{ paddingVertical: 10 }}
            dotsLength={this.state.files.length}
            activeDotIndex={activeSlide}
            dotStyle={{
                width: 10,
                height: 10,
                borderRadius: 5,
                marginHorizontal: 3,
                backgroundColor: 'rgba(0, 0, 0, 0.6)'
            }}
            inactiveDotStyle={{
                // Define styles for inactive dots here
            }}
            inactiveDotOpacity={0.4}
            inactiveDotScale={0.6}
          />
      );
  }
  renderCarousel(){
    let images = (this.state.files||[]).map(f=>{
      return {
        source : f._id?{uri:`${server_url_report}/api/${this.id_app}/file/download/${f._id}?size=${this.props.imageSize||'S'}&access_token=${this.token}`}:f,
        title: f.mieu_ta
      }
    })
    return(
      <View style={[{flexDirection:"column",justifyContent:"center",alignItems:"center",backgroundColor:"white"},this.props.style]}>
        <Carousel
          layout={'default'}
          loop={false}
          useScrollView ={true}
          data={this.state.files}
          renderItem={({item,index})=>this.renderCarouselItem({item,index})}
          sliderWidth={sliderWidth}
          itemWidth={itemWidth}
          onSnapToItem={(index) => this.setState({ activeSlide: index }) }/>
          <View style={{marginTop:this.state.files.length>1?0:10}}>{ this.pagination() }</View>
          <ImageViewer
             images={images}
             imageIndex={this.state.activeSlide||0}
             isVisible={this.state.openModel}
             controls={{next: true, prev: true,close:true}}
             onClose={() => this.setState({openModel: false})}
          />
      </View>
    )
  }
  renderItem(item,index){
    if(item.file.extension==='mp4' || item.file.extension==='avi' || item.file.extension==='mp3' || item.file.extension==='aac'){
      return this.renderVideo(item);
    }
    if(item.file.extension==='png' || item.file.extension==='jpg' || item.file.extension==='jpeg'){
      return this.renderImage(item,index);
    }
    return null;
  }

  async stream(item){
    let url = `${server_url_report}/api/${this.id_app}/file/download/${item._id}?access_token=${this.token}`;
    if(this.state.source!==url){
      this.setState({
        source:url,
        _id:item._id
      })
      if(this.state.isPlaying){
        try{
          for(let _url in this.videoObjects){
            let videoObject = this.videoObjects[_url];
            await videoObject.stopAsync()
          }
        }catch(e){
          console.log(e.message);
        }
      }
      if(item.file.extension==='mp4' || item.file.extension==='avi'){

        for(let _url in this.videoObjects){
          if(_url===url){
            let videoObject = this.videoObjects[_url];
            await videoObject.playAsync();
          }
        }
        return;
      }
      return;
    }
    //continue playing
    if(this.state.isPlaying){
      try{
        for(let _url in this.videoObjects){
          let videoObject = this.videoObjects[_url];
          await videoObject.pauseAsync()
        }
      }catch(e){
        console.log(e.message);
      }
    }else{
      if(item.file.extension==='mp4' || item.file.extension==='avi'){
        for(let _url in this.videoObjects){
          if(_url===url){
            let videoObject = this.videoObjects[_url];
            await videoObject.playAsync();
          }
        }
        return;
      }
    }
  }


  render() {
    if(this.state.refreshing){
      if(this.props.defaultItem){
        return this.props.defaultItem();
      }else{
        return (
          <View style={{margin:20}}>
            <ActivityIndicator />
          </View>
        )
      }
    }

    if(!this.state.files || this.state.files.length===0){
      if(this.props.defaultItem){
        return this.props.defaultItem();
      }
      if(this.props.defaultImage){
        return this.renderImage(this.props.defaultImage);
      }else{
        if(this.props.notFileTitle){
          return <Text style={{margin:10}}>{this.props.notFileTitle}</Text>
        }else{
          return null
        }

      }
    }
    if(this.props.carousel){
      return this.renderCarousel();
    }

    let images = (this.state.files||[]).map(f=>{
      return {
        source : {uri:`${server_url_report}/api/${this.id_app}/file/download/${f._id}?size=L&access_token=${this.token}`},
        title: f.mieu_ta
      }
    })
    return (
      <View>
        {
          this.props.numColumns && this.props.numColumns>1?
          <FlatList
            scrollEnabled={false}
            numColumns={this.props.numColumns||1}
            data={this.state.files}
            keyExtractor={(item, index) => item._id}
            renderItem={({item,index})=>
              this.renderItem(item,index)
            }
          />
          :
            <View>
              {this.state.files.map((item,index)=>this.renderItem(item,index))}
            </View>
        }

        <ImageViewer
           images={images}
           imageIndex={this.state.activeSlide||0}
           isVisible={this.state.openModel}
           controls={{next: true, prev: true,close:true}}
           onClose={() => this.setState({openModel: false})}
           renderFooter={(currentImage) => (<View style={{margin:20}}><Text style={{color:"white",textAlign:'center'}}>{currentImage.title||""}</Text></View>)}
        />


      </View>
    )
  }
}
FileSheet.propTypes={
  idLink:PropTypes.string.isRequired
}
export default  FileSheet;
