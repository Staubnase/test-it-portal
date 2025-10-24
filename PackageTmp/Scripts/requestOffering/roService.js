var roService = {

    ProcessData: function (vm, roTemplate, answer) {

        var multiMap = [];
        
        //nothing to process if RO has no prompts
        if (_.isUndefined(roTemplate.Object.Data.PresentationMappingTemplate.Sources.Source[0])) {
            return;
        }

        if (!_.isUndefined(roTemplate.Object.Data.PresentationMappingTemplate.Sources.Source[0].ControlConfiguration.Configuration)) {
            if (!_.isNull(roTemplate.Object.Data.PresentationMappingTemplate.Sources.Source[0].ControlConfiguration.Configuration.Details.Cireson.MulitpleMapping)) {
                multiMap = roTemplate.Object.Data.PresentationMappingTemplate.Sources.Source[0].ControlConfiguration.Configuration.Details.Cireson.MulitpleMapping.Map;
                if (!_.isArray(multiMap)) multiMap = [multiMap];
            }
        }

        roService.addOrphanPropertyIntoAnswerCollection(answer.AnswerCollection, roTemplate.Object.Data.PresentationMappingTemplate.Sources.Source);

        var targets = roService.processNoneMapping(roTemplate.Object.Data.PresentationMappingTemplate.Sources.Source, answer.AnswerCollection);
        var targetsmulitpleMapping = roService.processMultipleMapping(multiMap, answer.AnswerCollection, roTemplate.Object.Data.PresentationMappingTemplate.Sources.Source, vm);

        roService.processInputData(vm, targets, targetsmulitpleMapping);
        roService.processQueryReltaedItems(vm, targets, vm.NameRelationship);
        roService.processUserInputs(answer.AnswerCollection, vm);
        roService.processWatchList(vm, answer);

        if (answer.AffectedUserId == session.user.Id) {
            vm.RequestedWorkItem = vm.CreatedWorkItem;
        }
        else {
            vm.RequestedWorkItem = { ClassTypeId: vm.CreatedWorkItem.ClassTypeId, ClassName: vm.CreatedWorkItem.ClassName, BaseId: answer.AffectedUserId};
        }

        var url = window.location.pathname.split("/");
        var requestofferingUrl = decodeURIComponent(url[url.length - 1]);
        vm.FileAttachementFolderRO = requestofferingUrl.split(",")[0];
        
        //This will assign correct priority to IR
        if (!_.isNull(pageForm.PriorityJson) && vm.ClassName == "System.WorkItem.Incident") {
            var priority = !_.isNull(vm.Priority) ? vm.Priority : 0;
            var priorityJSONU = pageForm.PriorityJson.Matrix.U;
            for (var i in priorityJSONU) {
                var urgency = priorityJSONU[i];
                if (urgency.Id == vm.Urgency.Id.toLowerCase()) {
                    for (var x in urgency.I) {
                        var impact = urgency.I[x];
                        if (impact.Id == vm.Impact.Id.toLowerCase()) {
                            priority = impact.P;
                            break;
                        } else {
                            priority = 9;
                        }
                    }
                }
            }

            if (priority != vm.Priority) {
                vm.Priority = priority;
            }
        }
    },
    addOrphanPropertyIntoAnswerCollection: function (answer, sources) {
        for (var i in sources) {
            var source = sources[i];

            if (source["@ReadOnly"] == "true") continue;
            if (source["Targets"] == null) continue;

            var sId = source["@Id"];
            if (sId != "00000000-0000-0000-0000-000000000000" || sId != "WatchList") {
                var res = _.find(answer, function (item) {
                    return sId == item.QuestionId;
                });

                if (_.isUndefined(res)) {
                    answer.push({
                        QuestionId: sId,
                        AnswerType: source.Targets.Target["@OutputName"],
                        EnumDisplayName: "",
                        SelectedQuery: "",
                        Answer: "",
                        Prompt: source["@Prompt"],
                        ControlType: source["@ControlType"],
                        OutputType: source.Targets.Target["@OutputName"],
                    });
                }
            }
        }
    },

    processAttachments: function (answer, vm, isUploadFile) {
        var attachments = [];
        var attachmentsNames = [];
        if (answer.SelectedQuery != "") {
            attachments = JSON.parse(answer.SelectedQuery);
        }

        if (_.isUndefined(vm.FileAttachment)) {
            vm.FileAttachment = [];
        }

        
        _.each(attachments, function (file) {
            if (isUploadFile) {
                vm.FileAttachment.unshift(file);
            }
            attachmentsNames.push(file.DisplayName);
        });
        

        return attachmentsNames.join(",");
    },

    processUserInputs: function (answers, vm) {
        
        var userInputs = "";
        for (var i in answers) {
            var answer = answers[i];
            var contentAnswer = "";
            var type = "";

            if (!(answer.AnswerType == "InstancePicker" || answer.AnswerType == "FileAttachment") && (answer.Answer === "" || _.isUndefined(answer.OutputType))) continue;

            if (answer.AnswerType == "String" || answer.AnswerType == "List") {
                contentAnswer = app.lib.htmlEntities(answer.Answer);
                type = answer.OutputType;
            } else if (answer.AnswerType == "DateTime") {
                type = answer.OutputType;
                //Date time saved as UTC date in ISO 8601 format 2020-11-27 J.D./S.W.
                contentAnswer = answer.Answer;
            } else if (answer.AnswerType == "FileAttachment") {
                //type = answer.ControlType;
                contentAnswer = roService.processAttachments(answer, vm, true);
                continue;
            } else if (answer.AnswerType == "InstancePicker") {
                type = answer.ControlType;

                if (answer.SelectedQuery != "") {
                    var selectedItems = JSON.parse(answer.SelectedQuery);
                    _.each(selectedItems, function (val) {
                        contentAnswer += '<Value DisplayName="' + val.DisplayName + '" Id="' + val.BaseId + '"/>';
                    });

                    contentAnswer = app.lib.encodeHTML('<Values Count="' + selectedItems.length + '">' + contentAnswer + '</Values>').replace(/"/g, "&quot;");
                }
                else {
                    continue;
                }

            }
            else {
                //default for all other types
                contentAnswer = app.lib.htmlEntities(answer.Answer);
                type = answer.OutputType;
            }

            userInputs += '<UserInput Question="' + app.lib.htmlEntities(answer.Prompt) + '" Answer="' + contentAnswer + '" Type="' + type + '" />';
        }
        vm.UserInput = "<UserInputs>" + userInputs + "</UserInputs>";
    },

    processQueryReltaedItems: function (vm, targets, NameRelationships) {
        for (var i in targets) {
            var target = targets[i];
            
            if (target.RelationshipId != "") {
                var rel = _.find(NameRelationships, function (val) {
                    return val.RelationshipId.toLowerCase() == target.RelationshipId.toLowerCase();
                });

                if (_.isUndefined(rel)) continue;

                function ProcessRelatedItems(_vm) {
                    if (target.Content != "") {
                        var json = JSON.parse(target.Content);
                        var relName = rel.Name == "RelatesToWorkItem_" ? "RelatesToWorkItem" : rel.Name;

                        if (_.isUndefined(_vm[relName])) {
                            _vm[relName] = !_.isNull(json) ? json : [];
                        }
                        else {
                            _.each(json, function (item) {
                                _vm[relName].push(item);
                            });
                        }
                    }
                }

                function FindChildActivity(_vm, childId) {
                    for (var aw in _vm.Activity) {
                        var activity = _vm.Activity[aw];
                        if (activity.ChildId == childId) {
                            ProcessRelatedItems(activity);
                        }
                        else {
                            if (!_.isUndefined(activity.Activity) && activity.Activity.length > 0) {
                                FindChildActivity(activity, childId)
                            }
                        }
                    }
                }

                if (target.ChildId != 0) {
                    FindChildActivity(vm, target.ChildId);
                }
                else {
                    ProcessRelatedItems(vm);
                }
            }
        }
    },

    processInputData: function (vm, targets, mulitpleMapping) {
        for (var i in vm) {
            
            if (i == "Activity") {
                for (var aw in vm[i]) {
                    roService.processInputData(vm[i][aw], targets, mulitpleMapping);
                }
            }
            else {
                var targetMultiple = _.find(mulitpleMapping, function (targetItem) {
                    if (!_.isUndefined(vm.ChildId)) { //if childId exist, then this is an activity.
                        return vm.ChildId == targetItem.ChildId && targetItem.Property == i; //Make sure to get child property
                    }
                    else {
                        return targetItem.ChildId == 0 && targetItem.Property == i; //Make sure to get none child property
                    }
                });
                if (_.isUndefined(targetMultiple)) { //If multi mapping is empty, then it will process the simple mapping.
                    var target = _.find(targets, function (targetItem) {
                        //return targetItem.Property == i
                        if (!_.isUndefined(vm.ChildId)) { //if childId exist, then this is an activity.
                            return vm.ChildId == targetItem.ChildId && targetItem.Property == i; //Make sure to get child property
                        }
                        else {
                            return targetItem.ChildId == 0 && targetItem.Property == i; //Make sure to get none child property
                        }
                    });
                    if (!_.isUndefined(target)) { //If target exist, it will assign the value
                        if (target.OutputType == "enum") {
                            //if a target Content is found, then change Id value, else keep default
                            if (!_.isUndefined(target.Content) && target.Content.length > 0) 
                                vm[i].Id = target.Content;
                        }
                        else {
                            vm[i] = target.Content; //save as is
                        }
                    }
                }
                else { //Process multi mapping
                    vm[i] = targetMultiple.Content;
                }
            }
        }
    },

    processNoneMapping: function (sources, answers) {
        var processedMap = [];
        for (var i in sources) {
            var source = sources[i];
            var id = source["@Id"];

            if (id == "WatchList" || (id == "00000000-0000-0000-0000-000000000000" && source["@ControlType"] != "System.SupportingItem.PortalControl")) continue;
            
            var _answer = _.filter(answers, function (obj) {
                return obj.QuestionId == id;
            });

            if (id != "00000000-0000-0000-0000-000000000000" && _.isUndefined(_answer[0])) {
                continue;
            }

            //ignore display only prompts
            if (source["@ReadOnly"].toLowerCase()==="true") {
                continue;
            }

            if (source["@ControlType"] == "System.SupportingItem.PortalControl.FileAttachment") {
                _answer[0].Prompt = source["@Prompt"];
                continue;
            }

            if (source["@ControlType"] == "System.SupportingItem.PortalControl") {
                _answer[0] = source;
                _answer[0].Prompt = "";
                _answer[0].Answer = session.user.UserName;
                _answer[0].SelectedQuery = "";
            }
            
            //ignore hidden prompts with conditional display
            if (app.lib.getSafeProperty(function () { return source.ControlConfiguration.Configuration.Details.Cireson.Show.Condition; })) {
                var answerFields = $("[data-control-sourceid='" + id + "']");
                if (answerFields.length > 0) {
                    if ($("input[name='" + $(answerFields[0]).attr("name") + "']").closest(".question-container").hasClass("ng-hide")) continue;
                }
            }

            
            
            _answer[0].Prompt = source["@Prompt"];
            _answer[0].ControlType = source["@ControlType"];
            _answer[0].OutputType = source.ControlConfiguration.AddressableOutputs.AddressableOutput["@OutputType"];
            
            var answer = _answer[0].Answer;
            if (_answer[0].SelectedQuery != "") answer = _answer[0].SelectedQuery;
            if (!_.isNull(source.Targets)) {
                if (_.isArray(source.Targets.Target)) {
                    for (var i in source.Targets.Target) {
                        processedMap.unshift(roService.buildMap(source, source.Targets.Target[i], id, answer));
                    }
                }
                else {
                    processedMap.unshift(roService.buildMap(source, source.Targets.Target, id, answer));
                }
            }
            
        }
        return processedMap;
    },

    buildMap: function (source, target, id, Content) {

        var propertyPath = target["@Path"];
        var outputType = source.ControlConfiguration.AddressableOutputs.AddressableOutput["@OutputType"];
        var childId = 0;
        var RelationshipId = "";

        if (propertyPath == "") {
            RelationshipId = target["@RelationshipId"];
        }
        else {

            if (!_.isUndefined(target["@RelationshipId"])) {
                RelationshipId = target["@RelationshipId"];
            }

            var tempPropPath = propertyPath.split("]");
            tempPropPath = tempPropPath[tempPropPath.length-1];
            childId = tempPropPath.indexOf("$?ChildId");
            if (childId > -1) {
                var tempid = tempPropPath.substring(childId + 11, tempPropPath.length);
                var splitIdProp = tempid.split("/");
                childId = splitIdProp[0].substring(0, splitIdProp[0].length - 1);
                propertyPath = splitIdProp[1];
            }
            else {
                childId = 0;
            }
        }
        


        return {
            Id: id,
            Content: Content,
            Property: propertyPath,
            RelationshipId: RelationshipId,
            ChildId: childId,
            OutputType: outputType
        };
    },

    processMultipleMapping: function (mapList, answers, sources, vm) {
        var processedMap = [];
        for (var i in mapList) {
            var map = mapList[i];
            var tempContent = map.Content || ""; // set default map.Content to empty string to prevent error: Cannot read property 'replace' of null in tempContent.replace()
            var tempProp = map["@Property"];


            var childId = tempProp.lastIndexOf("$?ChildId");
            
            if (childId > -1) {
                var tempid = tempProp.substring(childId + 11, tempProp.length);
                var splitIdProp = tempid.split("/");
                childId = splitIdProp[0].substring(0, splitIdProp[0].length - 1);
                tempProp = splitIdProp[1];
            }
            else {
                childId = 0;
            }
            
            for (var a in answers) {
                var prompt = "\\[Prompt_" + answers[a].QuestionId + "\\]";

                var source = _.findWhere(sources, { '@Id': answers[a].QuestionId });

                //ignore hidden prompts with conditional display
                if (app.lib.getSafeProperty(function () { return source.ControlConfiguration.Configuration.Details.Cireson.Show.Condition; })) {
                    var answerFields = $("[data-control-sourceid='" + answers[a].QuestionId + "']");
                    if (answerFields.length > 0) {
                        if ($("input[name='" + $(answerFields[0]).attr("name") + "']").closest(".question-container").hasClass("ng-hide")) {
                            //set to empty string
                            tempContent = tempContent.replace(new RegExp(prompt, "g"), "");
                        }
                    }
                }

                if (answers[a].EnumDisplayName != "") {
                    tempContent = tempContent.replace(new RegExp(prompt,"g"), answers[a].EnumDisplayName);
                }
                else {
                    if (answers[a].AnswerType == "InstancePicker") {
                        if (!_.isNull(map.Prompts)) {
                            var prompts = Array.isArray(map.Prompts.prompt) ? map.Prompts.prompt : [map.Prompts.prompt];
                            _.each(prompts, function (promptItem) {
                                var tempList = [];
                                var queryProp = promptItem["@QueryProperty"];

                                if (!_.isUndefined(queryProp) && queryProp != "") { 
                                    prompt = "\\[Prompt_" + answers[a].QuestionId + "_" + queryProp + "\\]";
                                }
                                
                                if (answers[a].SelectedQuery != "") {
                                    _.each(JSON.parse(answers[a].SelectedQuery), function (item) {
                                        if (_.isUndefined(queryProp)) {
                                            tempList.push(item.DisplayName);
                                        }
                                        else {
                                            if (queryProp == "" || queryProp == "Default") {
                                                tempList.push(item.DisplayName);
                                            }
                                            else {
                                                var classProperties = (!_.isUndefined(item.FullDetails)) ? item.FullDetails : item;
                                                var subProp = queryProp.split(".");
                                                if (subProp.length <= 0) {
                                                    tempList.push(classProperties[queryProp]);
                                                }
                                                else {
                                                    var tempDetails = classProperties;
                                                    for (var propI in subProp) {
                                                        tempDetails = tempDetails[subProp[propI]];
                                                    }
                                                    tempList.push(tempDetails);
                                                }
                                            }
                                        }
                                    });
                                    tempContent = tempContent.replace(new RegExp(prompt, "g"), tempList.join(","));
                                } else {
                                    tempContent = tempContent.replace(new RegExp(prompt, "g"), "");
                                }
                            });
                        } else {
                            tempContent = tempContent.replace(new RegExp(prompt, "g"), "");
                        }
                    } else if (answers[a].AnswerType == "FileAttachment") {
                        //roService.processAttachments() returns concatenated filenames
                        tempContent = tempContent.replace(new RegExp(prompt, "g"), roService.processAttachments(answers[a], vm, false));
                    } else {
                        if (answers[a].OutputType == "datetime") {
                        
                            tempContent = tempContent.replace(new RegExp(prompt, "g"), kendo.toString(kendo.parseDate(answers[a].Answer), "g"));
                        }
                        else {
                            tempContent = tempContent.replace(new RegExp(prompt, "g"), answers[a].Answer);
                        }
                    }
                }
            }
            
            
            processedMap.unshift({
                Content: tempContent.replace(/\\n/g, "\n"),
                Property: tempProp,
                ChildId: childId
            });
        }

        return processedMap;
    },

    processWatchList: function (vm, roModel) {
        if (_.isUndefined(vm.WatchList)) {
            vm.WatchList = [];
        }
        _.each(roModel.WatchListUserIds, function (id) {
            if (_.isUndefined(id) || _.isNull(id) || id == "") {
                return;
            }

            var item = _.where(vm.WatchList, { BaseId: id });
            if (item.length <= 0)
                vm.WatchList.push({ "BaseId": id });
        });
    }
}