import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const CategoryTreeMobile = ({ Categories }) => {
    const [categories, setCategories] = useState([]);
  
    useEffect(() => {
        setCategories(Categories);
    }, [Categories, location]);

    const Tree = ({ data }) => {
        return (
            <div>
                <ul className="nav sidenav abn-tree">
                    {data &&
                        data.map((item) => <Branch key={item.Id} item={item} level={0}  />)}
                </ul>
            </div>

        );
    }

    const Branch = ({ item, level }) => {
        const [selected, setSelected] = useState(item.Selected ? item.Selected : false);
        const hasChildren = item.Children && item.Children.length > 0;
        
        const renderBranches = () => {
           
            if (hasChildren) {
                const newLevel = level + 1;
                {
                    return item.Children.map((child) => {
                        const childItem = {
                            Id: child.nodeId,
                            Name: child.label,
                            Children: child.children
                        }
                        return <Branch key={childItem.Id} item={childItem} level={newLevel} />;
                    });
                };
            }
            return null;
        }

        const onCategoryToggled = (e) => {
            $('.nav-dropdown').slideToggle(450);
            $('.nav-dropdown').removeClass('show-nav-content');
            setSelected(prev => !prev);
        }
           
        return (
            <>
                <Node item={item} hasChildren={hasChildren} level={level} onToggle={onCategoryToggled} />
                {selected && renderBranches()}
            </>
        );
    }

    const Node = ({ item, hasChildren, level, onToggle }) => {
        const linkURL = "/category/" + item.Name + "/" + item.Id;

        return (
            <li style={{ paddingLeft: `${level * 16}px` }}>
                <Link classNameName="indented tree-label" to={{ pathname: "/category/" + item.Name + "/" + item.Id, state: { ClearFields: true }}}>
                    <a onClick={onToggle}>
                        {hasChildren && <small><i className="tree-icon fa fa-caret-right"></i> </small>}
                        {item.Name}
                        {hasChildren && <small> ({item.Children.length})</small>}
                       
                    </a>
                </Link>
                
            </li>
        );
    }

    const onNavDropDownClick = () => {
        $('.nav-dropdown').toggleClass('show-nav-content');
    }

    return (
        <div>
            <span className="nav-dropdown-default">{localization.BrowseByCategory}</span> 
            <div className="nav-dropdown-trigger" onClick={onNavDropDownClick}>
                <i className="fa fa-sort-desc"></i>
            </div>
            <div className="nav-dropdown-content">
                <Tree data={categories} />
            </div>
        </div>
    );
}

export default CategoryTreeMobile