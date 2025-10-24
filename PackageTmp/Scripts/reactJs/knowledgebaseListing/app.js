import React, { useState, useEffect} from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Switch, HashRouter, useParams, useHistory, Redirect } from 'react-router-dom'
import { useLocation } from 'react-router';
import 'regenerator-runtime/runtime'
import * as localization from './common/Localization';
import BreadCrumbs from './components/BreadCrumbs';
import CategoryTree from './components/CategoryTree';
import AdvancedSearch from './components/AdvancedSearch';
import ArticleList from './components/ArticleList';
import Index from './components/Index';
import BreadCrumbsByCategory from './components/BreadCrumbsByCategory';
import ArticleListByCategory from './components/ArticleListByCategory';
import CategoryTreeMobile from './components/CategoryTreeMobile';

const App = () => {
    const [categoryCrumbs, setCategoryCrumbs] = useState([]);
    const [categories, setCategories] = useState([]);
    const [types, setTypes] = useState([]);

    const getKBCategories = async () => {
        const url = "/api/V3/ArticleCategory";
        const response = await fetch(url);
        const result = await response.json();
        let categoryList = [];
        if (result) {
            _.each(result.Categories, function (cat) {
                categoryList.push({
                    Id: cat.nodeId,
                    Name: cat.label,
                    Checked: false,
                    Children: cat.children
                });
            });
            setCategories(_.sortBy(categoryList, 'Name'));
        }
    }

    const getKBTypes = async () => {
        const url = "/api/V3/ArticleType";
        const response = await fetch(url);
        const result = await response.json();
        if (result) {
            let typeList = [];
            if (result) {
                _.each(result, function (type) {
                    typeList.push({
                        Id: type.Id,
                        Name: type.Name,
                        Checked: false
                    });
                });
                setTypes(_.sortBy(typeList, 'Name'));
            }
        }
    }

    useEffect(() => {
        getKBCategories();
        getKBTypes();
    }, []);


    return (
        <HashRouter hashType="slash" basename="/">
            <div className="container-fluid">
                <div className="row kb">
                    <div className="col-sm-9 col-sm-right-offset-3">
                       <Switch>
                            <Route path="/category/:categoryName/:categoryId"  >
                                <BreadCrumbsByCategory/>
                            </Route>
                            <Route>
                                <BreadCrumbs Breadcrumbs={categoryCrumbs} />
                            </Route>
                        </Switch>

                        <div className="hidden-xs">
                            <Route exact path={["/", "/category", "/search"]} >
                                <div>
                                    <h1>{localization.BrowseArticles}</h1>
                                </div>
                            </Route>
                          
                            <hr />
                        </div>

                        <div className="nav-dropdown visible-xs">
                            <CategoryTreeMobile Categories={categories} />
                        </div><br />

                        <div className="article-search">
                            <Switch>
                                <Route path={["/search/:searchText/:selectedCategories?/:selectedTypes?"]} >
                                    <AdvancedSearch Types={types} Categories={categories} ClearFields={false} updateCategoryTree={getKBCategories} />
                                </Route>
                                <Route>
                                    <AdvancedSearch Types={types} Categories={categories} ClearFields={true} updateCategoryTree={getKBCategories}/>
                                </Route>
                            </Switch>
                        </div>

                        <div className="kb-listing-body">
                            <Switch>
                                <Route exact path={["/", "/category", "/search"]} >
                                    <Index/>
                                </Route>
                                <Route path="/search/:searchText/:selectedCategories?/:selectedTypes?">
                                    <ArticleList />
                                </Route>
                                <Route path="/category/:categoryName/:categoryId" >
                                    <ArticleListByCategory  />
                                </Route>
                            </Switch>
                        </div>
                      
                    </div>
                    <div className="col-sm-3 sidebar-right pad-top-1-5 hidden-xs">
                        <h4 className="text-left">{localization.BrowseByCategory}</h4>
                        <CategoryTree Categories={categories} />
                    </div>
                </div>
                </div>
        </HashRouter>
    )
}

ReactDOM.render(<App />, document.getElementById('KBListingView'));
