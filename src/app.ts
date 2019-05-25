import './css/style.scss';
import * as ko from 'knockout';
import Numeral from 'numeral';
import { IPage } from './state';
import { PageStore } from './store';
import './components';

/**
 * App
 */

export class App {
    pages$: ko.ObservableArray<IPage>;
    constructor() {
        this.pages$ = PageStore.getState().pages$;
    }
}

export const app = new App();

ko.applyBindings(app);

Numeral.nullFormat('');

ko.bindingHandlers.amount = {
    update: (element, valueAccessor) => {
        const value = Numeral(valueAccessor());
        ko.bindingHandlers.text.update(element, () => value.format());
    }
};
