
import React from 'react';
import { createRoot } from "react-dom/client";
import App from './components/App';
const root = createRoot(document.getElementById('aro-react'));
root.render(
    <React.StrictMode>
        <App templateId={document.getElementById('aro-react').getAttribute("templateId")}
            offeringId={document.getElementById('aro-react').getAttribute("offeringId")} 
            isNewQueryPicker={document.getElementById('aro-react').getAttribute("isNewQueryPicker")}
        />
    </React.StrictMode>
);
