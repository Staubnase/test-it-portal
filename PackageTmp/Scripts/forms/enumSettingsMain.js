require.config({
    waitSeconds: 0,
    urlArgs: "v=" + session.staticFileVersion,
    baseUrl: "/Scripts/",
    paths: {
        text: "require/text"
    }
});

//let's let the user know that things are happening
app.lib.mask.apply();
$("body").css("cursor", "wait");
$(document).ajaxStop(function () {
    $("body").css("cursor", "auto");
});

require(
    [], function () {
        $(document).ready(function () {
            $(".page_title").html(localization.EnumerationSettings);
            //set page <title>
            document.title = localizationHelper.localize("EnumerationSettings");
        });

        $.ajax({
            url: "/Enumeration/ParentEnumList"
                    , type: "GET"
                    , cache: false
                    , success: function (result) {
                        for (var i in result) {
                            var li = $("<li class='list-group-item'></li>");
                            $("#parentList").append(li);
                            li.html("<h5><a id='" + result[i].ItemId + "'  class='grid-highlight-column-last' href='/Enumeration/?enumid=" + result[i].ItemId + "&localeid=" + result[i].CurrentLocale + "'>" + localization.Edit + " " + result[i].text + " " + localization.EnumerationList + "</a></h5>");
                        }
                        app.lib.mask.remove();
                    }
        });

    });




