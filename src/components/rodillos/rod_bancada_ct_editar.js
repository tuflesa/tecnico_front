import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { BACKEND_SERVER } from '../../constantes';
import RodBancadaCT from './rod_bancada_ct';

const RodBancadaCT_Editar = ({ match }) => {
    const [token] = useCookies(['tec-token']);
    const [bancada, setBancada] = useState(null)

    useEffect(() => {
        axios.get(BACKEND_SERVER + `/api/rodillos/bancada/${match.params.id}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => {
            setBancada(res.data);
        })
        .catch( err => {
            console.log(err);
        });
    }, [token, match]);

    return ( 
        <React.Fragment>
            {bancada ? <RodBancadaCT bancada={bancada} setBancada={setBancada}/> : null}
        </React.Fragment>
     );
}
 
export default RodBancadaCT_Editar;