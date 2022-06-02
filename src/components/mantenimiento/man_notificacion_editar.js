import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { BACKEND_SERVER } from '../../constantes';
import NotificacionForm from './man_notificaciones_form';

const ManNotificacionDetalle = ({ match }) => {
    const [token] = useCookies(['tec-token']);
    const [nota, setNota] = useState(null)
    
    useEffect(() => {
        axios.get(BACKEND_SERVER + `/api/mantenimiento/notificaciones/${match.params.id}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => {
            setNota(res.data);  
        })
        .catch( err => {
            console.log(err);
        });
    }, [token, match]);

    return ( 
        <React.Fragment>
            {nota ? <NotificacionForm nota={nota} setNota={setNota} /> : null}
        </React.Fragment>
     )
}
 
export default ManNotificacionDetalle;