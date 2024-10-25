import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { BACKEND_SERVER } from '../../constantes';
import RodRectificacionForm from './rod_rectificacion_form';

const RodEditarRectificado = ({ match }) => {
    const [token] = useCookies(['tec-token']);
    const [rectificacion, setRectificacion] = useState(null)
    const [lineas_rectificacion, setLineasRectificacion] = useState(null);
    useEffect(() => {
        axios.get(BACKEND_SERVER + `/api/rodillos/rectificacion_lista/${match.params.id}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => {
            setRectificacion(res.data);
        })
        .catch( err => {
            console.log(err);
        });
    }, [token, match]);
    
    useEffect(() => {
        axios.get(BACKEND_SERVER + `/api/rodillos/listado_linea_rectificacion/?rectificado=${match.params.id}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
                }
        })
        .then( res => {
            setLineasRectificacion(res.data);
        })
        .catch( err => {
            console.log(err);
        });
    }, [token, match]);
    

    return ( 
        <React.Fragment>
            {rectificacion && lineas_rectificacion ? <RodRectificacionForm rectificacion={rectificacion} setRectificacion={setRectificacion} lineas_rectificandose={lineas_rectificacion} setLineasRectificandose={setLineasRectificacion}/> : null}
        </React.Fragment>
     );
}
 
export default RodEditarRectificado;