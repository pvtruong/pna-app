async function delay(time=0){
  return new Promise((resolve,reject)=>{
    setTimeout(()=>{
      resolve(1);
    },time)
  })
}
const roundBy  = Math.roundBy =  (n,decimalPlaces=3)=>{
    var scale = Math.pow(10, decimalPlaces);
    return Math.round(scale * n) / scale;
};
function khoangSo(so){
  if(!so) return so;
  let _so =  so.toString().split(".")[0].split(",")[0];
  let _le = Number(_so.substring(_so.length-1));
  let _chan = Number(_so.substring(0,_so.length-1) + '0');

  if(_le<5){
    return `${_chan}-${_chan+5}`
  }else{
    return `${_chan + 5}-${_chan+10}`
  }
}

const colors = [
    { name: 'TURQUOISE', code: '#1abc9c' },
    { name: 'EMERALD', code: '#2ecc71' },
    { name: 'PETER RIVER', code: '#3498db' },
    { name: 'AMETHYST', code: '#9b59b6' },
    { name: 'WET ASPHALT', code: '#34495e' },
    { name: 'GREEN SEA', code: '#16a085' },
    { name: 'NEPHRITIS', code: '#27ae60' },
    { name: 'BELIZE HOLE', code: '#2980b9' },
    { name: 'WISTERIA', code: '#8e44ad' },
    { name: 'MIDNIGHT BLUE', code: '#2c3e50' },
    { name: 'SUN FLOWER', code: '#f1c40f' },
    { name: 'CARROT', code: '#e67e22' },
    { name: 'ALIZARIN', code: '#e74c3c' },

    { name: 'CONCRETE', code: '#95a5a6' },
    { name: 'ORANGE', code: '#f39c12' },
    { name: 'PUMPKIN', code: '#d35400' },
    { name: 'POMEGRANATE', code: '#c0392b' },

    { name: 'ASBESTOS', code: '#7f8c8d' }
]
function getRandomColor(){
  return colors[Math.floor(Math.random() * colors.length)];
}
function toNumber(nb){
  nb = nb.split(",").join("");
  return Number(nb);
}
export {
  delay,khoangSo,roundBy,getRandomColor,toNumber
}
