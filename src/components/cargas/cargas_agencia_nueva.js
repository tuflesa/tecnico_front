import React from 'react';
import AgenciaForm from './cargas_agencia_form';

const CargasAgenciaNueva = () => {
    const agencia = {
        nombre: '',
        telefono: '',
        contacto: '',
        observaciones: ''
    }
    return (
        <AgenciaForm agencia = {agencia} />
    )
}

export default CargasAgenciaNueva;