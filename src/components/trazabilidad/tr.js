import React from "react";
import { Switch, Route } from 'react-router-dom';
import TR_Main from "./TR_Main";

const TR = () => {
    return (
        <React.Fragment>
            <Switch>
                <Route path='/trazabilidad/main' component={TR_Main} />
            </Switch>
        </React.Fragment>
    )
}
export default TR;