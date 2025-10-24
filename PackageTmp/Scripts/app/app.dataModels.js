var app = (!app) ? {} : app;

app.dataModels = {
	AppliesToWorkItem: {
		fileRemoved: function (fileName) {
			actionType = {
				Id: "308f9416-c672-200f-adb2-8e8cb10e2c33",
				Name: "Attached File Deleted"
			}
			this.ActionType = actionType;
			//this.ClassName = "System.WorkItem.TroubleTicket.ActionLog";
			//this.ClassTypeId = "dbb6a632-0a7e-cef8-1fc9-405d5cd4d911";
			// file name
			this.Description = fileName;
			this.EnteredBy = session.user.Name;
		    this.EnteredDate = new Date().toISOString();
		    this.LastModified = new Date().toISOString();
			this.Title = localization.AttachedFileDeleted;
			this.Image = app.config.iconPath + app.config.icons[actionType.Name];
		},
		fileAdded: function (fileName) {
			actionType = {
				Id: "aa88cefa-1c40-c1d2-8d64-162f5cb25f2b",
				Name: "Attached File"
			}
			this.ActionType = actionType;
			//this.ClassName = "System.WorkItem.TroubleTicket.ActionLog";
			//this.ClassTypeId = "dbb6a632-0a7e-cef8-1fc9-405d5cd4d911";
			// file name
			this.Description = fileName;
			this.EnteredBy = session.user.Name;
			this.EnteredDate = new Date().toISOString();
			this.LastModified = new Date().toISOString();
			this.Title = localization.AttachedFile;
			this.Image = app.config.iconPath + app.config.icons[actionType.Name];
		},
		recordAssigned: function (assignTo) {
		    actionType = {
		        Id: "b04370d9-3d4f-3981-61bb-ac9462a1fe65",
		        Name: "Record Assigned"
		    }
		    this.ActionType = actionType;
		    this.Description = localization.RecordAssignedDescription.replace("{0}", session.user.Name).replace("{1}", assignTo);
		    this.EnteredBy = session.user.Name;
		    this.EnteredDate = new Date().toISOString();
		    this.LastModified = new Date().toISOString();
		    this.Title = localization.RecordAssigned;
		    this.Image = app.config.iconPath + app.config.icons[actionType.Name];
		}
	},
	AppliesToTroubleTicket: {
		fileRemoved: function (fileName) {
			actionType = {
				Id: "308f9416-c672-200f-adb2-8e8cb10e2c33",
				Name: "Attached File Deleted"
			}
			this.ActionType = actionType;
			//this.ClassName = "System.WorkItem.TroubleTicket.ActionLog";
			//this.ClassTypeId = "dbb6a632-0a7e-cef8-1fc9-405d5cd4d911";
			// file name
			this.Description = fileName;
			this.EnteredBy = session.user.Name;
			this.EnteredDate = new Date().toISOString();
			this.LastModified = new Date().toISOString();
			this.Title = localization.AttachedFileDeleted;
			this.Image = app.config.iconPath + app.config.icons[actionType.Name];
		},
		fileAdded: function (fileName) {
			actionType = {
				Id: "aa88cefa-1c40-c1d2-8d64-162f5cb25f2b",
				Name: "Attached File"
			}
			this.ActionType = actionType;
			//this.ClassName = "System.WorkItem.TroubleTicket.ActionLog";
			//this.ClassTypeId = "dbb6a632-0a7e-cef8-1fc9-405d5cd4d911";
			// file name
			this.Description = fileName;
			this.EnteredBy = session.user.Name;
			this.EnteredDate = new Date().toISOString();
			this.LastModified = new Date().toISOString();
			this.Title = localization.AttachedFile;
			this.Image = app.config.iconPath + app.config.icons[actionType.Name];
		},
		recordActivated: function () {
		    actionType = {
		        Id: "c3b2471e-4662-f394-7d0a-4d54743a8232",
		        Name: "Record Activated"
		    }
		    this.ActionType = actionType;
		    //this.ClassName = "System.WorkItem.TroubleTicket.ActionLog";
		    //this.ClassTypeId = "dbb6a632-0a7e-cef8-1fc9-405d5cd4d911";
		    // file name
		    this.EnteredBy = session.user.Name;
		    this.Description = '';
		    this.EnteredDate = new Date().toISOString();
		    this.LastModified = new Date().toISOString();
		    this.Title = localization.RecordActivated;
		    this.Image = app.config.iconPath + app.config.icons[actionType.Name];
		},
		recordResolved: function (resolutionDescription) {
		    actionType = {
		        Id: "5ca2cfee-6740-1576-540B-ce17222840b8",
		        Name: "Record Resolved"
		    }
		    this.ActionType = actionType;
		    //this.ClassName = "System.WorkItem.TroubleTicket.ActionLog";
		    //this.ClassTypeId = "dbb6a632-0a7e-cef8-1fc9-405d5cd4d911";
		    // file name
		    this.Description = resolutionDescription;
		    this.EnteredBy = session.user.Name;
		    this.EnteredDate = new Date().toISOString();
		    this.LastModified = new Date().toISOString();
		    this.Title = localization.RecordResolved;
		    this.Image = app.config.iconPath + app.config.icons[actionType.Name];
		},
		recordAssigned: function (assignTo) {
		    actionType = {
		        Id: "b04370d9-3d4f-3981-61bb-ac9462a1fe65",
		        Name: "Record Assigned"
		    }
		    this.ActionType = actionType;
		    this.Description = localization.RecordAssignedDescription.replace("{0}", session.user.Name).replace("{1}", assignTo);
		    this.EnteredBy = session.user.Name;
		    this.EnteredDate = new Date().toISOString();
		    this.LastModified = new Date().toISOString();
		    this.Title = localization.RecordAssigned;
		    this.Image = app.config.iconPath + app.config.icons[actionType.Name];
		},
		recordClosed: function () {
		    actionType = {
		        Id: "6d051b98-bf5d-d63c-595c-daf7ef9919c6",
		        Name: "Record Closed"
		    }
		    this.ActionType = actionType;
		    this.EnteredBy = session.user.Name;
		    this.Description = '';
		    this.EnteredDate = new Date().toISOString();
		    this.LastModified = new Date().toISOString();
		    this.Title = localization.RecordClosed;
		    this.Image = app.config.iconPath + app.config.icons[actionType.Id];
		},
	}
}