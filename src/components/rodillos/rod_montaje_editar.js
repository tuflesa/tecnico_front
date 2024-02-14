import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { BACKEND_SERVER } from '../../constantes';
import RodMontaje from './rod_montaje';

const RodMontajeEditar = ({ match }) => {
    const [token] = useCookies(['tec-token']);
    const [montaje_edi, setMontajeEditar] = useState(null)

    useEffect(() => {
        axios.get(BACKEND_SERVER + `/api/rodillos/montaje_listado/${match.params.id}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => {
            setMontajeEditar(res.data);
        })
        .catch( err => {
            console.log(err);
        });
    }, [token, match]);

    return ( 
        <React.Fragment>
            {montaje_edi ? <RodMontaje montaje_edi={montaje_edi} setMontajeEditar={setMontajeEditar}/>:null}
        </React.Fragment>
     );
}
 
export default RodMontajeEditar;