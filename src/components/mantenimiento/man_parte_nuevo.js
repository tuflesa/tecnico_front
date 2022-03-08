import React, {useState} from 'react';
import ParteForm from './man_parte_form';
import { useCookies } from 'react-cookie';

const ManParteNuevo = () => {
    const [user] = useCookies(['tec-user']);
    const [parte, setParte] = useState({nombre: '', creada_por: user['tec-user']});
    return ( 
        <ParteForm  parte={parte} 
                    setParte={setParte}
        />
     )
}
 
export default ManParteNuevo;