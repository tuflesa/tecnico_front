import React from "react";
import { Switch, Route } from 'react-router-dom';
import QS_Grafico from "./qs_grafico";

const QS = () => {
    return (
        <React.Fragment>
            <Switch>
                <Route path='/qs/grafico' component={QS_Grafico} />
            </Switch>
        </React.Fragment>
    )
}
export default QS;