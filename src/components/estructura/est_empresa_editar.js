import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import EstEmpresaForm from './est_empresa_form';
import { BACKEND_SERVER } from '../../constantes';

const EstEmpresaDetalle = ({ match }) => {
    const [token] = useCookies(['tec-token']);
    const [empresa, setEmpresa] = useState(null)

    useEffect(() => {
        axios.get(BACKEND_SERVER + `/api/estructura/empresa/${match.params.id}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => {
            //console.log(res.data);
            setEmpresa(res.data);
        })
        .catch( err => {
            console.log(err);
        });
    }, [token, match]);

    return ( 
        <React.Fragment>
            {empresa ? <EstEmpresaForm empresa={empresa} /> : null}
        </React.Fragment>
     );
}
 
export default EstEmpresaDetalle;