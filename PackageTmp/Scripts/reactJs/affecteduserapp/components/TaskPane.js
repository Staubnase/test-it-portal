import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom'


const TaskPane = () => {
    const location = useLocation()
    const convertToIncidentText = localization.ConvertToIncident;
    const convertToServiceRequestText = localization.ConvertToServiceRequest;

    return (
        <div data-bind="affix:{top:auto}" class="task-panel task-panel-narrow">
            <h2 data-localize="Tasks"></h2>
            <ul class="taskmenu">
                {(location.pathname === '/' || location.pathname === '/incident') ?
                    <Link to='/servicerequest'>{convertToServiceRequestText}</Link> :
                    <Link to='/incident'>{convertToIncidentText }</Link>}
            </ul>
        </div>
    )
}

export default TaskPane
