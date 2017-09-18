import { EventEmitter } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Subscription } from "rxjs/Subscription";
import "rxjs/add/operator/map";
import "rxjs/add/operator/catch";

import { CompleterBaseData } from "./completer-base-data";
import { CompleterItem } from "../components/completer-item";

export class RemoteData extends CompleterBaseData {
    public dataSourceChange: EventEmitter<void> = new EventEmitter<void>();

    private _remoteUrl: string;
    private remoteSearch: Subscription;
    private _urlFormater: ((term: string) => string) | null = null;
    private _dataField: string | null = null;
    private _requestOptions: any;


    constructor(private http: HttpClient ) {
        super();
    }

    public remoteUrl(remoteUrl: string) {
        this._remoteUrl = remoteUrl;
        this.dataSourceChange.emit();

        return this;
    }

    public urlFormater(urlFormater: (term: string) => string) {
        this._urlFormater = urlFormater;
    }

    public dataField(dataField: string) {
        this._dataField = dataField;
    }

    public requestOptions(requestOptions: any) {
        this._requestOptions = requestOptions;
    }

    public search(term: string): void {
        this.cancel();
        // let params = {};
        let url = "";
        if (this._urlFormater) {
            url = this._urlFormater(term);
        } else {
            url = this._remoteUrl + encodeURIComponent(term);
        }

        this.remoteSearch = this.http.get(url, Object.assign({}, this._requestOptions))
            .map((data: any) => {
                let matches = this.extractValue(data, this._dataField);
                return this.extractMatches(matches, term);
            })
            .catch(() => [])
            .subscribe((matches: any[]) => {
                let results = this.processResults(matches);
                this.next(results);
            });
    }

    public cancel() {
        if (this.remoteSearch) {
            this.remoteSearch.unsubscribe();
        }
    }

    public convertToItem(data: any): CompleterItem | null {
        return super.convertToItem(data);
    }
}
