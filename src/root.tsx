import React from 'react';
import RootRouter from './routes/root-router';
import moment from "moment";

window.moment = moment

function Root() {
    return (
        <div>
            <RootRouter/>
        </div>
    );
}

export default Root;
