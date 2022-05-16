import React, {useState} from 'react';
import ParteForm from './man_parte_form';
import { useCookies } from 'react-cookie';
import ParteMediciones from './man_parte_mediciones';

const ManParteNuevoMediciones = () => {
    const [user] = useCookies(['tec-user']);
    const [parte, setParte] = useState({creado_por: user['tec-user'], empresa:user['tec-user'].perfil.empresa.id});
    return ( 
        <ParteMediciones    parte={parte} 
                            setParte={setParte}
        />
     )
}
 
export default ManParteNuevoMediciones;