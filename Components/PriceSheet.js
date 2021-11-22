import React from 'react';
import {server_url,currency,baseUrl} from './../Config.js';
import {Alert,View,ScrollView,TouchableOpacity,RefreshControl,ActivityIndicator,FlatList,Image} from 'react-native';
import {textCenter,headerPageStyle,moneyStyle,pageBackground,mainColor,mainButtonColor} from "./../style.js";
import {asyncdepartments,addToCart,asyncGetDataById,getLabel} from "./../API.js";
import Numeral from "numeral";
import Moment from "moment";
import equal from 'fast-deep-equal';
import PropTypes from 'prop-types';
import Context from '../Context';
//Numeral.locale('vi');
import {
  Text,Icon,Button
  ,Spinner,Thumbnail
  ,CheckBox,Label,Input
  ,Item,Toast
  ,Form,H1,H2,H3,Card,Grid,Row,Col
} from 'native-base';
class PriceSheet extends React.Component {
  constructor(props){
    super(props);
    this.navigate = this.props.navigation.navigate;
    this.state={
      obj:this.props.obj,
      price:(this.props.obj.prices||[]).length>0?this.props.obj.prices[0]:null
    }
  }
  componentDidUpdate(prevProps) {
    if(!equal(prevProps.obj,this.props.obj)){
      this.setState({obj:this.props.obj,price:((this.props.obj.prices||[]).length>0?this.props.obj.prices[0]:null)});
    }
  }
  book(price){
    /*if(!this.state.price){
      Alert.alert(getLabel("Bạn phải chọn một gói"));
      return;
    }*/
    this.navigate("Booking",{userInfo:this.context.userInfo,obj:this.state.obj,id_app:this.state.obj.id_app,price:price,voucherCode:this.props.voucherCode,ngay_bat_dau:this.props.ngay_bat_dau});
  }
  selPrice(p){
    this.setState({price:p})
  }
  changeQuatity(p,sl){
    p.sl_xuat = (p.sl_xuat||1)+sl;
    if(p.sl_xuat<1) p.sl_xuat = 1;
    this.setState({obj:this.state.obj});
  }
  render() {
    if(!this.state.obj || !this.state.obj.prices || this.state.obj.prices.length==0){
      return (
        <View style={{margin:20}}>
          <H3 style={{textAlign:"center"}}>{getLabel("Dịch vụ này chưa cập nhật giá bán")}</H3>
        </View>
      )
    }
    let prices = this.state.obj.prices.sort((a,b)=>a.price-b.price);
    return (
      <View style={this.props.style}>
        {this.props.title && prices.length>1 &&
          <View style={{marginTop:10,borderBottomColor: 'silver', borderBottomWidth: .5}}><Text note>{this.props.title}</Text></View>
        }
        <ScrollView style={{flexGrow:1}}>
          {prices.map(p=>
              <Card key={p.ma_dvt} style={{marginLeft:10,marginRight:10,marginTop:5}} noShadow>
                <View style={{paddingTop:10,paddingBottom:10,paddingRight:10}}>
                    {/*<CheckBox checked={this.state.price && p.ma_dvt===this.state.price.ma_dvt}  onPress={()=>this.selPrice(p)}/>*/}
                    <View style={{flexDirection:'column',flexGrow:1,marginLeft:20}}>
                      <View style={{flexDirection:"column",alignItems:"center"}}>
                          <H3 style={{textAlign:"center",fontWeight:"bold"}}>{ p.ten_dvt}</H3>
                          {/*<Text style={{textAlign:"center"}}>{`${p.so_lan||1} ${getLabel("buổi")}, ${p.so_gio_1_lan||0} ${getLabel("giờ")}/${getLabel("buổi")} `}</Text>*/}
                          <H1 style={[moneyStyle],{fontWeight:"bold",textAlign:"right"}}>{Numeral(p.price * (p.sl_xuat||1)).format()} {currency}</H1>
                      </View>
                      <View style={{marginTop:10,flexDirection:"row",justifyContent:"center",alignItems:"center"}}>
                        <Button  light rounded onPress={()=>this.changeQuatity(p,-1)}>
                          <Icon type="FontAwesome" name="minus"/>
                        </Button>
                        <Text style={{marginLeft:10,marginRight:10,fontWeight:"bold"}}>{p.sl_xuat||1}</Text>
                        <Button light rounded onPress={()=>this.changeQuatity(p,1)}>
                          <Icon type="FontAwesome" name="plus" />
                        </Button>
                      </View>

                      {p.ghi_chu &&
                        <View style={{marginTop:10}}>
                          <Text style={{textAlign:"center"}} note>({p.ghi_chu})</Text>
                        </View>
                      }
                    </View>

                    <View style={{margin:20,marginBottom:10}}>
                      <Button  full rounded onPress={()=>this.book(p)} style={{backgroundColor:mainButtonColor}}>
                        <Text>{getLabel("Chọn")}</Text>
                      </Button>
                    </View>
                </View>
              </Card>
            )
          }
        </ScrollView>

      </View>
    );
  }
}
PriceSheet.propTypes={
  voucherCode:PropTypes.string.isRequired
}
PriceSheet.contextType = Context;
export default  PriceSheet;
