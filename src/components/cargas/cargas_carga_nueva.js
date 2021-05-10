import React  from 'react';
import { useCookies } from 'react-cookie';
import CargaForm from './cargas_carga_form';

const CargaNueva = () => {
    const [user] = useCookies(['tec-user']);
    const hoy = new Date();
    var dd = String(hoy.getDate()).padStart(2, '0');
    var mm = String(hoy.getMonth() + 1).padStart(2, '0'); //Enero es 0!
    var yyyy = hoy.getFullYear();

    const carga = {
        empresa: user['tec-user'].perfil.empresa.id,
        fecha_entrada: yyyy + '-' + mm + '-' + dd,
        hora_entrada: hoy.getHours()+':'+hoy.getMinutes(),
        matricula: '',
        remolque: '',
        telefono: '',
        agencia: 0,
        destino: '',
        tara: '',
        bruto: ''
    }

    return (
        <CargaForm carga={carga}/>
    )
}

export default CargaNueva;