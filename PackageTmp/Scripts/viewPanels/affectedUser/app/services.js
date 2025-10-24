// SERVICES

/*** LISTS ***/

affectedUserApp.service('templateListService', ['$q', '$http', function ($q, $http) {
   var getTemplates = function(classId) {
	   var defferred = $q.defer();

       $.ajax({
           type: 'GET',
           url: '/api/V3/Template/GetTemplates',
           data: { classId: classId  },
           success: function (data, status, xhr) {
               defferred.resolve(data);
           },
           error: function (xhr, ajaxOptions, thrownError) {
               console.log(xhr, ajaxOptions, thrownError);
           },
           async: true
       });

	   return defferred.promise;
    };
	return {
		getTemplates: getTemplates
	}
}]);

affectedUserApp.service('flatListService', ['$q', '$http', function ($q, $http) {
   var getList = function(listguid) {
	   var defferred = $q.defer();

       $.ajax({
           type: 'GET',
           url: '/api/V3/Enum/GetList',
           data: { Id: listguid, Flatten: true  },
           success: function (data, status, xhr) {
               defferred.resolve(data);
           },
           error: function (xhr, ajaxOptions, thrownError) {
               console.log(xhr, ajaxOptions, thrownError);
           },
           processData: false,
           async: true
       });
	   return defferred.promise;
    };
	return {
		getList: getList
	}
}]);

affectedUserApp.service('listService', ['$q', '$http', function ($q, $http) {
   var getList = function(listguid) {
	   var defferred = $q.defer();

       $.ajax({
           type: 'GET',
           url: '/api/V3/Enum/GetList',
           data: { Id: listguid, Flatten: false  },
           success: function (data, status, xhr) {
               defferred.resolve(data);
           },
           error: function (xhr, ajaxOptions, thrownError) {
               console.log(xhr, ajaxOptions, thrownError);
           },
           async: true
       });
	   return defferred.promise;
    };
	return {
		getList: getList
	}
}]);

affectedUserApp.service('userListService', ['$q', '$http', function ($q, $http) {
   var getUserList = function(searchString) {
	   var defferred = $q.defer();
       

       $.ajax({
           type: 'GET',
           url: '/api/V3/User/GetUserList',
           data: { maxNumberOfResults: 50, userFilter: searchString },
           success: function (data, status, xhr) {
               defferred.resolve(data);
           },
           error: function (xhr, ajaxOptions, thrownError) {
               console.log(xhr, ajaxOptions, thrownError);
           },
           async: true
       });
	   return defferred.promise;
    };
	return {
		getUserList: getUserList
	}
}]);

affectedUserApp.service('userService', ['$q', '$http', function ($q, $http) {
   var getUser = function(userGuid) {
       var criteria = {
                            "Id": "490ab845-b14c-1d91-c39f-bb9e8a350933",
                            "Criteria": {
                                "Base": {
                                    "Expression": {
                                        "SimpleExpression": {
                                            "ValueExpressionLeft": {
                                                "GenericProperty": "Id"
                                            },
                                            "Operator": "Like",
                                            "ValueExpressionRight": {
                                                "Value": userGuid
                                            }
                                        }
                                    }
                                }
                            }
                         };

        var promise = $http
            .post('/api/V3/Projection/GetProjectionByCriteria', JSON.stringify(criteria) )
        return promise;
    };
	return {
		getUser: getUser
	}
}]);


/*** VALUES ***/

affectedUserApp.service('valueService', function(){
    this.title = "";
    this.description = "";
    this.altcontact = "";
    this.supportgroup = "";
    this.tierqueue = "";
    this.area = "";
    this.classification = "";
    this.srtemplateid = "03bc9162-041f-c987-8ce4-a5547cd9ca04"; // Default Template
    this.irtemplateid = "a77bb0c9-e201-dd93-230c-799a66d9e8fa"; // Default Template
    this.irsource = "";
    this.srsource = "";
    this.impact = "";
    this.srurgency = "";
    this.irurgency = "";
    this.priority = "";
    
    this.enduser = "";
    this.enduserlist = "";
    this.enduserobj = "";
    
    this.assigneduser = "";
    this.assigneduserlist = "";
    this.assigneduserobj = "";

    this.irTemplateList = "";
    this.tierQueueList = "";
    this.classificationList = "";
    this.irSourceList = "";
    this.irUrgencyList = "";
    this.impactList = "";
    
    this.srTemplateList = "";
    this.supportGroupList = "";
    this.areaList = "";
    this.srSourceList = "";
    this.srUrgencyList = "";
    this.priorityList = "";

    this.kendoViewModel = kendo.observable({});
});

/*** TRIGGERS ***/

affectedUserApp.service('createWIService', ['$q', '$http', function ($q, $http) {
   var createProjectionByCriteria = function(type, title, description, altcontact, category, supportgroup, templateid, source, enduser, assigneduser, urgency, impactpriority) {
	   var defferred = $q.defer();
        return $http({
            method: 'GET',
            url: '/api/V3/Projection/CreateProjectionByTemplate',
            params: {id: templateid, createdById: session.user.Id}
        }).then(function(response){
            app.lib.mask.apply("Creating " + response.data.Id + "...");
        
            // SHARED PROPERTIES
            response.data.Title = title;
            if (description != "") //do not send back empty value to prevent from overwriting template values
                response.data.Description = description;
            if (altcontact != "") //do not send back empty value to prevent from overwriting template values
                response.data.ContactMethod = altcontact;
            
            sourceobj = validateEnumSelection(source);
            if(sourceobj != null){
                response.data.Source.Id = sourceobj.Id;
                response.data.Source.Name = sourceobj.Name;
            }
            
            urgencyobj = validateEnumSelection(urgency);
            if(urgencyobj != null){
                response.data.Urgency.Id = urgencyobj.Id;
                response.data.Urgency.Name = urgencyobj.Name;
            }
        
            // IR PROPERTIES
            if(type == "IR"){
                tierqueueobj = validateEnumSelection(supportgroup);
                if(tierqueueobj != null){
                    response.data.TierQueue.Id = tierqueueobj.Id;
                    response.data.TierQueue.Name = tierqueueobj.Name;
                }
                
                classificationobj = validateEnumSelection(category);
                if(classificationobj != null){
                    response.data.Classification.Id = classificationobj.Id;
                    response.data.Classification.Name = classificationobj.Name;
                }
                
                impactobj = validateEnumSelection(impactpriority);
                if(impactobj != null){
                    response.data.Impact.Id = impactobj.Id;
                    response.data.Impact.Name = impactobj.Name;
                }
            }
            // SR PROPERTIES
            else if (type == "SR"){
                supportgroupobj = validateEnumSelection(supportgroup);
                if(supportgroupobj != null){
                    response.data.SupportGroup.Id = supportgroupobj.Id;
                    response.data.SupportGroup.Name = supportgroupobj.Name;
                }
                
                areaobj = validateEnumSelection(category);
                if(areaobj != null){
                    response.data.Area.Id = areaobj.Id;
                    response.data.Area.Name = areaobj.Name;
                }
                
                priorityobj = validateEnumSelection(impactpriority);
                if(priorityobj != null){
                    response.data.Priority.Id = priorityobj.Id;
                    response.data.Priority.Name = priorityobj.Name;
                }
            }
            
            if(enduser != null){
                response.data.RequestedWorkItem = {"BaseId": enduser.BaseId};
            }
            
            if(assigneduser != null){
                response.data.AssignedWorkItem = {"BaseId": assigneduser.BaseId};
            }
            
            var workItemID = response.data.Id;

            // CREATE THE ACTUAL WORK ITEM
            var strData = { "isDirty": true, "original": response.data, "current": response.data } ;

            return $http({
                method: 'POST',
                url: '/AffectedUser/Save',
                data: { formJson: JSON.stringify(strData) },
            }).then(function (result) {
                if (result.data.success) {
                    app.lib.mask.remove();
                    defferred.resolve(result);
                    return workItemID;
                }
                else {
                    console.log(result);
                }
            }); 
             
        });
	   return defferred.promise;
    };
	return {
		createProjectionByCriteria: createProjectionByCriteria
	}
}]);

affectedUserApp.service('enumMatchService', ['$q', '$http', function ($q, $http) {
    var checkForMatch = function(enumFromOtherWIList, currentWIEnumList) {
        var index = -1;
        enumFromOtherWIListObj = validateEnumSelection(enumFromOtherWIList);
        if(enumFromOtherWIListObj != null){  
            for(var i = 0; i < currentWIEnumList.length; i++){
                if(currentWIEnumList[i].Text == enumFromOtherWIListObj.Text){
                    index = i;   
                }
            }
        }
        
        var jsonObject = null;
        if(index != -1){ // If the value is not found in the other WI's list, we do not want to try to set anything in this WI's list
            // Need to create a new object to trim off a hash value-- if the stringified JSON does not match exactly, the form will not update correctly
            var newEnumObjWithoutHash = {"Id":currentWIEnumList[index].Id,
                                         "Text":currentWIEnumList[index].Text,
                                         "Name":currentWIEnumList[index].Name,
                                         "HasChildren":currentWIEnumList[index].HasChildren,
                                         "Ordinal":currentWIEnumList[index].Ordinal,
                                         "EnumNodes":currentWIEnumList[index].EnumNodes}
        
            jsonObject = JSON.stringify(newEnumObjWithoutHash); 
        }
        
        return jsonObject;
    };
	return {
		checkForMatch: checkForMatch
	}
}]);

// Description: Takes in an enum value in JSON format, parses it, and returns the object if valid
// Input: enum value in JSON format
// Output: parased enum object if valid, null otherwise
function validateEnumSelection(enumJSON){
    if(enumJSON != null && enumJSON != ""){
        var enumobj = JSON.parse(enumJSON);
        if(enumobj.Id === "00000000-0000-0000-0000-000000000000"){
            return null;
        }
        else{
            return enumobj;
        }
    }
    
    return null;
}