import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { BACKEND_SERVER } from '../../constantes';
import RodRodilloForm from './rod_rodillo_form';

const RodEditar = ({ match }) => {
    const [token] = useCookies(['tec-token']);
    const [rodillo, setRodillo] = useState(null)

    useEffect(() => {
        axios.get(BACKEND_SERVER + `/api/rodillos/lista_rodillos/${match.params.id}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => {
            setRodillo(res.data);
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