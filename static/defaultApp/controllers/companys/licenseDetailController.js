(function () {

    var injectParams = ['$scope', '$location', '$routeParams',
                        '$timeout', 'config', 'modalService','ngDialog','dataService','toaster','displayModel','MyCache'];

    var licenseDetailController = function ($scope, $location, $routeParams,
                                           $timeout, config,modalService,ngDialog ,dataService,toaster,displayModel,MyCache) {
        var vm = this,
    	date = $routeParams.date;
    	companyId = ($routeParams.companyId) ? parseInt($routeParams.companyId) : 0;
        vm.busy=false;
        vm.isLoad=false;
        vm.keyword='';
        vm.licenses = [];
        vm.type = '';

        vm.getLicenses = function () {

            if(vm.busy)return;
            vm.busy=true;

            dataService.getLicenses(vm.type,date,companyId,vm.licenses.length,vm.keyword)
            .then(function (data) {
                for (var i = 0; i < data.length; i++) {
                    vm.licenses.push(data[i]);
                }
                displayModel.title = vm.licenses[0].company_name;
                vm.isLoad=true;
                vm.isLoad=true;
                $timeout(function () {
                    vm.busy=false;
                }, 1000);
            }, function (error) {
            	toaster.pop('error', "处理失败", "很遗憾处理失败，由于网络原因无法连接到服务器！");
            });
        };


        //取消预约单
        vm.updateLicense = function ($index,state) {
            if (state=='confirm'||state=='active'||state=='cancel'){
                return '';
            }
            var detail=vm.licenses[$index];

        	$scope.modalOptions = {
                closeButtonText: '取消',
                actionButtonText: '确认激活',
                headerText: detail.company_name,
                headerTextmin: detail.version,
                bodyText: detail.mac,
                bodyTextmin: '',
            };

            ngDialog.openConfirm({
                template:'/born_manager/static/defaultApp/partials/modaldemo.html',
                className: 'ngdialog',
                scope:$scope //将scope传给test.html,以便显示地址详细信息
            }).then(function (result) {
                if (result === 'ok') {
                	dataService.updateLicense(detail.id)
                    .then(function (data) {
                        toaster.pop('success', "审核该设备处理成功！");
                        vm.licenses[$index].state='confirm';
                        vm.licenses[$index].state_display='已激活';
                    }, function (error) {
                    	toaster.pop('warning', "处理失败", "很遗憾处理失败，由于网络原因无法连接到服务器！");
                    });
                }
            });
        };


        vm.back = function(){
            window.location.href = 'bornhr://back';
        }

        //初始化
        function init() {
            displayModel.showHeader='1';
            displayModel.displayBack='1';
            displayModel.displaySave='0';
            displayModel.displaySearch='0';
            displayModel.displayCancel='0';
            displayModel.displayCreate='0';
            displayModel.displaySubmit='0';
            displayModel.displayConfirm='0';
            displayModel.displayBottom = '0';
            displayModel.headerBack=vm.back;
//            displayModel.born_search = vm.born_searsh;
            vm.type = MyCache.get('license_type');
        }

        init();
    };

    licenseDetailController.$inject = injectParams;
    angular.module('managerApp').controller('LicenseDetailController', licenseDetailController);

}());