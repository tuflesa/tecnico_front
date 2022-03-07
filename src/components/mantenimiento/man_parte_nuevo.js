import React, {useState} from 'react';
import ParteForm from './man_parte_form';

const ManParteNuevo = () => {
    const [parte, setParte] = useState(null)
    return ( 
        <ParteForm parte={parte} setParte={setParte}/>
     );
}
 
export default ManParteNuevo;