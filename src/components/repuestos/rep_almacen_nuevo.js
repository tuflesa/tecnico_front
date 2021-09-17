import React from 'react';
import RepAlmacenForm from './rep_almacen_form';
import { useCookies } from 'react-cookie';

const RepAlmacenNuevo = () => {
    const [user] = useCookies(['tec-user']);

    return (
        <RepAlmacenForm nombre={''}
                        empresa={user['tec-user'].perfil.empresa.id}
                        almacen_id={null}/>
    )
}

export default RepAlmacenNuevo;