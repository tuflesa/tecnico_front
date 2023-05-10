import React, {useState} from 'react';
import { useCookies } from 'react-cookie';
import NotificacionForm from './man_notificaciones_form';

const ManNotificacionesNuevas = () => {
    const [user] = useCookies(['tec-user']);
    const [nota, setNota] = useState({quien: user['tec-user'], empresa:user['tec-user'].perfil.empresa.id, zona:user['tec-user'].perfil.zona?user['tec-user'].perfil.zona:null});
    return ( 
        <NotificacionForm   nota={nota} 
                            setNota={setNota}
        />
     )
}
 
export default ManNotificacionesNuevas;