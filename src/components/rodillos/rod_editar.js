import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { BACKEND_SERVER } from '../../constantes';
import RodRodilloForm from './rod_rodillo_form';

const RodEditar = ({ match }) => {
    const [token] = useCookies(['tec-token']);
    const [rodillo, setRodillo] = useState(null)

    useEffect(() => {
        axios.get(BACKEND_SERVER + `/api/rodillos/rodillo_editar/${match.params.id}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => {
            setRodillo(res.data);
            console.log('estoy en editar y esto sacamos');
            console.log(res.data);
        })
        .catch( err => {
            console.log(err);
        });
    }, [token, match]);

    return ( 
        <React.Fragment>
            {rodillo ? <RodRodilloForm rodillo={rodillo} setRodillo={setRodillo} /> : null}
        </React.Fragment>
     );
}
 
export default RodEditar;