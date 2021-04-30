import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { BACKEND_SERVER } from '../../constantes';
import EstSeccionForm from './est_seccion_form';

const EstSeccionDetalle = ({ match }) => {
    const [token] = useCookies(['tec-token']);
    const [seccion, setSeccion] = useState(null)

    useEffect(() => {
        console.log(BACKEND_SERVER + `/api/estructura/seccion/${match.params.id}`);
        axios.get(BACKEND_SERVER + `/api/estructura/seccion/${match.params.id}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => {
            console.log(res.data);
            setSeccion(res.data);
        })
        .catch( err => {
            console.log(err);
        });
    }, [token, match]);

    return ( 
        <React.Fragment>
            {seccion ? <EstSeccionForm seccion={seccion}/> : null}
        </React.Fragment>
     );
}
 
export default EstSeccionDetalle;