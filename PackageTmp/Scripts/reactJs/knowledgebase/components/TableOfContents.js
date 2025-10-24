import React, { useState, useEffect } from 'react';

const TableOfContents = ({ content, contentType }) => {
    const [headlines, setHeadLines] = useState([]);

    const getHeadLines = () => {
        const divElement = $("<div></div>").html(content);
        const headings = divElement.find("h1,h2,h3,h4,h5,h6")
        let id = 0;

        _.each(headings, function (e) {
            id = id + 1;

            //add id for scroll spy, maybe
            let currentElm = $(e);
            let currentId = "heading-" + id + "-" + contentType;
            
            currentElm.attr('id', currentId);

            //sanitize the toc link
            var heading = e.cloneNode(true);
            heading.innerHTML = heading.innerHTML.replace(/(<([^>]+)>)/ig, "");//remove inner html tags

            //if we have text to link from, add it 
            if (heading.innerHTML.length > 0) {
                setHeadLines(headlines => [...headlines, {
                    level: e.tagName[1],
                    label: $(e).text(),
                    id: currentId,
                    html: heading.outerHTML,
                    element: e
                }]);
            }
        });

    };
    const onClick = (crumb) => {
        let elementId = "#" + crumb.crumb.id;
        $('html,body').animate({
            scrollTop: $(elementId).offset().top-50
        },'slow');
    }

    useEffect(() => {
        getHeadLines();
    }, [content]);


    return (
        <ul class='nav sidenav'>
            {headlines && headlines.map((crumb) => <li key={`#${crumb.id}`}>
                <a href={`#${crumb.id}`} onClick={ ()=>onClick({crumb})} dangerouslySetInnerHTML={{ __html: crumb.html }}></a>
            </li>)}
        </ul>
    )

   
}

export default TableOfContents
