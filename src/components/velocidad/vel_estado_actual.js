import React from 'react';
import { Form } from 'react-bootstrap';

const EstadoActual = ({ estado, seleccionLinea }) => {
    return (
        <div>
            <h4>{estado.zona.siglas}</h4>
            <h4>{estado.velocidad_actual && estado.velocidad_actual.toFixed(2)}</h4>
            <Form.Check type="checkbox" 
                        label="Ver"
                        checked={estado.seleccion}
                        value={estado.zona.siglas}
                        onChange={seleccionLinea} />
        </div>
    )
}

export default EstadoActual; 