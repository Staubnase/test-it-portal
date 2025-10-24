(function (window, undefined) {
    'use strict';
    /*
     * The MIT License
     *
     * Copyright (c) 2015, Sebastian Sdorra
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
     * SOFTWARE.
     */



    angular.module('adf', ['adf.provider', 'ui.bootstrap', 'ngAside'])
      .value('adfTemplatePath', '../src/templates/')
      .value('rowTemplate', '<adf-dashboard-row row="row" adf-model="adfModel" options="options" edit-mode="editMode" ng-repeat="row in column.rows" />')
      .value('columnTemplate', '<adf-dashboard-column column="column" adf-model="adfModel" options="options" edit-mode="editMode" ng-repeat="column in row.columns" />')
      .value('adfVersion', '0.11.0-SNAPSHOT');

    /*
    * The MIT License
    *
    * Copyright (c) 2015, Sebastian Sdorra
    *
    * Permission is hereby granted, free of charge, to any person obtaining a copy
    * of this software and associated documentation files (the "Software"), to deal
    * in the Software without restriction, including without limitation the rights
    * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    * copies of the Software, and to permit persons to whom the Software is
    * furnished to do so, subject to the following conditions:
    *
    * The above copyright notice and this permission notice shall be included in
    * all copies or substantial portions of the Software.
    *
    * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    * SOFTWARE.
    */


    /* global angular */
    angular.module('adf')
      .directive('adfDashboardColumn', ["$log", "$compile", "$rootScope", "adfTemplatePath", "rowTemplate", "dashboard", function ($log, $compile, $rootScope, adfTemplatePath, rowTemplate, dashboard) {


          /**
           * moves a widget in between a column
           */
          function moveWidgetInColumn($scope, column, evt) {
              var widgets = column.widgets;
              // move widget and apply to scope
              $scope.$apply(function () {
                  widgets.splice(evt.newIndex, 0, widgets.splice(evt.oldIndex, 1)[0]);
                  $rootScope.$broadcast('adfWidgetMovedInColumn');
              });
          }

          /**
           * finds a widget by its $$hashKey in the column
           */
          function findWidget(column, index) {
              var widget = null;
              for (var i = 0; i < column.widgets.length; i++) {
                  var w = column.widgets[i];
                  if (w.$$hashKey === index) {
                      widget = w;
                      break;
                  }
              }
              return widget;
          }

          /**
           * finds a column by its $$hashKey in the model
           */
          function findColumn(model, index) {
              var column = null;
              for (var i = 0; i < model.rows.length; i++) {
                  var r = model.rows[i];
                  for (var j = 0; j < r.columns.length; j++) {
                      var c = r.columns[j];
                      if (c.$$hashKey === index) {
                          column = c;
                          break;
                      } else if (c.rows) {
                          column = findColumn(c, index);
                      }
                  }
                  if (column) {
                      break;
                  }
              }
              return column;
          }

          /**
           * get the adf id from an html element
           */
          function getId(el) {
              var id = el.getAttribute('adf-id');
              return id ? id : -1;
          }

          /**
           * adds a widget to a column
           */
          function addWidgetToColumn($scope, model, targetColumn, evt) {
              // find source column
              var columnHashKey = getId(evt.from);
              var sourceColumn = findColumn(model, columnHashKey);

              if (sourceColumn) {
                  // find moved widget
                  var widgetHashKey = getId(evt.item);
                  var widget = findWidget(sourceColumn, widgetHashKey);

                  if (widget) {
                      // add new item and apply to scope
                      $scope.$apply(function () {
                          if (!targetColumn.widgets) {
                              targetColumn.widgets = [];
                          }
                          targetColumn.widgets.splice(evt.newIndex, 0, widget);

                          $rootScope.$broadcast('adfWidgetAddedToColumn');
                      });
                  } else {
                      $log.warn('could not find widget with hashkey ' + widgetHashKey);
                  }
              } else {
                  $log.warn('could not find column with hashkey ' + columnHashKey);
              }
          }

          /**
           * removes a widget from a column
           */
          function removeWidgetFromColumn($scope, column, evt) {
              // remove old item and apply to scope
              $scope.$apply(function () {
                  column.widgets.splice(evt.oldIndex, 1);
                  $rootScope.$broadcast('adfWidgetRemovedFromColumn');
              });
          }

          /**
           * enable sortable
           */
          function applySortable($scope, $element, model, column) {
              // enable drag and drop
              var el = $element[0];
              var sortable = Sortable.create(el, {
                  group: 'widgets',
                  handle: '.adf-move',
                  ghostClass: 'placeholder',
                  animation: 150,
                  onAdd: function (evt) {
                      addWidgetToColumn($scope, model, column, evt);
                  },
                  onRemove: function (evt) {
                      removeWidgetFromColumn($scope, column, evt);
                  },
                  onUpdate: function (evt) {
                      moveWidgetInColumn($scope, column, evt);
                  }
              });

              // destroy sortable on column destroy event
              $element.on('$destroy', function () {
                  sortable.destroy();
              });
          }

          return {
              restrict: 'E',
              replace: true,
              scope: {
                  column: '=',
                  editMode: '=',
                  continuousEditMode: '=',
                  adfModel: '=',
                  options: '='
              },
              templateUrl: adfTemplatePath + 'dashboard-column.html',
              link: function ($scope, $element) {
                  // set id
                  var col = $scope.column;
                  if (!col.cid) {
                      col.cid = dashboard.id();
                  }

                  if (angular.isDefined(col.rows) && angular.isArray(col.rows)) {
                      // be sure to tell Angular about the injected directive and push the new row directive to the column
                      $compile(rowTemplate)($scope, function (cloned) {
                          $element.append(cloned);
                      });
                  } else {
                      // enable drag and drop for widget only columns
                      applySortable($scope, $element, $scope.adfModel, col);
                      app.lib.mask.remove();
                  }
              }
          };
      }]);

    /*
     * The MIT License
     *
     * Copyright (c) 2015, Sebastian Sdorra
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
     * SOFTWARE.
     */

    /**
     * @ngdoc directive
     * @name adf.directive:adfDashboard
     * @element div
     * @restrict EA
     * @scope
     * @description
     *
     * `adfDashboard` is a directive which renders the dashboard with all its
     * components. The directive requires a name attribute. The name of the
     * dashboard can be used to store the model.
     *
     * @param {string} name name of the dashboard. This attribute is required.
     * @param {boolean=} editable false to disable the editmode of the dashboard.
     * @param {boolean=} collapsible true to make widgets collapsible on the dashboard.
     * @param {boolean=} maximizable true to add a button for open widgets in a large modal panel.
     * @param {boolean=} enableConfirmDelete true to ask before remove an widget from the dashboard.
     * @param {string=} structure the default structure of the dashboard.
     * @param {object=} adfModel model object of the dashboard.
     * @param {function=} adfWidgetFilter function to filter widgets on the add dialog.
     * @param {boolean=} continuousEditMode enable continuous edit mode, to fire add/change/remove
     *                   events during edit mode not reset it if edit mode is exited.
     */

    angular.module('adf')
      .directive('adfDashboard', ["$rootScope", "$log", "$aside", "dashboard", "adfTemplatePath", function ($rootScope, $log, $aside, dashboard, adfTemplatePath) {




          function stringToBoolean(string) {
              switch (angular.isDefined(string) ? string.toLowerCase() : null) {
                  case 'true': case 'yes': case '1': return true;
                  case 'false': case 'no': case '0': case null: return false;
                  default: return Boolean(string);
              }
          }

          function copyWidgets(source, target) {
              if (source.widgets && source.widgets.length > 0) {
                  var w = source.widgets.shift();
                  while (w) {
                      target.widgets.push(w);
                      w = source.widgets.shift();
                  }
              }
          }

          /**
          * Copy widget from old columns to the new model
          * @param object root the model
          * @param array of columns
          * @param counter
          */
          function fillStructure(root, columns, counter) {
              counter = counter || 0;

              if (angular.isDefined(root.rows)) {
                  angular.forEach(root.rows, function (row) {
                      angular.forEach(row.columns, function (column) {
                          // if the widgets prop doesn't exist, create a new array for it.
                          // this allows ui.sortable to do it's thing without error
                          if (!column.widgets) {
                              column.widgets = [];
                          }

                          // if a column exist at the counter index, copy over the column
                          if (angular.isDefined(columns[counter])) {
                              // do not add widgets to a column, which uses nested rows
                              if (!angular.isDefined(column.rows)) {
                                  copyWidgets(columns[counter], column);
                                  counter++;
                              }
                          }

                          // run fillStructure again for any sub rows/columns
                          counter = fillStructure(column, columns, counter);
                      });
                  });
              }
              return counter;
          }

          /**
          * Read Columns: recursively searches an object for the 'columns' property
          * @param object model
          * @param array  an array of existing columns; used when recursion happens
          */
          function readColumns(root, columns) {
              columns = columns || [];

              if (angular.isDefined(root.rows)) {
                  angular.forEach(root.rows, function (row) {
                      angular.forEach(row.columns, function (col) {
                          columns.push(col);
                          // keep reading columns until we can't any more
                          readColumns(col, columns);
                      });
                  });
              }

              return columns;
          }

          function changeStructure(model, structure) {
              var columns = readColumns(model);
              var counter = 0;

              model.rows = angular.copy(structure.rows);

              while (counter < columns.length) {
                  counter = fillStructure(model, columns, counter);
              }
          }

          function createConfiguration(type) {
              var cfg = {};
              var config = dashboard.widgets[type].config;
              if (config) {
                  cfg = angular.copy(config);
              }
              return cfg;
          }

          /**
           * Find first widget column in model.
           *
           * @param dashboard model
           */
          function findFirstWidgetColumn(model) {
              var column = null;
              if (!angular.isArray(model.rows)) {
                  $log.error('model does not have any rows');
                  return null;
              }
              for (var i = 0; i < model.rows.length; i++) {
                  var row = model.rows[i];
                  if (angular.isArray(row.columns)) {
                      for (var j = 0; j < row.columns.length; j++) {
                          var col = row.columns[j];
                          if (!col.rows) {
                              column = col;
                              break;
                          }
                      }
                  }
                  if (column) {
                      break;
                  }
              }
              return column;
          }

          /**
           * Returns true if the model has no widgets; otherwise false
           *
           * @param dashboard model
          */
          function hasWidgets(model) {
              var returnValue = false;
              if (model && model.rows) {
                  angular.forEach(model.rows, function (row) {
                      angular.forEach(row.columns, function (column) {
                          if (angular.isArray(column.widgets) && column.widgets.length > 0) {
                              returnValue = true;
                          }
                      });
                  });
              }

              return returnValue;
          }

          /**
           * Adds the widget to first column of the model.
           *
           * @param dashboard model
           * @param widget to add to model
           * @param name name of the dashboard
           */
          function addNewWidgetToModel(model, widget, name) {
              if (model) {
                  var column = findFirstWidgetColumn(model);
                  if (column) {
                      if (!column.widgets) {
                          column.widgets = [];
                      }
                      column.widgets.unshift(widget);
                      $rootScope.$broadcast('adfWidgetAdded', name, model, widget);
                  } else {
                      $log.error('could not find first widget column');
                  }
              } else {
                  $log.error('model is undefined');
              }

              //append collapsible buttons to widgets
              app.dashboardUtils.AddWidgetToggleButton();
          }

          return {
              replace: true,
              restrict: 'EA',
              transclude: false,
              scope: {
                  structure: '@',
                  name: '@',
                  collapsible: '@',
                  editable: '@',
                  editMode: '@',
                  continuousEditMode: '=',
                  maximizable: '@',
                  adfModel: '=',
                  adfWidgetFilter: '='
              },
              controller: ["$scope", "UserService", "LocalizationService", "NavigationGuardService", function ($scope, UserService, LocalizationService, NavigationGuardService) {
                  var model = {};
                  var structure = {};
                  var widgetFilter = null;
                  var structureName = {};
                  var name = $scope.name;

                  $scope.sessionUser = null;

                  UserService.getSessionUser().then(function (user) {
                      $scope.sessionUser = user;
                      if ($scope.model && (hasWidgets($scope.model) === false) && user.IsAdmin) {
                          $scope.editMode = true;
                      }
                  });

                  //Do not show Edit option on new AM views :BUG 12437
                  var newAMViewIds = ['dc593e94-dae7-4ba9-b360-2398abb7a83e', '13d12020-a5c2-48fc-88d3-86043bfc04c7', '5b98769d-b633-48a9-9c12-3c0776cbcc74', '58b87108-60d9-4f13-b80b-681336b5143a',
                  'dca8d651-055c-458f-b82c-cb5ab212954c', '44b8643e-8152-482e-85d2-caa8d221ddd9', '461598ae-1f25-48ff-be4c-e31d7a59a325', 'bd86603d-0d29-42ef-bc64-32825e736703', 'b4e9f069-1601-4805-b61a-d036cdbd70c8',
                  '2abb8055-0b9f-4971-9abd-6e7019ffa2e9', 'd0e079fc-43d5-450f-981f-cb6b2ece7cf5', 'b0a3061c-fb99-4311-b80b-4827aeaf7e53', 'eb8f24ac-72f2-48f2-a906-bfdb053ccc97', '5195e553-ad89-4dd1-8199-16eade4a65b1',
                  '39236ac4-e688-410d-9e3e-9160673bc0d0', '613aadba-8500-4765-9fd9-59593380c6e5', '32931c1e-4d39-4993-801c-3e903e28a0c5', '2768c7b4-f662-4048-a2ce-c9e1695e9b7f', 'e4b77f1e-6dd8-4e5d-b686-c93b48c825b4',
                  '36c7bb49-2475-4e8e-93d7-72971a333262', 'd8d2ac0d-b0d2-445b-884b-9b9e83b8692f', '8a8045ec-9749-4881-b036-513d01bad672', '56301bc8-c44e-4f7c-a640-95fbba14f87d', '02be6af4-069c-47a2-a526-7061bc0e34a0',
                  '57257fed-beef-4bbf-89d7-d287b6bc419b', '01da867f-f87e-4805-94c5-40ce346e8978', 'ac5e4db3-4e8e-4ea3-87d0-45f1446c4feb', '4e15f53d-480a-46fb-a346-89d855d3fd59', '402ef9ef-c39b-4ebc-a2bc-8c357ce3aa6f',
                  '84100ec7-9bae-406c-8fb2-069c5e4e05a6', '268d27c5-365e-4c81-9a5f-154e3af31e38', '5fb9de5b-799e-4bd9-a841-55d8c62f5d17', 'fa9720f3-5c4c-4368-9f0a-715cd1d4251f', 'b13ade9a-33cb-4215-917b-1f50080e5a9d',
                  '8b6b1096-2af5-4a12-9b9a-ac763448828e', 'fc95e3b0-3a7f-4ede-b67d-9b9f614aa10f', '987d92d0-266e-4ec5-815a-e4e5243d7c8d', '2f97193b-2a19-4ddd-9c51-ffa184d10f59', '20be2662-b284-4f66-a904-dc93c22c8179',
                  'eaac7a2a-1487-41d7-b49a-8af312ab37f6', 'a8b38235-0b47-47f4-9e40-4c76836b6a22', '3ca3c3f3-7935-4a08-8ff0-73c0af2c7344', 'a1c967f2-e448-4d60-8b43-f71a7c0fa55c']

                  //dislay edit button when dashboard license is valid
                  $scope.showEditButton = (session.consoleSetting.DashboardsLicense.IsValid && session.user.IsAdmin && newAMViewIds.indexOf(app.getNavNodeIdFromUrl().toLowerCase()) == -1);

                  function guardian() {
                      var message = 'There may be unsaved changes to the page.  Are you sure you want to continue?';
                      return $scope.editMode ? message : undefined;
                  }
                  NavigationGuardService.registerGuardian(guardian);

                  $scope.localize = function (key) {
                      return LocalizationService.getValue(key);
                  };

                 
                  // Watching for changes on adfModel
                  $scope.$watch('adfModel', function (oldVal, newVal) {
                      // has model changed or is the model attribute not set
                      if (newVal !== null || (oldVal === null && newVal === null)) {
                          model = $scope.adfModel;
                          widgetFilter = $scope.adfWidgetFilter;
                          if (!model || !model.rows) {
                              structureName = $scope.structure;
                              structure = dashboard.structures[structureName];
                              if (structure) {
                                  if (model) {
                                      model.rows = angular.copy(structure).rows;
                                  } else {
                                      model = angular.copy(structure);
                                  }
                                  model.structure = structureName;
                              } else {
                                  $log.error('could not find structure ' + structureName);
                              }
                          }

                          if (model) {

                              if (!model.title) {
                                  model.title = 'Dashboard';
                              }
                              if (!model.titleTemplateUrl) {
                                  model.titleTemplateUrl = adfTemplatePath + 'dashboard-title.html';
                                  $('body').addClass('new-dashboard');//to determine if new dashboard was open and change drawer bottom value to match this page drawer bottom..
                              }
                              var canEdit =
                                $scope.sessionUser &&
                                $scope.sessionUser.IsAdmin &&
                                model &&
                                (hasWidgets(model) === false);
                              if (canEdit) {
                                  $scope.editMode = true;
                              }

                              //display edit task bar only on desktop view
                              $scope.showEditTaskbar = app.isMobile() ? false : true;

                              $scope.model = model;
                          } else {
                              $log.error('could not find or create model');
                          }
                      }
                  }, true);

                  // edit mode
                  $scope.editMode = false;
                  $scope.editClass = '';

                  $scope.toggleEditMode = function () {
                      $scope.editMode = !$scope.editMode;
                      if ($scope.editMode) {
                          if (!$scope.continuousEditMode) {
                              $scope.modelCopy = angular.copy($scope.adfModel, {});
                          }
                      }

                      if (!$scope.editMode) {
                          $rootScope.$broadcast('adfDashboardChanged', name, model);
                      }

                      //append collapsible buttons to widgets
                      app.dashboardUtils.AddWidgetToggleButton();
                  };

                  $scope.collapseAll = function (collapseExpandStatus) {
                      $rootScope.$broadcast('adfDashboardCollapseExapand', { collapseExpandStatus: collapseExpandStatus });
                  };

                  $scope.cancelEditMode = function () {
                      $scope.editMode = false;
                      if (!$scope.continuousEditMode) {
                          $scope.modelCopy = angular.copy($scope.modelCopy, $scope.adfModel);
                      }
                      //append collapsible buttons to widgets
                      app.dashboardUtils.AddWidgetToggleButton();
                      setTimeout(function () {
                          app.custom.dashboard.build();
                      }, 100);
                      $rootScope.$broadcast('adfDashboardEditsCancelled');
                  };

                  // edit dashboard settings
                  $scope.editDashboardDialog = function () {
                      var editDashboardScope = $scope.$new();
                      // create a copy of the title, to avoid changing the title to
                      // "dashboard" if the field is empty
                      editDashboardScope.copy = {
                          title: model.title
                      };
                      editDashboardScope.structures = dashboard.structures;

                      var instance = $aside.open({
                          scope: editDashboardScope,
                          templateUrl: adfTemplatePath + 'dashboard-edit.html',
                          placement: 'right',
                          size: 'md',
                          animation: 0
                      });
                      $scope.changeStructure = function (name, structure) {
                          $log.info('change structure to ' + name);
                          model.selectedKey = name;
                          changeStructure(model, structure);
                      };
                      editDashboardScope.closeDialog = function () {
                          // copy the new title back to the model
                          model.title = editDashboardScope.copy.title;
                          // close modal and destroy the scope
                          instance.close();
                          editDashboardScope.$destroy();
                      };
                      editDashboardScope.getSelectedStructureClass = function (key) {
                          var styleClass = '';
                          if (key === model.selectedKey) {
                              styleClass = 'selected';
                          }
                          return styleClass;
                      };
                  };

                  // add widget dialog
                  $scope.addWidgetDialog = function () {
                      var addScope = $scope.$new();
                      var model = $scope.model;
                      var widgets;
                      if (angular.isFunction(widgetFilter)) {
                          widgets = {};
                          angular.forEach(dashboard.widgets, function (widget, type) {
                              if (widgetFilter(widget, type, model)) {
                                  widgets[type] = widget;
                              }
                          });
                      } else {
                          widgets = dashboard.widgets;
                      }

                      addScope.widgets = widgets;

                      if (app.custom.dashboard.widgets.length) {
                          app.custom.dashboard.widgets.forEach(function (customWidget) {
                              //add custom widgets to the angular scope for adding to the page
                              addScope.widgets[customWidget.name] = customWidget.config;
                          });
                      }

                      var adfAddTemplatePath = adfTemplatePath + 'widget-add.html';
                      if (model.addTemplateUrl) {
                          adfAddTemplatePath = model.addTemplateUrl;
                      }

                      var opts = {
                          scope: addScope,
                          templateUrl: adfAddTemplatePath,
                          placement: 'right',
                          size: 'md'
                      };

                      var instance = $aside.open(opts);
                      addScope.addWidget = function (widget) {
                          var w = {
                              type: widget,
                              config: createConfiguration(widget)
                          };
                          addNewWidgetToModel(model, w, name);
                          setTimeout(function () {
                              //rebuild the custom widgets after adding one
                              app.custom.dashboard.build();
                          }, 200);
                          // close and destroy
                          instance.close();
                          addScope.$destroy();
                      };
                      addScope.closeDialog = function () {
                          // close and destroy
                          instance.close();
                          addScope.$destroy();
                      };
                  };

                  $scope.addNewWidgetToModel = addNewWidgetToModel;
                  $scope.showDrawer = false;
                  $scope.drawerNewClick = function (e) {
                      $scope.showDrawer = true;
                  }
              }],
              link: function ($scope, $element, $attr) {
                  // pass options to scope
                  var options = {
                      name: $attr.name,
                      editable: true,
                      enableConfirmDelete: stringToBoolean($attr.enableconfirmdelete),
                      maximizable: stringToBoolean($attr.maximizable),
                      collapsible: stringToBoolean($attr.collapsible)
                  };
                  if (angular.isDefined($attr.editable)) {
                      options.editable = stringToBoolean($attr.editable);
                  }
                  if (angular.isDefined($attr.collapsible)) {
                      options.collapsible = stringToBoolean($attr.collapsible);
                  }
                  $scope.options = options;
              },
              templateUrl: adfTemplatePath + 'dashboard.html'
          };
      }]);



    angular.module('adf').directive('adfLayoutSample', ['adfTemplatePath', AdfLayoutSampleDirective]);

    function AdfLayoutSampleDirective(adfTemplatePath) {
        return {
            restrict: 'E',
            scope: {
                adfStructure: '='
            },
            bindToController: true,
            controller: AdfLayoutSampleDirectiveController,
            controllerAs: 'vm',
            replace: true,
            templateUrl: adfTemplatePath + 'layout-sample.html'
        };
    }

    function AdfLayoutSampleDirectiveController() {
        var vm = this;

        angular.extend(vm, {
            getColumnWidth: function (styleClass) {

                var map = {
                    'col-md-3': '25.00',
                    'col-md-4': '33.33',
                    'col-md-6': '50.00',
                    'col-md-8': '66.66',
                    'col-md-9': '75.00',
                    'col-md-12': '100.00'
                };

                var width = (map[styleClass] ? map[styleClass] : '100.00') + '%';
                return width;
            },
            getRowHeight: function () {

                var numberOfRows = vm.adfStructure.rows.length;
                var height = (60 / numberOfRows).toFixed(2);
                return height;
            },
            getColumnStyle: function (column) {
                var style = {
                    'width': vm.getColumnWidth(column.styleClass),
                    'height': vm.getRowHeight() + 'px'
                };

                return style;
            }
        });
    }
    /*
     * The MIT License
     *
     * Copyright (c) 2015, Sebastian Sdorra
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
     * SOFTWARE.
     */

    angular.module('adf')
    .filter('orderObjectBy', function () {
        return function (items, field, reverse) {
            var filtered = [];
            angular.forEach(items, function (item, key) {
                item.jsonKey = key;
                filtered.push(item);
            });
            filtered.sort(function (a, b) {
                return (a[field] > b[field] ? 1 : -1);
            });
            if (reverse) filtered.reverse();
            return filtered;
        };
    });


    /**
     * @ngdoc object
     * @name adf.dashboardProvider
     * @description
     *
     * The dashboardProvider can be used to register structures and widgets.
     */
    angular.module('adf.provider', [])
      .provider('dashboard', function () {

          var widgets = {};
          var widgetsPath = '';
          var structures = {};
          var messageTemplate = '<div class="alert alert-danger">{}</div>';
          var loadingTemplate = '\
      <div class="progress progress-striped active">\n\
        <div class="progress-bar" role="progressbar" style="width: 100%">\n\
          <span class="sr-only">loading ...</span>\n\
        </div>\n\
      </div>';

          /**
           * @ngdoc method
           * @name adf.dashboardProvider#widget
           * @methodOf adf.dashboardProvider
           * @description
           *
           * Registers a new widget.
           *
           * @param {string} name of the widget
           * @param {object} widget to be registered.
           *
           *   Object properties:
           *
           *   - `title` - `{string=}` - The title of the widget.
           *   - `description` - `{string=}` - Description of the widget.
           *   - `config` - `{object}` - Predefined widget configuration.
           *   - `controller` - `{string=|function()=}` - Controller fn that should be
           *      associated with newly created scope of the widget or the name of a
           *      {@link http://docs.angularjs.org/api/angular.Module#controller registered controller}
           *      if passed as a string.
           *   - `controllerAs` - `{string=}` - A controller alias name. If present the controller will be
           *      published to scope under the `controllerAs` name.
           *   - `frameless` - `{boolean=}` - false if the widget should be shown in frameless mode. The default is false.
           *   - `template` - `{string=|function()=}` - html template as a string.
           *   - `templateUrl` - `{string=}` - path to an html template.
           *   - `reload` - `{boolean=}` - true if the widget could be reloaded. The default is false.
           *   - `resolve` - `{Object.<string, function>=}` - An optional map of dependencies which should
           *      be injected into the controller. If any of these dependencies are promises, the widget
           *      will wait for them all to be resolved or one to be rejected before the controller is
           *      instantiated.
           *      If all the promises are resolved successfully, the values of the resolved promises are
           *      injected.
           *
           *      The map object is:
           *      - `key` – `{string}`: a name of a dependency to be injected into the controller.
           *      - `factory` - `{string|function}`: If `string` then it is an alias for a service.
           *        Otherwise if function, then it is {@link http://docs.angularjs.org/api/AUTO.$injector#invoke injected}
           *        and the return value is treated as the dependency. If the result is a promise, it is
           *        resolved before its value is injected into the controller.
           *   - `edit` - `{object}` - Edit modus of the widget.
           *      - `controller` - `{string=|function()=}` - Same as above, but for the edit mode of the widget.
           *      - `controllerAs` - `{string=}` - Same as above, but for the edit mode of the widget.
           *      - `template` - `{string=|function()=}` - Same as above, but for the edit mode of the widget.
           *      - `templateUrl` - `{string=}` - Same as above, but for the edit mode of the widget.
           *      - `resolve` - `{Object.<string, function>=}` - Same as above, but for the edit mode of the widget.
           *      - `reload` - {boolean} - true if the widget should be reloaded, after the edit mode is closed.
           *        Default is true.
           *
           * @returns {Object} self
           */
          this.widget = function (name, widget) {
              var w = angular.extend({ reload: false, frameless: false }, widget);
              if (w.edit) {
                  var edit = { reload: true };
                  angular.extend(edit, w.edit);
                  w.edit = edit;
              }
              widgets[name] = w;
              return this;
          };

          /**
           * @ngdoc method
           * @name adf.dashboardProvider#widgetsPath
           * @methodOf adf.dashboardProvider
           * @description
           *
           * Sets the path to the directory which contains the widgets. The widgets
           * path is used for widgets with a templateUrl which contains the
           * placeholder {widgetsPath}. The placeholder is replaced with the
           * configured value, before the template is loaded, but the template is
           * cached with the unmodified templateUrl (e.g.: {widgetPath}/src/widgets).
           * The default value of widgetPaths is ''.
           *
           *
           * @param {string} path to the directory which contains the widgets
           *
           * @returns {Object} self
           */
          this.widgetsPath = function (path) {
              widgetsPath = path;
              return this;
          };

          /**
           * @ngdoc method
           * @name adf.dashboardProvider#structure
           * @methodOf adf.dashboardProvider
           * @description
           *
           * Registers a new structure.
           *
           * @param {string} name of the structure
           * @param {object} structure to be registered.
           *
           *   Object properties:
           *
           *   - `rows` - `{Array.<Object>}` - Rows of the dashboard structure.
           *     - `styleClass` - `{string}` - CSS Class of the row.
           *     - `columns` - `{Array.<Object>}` - Columns of the row.
           *       - `styleClass` - `{string}` - CSS Class of the column.
           *
           * @returns {Object} self
           */
          this.structure = function (name, structure) {
              structures[name] = structure;
              return this;
          };

          /**
           * @ngdoc method
           * @name adf.dashboardProvider#messageTemplate
           * @methodOf adf.dashboardProvider
           * @description
           *
           * Changes the template for messages.
           *
           * @param {string} template for messages.
           *
           * @returns {Object} self
           */
          this.messageTemplate = function (template) {
              messageTemplate = template;
              return this;
          };

          /**
           * @ngdoc method
           * @name adf.dashboardProvider#loadingTemplate
           * @methodOf adf.dashboardProvider
           * @description
           *
           * Changes the template which is displayed as
           * long as the widget resources are not resolved.
           *
           * @param {string} template loading template
           *
           * @returns {Object} self
           */
          this.loadingTemplate = function (template) {
              loadingTemplate = template;
              return this;
          };

          /**
           * @ngdoc service
           * @name adf.dashboard
           * @description
           *
           * The dashboard holds all options, structures and widgets.
           *
           * @property {Array.<Object>} widgets Array of registered widgets.
           * @property {string} widgetsPath Default path for widgets.
           * @property {Array.<Object>} structures Array of registered structures.
           * @property {string} messageTemplate Template for messages.
           * @property {string} loadingTemplate Template for widget loading.
           *
           * @returns {Object} self
           */
          this.$get = function () {
              var cid = 0;

              return {
                  widgets: widgets,
                  widgetsPath: widgetsPath,
                  structures: structures,
                  messageTemplate: messageTemplate,
                  loadingTemplate: loadingTemplate,

                  /**
                   * @ngdoc method
                   * @name adf.dashboard#id
                   * @methodOf adf.dashboard
                   * @description
                   *
                   * Creates an ongoing numeric id. The method is used to create ids for
                   * columns and widgets in the dashboard.
                   */
                  id: function () {
                      return ++cid;
                  }
              };
          };

      });

    /*
    * The MIT License
    *
    * Copyright (c) 2015, Sebastian Sdorra
    *
    * Permission is hereby granted, free of charge, to any person obtaining a copy
    * of this software and associated documentation files (the "Software"), to deal
    * in the Software without restriction, including without limitation the rights
    * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    * copies of the Software, and to permit persons to whom the Software is
    * furnished to do so, subject to the following conditions:
    *
    * The above copyright notice and this permission notice shall be included in
    * all copies or substantial portions of the Software.
    *
    * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    * SOFTWARE.
    */


    /* global angular */
    angular.module('adf')
      .directive('adfDashboardRow', ["$compile", "adfTemplatePath", "columnTemplate", function ($compile, adfTemplatePath, columnTemplate) {


          return {
              restrict: 'E',
              replace: true,
              scope: {
                  row: '=',
                  adfModel: '=',
                  editMode: '=',
                  continuousEditMode: '=',
                  options: '='
              },
              templateUrl: adfTemplatePath + 'dashboard-row.html',
              link: function ($scope, $element) {
                  if (angular.isDefined($scope.row.columns) && angular.isArray($scope.row.columns)) {
                      $compile(columnTemplate)($scope, function (cloned) {
                          $element.append(cloned);
                      });
                  }
              }
          };
      }]);

    /*
     * The MIT License
     *
     * Copyright (c) 2015, Sebastian Sdorra
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
     * SOFTWARE.
     */



    angular.module('adf')
      .directive('adfWidgetContent', ["$log", "$q", "$sce", "$http", "$templateCache", "$compile", "$controller", "$injector", "dashboard", function ($log, $q, $sce, $http, $templateCache,
              $compile, $controller, $injector, dashboard) {

          function parseUrl(url) {
              var parsedUrl = url;
              if (url.indexOf('{widgetsPath}') >= 0) {
                  parsedUrl = url.replace('{widgetsPath}', dashboard.widgetsPath)
                          .replace('//', '/');
                  if (parsedUrl.indexOf('/') === 0) {
                      parsedUrl = parsedUrl.substring(1);
                  }
              }
              return parsedUrl;
          }

          function getTemplate(widget) {
              var deferred = $q.defer();
              //don't run the template fetching code if widget is custom.
              if (!widget.custom) {
                  if (widget.template) {
                      deferred.resolve(widget.template);
                  } else if (widget.templateUrl) {
                      // try to fetch template from cache
                      var tpl = $templateCache.get(widget.templateUrl);
                      if (tpl) {
                          deferred.resolve(tpl);
                      } else {
                          var url = $sce.getTrustedResourceUrl(parseUrl(widget.templateUrl));
                          $http.get(url)
                              .success(function (response) {
                                  // put response to cache, with unmodified url as key
                                  $templateCache.put(widget.templateUrl, response);
                                  deferred.resolve(response);
                              })
                              .error(function () {
                                  deferred.reject('could not load template');
                              });
                      }
                  }

                  return deferred.promise;
              }
          }

          function compileWidget($scope, $element, currentScope) {
              //only compile if the widget has content, this precludes custom widgets
              if ($scope.content) {
                  var model = $scope.model;
                  var content = $scope.content;

                  // display loading template
                  $element.html(dashboard.loadingTemplate);

                  // create new scope
                  var templateScope = $scope.$new();

                  // pass config object to scope
                  if (!model.config) {
                      model.config = {};
                  }

                  templateScope.config = model.config;

                  // local injections
                  var base = {
                      $scope: templateScope,
                      widget: model,
                      config: model.config
                  };

                  // get resolve promises from content object
                  var resolvers = {};
                  resolvers.$tpl = getTemplate(content);
                  if (content.resolve) {
                      angular.forEach(content.resolve, function (promise, key) {
                          if (angular.isString(promise)) {
                              resolvers[key] = $injector.get(promise);
                          } else {
                              resolvers[key] = $injector.invoke(promise, promise, base);
                          }
                      });
                  }

                  // resolve all resolvers
                  $q.all(resolvers).then(function (locals) {
                      angular.extend(locals, base);

                      // compile & render template
                      var template = locals.$tpl;
                      $element.html(template);
                      if (content.controller) {
                          var templateCtrl = $controller(content.controller, locals);
                          if (content.controllerAs) {
                              templateScope[content.controllerAs] = templateCtrl;
                          }
                          $element.children().data('$ngControllerController', templateCtrl);
                      }
                      $compile($element.contents())(templateScope);

                      //remove loading mask once everything is resolved
                      app.lib.mask.remove();
                  }, function (reason) {
                      // handle promise rejection
                      var msg = 'Could not resolve all promises';
                      if (reason) {
                          msg += ': ' + reason;
                      }
                      $log.warn(msg);
                      $element.html(dashboard.messageTemplate.replace(/{}/g, msg));
                  });

                  // destroy old scope
                  if (currentScope) {
                      currentScope.$destroy();
                  }

                  return templateScope;
              }
          }

          return {
              replace: true,
              restrict: 'EA',
              transclude: false,
              scope: {
                  model: '=',
                  content: '='
              },
              link: function ($scope, $element) {
                  var currentScope = compileWidget($scope, $element, null);
                  $scope.$on('widgetConfigChanged', function () {
                      currentScope = compileWidget($scope, $element, currentScope);
                  });
                  $scope.$on('widgetReload', function () {
                      currentScope = compileWidget($scope, $element, currentScope);
                  });
              }
          };

      }]);

    /*
     * The MIT License
     *
     * Copyright (c) 2015, Sebastian Sdorra
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
     * SOFTWARE.
     */



    angular.module('adf')
        .directive('adfWidget', ["$log", "$aside", "$rootScope", "dashboard", "adfTemplatePath", function ($log, $aside, $rootScope, dashboard, adfTemplatePath) {

            function preLink($scope) {
                var definition = $scope.definition;
                if (definition) {
                    var w = dashboard.widgets[definition.type];
                    if (w) {
                        
                        // pass title
                        if (!definition.title && !definition.titleX) {
                            var title = localizationHelper.localize(definition.TitleLocalizationKey, w.title);
                            if (_.isUndefined(title)) {
                                $scope.getAvailableLocale(definition.TitleLocalizationKey).then(function (localizations) {
                                    var localizedTitle = _.find(localizations, function (item) {
                                        return item.Locale == session.user.Preferences.LanguageCode.Id;
                                    });
                                    title = localizedTitle;
                                });
                            }

                            definition.title = title;
                            definition.titleX = title;

                        }
                        
                        if (!definition.TitleLocalizationKey) {
                            definition.TitleLocalizationKey = definition.type + "_" + app.lib.newGUID() + "_title";
                        } else {
                            definition.title = localizationHelper.localize(definition.TitleLocalizationKey, definition.title);
                            definition.titleX = localizationHelper.localize(definition.TitleLocalizationKey, definition.title);
                        }

                        

                        if (!definition.DescriptionLocalizationKey) {
                            definition.DescriptionLocalizationKey = definition.type + "_" + app.lib.newGUID() + "_desc";
                        } else {
                            var localizedDescription = localizationHelper.localize(definition.DescriptionLocalizationKey, "");
                            definition.description = (localizedDescription != ("*" + definition.DescriptionLocalizationKey + "*")) ? localizedDescription : "";
                        }

                        if (!definition.titleTemplateUrl) {
                            definition.titleTemplateUrl = adfTemplatePath + 'widget-title.html';
                            if (w.titleTemplateUrl) {
                                definition.titleTemplateUrl = w.titleTemplateUrl;
                            }
                        }

                        if (!definition.titleTemplateUrl) {
                            definition.frameless = w.frameless;
                        }

                        // set id for sortable
                        if (!definition.wid) {
                            definition.wid = dashboard.id();
                        }

                        if (!definition.config) {
                            definition.config = {}
                        }

                        if (definition.type === 'grid') {
                            if (definition.config.selectedQueryBuilder) {
                                definition.config.stateGuid = "dashboard-grid_"
                                    + app.getNavNodeIdFromUrl() + "_"
                                    + definition.config.selectedQueryBuilder.navNodeId + "_"
                                    + definition.wid;
                            }
                        } else if (definition.type === 'advanced-grid' || definition.type === 'odata-grid') {
                            definition.config.stateGuid = "dashboard-grid_"
                                + app.getNavNodeIdFromUrl() + "_"
                                + definition.wid;
                        } else {
                            definition.config.stateGuid = 'na';
                        }


                        // pass copy of widget to scope
                        $scope.widget = angular.copy(w);

                        $scope.widget.showDesc = false;

                        // create config object
                        var config = definition.config;
                        if (config) {
                            if (angular.isString(config)) {
                                config = angular.fromJson(config);
                            }
                        } else {
                            config = {};
                        }

                        // pass config to scope
                        $scope.config = config;

                        // collapse exposed $scope.widgetState property
                        if (!$scope.widgetState) {
                            $scope.widgetState = {};
                            $scope.widgetState.isCollapsed = false;
                        }

                        //enable reload on count widget
                        if ($scope.definition.type === 'count') {
                            $scope.widget.reload = true;
                        }

                        //enable export on grid widgets
                        if ($scope.definition.type.indexOf("grid") > -1) {
                            $scope.widget.export = true;
                        }

                        //default widget visibility to true
                        $scope.definition.visible = true;

                    } else {
                        $log.warn('could not find widget ' + definition.type);
                    }
                } else {
                    $log.debug('definition not specified, widget was probably removed');
                }
            }

            function postLink($scope, $element) {
                var definition = $scope.definition;
                if (definition) {
                    // bind close function

                    var deleteWidget = function () {
                        var column = $scope.col;
                        if (column) {
                            var index = column.widgets.indexOf(definition);
                            if (index >= 0) {
                                column.widgets.splice(index, 1);
                            }
                        }
                        $element.remove();
                        $rootScope.$broadcast('adfWidgetRemovedFromColumn');
                    };

                    $scope.remove = function () {
                        if ($scope.options.enableConfirmDelete) {
                            var deleteScope = $scope.$new();
                            var deleteTemplateUrl = adfTemplatePath + 'widget-delete.html';
                            if (definition.deleteTemplateUrl) {
                                deleteTemplateUrl = definition.deleteTemplateUrl;
                            }
                            var opts = {
                                scope: deleteScope,
                                templateUrl: deleteTemplateUrl,
                                placement: 'right',
                                size: 'md'
                            };
                            var instance = $aside.open(opts);

                            deleteScope.closeDialog = function () {
                                instance.close();
                                deleteScope.$destroy();
                            };
                            deleteScope.deleteDialog = function () {
                                deleteWidget();
                                deleteScope.closeDialog();
                            };
                        } else {
                            deleteWidget();
                        }
                    };

                    // bind reload function
                    $scope.reload = function (e) {
                        if ($scope.definition.type == "grid" || $scope.definition.type == "count" || $scope.definition.type == "chart") {
                            app.gridUtils.savedState.removeSavedState(definition.config.stateGuid);
                            app.storage.viewPanels.session.clear();
                            window.location.reload();
                        }
                        $scope.$broadcast('widgetReload');
                    };

                    // bind edit function
                    $scope.edit = function () {
                        var editScope = $scope.$new();
                        editScope.definition = angular.copy(definition);
                        editScope.definition.UpdateLocalizationText = function (x, modelName) {
                            if (session.user.LanguageCode == x.Locale) {
                                editScope.definition[modelName] = x.Translation;
                            }
                        }

                        editScope.definition.UpdateCurrentLocalizationFromTextbox = function (x, modelName, modelListName) {
                            _.find(editScope.definition[modelListName], function (localeItem) {
                                if (localeItem.Locale == session.user.LanguageCode) {
                                    localeItem.Translation = editScope.definition[modelName];

                                    return true;
                                }

                                return false;
                            });
                            
                        }
                        //localization model
                        editScope.definition.TitleLocalization = [];
                        $scope.getAvailableLocale(editScope.definition.TitleLocalizationKey).then(function (localizations) {

                            editScope.definition.TitleLocalization = localizations;
                        });

                        editScope.definition.DescriptionLocalization = [];
                        $scope.getAvailableLocale(editScope.definition.DescriptionLocalizationKey).then(function (localizations) {
                            editScope.definition.DescriptionLocalization = localizations;
                        });

                        var adfEditTemplatePath = adfTemplatePath + 'widget-edit.html';
                        if (definition.editTemplateUrl) {
                            adfEditTemplatePath = definition.editTemplateUrl;
                        }

                        var opts = {
                            scope: editScope,
                            templateUrl: adfEditTemplatePath,
                            placement: 'right',
                            size: 'md'
                        };

                        var instance = $aside.open(opts);
                        editScope.closeDialog = function () {
                            setTimeout(function () {
                                //rebuild widgets after editing
                                app.custom.dashboard.build();
                            }, 200);
                            instance.close();
                            editScope.$destroy();
                        };

                      //This will prevent unnecessary closing of the flyout. Bug22849
                      _.defer(function () {
                          var mouseDownActionIsCloseFlyout = false;
                          //This will remove angular click event
                          $("#wedgetFlyout").unbind("click").mousedown(function (e) {
                              mouseDownActionIsCloseFlyout = false;
                              if ($(e.target).parents(".modal-dialog").length <= 0) {
                                  mouseDownActionIsCloseFlyout = true;
                              }
                          }).click(function (e) {
                              if (mouseDownActionIsCloseFlyout) instance.close();
                         }); 
                          
                      });

                        
                        editScope.saveDialog = function () {
                            app.lib.mask.apply();
                            setTimeout(function () {
                                definition.title = editScope.definition.title;
                                definition.description = editScope.definition.description;
                                definition.TitleLocalizationKey = editScope.definition.TitleLocalizationKey
                                definition.DescriptionLocalizationKey = editScope.definition.DescriptionLocalizationKey

                                angular.extend(definition.config, editScope.definition.config);

                                var localizationModels = [];


                                //title
                                _.each(editScope.definition.TitleLocalization, function (translationModel) {
                                    if (translationModel.Locale == session.user.Preferences.LanguageCode.Id) {
                                        translationModel.Translation = !_.isUndefined($scope.definition.title) ? $scope.definition.title : $scope.definition.titleX;
                                    }

                                    if (translationModel.Translation != "") {
                                        localizationModels.push(translationModel);
                                    }
                                });

                                //description
                                _.each(editScope.definition.DescriptionLocalization, function (translationModel) {
                                    if (translationModel.Locale == session.user.Preferences.LanguageCode.Id) {
                                        translationModel.Translation = !_.isUndefined($scope.definition.description) ? $scope.definition.description : "";
                                    }

                                    if (translationModel.Translation != "") {
                                        localizationModels.push(translationModel);
                                    }
                                });


                                

                                //save column localization if avaialable
                                if (!_.isUndefined(editScope.definition.config.gridColumns)) {
                                    _.each(editScope.definition.config.gridColumns, function (column) {
                                        _.each(column.translations, function (translationModel) {
                                            if (translationModel.Translation != "") {
                                                localizationModels.push(translationModel);
                                            }
                                        });
                                    });
                                };

                                $scope.saveLocalizationKeys(localizationModels, function () {

                                    for (var i in editScope.definition.config.allColumns) {
                                        editScope.definition.config.allColumns[i].translations = [];
                                    }

                                    app.lib.mask.remove();
                                    editScope.closeDialog();


                                    var widget = $scope.widget;
                                    if (widget.edit && widget.edit.reload) {
                                        // reload content after edit dialog is closed
                                        $scope.$broadcast('widgetConfigChanged');
                                    }
                                    
                                });

                            }, 100);


                        };
                  };

                  $scope.export = function () {
                      var gridElem = $element.find("[kendo-grid='grid']");
                      var kendoGrid = $(gridElem).getKendoGrid();
                      //Set dashboard page title as export filename when widget definition title is empty
                      var exportFileName = ($scope.definition.title) ? $scope.definition.title : $(".dashboard-container h1").text();
                      kendoGrid.options.excel = { fileName: exportFileName.trim() + ".xlsx", allPages: true, proxyURL: "" };
                      kendoGrid.saveAsExcel();
                    }

              } else {
                  $log.debug('widget not found');
              }
          }

          return {
              replace: true,
              restrict: 'EA',
              transclude: false,
              templateUrl: adfTemplatePath + 'widget.html',
              scope: {
                  definition: '=',
                  col: '=column',
                  editMode: '=',
                  options: '=',
                  widgetState: '='
              },
              controller: ["$scope", "LocalizationService", function ($scope, LocalizationService) {

                  $scope.$on('adfDashboardCollapseExapand', function (event, args) {
                      $scope.widgetState.isCollapsed = args.collapseExpandStatus;
                  });

                  $scope.localize = function (key) {
                      return LocalizationService.getValue(key);
                  };

                  $scope.saveLocalizationKeys = function (models, callBack) {
                      if (models.length === 0) return;
                      return LocalizationService.saveLocalizations(models, callBack)
                  }

                  $scope.getAvailableLocale = function (key) {
                      return LocalizationService.getAvailableLocale(key);
                  }

                  $scope.openFullScreen = function () {
                      var definition = $scope.definition;
                      var fullScreenScope = $scope.$new();
                      var opts = {
                          scope: fullScreenScope,
                          templateUrl: adfTemplatePath + 'widget-fullscreen.html',
                          size: definition.modalSize || 'lg', // 'sm', 'lg'
                          windowClass: (definition.fullScreen) ? 'dashboard-modal widget-fullscreen' : 'dashboard-modal',
                          placement: 'top'
                      };

                      var instance = $aside.open(opts);
                      fullScreenScope.closeDialog = function () {
                          instance.close();
                          fullScreenScope.$destroy();
                      };
                  };
              }],
              compile: function () {

                  /**
                   * use pre link, because link of widget-content
                   * is executed before post link widget
                   */
                  return {
                      pre: preLink,
                      post: postLink
                  };
              }
          };

      }]);

    angular.module("adf").run(["$templateCache", function ($templateCache) {
        $templateCache.put("../src/templates/dashboard-column.html", "<div adf-id={{column.$$hashKey}} class=column ng-class=column.styleClass ng-model=column.widgets> <adf-widget ng-repeat=\"definition in column.widgets\" definition=definition column=column edit-mode=editMode options=options widget-state=widgetState>  </adf-widget></div> ");
        $templateCache.put("../src/templates/dashboard-edit.html", "<div class=modal-header> <h4 class=modal-title>{{ ::localize(\'PageLayout\') }}</h4> </div> <div class=modal-body> <form role=form>  <div class=form-group> <label>{{ ::localize(\'Layout\') }}</label> <fieldset> <div ng-repeat=\"(key, structure) in structures\" style=\"float: left;\"> <adf-layout-sample ng-click=\"changeStructure(key, structure)\" adf-structure=structure ng-class=\"getSelectedStructureClass(key, structure)\"></adf-layout-sample> </div> </fieldset> </div> </form> </div> <div class=modal-footer> <button type=button class=\"btn btn-primary close\" ng-click=closeDialog()>{{ ::localize(\'Close\') }}</button> </div>");
        $templateCache.put("../src/templates/dashboard-row.html", "<div class=row ng-class=row.styleClass>  </div> ");
        $templateCache.put("../src/templates/dashboard.html", "<div class=dashboard-container> <div ng-include src=model.titleTemplateUrl></div>   <div class='row'><div class='col-md-12' id='alertMessagesContainer'><div class='alert alert-success' style='display:none'></div></div></div>   <div class=dashboard x-ng-class=\"{\'edit\' : editMode}\"> <adf-dashboard-row row=row adf-model=model options=options ng-repeat=\"row in model.rows\" edit-mode=editMode continuous-edit-mode=continuousEditMode> </adf-dashboard-row></div> </div>");
        $templateCache.put("../src/templates/dashboard-title.html", "<h1> {{ ::model.title }} </h1> <div class=\"container-fluid margin-t20\"><div class=row><div class=col-md-12 id=alertMessagesContainer></div></div></div> <div ng-if=showEditTaskbar  id=drawer-taskbar class=\"dashboard-drawertaskbar\"> <a ng-click=editDashboardDialog() ng-if=editMode class=\"btn btn-link\"><span class=\"fa fa-th-large\"></span> <div>{{ localize(\'Layout\') }}</div> </a> <a ng-click=addWidgetDialog() ng-if=editMode class=\"btn btn-link btn-lg\"><span class=\"fa fa-plus\"></span> <div>{{ localize(\'Content\') }}</div> </a> <a ng-if=showEditButton ng-click=toggleEditMode() class=\"btn btn-link btn-lg\"><span class=fa x-ng-class=\"{\'fa-pencil\' : !editMode, \'fa-check\' : editMode}\"></span> <div>{{ editMode ? localize(\'Save\') : localize(\'Edit\') }}</div> </a> <a ng-click=cancelEditMode() ng-if=editMode class=\"btn btn-link btn-lg\"><span class=\"fa fa-times\"></span> <div>{{ ::localize(\'Cancel\') }}</div> </a> </div>  ");
        $templateCache.put("../src/templates/layout-sample.html", "<div class=adf-layout-sample> <div ng-repeat=\"row in vm.adfStructure.rows\" class=clearfix> <div ng-repeat=\"column in row.columns\" class=adf-layout-sample-column ng-style=\"{{ vm.getColumnStyle(column) }}\"> </div> </div> </div>");
        $templateCache.put("../src/templates/widget-add.html", "<div class=modal-header> <h4 class=modal-title>{{ ::localize(\'AddNewContent\') }}</h4> </div> <div class=modal-body> <div> <div ng-repeat=\"widget in widgets | orderObjectBy: 'ordinal'\"> <a href ng-click=addWidget(widget.jsonKey)> <h5>{{ ::localize(widget.title) }}</h5> </a> <p> {{ ::localize(widget.description) }} </p> <br> </div> </div> </div> <div class=modal-footer> <button type=button class=\"btn btn-primary close\" ng-click=closeDialog()>{{ ::localize(\'Close\') }}</button> </div> ");
        $templateCache.put("../src/templates/widget-delete.html", "<div class=modal-header> <h4 class=modal-title>{{ ::localize(\'Delete\') }} {{widget.title}}</h4> </div> <div class=modal-body> <form role=form> <div class=form-group> <label for=widgetTitle>{{ ::localize(\'DeleteWidgetConfirmation\') }}</label> </div> </form> </div> <div class=modal-footer> <button type=button class=\"btn btn-default close\" ng-click=closeDialog()>{{ ::localize(\'Close\') }}</button> <button type=button class=\"btn btn-primary\" ng-click=deleteDialog()>{{ ::localize(\'Delete\') }}</button> </div> ");
        $templateCache.put("../src/templates/widget-edit.html", "<div class=modal-header> <h4 class=modal-title>{{ ::localize(widget.title) }}</h4> </div> <div class=modal-body> <form role=form> <div class=form-group> <label for=widgetTitle>{{ ::localize(\'Title\') }}</label> <input type=text class=form-control id=widgetTitle ng-model='definition.title' ng-keyup=\"definition.UpdateCurrentLocalizationFromTextbox(definition,'title','TitleLocalization')\" placeholder=\"Enter title\" required><a class=control-label ng-click=\"definition.showTranslation = !definition.showTranslation;\">{{ ::localize(\'EnterTranslations\') }}</a></div><div ng-show=\"definition.showTranslation\" class=\"modal-showtranslation\"><table><tr ng-repeat=\"x in definition.TitleLocalization\"><td>{{x.Locale}}</td><td><input ng-keyup=\"definition.UpdateLocalizationText(x,'title')\" ng-model=\"x.Translation\"/></td></tr></table></div><div class=form-group> <label for=widgetDescription>{{ ::localize(\'Description\') }}</label> <textArea class=form-control id=widgetDescription ng-model=definition.description rows='3' ng-keyup=\"definition.UpdateCurrentLocalizationFromTextbox(definition,'description','DescriptionLocalization')\"></textArea><a class=control-label ng-click=\"definition.showTranslationDesc = !definition.showTranslationDesc;\">{{ ::localize(\'EnterTranslations\') }}</a></div><div ng-show=\"definition.showTranslationDesc\" class=\"modal-showtranslation\"><table><tr ng-repeat=\"y in definition.DescriptionLocalization\"><td>{{y.Locale}}</td><td><input ng-model=\"y.Translation\" ng-keyup=\"definition.UpdateLocalizationText(y,'description')\"/></td></tr></table></div> </form> <div ng-if=widget.edit> <adf-widget-content model=definition content=widget.edit> </adf-widget-content></div> </div> <div class=modal-footer> <button type=button class=\"btn btn-primary\" id=saveAdfDialog ng-click=saveDialog()>{{ ::localize(\'Apply\') }}</button> <button type=button class=\"btn btn-default\" ng-click=closeDialog()>{{ ::localize(\'Cancel\') }}</button> </div>");
        $templateCache.put("../src/templates/widget-fullscreen.html", "<div class=modal-header> <div class=\"pull-right widget-icons\"> <a href title=\"{{localize(\'ReloadWidgetContent\')}}\" ng-if=widget.reload ng-click=reload()> <i class=\"fa fa-refresh\"></i> </a> <a href title=close ng-click=closeDialog()> <i class=\"fa fa-remove\"></i> </a> </div> <h4 class=modal-title>{{::definition.title}}</h4> </div> <div class=modal-body> <adf-widget-content model=definition content=widget> </adf-widget-content></div> <div class=modal-footer> <button type=button class=\"btn btn-primary\" ng-click=closeDialog()>{{ ::localize(\'Close\') }}</button> </div> ");
        $templateCache.put("../src/templates/widget-title.html", "<h3 class=\"panel-title adf-widget-title\"> <span class=\"pull-right\"> <a ng-if=definition.description href title=\"See Description\" ng-click=widget.showDesc=!widget.showDesc;> <i class=\"fa fa-info\" style=\"padding-right:7px;padding-left:7px\"></i> </a> <a href title=\"{{::localize(\'ReloadWidgetContent\')}}\" ng-if=widget.reload ng-click=reload()> <i class=\"fa fa-refresh\"></i> </a> <a href title=\"{{::localize(\'ExportToExcel\')}}\" ng-if=widget.export ng-click=export()> <i class=\"fa fa-file-excel-o\"></i> </a> <a href title=\"{{::localize(\'ChangeWidgetLocation\')}}\" class=adf-move ng-if=editMode> <i class=\"fa fa-arrows adf-move\"></i> </a>  <a href title=\"{{::localize(\'CollapseWidget\')}}\" ng-show=\"false\" ng-click=\"widgetState.isCollapsed = !widgetState.isCollapsed\"> <i class=\"fa fa-minus\"></i> </a>  <a href title=\"{{::localize(\'ExpandWidget\')}}\" ng-show=\"options.collapsible && widgetState.isCollapsed\" ng-click=\"widgetState.isCollapsed = !widgetState.isCollapsed\"> <i class=\"fa fa-plus\"></i> </a>  <a href title=\"{{ ::localize(\'EditWidgetSettings\') }}\" ng-click=edit() ng-if=editMode> <i class=\"fa fa-cog\"></i> </a> <a href title=\"{{::localize(\'MaximizeWidget\')}}\" ng-click=openFullScreen() ng-show=options.maximizable> <i class=\"fa fa-arrows-h\"></i> </a>  <a href title=\"{{::localize(\'RemoveWidget\')}}\" ng-click=remove() ng-if=editMode> <i class=\"fa fa-trash\"></i> </a> </span>{{definition.title}}  </h3>");
        $templateCache.put("../src/templates/widget.html", "<div ng-show={{definition.visible}} adf-id={{definition.$$hashKey}} adf-widget-type={{definition.type}} ng-class=\"{\'panel panel-default\':!widget.frameless || editMode}\" class=widget> <div class=\"panel-heading clearfix\" ng-if=\"!widget.frameless || editMode\"> <div ng-include src=definition.titleTemplateUrl></div> </div> <p class=\"adf-widget-description\" ng-if=widget.showDesc&&definition.description> {{definition.description}} </p>  <div ng-class=\"{\'panel-body\':!widget.frameless || editMode}\"> <adf-widget-content model=definition content=widget> </adf-widget-content></div> </div> ");
    }]);
})(window);