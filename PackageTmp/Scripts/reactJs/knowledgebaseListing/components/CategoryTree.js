import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const CategoryTree = ({ Categories }) => {
    const [categories, setCategories] = useState([]);
  
    useEffect(() => {
        setCategories(Categories);
    }, [Categories, location]);

    const Tree = ({ data }) => {
        return (
            <nav className="tree-dir sidebar-nav">
                <ul className="nav sidenav abn-tree">
                    {data &&
                        data.map((item) => <Branch key={item.Id} item={item} level={0}  />)}
                </ul>
            </nav>

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
            $('.filters-wrapper').slideToggle(450);
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
                        {item.Name}
                        {hasChildren && <small> ({item.Children.length}) <i className="tree-icon pull-right fa fa-chevron-left"></i> </small>}
                       
                    </a>
                </Link>
                
            </li>
        );
    }
    
    return (
        <Tree data={categories} />
    );
}

export default CategoryTree