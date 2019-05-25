// Data Service Component
import './style.scss';
import * as ko from 'knockout';
import { IPage } from '../../state';
import { Actions } from '../../store';

const component = 'e1p-demo-ds';

let vm: ViewModel;

class ViewModel {
    page: IPage;
    descendantsComplete = () => {
    }
    constructor(params: { page: IPage }) {
        vm = this;
        this.page = params.page;
        if (!params.page.data.demo) {
            const rq = {
                formServiceDemo: 'TRUE',
                dataServiceType: 'BROWSE',
                targetName: this.page.id,
                targetType: this.page.data.type === 'TBLE' ? 'table' : 'view'

            };
            console.log('Demo Ds: ', rq);
            callAISService(rq, DATA_SERVICE, response => {
                const columns = response[`fs_DATABROWSE_${this.page.id}`].data.gridData.columns;
                console.log('Demo: ', response);
                this.page.data.ds = Object.values<string>(columns)
                    .map(field => {
                        return {
                            field,
                            title: columns[field].title
                        }
                    });
                Actions.PageSave(this.page);
            });
        }
    }
}

ko.components.register(component, {
    viewModel: {
        createViewModel: (params, componentInfo) => {
            const vm = new ViewModel(params);
            const sub = (ko as any).bindingEvent
                .subscribe(componentInfo.element, 'descendantsComplete', vm.descendantsComplete);
            (vm as any).dispose = () => sub.dispose();
            return vm;
        }
    },
    template: require('./template.html')
});
