import React, { useState } from 'react';
import PedidoForm from './rep_pedido_form';

const RepPedidoNuevo = () => {    
    const [pedido, setPedido] = useState(null);
    return (
        <PedidoForm pedido={pedido}
                    setPedido={setPedido}
        />
    )
}
export default RepPedidoNuevo;