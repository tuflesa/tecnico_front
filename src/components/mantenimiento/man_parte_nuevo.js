import React, {useState} from 'react';
import ParteForm from './man_parte_form';
import { useCookies } from 'react-cookie';

const ManParteNuevo = () => {
    const [user] = useCookies(['tec-user']);
    const [parte, setParte] = useState({creado_por: user['tec-user'], empresa:user['tec-user'].perfil.empresa.id});
    var op=true;
    return ( 
        <ParteForm  parte={parte} 
                    setParte={setParte}
                    op={op}
        />
     )
}
 
export default ManParteNuevo;