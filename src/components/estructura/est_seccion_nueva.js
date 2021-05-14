import React from 'react';
import EstSeccionForm from './est_seccion_form';
import { useCookies } from 'react-cookie';

const EstEmpresaNueva = () => {
    const [user] = useCookies(['tec-user']);

    return ( 
        <EstSeccionForm seccion={{nombre: '', empresa: user['tec-user'].perfil.empresa.id}} />
     );
}
 
export default EstEmpresaNueva;