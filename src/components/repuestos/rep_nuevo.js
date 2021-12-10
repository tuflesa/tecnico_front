import React, {useState} from 'react';
import RepuestoForm from './rep_form';

const RepNuevo = ({setTitulo}) => {
    const [repuesto, setRepuesto] = useState({nombre: '', es_critico: false, descatalogado: false, tipo_repuesto: 1})
    return ( 
        <RepuestoForm repuesto={repuesto} setRepuesto={setRepuesto}/>
     );
}
 
export default RepNuevo;