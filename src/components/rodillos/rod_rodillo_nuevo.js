import React, {useState} from 'react';
import RodRodilloForm from './rod_rodillo_form';

const RodNuevo = ({setTitulo}) => {
    const [nuevo_rodillo, setNuevoRodillo] = useState([]);
    return ( 
        <RodRodilloForm rodillo={nuevo_rodillo} setRodillo={setNuevoRodillo}/>
     );
}
 
export default RodNuevo;