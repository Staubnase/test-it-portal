var Subnet = new function () {
    var ipAddress;
    var subNetMask;
    this.Init = function (vm) {
        ipAddress = $("input[name='IPMask']");
        subNetMask = $("input[name='SubnetMask']");
    }
    this.checkIP = function () {
        var singleIp = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)-(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        var formGroup = ipAddress.parents(".form-group");
        if (singleIp.test(ipAddress.val())) {
            ipAddress.next().hide();
            formGroup.find(".subnetError").hide();
            return true;
        }
        else {
            ipAddress.parents(".form-group").addClass("has-error");
            _.delay(function () {
                ipAddress.next().html(localization.InvalidIPAddress);
                ipAddress.next().show();
            },50);
            return false;
        }
    }
    this.checkSubnet = function () {
        var formGroup = subNetMask.parents(".form-group");
        var ipformat = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        if (subNetMask.val().match(ipformat)) {
            subNetMask.next().hide();
            formGroup.find(".subnetError").hide();
            return true;
        }
        else {
            formGroup.addClass("has-error");
            var subnetError = formGroup.find(".subnetError");
            if (subnetError[0] == null) {
                var errorMsg = subNetMask.next().clone();
                errorMsg.addClass("subnetError").html(localization.InvalidSubnetMask).show();
                formGroup.append(errorMsg);
            } else {
                subnetError.html(localization.InvalidSubnetMask).show();
            }
            return false;
        }
    }
}
