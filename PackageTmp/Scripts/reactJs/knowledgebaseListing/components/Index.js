import React, { useState, useEffect } from 'react';
import * as localization from '../common/Localization';

const Index = () => {
    return (
        <div className="articles mar-top-3">
            <h4>{localization.SelectCategoryOrSearch}</h4>
        </div>
    );
}

export default Index