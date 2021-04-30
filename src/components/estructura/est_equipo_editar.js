import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { BACKEND_SERVER } from '../../constantes';
import EstEquipoForm from './est_equipo_form';

const EstEquipoDetalle = ({ match }) => {
    const [token] = useCookies(['tec-token']);
    const [equipo, setEquipo] = useState(null)

    useEffect(() => {
        console.log(BACKEND_SERVER + `/api/estructura/equipo/${match.params.id}`);
        axios.get(BACKEND_SERVER + `/api/estructura/equipo/${match.params.id}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => {
            console.log(res.data);
            setEquipo(res.data);
        })
        .catch( err => {
            console.log(err);
        });
    }, [token, match]);

    return ( 
        <React.Fragment>
            {equipo ? <EstEquipoForm equipo={equipo}/> : null}
        </React.Fragment>
     );
}
 
export default EstEquipoDetalle;