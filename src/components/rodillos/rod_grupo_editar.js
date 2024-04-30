import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { BACKEND_SERVER } from '../../constantes';
import RodGrupo from './rod_grupo_form';

const RodGrupoEditar = ({ match }) => {
    const [token] = useCookies(['tec-token']);
    const [grupo, setGrupo] = useState(null)

    useEffect(() => {
        axios.get(BACKEND_SERVER + `/api/rodillos/grupo/${match.params.id}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => {
            setGrupo(res.data);
        })
        .catch( err => {
            console.log(err);
        });
    }, [token, match]);

    return ( 
        <React.Fragment>
            {grupo ? <RodGrupo grupo={grupo} setGrupo={setGrupo} mostrarBancada={true}/> : null}
        </React.Fragment>
     );
}
 
export default RodGrupoEditar;