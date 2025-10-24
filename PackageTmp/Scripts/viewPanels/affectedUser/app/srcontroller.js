affectedUserApp.controller('servicerequestController', ['$scope',  'valueService', 'listService', 'flatListService', 'createWIService', 'templateListService', 'userListService', 'userService', 'enumMatchService', function($scope, valueService, listService, flatListService, createWIService, templateListService, userListService, userService, enumMatchService){             
    $('#createIRTaskbar').hide();
    $('#createSRTaskbar').show();

    /**Bind to app.controls**/
    var appDiv = document.getElementById("AffectedUser");
    var appDivEle = angular.element(appDiv);
    _.defer(function () {
        app.controls.apply(appDivEle, {
            vm: valueService.kendoViewModel, bind: true, localize: true
        });
    })
    /**End of Bind to app.controls**/

    /**Task panel affix**/
    if (!app.isMobileDevice()) {
        var $taskPanel = $('.task-panel').first();
        $taskPanel.affix({ offset: { top: $taskPanel[0].getBoundingClientRect().top - 84 } });
        kendo.data.binders.yScrollOnResize($taskPanel[0], { yScrollOnResize: { path: { top: 'auto', bottom: 50 } } }, {});
    }
    /**End of task panel affix**/

    
    /*** TEMPLATE LISTS ***/

    // IR TEMPLATE LIST
    $scope.irTemplateList = valueService.irTemplateList;
    if(valueService.irTemplateList == ""){
        templateListService.getTemplates("a604b942-4c7b-2fb2-28dc-61dc6f465c68").then(function (tList) {
            $scope.irTemplateList = tList;
            valueService.irTemplateList = tList;
        });
    }

    // SR TEMPLATE LIST
    $scope.srTemplateList = valueService.srTemplateList;
    if(valueService.srTemplateList == ""){
        templateListService.getTemplates("04b69835-6343-4de2-4b19-6be08c612989").then(function (tList) {
            $scope.srTemplateList = tList;
            valueService.srTemplateList = tList;
        });
    }

    /*** ENUM LISTS ***/
    
    function buildTieredList(enumId, enumList, listName){
        var returnlist = listService.getList(enumId).then(function (list) {
            enumList = insertNewElements(list, enumList, enumId);
            for(var i = 0; i < list.length; i++){
                if(list[i].HasChildren == true){
                    buildTieredList(list[i].Id, enumList, listName);
                }              
            }   

            return enumList;
        }).then(function (finallist) {
            $scope[listName] = finallist;
            valueService[listName] = finallist;
        });
    }

    function insertNewElements(sublist, fullEnumList, enumId){   
        if(fullEnumList.length == 0){
            fullEnumList = sublist;
        }
        else{
            var parentIndex = 0;

            for(var i = 0; i < fullEnumList.length; i++){
                if(fullEnumList[i].Id == enumId){
                    parentIndex = i;
                }
            }

            for(var j = sublist.length - 1; j >= 0; j--){
                sublist[j].Text = fullEnumList[parentIndex].Text + " > " + sublist[j].Text;

                fullEnumList.splice(parentIndex + 1, 0, sublist[j]);
            }
        }
        return fullEnumList;
    }

    // IR TIER QUEUE LIST
    $scope.tierQueueList = valueService.tierQueueList;
    if(valueService.tierQueueList == ""){
        buildTieredList("c3264527-a501-029f-6872-31300080b3bf", new Array(), "tierQueueList");
    }

    // IR CLASSIFICATION LIST
    $scope.classificationList =  valueService.classificationList;
    if(valueService.classificationList == ""){
        buildTieredList("1f77f0ce-9e43-340f-1fd5-b11cc36c9cba", new Array(), "classificationList");
    }
    
    // IR SOURCE LIST
    $scope.irSourceList = valueService.irSourceList;
    if(valueService.irSourceList == ""){
        buildTieredList("5d59071e-69b3-7ef4-6dee-aacc5b36d898", new Array(), "irSourceList");
    }
    
    // IR IMPACT LIST
    $scope.impactList = valueService.impactList;
    if(valueService.impactList == ""){
        buildTieredList("11756265-f18e-e090-eed2-3aa923a4c872", new Array(), "impactList");
    }
    
    // IR URGENCY LIST
    $scope.irUrgencyList = valueService.irUrgencyList;
    if(valueService.irUrgencyList == ""){
        buildTieredList("04b28bfb-8898-9af3-009b-979e58837852", new Array(), "irUrgencyList");
    }

    // SR SUPPORT GROUP LIST
    $scope.supportGroupList = valueService.supportGroupList;
    if(valueService.supportGroupList == ""){
         buildTieredList("23c243f6-9365-d46f-dff2-03826e24d228", new Array(), "supportGroupList");
    }
    
    // SR AREA LIST
    $scope.areaList = valueService.areaList;
    if(valueService.areaList == ""){
        buildTieredList("3880594c-dc54-9307-93e4-45a18bb0e9e1", new Array(), "areaList");
    }
    
    // SR SOURCE LIST
    $scope.srSourceList = valueService.srSourceList;
    if(valueService.srSourceList == ""){
        buildTieredList("848211a2-393a-6ec5-9c97-8e1e0cfebba2", new Array(), "srSourceList");
    }
    
    // SR URGENCY LIST
    $scope.srUrgencyList = valueService.srUrgencyList;
    if(valueService.srUrgencyList == ""){
        buildTieredList("eb35f771-8b0a-41aa-18fb-0432dfd957c4", new Array(), "srUrgencyList");
    }
     
    // SR PRIORITY LIST
    $scope.priorityList = valueService.priorityList;
    if(valueService.priorityList == ""){
        buildTieredList("d55e65ea-fae9-f7db-0937-843bfb1367c0", new Array(), "priorityList");
    }
    
    /*** USER PICKERS ***/
    
    // END USER LIST
    $scope.enduser = valueService.enduser;
    $scope.enduserobj = valueService.enduserobj;
    $scope.$watch('[enduser]', function(){
        if($scope.enduserobj != null && $scope.enduser != $scope.enduserobj.DisplayName && $scope.enduser != $scope.enduserobj.UserName){
            $scope.enduserobj = null;
        }
        
        valueService.enduser = $scope.enduser;
        valueService.enduserobj = $scope.enduserobj;
        
        if(valueService.enduser != null && valueService.enduser.length >= 3 && valueService.enduserobj == null){
            userListService.getUserList(valueService.enduser).then(function (list) {
                $scope.enduserlist = list;
            });
        }
    });
    
    $scope.onEndUserSelected=function(){
        userService.getUser($scope.enduser).then(function (list) {
            $scope.enduserobj = list.data[0];
            $scope.enduser = list.data[0].DisplayName;
        });
	} 
    
    // ASSIGNED USER LIST
    $scope.assigneduser = valueService.assigneduser;
    $scope.assigneduserobj = valueService.assigneduserobj;
    $scope.$watch('[assigneduser]', function(){
        if($scope.assigneduserobj != null && $scope.assigneduser != $scope.assigneduserobj.DisplayName && $scope.assigneduser != $scope.assigneduserobj.UserName){  
            $scope.assigneduserobj = null;
        }
        
        valueService.assigneduser = $scope.assigneduser;
        valueService.assigneduserobj = $scope.assigneduserobj;
        
        if(valueService.assigneduser != null && valueService.assigneduser.length >= 3 && valueService.assigneduserobj == null){
            userListService.getUserList(valueService.assigneduser).then(function (list) {
                $scope.assigneduserlist = list;
            });
        }
    });
    
    $scope.onAssignedUserSelected=function(){
        userService.getUser($scope.assigneduser).then(function (list) {
            $scope.assigneduserobj = list.data[0];
            $scope.assigneduser = list.data[0].DisplayName;
        });
	} 
    
    /*** VALUES ***/
    
    $scope.srtemplateid = valueService.srtemplateid;  
    $scope.title = valueService.title;  
    $scope.description = valueService.description;
    $scope.altcontact = valueService.altcontact;
    $scope.supportgroup = valueService.supportgroup;   
    $scope.area = valueService.area;  
    $scope.srsource = valueService.srsource;  
    $scope.srurgency = valueService.srurgency;
    $scope.priority = valueService.priority;
    
    $scope.$watch('[srtemplateid, title, description, altcontact]', function(){     
        valueService.srtemplateid = $scope.srtemplateid;
        valueService.title = $scope.title;
        valueService.description = $scope.description;
        valueService.altcontact = $scope.altcontact;
    });
    
    $scope.$watch('[supportgroup]', function(){     
        valueService.supportgroup = $scope.supportgroup;
        
        if(valueService.tierqueue != null){
            var jsonObject = enumMatchService.checkForMatch(valueService.tierqueue, valueService.supportGroupList); // Find index of matching enum value in other WI's corresponding list

            if(jsonObject != null){
                valueService.supportgroup = jsonObject; // Set the valueService value (persistent)
                $scope.supportgroup = jsonObject; // Set the scope value (needed to render current form) 
            }

            //Set kendo view model value for enumpicker binding
            valueService.kendoViewModel.set("supportgroup", app.lib.tryParseJSON(valueService.supportgroup));
            valueService.kendoViewModel.set("tierqueue", app.lib.tryParseJSON(valueService.tierqueue));

            valueService.tierqueue = null; // When we are done with the comparison, we will clear the other page's value
        }
    });
    
     $scope.$watch('[srsource]', function(){     
        valueService.srsource = $scope.srsource;
        
        if(valueService.irsource != null){
            var jsonObject = enumMatchService.checkForMatch(valueService.irsource, valueService.srSourceList); // Find index of matching enum value in other WI's corresponding list

            if(jsonObject != null){
                valueService.srsource = jsonObject; // Set the valueService value (persistent)
                $scope.srsource = jsonObject; // Set the scope value (needed to render current form)
            }

            //Set kendo view model value for enumpicker binding
            valueService.kendoViewModel.set("irsource", app.lib.tryParseJSON(valueService.irsource));
            valueService.kendoViewModel.set("srsource", app.lib.tryParseJSON(valueService.srsource));

            valueService.irsource = null; // When we are done with the comparison, we will clear the other page's value
        }
    });
  
    $scope.$watch('[area]', function(){     
        valueService.area = $scope.area;
        
        if(valueService.classification != null){
            var jsonObject = enumMatchService.checkForMatch(valueService.classification, valueService.areaList); // Find index of matching enum value in other WI's corresponding list

            if(jsonObject != null){
                valueService.area = jsonObject; // Set the valueService value (persistent)
                $scope.area = jsonObject; // Set the scope value (needed to render current form)
            }

            //Set kendo view model value for enumpicker binding
            valueService.kendoViewModel.set("area", app.lib.tryParseJSON(valueService.area));
            valueService.kendoViewModel.set("classification", app.lib.tryParseJSON(valueService.classification));

            valueService.classification = null; // When we are done with the comparison, we will clear the other page's value
        }
    });
    
     $scope.$watch('[srurgency]', function(){     
        valueService.srurgency = $scope.srurgency;
        
        if(valueService.irurgency != null){
            var jsonObject = enumMatchService.checkForMatch(valueService.irurgency, valueService.srUrgencyList); // Find index of matching enum value in other WI's corresponding list

            if(jsonObject != null){
                valueService.srurgency = jsonObject; // Set the valueService value (persistent)
                $scope.srurgency = jsonObject; // Set the scope value (needed to render current form)
            }

            //Set kendo view model value for enumpicker binding
            valueService.kendoViewModel.set("srurgency", app.lib.tryParseJSON(valueService.srurgency));
            valueService.kendoViewModel.set("irurgency", app.lib.tryParseJSON(valueService.irurgency));

            valueService.irurgency = null; // When we are done with the comparison, we will clear the other page's value
        }
    });
    
    $scope.$watch('[priority]', function(){     
        valueService.priority = $scope.priority;
        
        if(valueService.impact != null){
            var jsonObject = enumMatchService.checkForMatch(valueService.impact, valueService.priorityList); // Find index of matching enum value in other WI's corresponding list

            if(jsonObject != null){
                valueService.priority = jsonObject; // Set the valueService value (persistent)
                $scope.priority = jsonObject; // Set the scope value (needed to render current form)
            }

            //Set kendo view model value for enumpicker binding
            valueService.kendoViewModel.set("impact", app.lib.tryParseJSON(valueService.impact));
            valueService.kendoViewModel.set("priority", app.lib.tryParseJSON(valueService.priority));

            valueService.impact = null; // When we are done with the comparison, we will clear the other page's value
        }
    });
    
    /*** TRIGGERS ***/
    
    // SUBMIT
    $scope.submit = function(){
        $scope.successId = null; // Makes the old banner disappear
        
        var creationResult = createWIService.createProjectionByCriteria("SR", $scope.title, $scope.description, $scope.altcontact, $scope.area, $scope.supportgroup, $scope.srtemplateid, $scope.srsource, $scope.enduserobj, $scope.assigneduserobj, $scope.srurgency, $scope.priority);
        
        creationResult.then(function(result){
            $scope.successType = "Service Request"
            $scope.successLink = '/ServiceRequest/Edit/' + result
            $scope.successId = result;

            app.lib.message.add(localization.ServiceRequestSavedMessage + "&nbsp;&nbsp;<a href='" + $scope.successLink + "'><strong>" + $scope.successId + "</strong></a> ", "success");
            app.lib.handleMessages();
        });
    };

    $scope.hideBanner = function() {
        $scope.successType = "";
        $scope.successLink = "";
        $scope.successId = "";
    };

    $scope.updateEnumObject = function (enumValue, enumName, enumListName) {
        var enumObject = _.findWhere($scope[enumListName], { Id: enumValue });
        $scope[enumName] = JSON.stringify(enumObject);
    }

    $scope.isMobile = app.isMobile();
}]);