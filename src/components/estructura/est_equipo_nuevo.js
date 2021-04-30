import React from 'react';
import EstEquipoForm from './est_equipo_form';

const EstEquipoNuevo = () => {
    
    return ( 
        <EstEquipoForm equipo={{nombre: '', seccion: '', fabricante: '', modelo: '', numero: ''}} />
     );
}
 
export default EstEquipoNuevo;