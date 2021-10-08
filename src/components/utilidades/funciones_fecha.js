const invertirFecha=(fecha)=>{
    const f = fecha.split('-');
    return f[2] + '-' + f[1]  + '-' + f[0];
}
export {invertirFecha}
