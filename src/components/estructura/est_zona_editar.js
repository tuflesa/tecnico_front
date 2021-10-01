import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { BACKEND_SERVER } from '../../constantes';
import EstZonaForm from './est_zona_form';

const EstZonaDetalle = ({ match }) => {
    const [token] = useCookies(['tec-token']);
    const [zona, setZona] = useState(null)

    useEffect(() => {
        axios.get(BACKEND_SERVER + `/api/estructura/zona/${match.params.id}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => {
            console.log(res.data);
            console.log("estoy aqui");
            setZona(res.data);
        })
        .catch( err => {
            console.log(err);
        });
    }, [token, match]);

    return ( 
        <React.Fragment>
            {zona ? <EstZonaForm zona={zona}/> : null}
        </React.Fragment>
     );
}
 
export default EstZonaDetalle;