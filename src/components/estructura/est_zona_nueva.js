import React from 'react';
import EstZonaForm from './est_zona_form';
import { useCookies } from 'react-cookie';

const EstEmpresaNueva = () => {
    const [user] = useCookies(['tec-user']);

    return ( 
        <EstZonaForm zona={{nombre: '', siglas: '', empresa: user['tec-user'].perfil.empresa.id}} />
     );
}
 
export default EstEmpresaNueva;