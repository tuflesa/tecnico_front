import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { BACKEND_SERVER } from '../../constantes';
import RodRectificacionForm from './rod_rectificacion_form';

const RodEditarRectificado = ({ match }) => {
    const [token] = useCookies(['tec-token']);
    const [rectificacion, setRectificacion] = useState(null)
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

    return ( 
        <React.Fragment>
            {rectificacion ? <RodRectificacionForm rectificacion={rectificacion} setRectificacion={setRectificacion} /> : null}
        </React.Fragment>
     );
}
 
export default RodEditarRectificado;