import React, { useState, useEffect } from 'react';
import { useHistory, useParams, useLocation } from "react-router-dom";
import { Checkbox } from "@progress/kendo-react-inputs";
import * as localization from '../common/Localization';

const AdvancedSearch = ({ Categories, Types, ClearFields, updateCategoryTree }) => {

    let { searchText, selectedCategories, selectedTypes } = useParams();

    const history = useHistory();
    const location = useLocation();
   
    const [showRequiredMessage, setShowRequiredMessage] = useState(false);
    const [showFilterWrapper, setShowFilterWrapper] = useState(false);
    const [showFilterIcon, setShowFilterIcon] = useState(false);
    const [searchInputText, setSearchInputText] = useState("");
    const [categories, setCategories] = useState([]);
    const [types, setTypes] = useState([]);

    const onToggleFilter = (e) => {
        setShowFilterWrapper(true)
        $('.filters-wrapper').slideToggle(450);
    }

    const onSearchClick = (e) => {
        setShowFilterWrapper(false)
        
        const catIds = _.pluck(_.filter(categories, function (cat) { return cat.Checked == true }), "Id").join('&');
        const typeIds = _.pluck(_.filter(types, function (type) { return type.Checked == true }), "Id").join('&');
                
        if (searchInputText != "") {
            let searchUrl = '/search/' + encodeURIComponent(searchInputText) + '/' + catIds + '/' + typeIds;

            searchUrl = searchUrl.replace(/\/$/, '');

            setShowFilterIcon((catIds != "" ? true : false) || (typeIds != "" ? true : false))
            setShowRequiredMessage(false);
            updateCategoryTree();

            history.push({
                pathname: searchUrl,
                state: { selectedCategories: catIds, selectedTypes: typeIds }
            });
        } else {
            setShowRequiredMessage(true)
        }

       
    }

    const onKeyUp = (e) => {
        if (e.keyCode == 13) {
            onSearchClick(e);
        }
    }

    const onFilterCategoryChanged = (e) => {
        let id = e.target.element.value;

        if (e.value) {
            _.each(categories, function (cat) {
                if (cat.Id == id) {
                    cat.Checked = true;
                }
            });
           
        } else {
            _.each(categories, function (cat) {
                if (cat.Id == id) {
                    cat.Checked = false;
                }
            });
        }
    }

    const onFilterTypeChanged = (e) => {
        let id = e.target.element.value;

        if (e.value) {
            _.each(types, function (type) {
                if (type.Id == id) {
                    type.Checked = true;
                }
            });

        } else {
            _.each(types, function (type) {
                if (type.Id == id) {
                    type.Checked = false;
                }
            });
        }
    }

    const resetCategories = (Categories) => {
        _.map(Categories, function (obj) {
            obj.Checked = false;
        });
        setCategories(Categories);
    }

    const resetTypes = (Types) => {
        _.map(Types, function (obj) {
            obj.Checked = false;
        });
    }

    useEffect(() => {
        setCategories(Categories)
        setTypes(Types)

        if (ClearFields || (!_.isUndefined(location.state) &&  location.state.ClearFields)) {
            setShowFilterWrapper(false);
            setShowFilterIcon(false);
            setSearchInputText("");
            resetCategories(Categories);
            resetTypes(Types);

        } else {
            let selectedCatIds = "";
            let selectedTypeIds = "";

            if (!_.isUndefined(searchText)) {
                setSearchInputText(searchText);
            }

            if (Categories.length > 0) {
                if (!_.isUndefined(selectedCategories)) {
                    selectedCatIds = selectedCategories;
                }

                if (_.isUndefined(selectedCatIds) && !_.isUndefined(location.state) && !_.isUndefined(location.state.selectedCategories)) {
                    selectedCatIds = location.state.selectedCategories
                }
               
                _.each(selectedCatIds.split("&"), function (categoryId) {
                    _.map(Categories, function (obj) {
                        if (obj.Id == categoryId) {
                            obj.Checked = true;
                        }
                    });
                });
                setCategories(Categories);
            } else {
                resetCategories(Categories);
            }

            if (Types.length > 0) {
                if (!_.isUndefined(selectedTypes)) {
                    selectedTypeIds = selectedTypes;
                }

                if (_.isUndefined(selectedTypeIds) && !_.isUndefined(location.state) && !_.isUndefined(location.state.selectedTypes)) {
                    selectedCatIds = location.state.selectedCategories
                }

                _.each(selectedTypeIds.split("&"), function (typeId) {
                    _.map(Types, function (obj) {
                        if (obj.Id == typeId) {
                            obj.Checked = true;
                        }
                    });
                });
                setTypes(Types);
            } else {
                resetTypes(Types);
            }
            setShowFilterIcon((selectedCatIds != "" ? true : false) || (selectedTypeIds != "" ? true : false))
          
        } 

    }, [Categories, Types, ClearFields, searchText, selectedCategories, selectedTypes, location.state]);

    const SearchFilterComponent = ({ filterList, onFilterChanged }) => {
        return (
            filterList &&
            filterList.map((filter) =>
                <div className="filter-boxes">
                    <Checkbox className="checkbox checkbox-inline" defaultChecked={filter.Checked} label={filter.Name} value={filter.Id}
                        onChange={onFilterChanged} />
                </div>)
        );
    }

    return (
        <div className="search-row search-directive" name="advSearchForm">
            {showRequiredMessage &&
                <div className="alert-container">
                    <div className="alert alert-danger">{ localization.Required }</div>
                </div>
            }

            <div className="search-wrapper">
                <div className="input-group">
                    <input type="text" placeholder={localization.Search} value={searchInputText} className="form-control" onChange={(e) => setSearchInputText(e.target.value)} onKeyUp={(e) => onKeyUp(e)} />
                    <div className="input-group-btn hidden-xs">
                        <button type="button" className="btn btn-default filter-toggle" onClick={(e) => onToggleFilter(e)}>
                            {showFilterIcon && <i className="fa fa-filter"></i>}
                            {localization.FilterSearchBy}<i className="fa fa-caret-down margin-l10"></i>
                        </button>
                    </div>
                    <span className="input-group-btn">
                        <button className="btn btn-primary btn-search" type="button" onClick={(e) => onSearchClick(e)} ><span className="fa fa-search"></span></button>
                    </span>
                </div>
            </div>

            {showFilterWrapper &&
                <div className="filters-wrapper">
                    <div className="filters">
                        <div className="col-xs-6 filter-column-header">
                            <p>{localization.SearchWithinCategory}</p>
                        </div>
                        <div className="col-xs-6 filter-column-header">
                            <p>{localization.SearchWithinType}</p>
                        </div>
                        <div className="col-xs-6 filter-column">
                            <SearchFilterComponent filterList={categories} onFilterChanged={onFilterCategoryChanged} />
                        </div>
                        <div className="col-xs-6 filter-column">
                            <SearchFilterComponent filterList={types} onFilterChanged={onFilterTypeChanged} />
                        </div>
                    </div>
                </div>
            }
        </div>
    )
}

export default AdvancedSearch