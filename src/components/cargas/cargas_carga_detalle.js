import React , { useState, useEffect } from 'react';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { BACKEND_SERVER } from '../../constantes';
import CargaForm from './cargas_carga_form';

const CargaDetalle = ({ match }) => {
    const [token] = useCookies(['tec-token']);
    const [carga, setCarga] = useState(null);

    useEffect(() => {
        axios.get(BACKEND_SERVER + `/api/cargas/carga/${match.params.id}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => {
            console.log(res.data);
            setCarga(res.data);
        })
        .catch( err => {
            console.log(err);
        });
    }, [token, match]);

    return (
        <React.Fragment>
            {carga ? <CargaForm carga={carga}/> : null}
        </React.Fragment>
    )
}

export default CargaDetalle;