import React, {useEffect, useState} from 'react';
import { useCookies } from 'react-cookie';
import NotificacionForm from './man_notificacion_form';

const NotificacionNueva = () => {
    const [user] = useCookies(['tec-user']);

    const [notificacion, setNotificacion] = useState(null);

    return (
        <NotificacionForm notificacion={notificacion} user={user['tec-user']}/>
    )
}

export default NotificacionNueva