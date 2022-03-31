import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { BACKEND_SERVER } from '../../constantes';
import LineaTareaForm from './man_linea_tarea_form';

const ManLineaDetalle = ({ match }) => {
    const [token] = useCookies(['tec-token']);
    const [linea_tarea, setLineaTarea] = useState(null)
    
    useEffect(() => {
        axios.get(BACKEND_SERVER + `/api/mantenimiento/listado_lineas_partes/${match.params.id}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => {
            setLineaTarea(res.data); 
        })
        .catch( err => {
            console.log(err);
        });
    }, [token, match]);

    return ( 
        <React.Fragment>
            {linea_tarea ? <LineaTareaForm linea_tarea={linea_tarea} setLineaTarea={setLineaTarea} /> : null}
        </React.Fragment>
     )
}
 
export default ManLineaDetalle;