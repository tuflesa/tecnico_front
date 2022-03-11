import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { BACKEND_SERVER } from '../../constantes';
import ParteForm from './man_parte_form';

const ManParteDetalle = ({ match }) => {
    const [token] = useCookies(['tec-token']);
    const [parte, setParte] = useState(null)
    
    useEffect(() => {
        axios.get(BACKEND_SERVER + `/api/mantenimiento/parte_trabajo_detalle/${match.params.id}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => {
            setParte(res.data);            
        })
        .catch( err => {
            console.log(err);
        });
    }, [token, match]);

    return ( 
        <React.Fragment>
            {parte ? <ParteForm parte={parte} setParte={setParte} /> : null}
        </React.Fragment>
     )
}
 
export default ManParteDetalle;