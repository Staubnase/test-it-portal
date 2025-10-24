import React, { useState, useEffect } from 'react';


const UserAvatar = ({ userFirstName, userLastName }) => {
    const [userInitials, setUserInitials] = useState("CY");

    const setUSerAvatar = () => {
        var i1 = "",
            i2 = "",
            nameArray = [];

        i1 = app.lib.capitalize(userFirstName.charAt(0));
        nameArray = userLastName.split(" ");
        if (nameArray.length > 2) {
            i2 = nameArray[nameArray.length - 1].charAt(0);
        } else {
            i2 = app.lib.capitalize(nameArray[0].charAt(0));
        }

        var initials = i1 + i2;

        setUserInitials(initials);
    }

    useEffect(() => {
        setUSerAvatar();
    }, []);

    return (
        <div class="user-avatar">
            <div class="generic-avatar">
                <a class="color">
                    <span class="name">{userInitials}</span>
                </a>
            </div>
        </div>
    )
}

export default UserAvatar
