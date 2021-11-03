import React, { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import { BACKEND_SERVER } from '../../constantes';

const BorrarPedido = ({id}) =>{
    const [token] = useCookies(['tec-token']);
    const [borrarPedido, setBorrarPedido] = useState(null);
    console.log(id);
    axios.get(BACKEND_SERVER + `/api/repuestos/lineapedido_detalle/?pedido=${id}`,{
        headers: {
            'Authorization': `token ${token['tec-token']}`
        }
    })
    .then( res => {
        setBorrarPedido(res.data);
        console.log (res);

    })
    .catch( err => {
        console.log(err);
    });
}
export default BorrarPedido;