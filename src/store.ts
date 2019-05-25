import * as ko from 'knockout';
import * as storage from 'store2';
import { createStore, createEvent } from 'effector';
import { IState, defaultPages, IPage } from './state';

// App Store

const db = storage.session.namespace('io-celin-e1p-base-route');

export const Actions = {
    PageAdd: createEvent<IPage>(),
    PageDelete: createEvent<IPage>(),
    PageUpdate: createEvent<IPage>(),
    PageSave: createEvent<IPage>()
};

export const PageStore = createStore<IState>(
    {
        pages$: ko.observableArray(db.size() > 0
                ? Object.values<IPage>(db.getAll())
                    .sort((a, b) => b.sequence - a.sequence)
                : defaultPages)
    })
    .on(Actions.PageAdd, (state: IState, page: IPage) => {
        page.sequence = state.pages$().length;
        state.pages$.unshift(page);
        db.set(page.id, page);
    })
    .on(Actions.PageDelete, (state: IState, page: IPage) => {
        const index = state.pages$.indexOf(page);
        state.pages$.splice(index, 1);
        db.remove(page.id);
    })
    .on(Actions.PageUpdate, (state: IState, page: IPage) => {
        const index = state.pages$.indexOf(page);
        state.pages$.splice(index, 1);
        state.pages$.splice(index, 0, page);
        db.set(page.id, page);
    })
    .on(Actions.PageSave, (_: IState, page: IPage) => {
        console.log('Save: ', page);
        db.set(page.id, page);
    });
