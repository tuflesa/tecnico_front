import React from 'react';
import RepProvedorForm from './rep_proveedor_form';

const RepProveedorNuevo = () => {
    return (
        <RepProvedorForm proveedor= {
            {
                nombre: '',
                direccion: '',
                telefono: ''
            }
           }/>
    )
}
export default RepProveedorNuevo;