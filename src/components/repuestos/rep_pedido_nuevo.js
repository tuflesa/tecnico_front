import React, { useState } from 'react';
import PedidoForm from './rep_pedido_form';
import { useCookies } from 'react-cookie';

const RepPedidoNuevo = () => {
    const [user] = useCookies(['tec-user']);
    
    const [pedido, setPedido] = useState(null);

    return (
        <PedidoForm pedido={pedido}
                    setPedido={setPedido}
        />
    )
}

export default RepPedidoNuevo;