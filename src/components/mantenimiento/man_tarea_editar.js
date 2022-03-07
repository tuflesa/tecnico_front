import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { BACKEND_SERVER } from '../../constantes';
import TareaForm from './man_tarea_form';

const ManDetalle = ({ match }) => {
    const [token] = useCookies(['tec-token']);
    const [tarea, setTarea] = useState(null)
    
    useEffect(() => {
        axios.get(BACKEND_SERVER + `/api/mantenimiento/tareas/${match.params.id}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => {
            setTarea(res.data);            
        })
        .catch( err => {
            console.log(err);
        });
    }, [token, match]);

    return ( 
        <React.Fragment>
            {tarea ? <TareaForm tarea={tarea} setTarea={setTarea} /> : null}
        </React.Fragment>
     )
}
 
export default ManDetalle;