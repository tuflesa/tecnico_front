import React , { useState, useEffect } from 'react';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { BACKEND_SERVER } from '../../constantes';
import AgenciaForm from './cargas_agencia_form';

const CargasAgenciaDetalle = ({ match }) => {
    const [token] = useCookies(['tec-token']);
    const [agencia, setAgencia] = useState(null);

    useEffect(() => {
        axios.get(BACKEND_SERVER + `/api/cargas/agencia/${match.params.id}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => {
            console.log(res.data);
            setAgencia(res.data);
        })
        .catch( err => {
            console.log(err);
        });
    }, [token, match]);
    return (
        <React.Fragment>
            {agencia ? <AgenciaForm agencia={agencia}/> : null}
        </React.Fragment>
    )
}

export default CargasAgenciaDetalle;