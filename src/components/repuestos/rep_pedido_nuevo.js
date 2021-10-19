import React from 'react';
import PedidoForm from './rep_pedido_form';
import { useCookies } from 'react-cookie';

const RepPedidoNuevo = () => {
    const [user] = useCookies(['tec-user']);
    console.log('estoy en nuevo pedido');

    return (
        <PedidoForm pedido={''}
                    empresa={user['tec-user'].perfil.empresa.id}
        />
    )
}

export default RepPedidoNuevo;