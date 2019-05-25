// Page Two Component
import './style.scss';
import * as ko from 'knockout';
import 'bootstrap';
import { IPage } from '../../state';
import { Actions } from '../../store';

const component = 'e1p-demo-fm';

let vm: ViewModel;

class ViewModel {
    page: IPage;
    fms$ = ko.observableArray<any>([]);
    toggle(d) {
        $(`#${d.fm}`).collapse('toggle');
        $(`#button-${d.fm}`).toggleClass('fa-rotate-180');
    }
    descendantsComplete = () => {
    }
    constructor(params: { page: IPage }) {
        vm = this;
        this.page = params.page;
        if (this.page.data.fms) {
            this.fms$(this.page.data.fms);
        } else {
            const fl = {
                outputType: 'GRID_DATA',
                dataServiceType: 'BROWSE',
                targetName: 'F9865',
                targetType: 'table',
                findOnEntry: 'TRUE',
                returnControlIDs: 'FMNM',
                query: {
                    condition: [
                        {
                            value: [
                                {
                                    content: this.page.id,
                                    specialValueId: 'LITERAL'
                                }
                            ],
                            controlId: 'F9865.OBNM',
                            operator: 'EQUAL'
                        }
                    ],
                    matchType: 'MATCH_ALL'
                }
            };
            callAISService(fl, DATA_SERVICE, dsResp => {
                const fms = {
                    formServiceDemo: 'TRUE',
                    formRequests: dsResp.fs_DATABROWSE_F9865.data.gridData.rowset
                        .map(r => {
                            return {
                                formName: `${this.page.id}_${r.F9865_FMNM}`
                            }
                        })
                };
                callAISService(fms, BATCH_FORM_SERVICE, fmResp => {
                    console.log('Demo: ', fmResp);
                    this.page.data.fms = Object.keys(fmResp)
                        .map((key, i) => {
                            const fm = fmResp[key];
                            console.log(key, fm);
                            const ff = Object.keys(fm.data)
                                .filter(field => field !== 'gridData')
                                .map(field => {
                                    return {
                                        field,
                                        title: fm.data[field].title
                                    };
                                });
                            const gf = fm.data.gridData
                                ? Object.keys(fm.data.gridData.columns)
                                    .map(field => {
                                        return {
                                            field,
                                            title: fm.data.gridData.columns[field]
                                        }
                                    })
                                : [];
                            return {
                                fm: i > 9 ? key.slice(6) : key.slice(5), 
                                title: fm.title,
                                ff,
                                gf
                            }
                        });
                    this.fms$(this.page.data.fms);
                    Actions.PageSave(this.page);
                });
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
