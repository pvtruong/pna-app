import React from 'react';
import Constants from 'expo-constants';
import {SLUG_APP_FOR_CUSTOMER} from './Config';
let textCenter ={
  flex: 1,
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  padding:10
}
let rounded={
  borderRadius:5,
  backgroundColor:'silver'
}
let inputStyle =  {
    margin: 15,
    height: 40,
    borderColor: '#7a42f4',
    borderWidth: 1,
    backgroundColor:'white',
    borderRadius:10,
    padding:10,
    textAlign:'center'
}


let screenCenter={
  flex: 1,
  flexDirection: 'column',
  justifyContent: 'center',
}
let pageBackground={
  backgroundColor:"white"
}
let sidebarHeaderStyle ={
  padding:10
}

let loading= {
  position: 'absolute',
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
  alignItems: 'center',
  justifyContent: 'center'
}

let groupItemStyle={
  style:{
    flexDirection:'row',
    justifyContent:'center',
    alignItems:'center',
    height:'100%',
    borderRadius:10,
    padding:10
  },
  colors:[
    '#57BDFB','#7ACAFA', '#57BDFB'
  ]
}
let cardBorderRadius={
  borderRadius:2
}
let cardHeader ={
  backgroundColor:'#57BDFB'
}



//let mainColor =(Constants.manifest.slug !== SLUG_APP_FOR_CUSTOMER?'#3EA473':'#962364');
//let lightColor =(Constants.manifest.slug !== SLUG_APP_FOR_CUSTOMER?'#5AA953':'#E52D7C');

let mainColor =(Constants.manifest.slug !== SLUG_APP_FOR_CUSTOMER?'#EC212D':'#EC212D');
let lightColor =(Constants.manifest.slug !== SLUG_APP_FOR_CUSTOMER?'#EC212D':'#EC212D');

let mainTextColor ='white';
let mainButtonColor =lightColor;

let headerBackgroundColor =	'rgba(11, 104, 76,0.8)';
let footerBackgroundColor =	'white';
let headerColor =	'#178897';
let docquyenBackgroundColor ='rgba(255, 51, 0,0.7)';

let headerPageStyle={
  backgroundColor:headerBackgroundColor,
}

let moneyStyle={
  color:mainColor,
}
let discountStyle={
  color:'red',
  fontWeight:'bold'
}

let cardSylte={
  backgroundColor:'white',
  borderRadius:0,
  borderColor:"#E1E7E7",
  borderWidth:0.5,
  overflow:'hidden'
}

let cardItemFirstBorderRadius={ borderTopLeftRadius: cardBorderRadius.borderRadius, borderTopRightRadius: cardBorderRadius.borderRadius,backgroundColor:cardHeader.backgroundColor };
let cardItemLastBorderRadius={ borderBottomLeftRadius: cardBorderRadius.borderRadius, borderBottomRightRadius: cardBorderRadius.borderRadius,backgroundColor:'white' };

let linearBackgroundColor =[mainColor,lightColor];

let listItem =(index,length)=>{
  return {
    marginLeft:10,
    marginRight:10,
    marginTop:index===0?10:0,
    padding:10,
    backgroundColor:'white',
    borderTopLeftRadius:index===0?5:0,
    borderTopRightRadius:index===0?5:0,
    borderBottomLeftRadius:index===length-1?5:0,
    borderBottomRightRadius:index===length-1?5:0,
    borderTopColor:'silver',borderTopWidth:index===0?0:.3
  }
}
export {
  textCenter,rounded,screenCenter,inputStyle,moneyStyle,sidebarHeaderStyle,headerPageStyle,discountStyle,loading,
  linearBackgroundColor,pageBackground,mainTextColor,
  cardSylte,cardHeader,cardBorderRadius,cardItemFirstBorderRadius,cardItemLastBorderRadius,
  groupItemStyle,mainColor,mainButtonColor,listItem,headerBackgroundColor,headerColor,docquyenBackgroundColor,footerBackgroundColor
}
