import React, {useState} from 'react';
import TareaForm from './man_tarea_form';

const ManNuevo = () => {
    const [tarea, setTarea] = useState({nombre: '', pendiente: true})
    return ( 
        <TareaForm tarea={tarea} setTarea={setTarea}/>
     );
}
 
export default ManNuevo;