import React from 'react';
import EstEquipoForm from './est_equipo_form';
import { useCookies } from 'react-cookie';

const EstEquipoNuevo = () => {
    const [user] = useCookies(['tec-user']);
    
    return ( 
        <EstEquipoForm equipo={{nombre: '', seccion: '', fabricante: '', modelo: '', numero: '', empresa_id: user['tec-user'].perfil.empresa.id}} />
     );
}
 
export default EstEquipoNuevo;