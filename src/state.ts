import * as ko from 'knockout';

// App State

export const testing = false;

export interface IPage {
    id: string;
    component: string;
    title: string;
    data: any;
    busy: boolean;
    sequence: number;
}

export interface IState {
    pages$: ko.ObservableArray<IPage>;
}

export const defaultPages: IPage[] = [
    {
        id: 'object-browser',
        component: 'e1p-object-browser',
        title: 'Object Browser',
        busy: false,
        sequence: 0,
        data: []
    }
];
