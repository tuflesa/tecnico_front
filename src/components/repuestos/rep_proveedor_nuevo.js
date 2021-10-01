import React from 'react';
import RepProvedorForm from './rep_proveedor_form';
import { useCookies } from 'react-cookie';

const RepProveedorNuevo = () => {
    const [user] = useCookies(['tec-user']);

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