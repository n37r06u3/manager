(function () {

    var injectParams = ['$scope', '$location', '$routeParams',
                        '$timeout', 'config', 'modalService','dataService','toaster','displayModel'];

    var licenseController = function ($scope, $location, $routeParams,
                                           $timeout, config,modalService, dataService,toaster,displayModel) {
        var vm = this,
    	companyId = ($routeParams.companyId) ? parseInt($routeParams.companyId) : 0;
        vm.busy=false;
        vm.isLoad=false;

        vm.licenses={
                display:'day',
                accounts:[],
                current_date:'',
                current_week:'',
                current_year:'',
                current_month:'',
                display_current:'',
                date_from:'',
                date_to:'',
                total_amount:0,
                cnt:0,
            };

        vm.setPage= function (direction) {
        	getLicenses(direction);
        };

        vm.setDisplay= function (display) {
            vm.licenses.display=display;
            getLicenses(0);

        };
        
        
        function getLicenses(direction) {

            if(vm.busy)return;
            vm.busy=true;

            dataService.getLicensesPages(companyId,vm.licenses.display,0,
                    vm.licenses.current_date, vm.licenses.current_week, vm.licenses.current_year, vm.licenses.current_month,
                    direction,vm.licenses.date_from,vm.licenses.date_to)
            .then(function (data) {
            	vm.licenses = data;
                vm.isLoad=true;
                $timeout(function () {
                    vm.busy=false;
                }, 1000);
            }, function (error) {
            	toaster.pop('error', "处理失败", "很遗憾处理失败，由于网络原因无法连接到服务器！");
            });
        };


        //取消预约单
        vm.updateLicense = function ($index) {

            var detail=vm.licenses.account[$index];

        	var modalOptions = {
                closeButtonText: '取消',
                actionButtonText: '确认',
                headerText: '系统提示',
                bodyText: '您确认要审核该设备吗?'
            };

            modalService.showModal({}, modalOptions).then(function (result) {
                if (result === 'ok') {
                	dataService.updateLicense(detail.id)
                    .then(function (data) {
                        toaster.pop('success', "审核该设备处理成功！");
                        vm.licenses.account[$index].state='confirm';
                        vm.licenses.account[$index].state_display='已激活';
                    }, function (error) {
                    	toaster.pop('warning', "处理失败", "很遗憾处理失败，由于网络原因无法连接到服务器！");
                    });
                }
            });
        };


        //初始化
        function init() {
            displayModel.displayModel='none';
            getLicenses(0);
        }

        init();
    };

    licenseController.$inject = injectParams;
    angular.module('managerApp').controller('LicenseController', licenseController);
    
}());