import React from 'react';
import {server_url,baseUrl,id_app,mainColor} from './../Config.js';
import {Alert,Image,StyleSheet,View,ScrollView,Modal,ActivityIndicator,AsyncStorage} from 'react-native';
import {headerPageStyle,pageBackground,loading} from './../style.js';
import {getLabel,asyncGet,asyncGetGridInfo,asyncGetReportInfo,asyncGetVoucher,asyncGetVoucherInfo,asyncUpdateVoucher,asyncPostVoucher} from "./../API.js";
import {Left,Right,Body,Text,Form,Icon,Button,Thumbnail,Label,Input,Item,Toast,Spinner,H3 } from 'native-base';
import Picker from "../Components/Picker.js";
import Voucher from "../Components/InputBase.js";
import DateTimePicker from "../Components/DateTimePicker.js";
import AutoCompleteInput from "../Components/AutoCompleteInput.js";
import Context from "../Context";
import Moment from 'moment';
import Numeral from 'numeral'
import {Dimensions} from 'react-native';
import {toNumber} from "../utils";
const { width: viewportWidth, height: viewportHeight } = Dimensions.get('window');
const tableWidth = viewportWidth<1000?0:viewportWidth;
const  constraints = {
  master: {
    so_ct: {presence:{message: '^' + getLabel("Bạn phải nhập số chứng từ bên tab t.t chung")}},
    ngay_ct: {presence:{message: '^' + getLabel("Bạn phải nhập ngày chứng từ bên tab t.t chung")}},
    ma_kh: {presence:{message: '^' + getLabel("Bạn phải nhập thông tin khách hàng bên tab t.t chung")}},
    ma_nv: {presence:{message: '^' + getLabel("Bạn phải nhập NVKD bên tab t.t chung")}},
  },
  dso1:{
    ma_vt: {presence:{message: '^' + getLabel("Bạn phải nhập sản phẩm bên tab chi tiết")}},
    ma_dvt: {presence:{message: '^' + getLabel("Bạn phải nhập đơn vị tính bên tab chi tiết")}},
    ma_kho: {presence:{message: '^' + getLabel("Bạn phải nhập kho hàng bên tab chi tiết")}},
  }
}
class SO1 extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      header:null
    }
  };
  constructor(props){
    super(props);
    this.state={}
  }
  async componentDidMount(){
    this.mounted = true;
    try{
      let voucherInfo = await asyncGetVoucherInfo(this.context.userInfo.token,"SO1",this.context.userInfo.email);
      let defaultData ={
        tab_dso1:[],
        status:0,
        ma_dvcs:'PNA',
        ma_tt:"TM",
        so_ct:'SO1',
        ma_ct:'SO1',
        qct: ((await AsyncStorage.getItem(`so1_qct`))||"SO1")
      }
      voucherInfo.master.columns.forEach(c=>{
        if(c.defaultvalue){
          defaultData[c.id] = c.defaultvalue;
        }
      })
      if(!defaultData.ngay_ct) defaultData.ngay_ct = new Date();
      if(!defaultData.ngay_giao) defaultData.ngay_giao = new Date();
      defaultData.ma_nt = "VND";
      defaultData.ty_gia = 1;
      this.setState({voucherInfo,defaultData})
    }catch(e){
      Alert.alert(e.message || "Chứng từ này không tồn tại");
    }finally{
    }
  }
  async componentWillUnmount(){
    this.mounted = false;
  }
  render() {
    if(!this.state.voucherInfo) return null;
    let otherColumns = this.state.voucherInfo.master.columns.filter(c=>c.id!="dien_giai" && c.id!="status" && c.id!="sel"  && c.id!="so_ct" && c.id!="ngay_ct" && !c.hide);
    return (
      <Voucher navigation = {this.props.navigation}
        title={getLabel("Đơn hàng")}
        tableWidth={tableWidth}
        voucherInfo = {this.state.voucherInfo}
        allowAdd
        columns={[
          {id:'dien_giai',label:'Diễn giải',size:3,hideWhen:row=>!row.dien_giai && !row.so_ct,
            format:(d)=>{
              return (
                <View style={{flexDirection:'column',width:'100%'}}>
                  <H3 style={{fontWeight:d.bold?'bold':'normal'}}>{d.dien_giai}</H3>
                  <Text>Số chứng từ: {d.so_ct}, ngày: {Moment(d.ngay_ct).format("DD/MM/YYYY")}</Text>
                  <View>
                      <Picker disableItems = {this.state.voucherInfo.statusDisable}  items={this.state.voucherInfo.statusList} valueField="Inds" labelField="Text" selectedValue={Number(d.status)}
                        onValueChange={async status=>{
                          if(status.toString()===d.status.toString()) return;
                          try{
                            this.context.setProcessing(true);
                            let data = {status:status.toString()};

                            if(status=="1" && !d.n1){
                              data.n1 = this.context.userInfo.email;
                              data.t1 = new Date();
                              data.ngay_duyet_gia = new Date();
                            }
                            if(status=="2" && !d.n2){
                              data.n2 = this.context.userInfo.email;
                              data.t2 = new Date();
                              data.ngay_duyet_cn = new Date();
                            }
                            await asyncUpdateVoucher(this.context.userInfo.token,this.state.voucherInfo.voucherid,d.stt_rec,data);
                            for(let k in data){
                              d[k] = data[k];
                            }
                          }catch(e){
                            console.log("Error update so1",e.message);
                            let error = e.message;
                            if(error.includes("{") && error.includes("}")){
                              try{
                                error = JSON.parse(error);
                              }catch(e){
                                error ={message:error}
                              }
                            }else{
                              error ={message:error}
                            }
                            this.context.alert(error.message || "Không thể cập nhật chứng từ này");
                          }finally{
                            this.context.setProcessing(false);
                          }
                        }}
                      />
                  </View>
                </View>

              )
            }
          }
        ].concat(otherColumns)}
        details={this.state.voucherInfo.details}
        master={this.state.voucherInfo.master}
        defaultData={this.state.defaultData}
        getUrl={condition=>{
          let url = `${server_url}/api/${id_app}/voucher/${this.state.voucherInfo.master.voucherid}?user=${this.context.userInfo.email}`;
          if(condition){
            let where = `1=1`;
            if(condition.tu_ngay){
              let tu_ngay= Moment(condition.tu_ngay).format("YYYY-MM-DD");
              where =`${where} and ngay_ct>='${tu_ngay}'`
            }
            if(condition.den_ngay){
              let den_ngay= Moment(condition.den_ngay).format("YYYY-MM-DD");
              where =`${where} and ngay_ct<='${den_ngay}'`
            }
            if(condition.stt_rec){
              where =`${where} and stt_rec='${condition.stt_rec}'`
            }
            url = `${url}&so_ct=${condition.so_ct||''}%&ma_kh=${(condition.kh||{}).ma_kh||''}%&where=${where}`;
          }
          url =`${url}&limit=20&sort=ngay_ct desc,so_ct desc`
          return url;
        }}
        condition ={this.props.navigation.getParam("condition") || {
          kh:{},
          tu_ngay:Moment().startOf("month").toDate(),
          den_ngay:Moment().endOf("month").toDate()
        }}
        constraints={constraints}
        saveData={(data,cb)=>{
          data.dso1 = [...data.tab_dso1];
          if(data.qct) this.state.defaultData.qct = data.qct;

          delete data.tab_dso1;
          if(data.stt_rec){
            data.ngay_sua = new Date();
            data.nguoi_sua = this.context.userInfo.email
          }else{
            data.ngay_tao = new Date();
            data.nguoi_tao = this.context.userInfo.email
          }
          asyncPostVoucher(this.context.userInfo.token,"so1",data).then(rs=>{
            if(cb) cb(null,rs);
          }).catch(e=>{
            cb(e);
          })
        }}
        inputForms={
          {
            masterForm:(data,updateData)=>{
              return (
                <Form style={{backgroundColor:"white",width:"100%",padding:5}}>

                  <Item stackedLabel>
                    <Label>{getLabel("Ngày chứng từ")} (*)</Label>
                    <View style={{width:'100%',marginTop:15}}>
                      <DateTimePicker  value={data.ngay_ct} onValueChange={ngay_ct=>updateData(data,{ngay_ct})} mode='date' icon="pencil-square-o" typeIcon ="FontAwesome"/>
                    </View>
                  </Item>
                  <Item stackedLabel>
                    <Label>{getLabel("Số chứng từ")} (*)</Label>
                    <Input editable={true}  autoCapitalize={'none'}  clearButtonMode ={'while-editing'} autoCorrect ={false} value={data.so_ct} onChangeText={(so_ct)=>updateData(data,{so_ct})}/>
                  </Item>
                  <Item stackedLabel>
                    <Label>{getLabel("Khách hàng")} (*)</Label>
                    <View style={{width:'100%',marginTop:15}}>
                      <AutoCompleteInput title="Danh mục khách hàng" placeholder="Nhập mã hoặc tên khách hàng" valueField="ma_kh" labelField="ten_kh"
                        value ={{ma_kh:data.ma_kh,ten_kh:data.ten_kh}}
                        getUrl={query=>{
                          let where = `trang_thai=1 and (ma_kh like '${query}%' or ten_kh like N'%${query}%' or ma_so_thue like N'%${query}%')`
                          let url =`${server_url}/api/${id_app}/list/dmkh?limit=20&fields=ma_kh,ten_kh&where=${where}&access_token=${this.context.userInfo.token}`
                          return url;
                        }}
                        onValueChange={item=>updateData(data,{ma_kh:item.ma_kh,ten_kh:item.ten_kh})}
                        icon="list" typeIcon ="FontAwesome"/>
                    </View>
                  </Item>

                  <Item stackedLabel>
                    <Label>{getLabel("NVKD")} (*)</Label>
                    <View style={{width:'100%',marginTop:15}}>
                      <AutoCompleteInput title="Danh mục nhân viên" placeholder="Nhập mã hoặc tên nhân viên" valueField="ma_nv" labelField="ten_nv"
                        value ={{ma_nv:data.ma_nv,ten_nv:data.ten_nv}}
                        getUrl={query=>{
                          let where = `trang_thai=1 and (ma_nv like '${query}%' or ten_nv like N'%${query}%')`
                          let url =`${server_url}/api/${id_app}/list/dnv?limit=20&fields=ma_nv,ten_nv&where=${where}&access_token=${this.context.userInfo.token}`
                          return url;
                        }}
                        onValueChange={item=>updateData(data,{ma_nv:item.ma_nv,ten_nv:item.ten_nv})}
                        icon="list" typeIcon ="FontAwesome"/>
                    </View>
                  </Item>

                  <Item stackedLabel>
                    <Label>{getLabel("Ngày giao")}</Label>
                    <View style={{width:'100%',marginTop:15}}>
                      <DateTimePicker  value={data.ngay_giao} onValueChange={ngay_giao=>updateData(data,{ngay_giao})} mode='date' icon="pencil-square-o" typeIcon ="FontAwesome"/>
                    </View>
                  </Item>
                  <Item stackedLabel>
                    <Label>{getLabel("Nơi giao")}</Label>
                    <Input editable={true}  autoCapitalize={'none'}  clearButtonMode ={'while-editing'} autoCorrect ={false} value={data.dia_chi_giao} onChangeText={(dia_chi_giao)=>updateData(data,{dia_chi_giao})}/>
                  </Item>

                  <Item stackedLabel>
                    <Label>{getLabel("HTTT")} (*)</Label>
                    <View style={{width:"100%",paddingTop:10}}>
                      <Picker  items={[{code:"TM",name:"TM"},{code:"TS",name:"TS"}]} valueField="code" labelField="name" selectedValue={data.ma_tt}
                        onValueChange={ma_tt=>{
                          updateData(data,{ma_tt})
                        }}/>
                    </View>
                  </Item>

                  <Item stackedLabel>
                    <Label>{getLabel("Diễn giải")}</Label>
                    <Input editable={true}  autoCapitalize={'none'}  clearButtonMode ={'while-editing'} autoCorrect ={false} value={data.dien_giai} onChangeText={(dien_giai)=>updateData(data,{dien_giai})}/>
                  </Item>
                </Form>
              )
            },
            dso1Form:(rows,updateData,removeRow,addRow)=>{
              return (
                <View style={{width:"100%"}}>
                  {rows.map((data,index)=>{
                    return (
                      <View key={index.toString()} style={{width:"100%",marginBottom:10}}>
                        <Form style={{backgroundColor:"white",width:"100%",padding:5}}>
                          <Item stackedLabel>
                            <Label>{getLabel("Sản phẩm")} (*)</Label>
                            <View style={{width:'100%',marginTop:15}}>
                              <AutoCompleteInput title="Danh mục sản phẩm" placeholder="Nhập mã hoặc tên sản phẩm" valueField="ma_vt" labelField="ten_vt"
                                value ={{ma_vt:data.ma_vt,ten_vt:data.ten_vt}}
                                getUrl={query=>{
                                  let where = `trang_thai=1 and (ma_vt like '${query}%' or ten_vt like N'%${query}%')`
                                  let url =`${server_url}/api/${id_app}/list/dmvt?limit=20&fields=ma_vt,ten_vt,ma_dvt&where=${where}&access_token=${this.context.userInfo.token}`
                                  return url;
                                }}
                                onValueChange={item=>updateData(data,{ma_vt:item.ma_vt,ten_vt:item.ten_vt,ma_dvt:item.ma_dvt})}
                                icon="list" typeIcon ="FontAwesome"/>
                            </View>
                          </Item>
                          <Item stackedLabel>
                            <Label>{getLabel("Kho hàng")} (*)</Label>
                            <View style={{width:'100%',marginTop:15}}>
                              <AutoCompleteInput title="Danh mục sản phẩm" placeholder="Nhập mã hoặc tên kho" valueField="ma_kho" labelField="ten_kho"
                                value ={{ma_kho:data.ma_kho,ten_kho:data.ten_kho}}
                                getUrl={query=>{
                                  let where = `trang_thai=1 and (ma_kho like '${query}%' or ten_kho like N'%${query}%')`
                                  let url =`${server_url}/api/${id_app}/list/dmkho?limit=20&fields=ma_kho,ten_kho&where=${where}&access_token=${this.context.userInfo.token}`
                                  return url;
                                }}
                                onValueChange={item=>updateData(data,{ma_kho:item.ma_kho,ten_kho:item.ten_kho})}
                                icon="list" typeIcon ="FontAwesome"/>
                            </View>
                          </Item>

                          <Item stackedLabel>
                            <Label>{getLabel("Số lượng")}</Label>
                            <Input editable={true}   keyboardType ={'number-pad'}   autoCapitalize={'none'}  clearButtonMode ={'while-editing'} autoCorrect ={false} value={Numeral(data.so_luong).format()} onChangeText={(so_luong)=>updateData(data,{so_luong:toNumber(so_luong),tien_nt:toNumber(so_luong)*data.gia_nt,tien:toNumber(so_luong)*data.gia_nt})}/>
                          </Item>
                          <Item stackedLabel>
                            <Label>{getLabel("Giá")}</Label>
                            <Input editable={true}    keyboardType ={'number-pad'}   autoCapitalize={'none'}  clearButtonMode ={'while-editing'} autoCorrect ={false} value={Numeral(data.gia_nt).format()} onChangeText={(gia_nt)=>updateData(data,{gia_nt:toNumber(gia_nt),gia:toNumber(gia_nt),tien_nt:data.so_luong*toNumber(gia_nt),tien:data.so_luong*toNumber(gia_nt)})}/>
                          </Item>
                          <Item stackedLabel>
                            <Label>{getLabel("Tiền")}</Label>
                            <Input editable={true}   keyboardType ={'number-pad'}   autoCapitalize={'none'}  clearButtonMode ={'while-editing'} autoCorrect ={false} value={Numeral(data.tien_nt).format()} onChangeText={(tien_nt)=>updateData(data,{tien_nt:toNumber(tien_nt),tien:toNumber(tien_nt)})}/>
                          </Item>


                        </Form>
                        <View style={{top:2,right:2,position:"absolute"}}>
                          <Button rounded danger small onPress={()=>removeRow("dso1",index)}><Text>x</Text></Button>
                        </View>
                      </View>
                    )
                  })}
                  <View style={{flexDirection:"row",justifyContent:"center",alignItems:"center",padding:10,width:"100%"}}>
                    <Button rounded small onPress={()=>addRow("dso1",{so_luong:0,gia:0,gia_nt:0,tien_nt:0,tien:0})}><Text>{getLabel("Thêm dòng mới")}</Text></Button>
                  </View>
                </View>
              )
            }
          }
        }
        renderConditionForm={(condition,updateCondition)=>{
          return (
            <Form style={{backgroundColor:"white",borderRadius:10,width:"100%"}}>
              <Item stackedLabel>
                <Label>{getLabel("Từ ngày")} (*)</Label>
                <View style={{width:'100%',marginTop:15}}>
                  <DateTimePicker  value={condition.tu_ngay} onValueChange={tu_ngay=>updateCondition(condition,{tu_ngay})} mode='date' icon="pencil-square-o" typeIcon ="FontAwesome"/>
                </View>
              </Item>
              <Item stackedLabel>
                <Label>{getLabel("Đến ngày")} (*)</Label>
                <View style={{width:'100%',marginTop:15}}>
                  <DateTimePicker  value={condition.den_ngay} onValueChange={den_ngay=>updateCondition(condition,{den_ngay})} mode='date' icon="pencil-square-o" typeIcon ="FontAwesome"/>
                </View>
              </Item>
              <Item stackedLabel>
                <Label>{getLabel("Số chứng từ")}</Label>
                <Input editable={true}  autoCapitalize={'none'}  clearButtonMode ={'while-editing'} autoCorrect ={false} value={condition.so_ct} onChangeText={(so_ct)=>updateCondition(condition,{so_ct})}/>
              </Item>
              <Item stackedLabel>
                <Label>{getLabel("Khách hàng")}</Label>
                <View style={{width:'100%',marginTop:15}}>
                  <AutoCompleteInput title="Danh mục khách hàng" placeholder="Nhập mã hoặc tên khách hàng" valueField="ma_kh" labelField="ten_kh"
                    value ={condition.kh}
                    getUrl={query=>{
                      let where = encodeURI(`trang_thai=1 and (ma_kh like '${query}%' or ten_kh like N'%${query}%' or ma_so_thue like N'%${query}%')`)
                      let url =`${server_url}/api/${id_app}/list/dmkh?limit=20&fields=ma_kh,ten_kh&where=${where}&access_token=${this.context.userInfo.token}`
                      return url;
                    }}
                    onValueChange={item=>updateCondition(condition,{kh:item})}
                    icon="list" typeIcon ="FontAwesome"/>
                </View>
              </Item>
            </Form>
          )
        }}
      />
    );
  }
}
SO1.contextType = Context;
export default SO1
