import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { BACKEND_SERVER } from '../../constantes';
import RepuestoForm from './rep_form';

const RepDetalle = ({ match }) => {
    const [token] = useCookies(['tec-token']);
    const [repuesto, setRepuesto] = useState(null)

    useEffect(() => {
        axios.get(BACKEND_SERVER + `/api/repuestos/detalle/${match.params.id}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => {
            setRepuesto(res.data);
        })
        .catch( err => {
            console.log(err);
        });
    }, [token, match]);

    return ( 
        <React.Fragment>
            {repuesto ? <RepuestoForm repuesto={repuesto} setRepuesto={setRepuesto} /> : null}
        </React.Fragment>
     );
}
 
export default RepDetalle;