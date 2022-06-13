import React, { useState, useEffect } from 'react';
import { useCookies } from 'react-cookie';
import { BACKEND_SERVER } from '../../constantes';
import axios from 'axios';
import PedidoForm from './rep_pedido_form';

const PedidoEditar = ({ match }) => {
    const [token] = useCookies(['tec-token']);
    const [pedido, setPedido] = useState(null);

    useEffect(() => {
        axios.get(BACKEND_SERVER + `/api/repuestos/pedido_detalle/${match.params.id}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => {
            setPedido(res.data);
        })
        .catch( err => {
            console.log(err);
        });
    }, [token, match]);

    return (
        <React.Fragment>
            {pedido ? <PedidoForm pedido={pedido} setPedido={setPedido}/> : ''}
        </React.Fragment>
    );
}

export default PedidoEditar;
