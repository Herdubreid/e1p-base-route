// Chart of Account Component
import './style.scss';
import * as ko from 'knockout';
import 'datatables.net-select-bs4';
import { IPage } from '../../state';
import { Actions } from '../../store';
import { Navigation } from '../nav';

const component = 'e1p-object-browser';

let vm: ViewModel;

class ViewModel {
    page: IPage;
    f9860: DataTables.Api;
    busy$ = ko.observable(false);
    obnm$ = ko.observable<string>('').extend({ rateLimit: { method: 'notifyWhenChangesStop', timeout: 600 } });
    md$ = ko.observable<string>('').extend({ rateLimit: { method: 'notifyWhenChangesStop', timeout: 600 } });
    searchLen$ = ko.pureComputed(() => vm.obnm$().length + vm.md$().length);
    descendantsComplete = () => {
        this.searchLen$
            .subscribe(l => {
                if (l > 2) {
                    vm.busy$(true);
                    const condition = [
                        {
                            value: [
                                {
                                    content: 'TBLE',
                                    specialValueId: 'LITERAL'
                                },
                                {
                                    content: 'BSVW',
                                    specialValueId: 'LITERAL'
                                },
                                {
                                    content: 'APPL',
                                    specialValueId: 'LITERAL'
                                }
                            ],
                            controlId: 'F9860.FUNO',
                            operator: 'LIST'
                        }
                    ];
                    if (vm.obnm$().length > 0) condition
                        .push(
                            {
                                value: [
                                    {
                                        content: vm.obnm$().toUpperCase(),
                                        specialValueId: 'LITERAL'
                                    }
                                ],
                                controlId: 'F9860.OBNM',
                                operator: 'STR_START_WITH'
                            });
                    if (vm.md$().length > 0) condition
                        .push({
                            value: [
                                {
                                    content: vm.md$(),
                                    specialValueId: 'LITERAL'
                                }
                            ],
                            controlId: 'F9860.MD',
                            operator: 'STR_CONTAIN'
                        });
                    const rq = {
                        outputType: 'GRID_DATA',
                        dataServiceType: 'BROWSE',
                        targetName: 'F9860',
                        targetType: 'table',
                        findOnEntry: 'TRUE',
                        returnControlIDs: 'OBNM|FUNO|MD',
                        maxPageSize: '100',
                        aliasNaming: false,
                        query: {
                            condition,
                            matchType: 'MATCH_ALL'
                        }
                    };
                    callAISService(rq, DATA_SERVICE, response => {
                        this.page.data = response.fs_DATABROWSE_F9860.data.gridData.rowset;
                        this.f9860
                            .clear()
                            .rows.add(this.page.data)
                            .draw();
                        Actions.PageSave(vm.page);
                        vm.busy$(false);
                    });
                }
            });
    }
    constructor(params: { page: IPage }) {
        this.page = params.page;
        vm = this;
        // Table
        this.f9860 = $('#f9860')
            .DataTable({
                dom: 't',
                scrollY: 'calc(100vh - 200px)',
                paging: false,
                select: {
                    style: 'single'
                },
                data: this.page.data,
                columns: [
                    {
                        width: '20%',
                        title: 'Object',
                        data: 'F9860_OBNM'
                    },
                    {
                        title: 'Description',
                        data: 'F9860_MD'
                    },
                    {
                        width: '10%',
                        title: 'Type',
                        data: 'F9860_FUNO'
                    }
                ]
            })
            .on('user-select', (_1, _2, _3, cell) => {
                const row = cell.row(cell.index().row).data();
                const type = row.F9860_FUNO;
                const page = {
                    id: row.F9860_OBNM,
                    component: `e1p-demo-${type === 'APPL' ? 'fm' : 'ds'}`,
                    title: row.F9860_MD,
                    busy: false,
                    data: {
                        type
                    },
                    sequence: 0
                };
                Actions.PageAdd(page);
                Navigation.goto(page);
            });
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
