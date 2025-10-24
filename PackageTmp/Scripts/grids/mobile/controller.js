/**
Mobile grid
**/
define(function (require) {
    var wiTpl = require("text!grids/mobile/view.workitem.html");
    var ciTpl = require("text!grids/mobile/view.configitem.html");
    var kmTpl = require("text!grids/mobile/view.knowledgemanager.html");
    var announcementTpl = require("text!grids/mobile/view.announcement.html");
    var amGeneralTpl = require("text!grids/mobile/view.amGeneral.html");

    var definition = {
        build: function (vm, node, callback) {
            var controlId = vm.containerId || vm.gridId;
            var tpl = wiTpl;
            var editUrl = '';

            switch (vm.grid.GridType) {
                case 'ConfigItem':
                    app.gridUtils.configureGenericGrid(controlId, vm);
                    tpl = ciTpl;
                    break;
                case 'EditableKnowledgeArticle':
                    app.gridUtils.applyKmDashboardDataSourceConfig(controlId, vm);
                    tpl = kmTpl;
                    break;
                case 'Announcement':
                    app.gridUtils.configureGenericGrid(controlId, vm);
                    tpl = announcementTpl;
                    break;
                case 'CatalogItem':
                    app.gridUtils.configureGenericGrid(controlId, vm);
                    tpl = amGeneralTpl;
                    editUrl = '/AssetManagement/Administration/CatalogItem/Edit/|ID|';
                    break;
                case 'LeaseContract':
                    app.gridUtils.configureGenericGrid(controlId, vm);
                    tpl = amGeneralTpl;
                    editUrl = '/AssetManagement/Contract/Lease/Edit/|ID|';
                    break;
                case 'SupportAndMaintenanceContract':
                    app.gridUtils.configureGenericGrid(controlId, vm);
                    tpl = amGeneralTpl;
                    editUrl = '/AssetManagement/Contract/SupportandMaintenance/Edit/|ID|';
                    break;
                case 'WarrantyContract':
                    app.gridUtils.configureGenericGrid(controlId, vm);
                    tpl = amGeneralTpl;
                    editUrl = '/AssetManagement/Contract/Warranty/Edit/|ID|';
                    break;
                case 'HardwareAsset':
                    app.gridUtils.configureGenericGrid(controlId, vm);
                    tpl = amGeneralTpl;
                    editUrl = '/AssetManagement/HardwareAsset/Edit/|ID|';
                    break;
                case 'SoftwareAsset':
                    app.gridUtils.configureGenericGrid(controlId, vm);
                    tpl = amGeneralTpl;
                    editUrl = '/AssetManagement/SoftwareAsset/Edit/|ID|';
                    break;
                case 'Consumable':
                    app.gridUtils.configureGenericGrid(controlId, vm);
                    tpl = amGeneralTpl;
                    editUrl = '/AssetManagement/Administration/Consumables/Edit/|ID|';
                    break;
                case 'CostCenter':
                    app.gridUtils.configureGenericGrid(controlId, vm);
                    tpl = amGeneralTpl;
                    editUrl = '/AssetManagement/Administration/CostCenter/Edit/|ID|';
                    break;
                case 'Location':
                    app.gridUtils.configureGenericGrid(controlId, vm);
                    tpl = amGeneralTpl;
                    editUrl = '/AssetManagement/Administration/Location/Edit/|ID|';
                    break;
                case 'NoticeEvent':
                    app.gridUtils.configureGenericGrid(controlId, vm);
                    tpl = amGeneralTpl;
                    editUrl = '/AssetManagement/Administration/NoticeEvent/Edit/|ID|';
                    break;
                case 'Organization':
                    app.gridUtils.configureGenericGrid(controlId, vm);
                    tpl = amGeneralTpl;
                    editUrl = '/AssetManagement/Administration/Organization/Edit/|ID|';
                    break;
                case 'Standard':
                    app.gridUtils.configureGenericGrid(controlId, vm);
                    tpl = amGeneralTpl;
                    editUrl = '/AssetManagement/Administration/Standard/Edit/|ID|';
                    break;
                case 'Subnet':
                    app.gridUtils.configureGenericGrid(controlId, vm);
                    tpl = amGeneralTpl;
                    editUrl = '/AssetManagement/Administration/Subnet/Edit/|ID|';
                    break;
                case 'Vendor':
                    app.gridUtils.configureGenericGrid(controlId, vm);
                    tpl = amGeneralTpl;
                    editUrl = '/AssetManagement/Administration/Vendor/Edit/|ID|';
                    break;
                case 'License':
                    app.gridUtils.configureGenericGrid(controlId, vm);
                    tpl = amGeneralTpl;
                    editUrl = '/AssetManagement/Administration/License/Edit/|ID|';
                    break;
                case 'PurchaseOrder':
                    app.gridUtils.configureGenericGrid(controlId, vm);
                    tpl = amGeneralTpl;
                    editUrl = '/AssetManagement/Administration/PurchaseOrder/Edit/|ID|';
                    break;
                case 'Purchase':
                    app.gridUtils.configureGenericGrid(controlId, vm);
                    tpl = amGeneralTpl;
                    editUrl = '/AssetManagement/Administration/Purchase/Edit/|ID|';
                    break;
                case 'Invoice':
                    app.gridUtils.configureGenericGrid(controlId, vm);
                    tpl = amGeneralTpl;
                    editUrl = '/AssetManagement/Administration/Invoice/Edit/|ID|';
                    break;
                default:
                    app.gridUtils.configureGenericGrid(controlId, vm);
                    break;
            }


            vm.dataSource.serverPaging = true;
            vm.dataSource.pageSize = 10;
            vm.dataSource.page = 1;
            vm.dataSource.total = 0;
            vm.dataSource.serverFiltering = true;

            var model = {
                viewModel: {
                    controlId: controlId,
                    GridType: vm.grid.GridType,
                    templateName: vm.grid.GridType,
                    source: new kendo.data.DataSource(vm.dataSource),
                    toolbar: vm.toolbar,
                    tasks: vm.tasks,
                    editUrl: editUrl
                }
            };

            //Fix for BUG 19524
            //set a dynamic mobile template for promoted views 
            if (vm.grid.dataUrl === "/grid/GetPromotedView/") {
                var initTemplate =
                    '<div data-bind="templateResources:\'resources\'" style="display: none">' +
                        '<div data-template-name="gridCardTemplate" class="gridcard gridcard--workitem"> \n';

                var columns = _.filter(vm.grid.columns,
                    function(el) {
                        return el.field.toLowerCase() !== "icon";
                    });

                editUrl = (editUrl.length > 0) ? editUrl.replace("|ID|", "#:BaseId#")
                    : "/Search/RedirectToWorkItem?searchText=#:Id#";

                if (columns.length > 0) {

                    for (var index = 0; index < columns.length; index++) {
                        var item = columns[index];
                        if (index === 0) {
                            initTemplate += '<p class="gridcard__title"> \n';
                            initTemplate += '<a href="' + editUrl + '">' + item.template + '</a> \n </p> \n';
                            initTemplate += '<div class="gridcard__detailblock"> \n';
                        } else {
                            initTemplate += '<p>' + item.template + '</p> \n';
                        }
                    };
                }
                initTemplate += '</div></div></div> \n';

                initTemplate += '<div>' +
                    '<div class="mobilegrid__header">' +
                    '</div>' +
                    '<div data-bind="mobileWIGrid: viewModel" data-template-name="gridCardList" class="mobilegrid"></div>' +
                    '<div class="mobilegrid__pager"></div>' +
                    '</div>';

                tpl = initTemplate;
            }

            var view = new kendo.View(tpl, { wrap: false, model: model });
            callback(view.render());
        }
    }
    return definition;
});