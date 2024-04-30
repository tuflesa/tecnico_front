import React, {useState} from 'react';
import RodGrupo from './rod_grupo_form';

const RodGrupoNuevo = ({setTitulo}) => {
    const [nuevo_grupo, setNuevoGrupo] = useState([]);
    return ( 
        <RodGrupo grupo={nuevo_grupo} setGrupo={setNuevoGrupo} mostrarBancada={false}/>
     );
}
 
export default RodGrupoNuevo;