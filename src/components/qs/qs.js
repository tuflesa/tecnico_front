import React from "react";
import { Switch, Route } from 'react-router-dom';
import QS_Grafico from "./qs_grafico";
import QS_Produccion from "./qs_produccion";

const QS = () => {
    return (
        <React.Fragment>
            <Switch>
                <Route path='/qs/grafico' component={QS_Grafico} />
                <Route path='/qs/produccion' component={QS_Produccion} />
            </Switch>
        </React.Fragment>
    )
}
export default QS;