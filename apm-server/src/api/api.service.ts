import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CrudService } from '../common/crud/crud.service';
import { ApiEntity } from './api.entity';
import { API_TOKEN } from './api.constants';

@Injectable()
export class ApiService extends CrudService<ApiEntity> {
    constructor(
        @Inject(API_TOKEN) protected readonly repository: Repository<ApiEntity>,
    ) {
        super();
    }

    findMappings() {
        return {
            lastActive: 'la',
            logs: 'lg',
            css_rule_delete: 'crd',
            css_rule_insert: 'cri',
            url_change: 'uc',
            visibility_change: 'vc',
            checkbox_change: 'cbc',
            radio_button_change: 'rbc',
            scroll_position_change: 'spc',
            dom_snapshot: 'ds',
            window_resize: 'wr',
            mouse_out: 'mou',
            mouse_over: 'mov',
            mouse_click: 'mc',
            mouse_move: 'mm',
            dom_mutation: 'dm',
            dom_element_value_change: 'evc',
        };
    }

    convertMappings(mappings) {
        let sessions = [];
        let lastActive;

        for (let mapping in mappings) {
            switch (mapping) {
                case 'dm':
                    sessions.push(
                        ...this.proccessMappings(
                            mappings[mapping],
                            'dom_mutation',
                        ),
                    );
                    break;
                case 'mc':
                    sessions.push(
                        ...this.proccessMappings(
                            mappings[mapping],
                            'mouse_click',
                        ),
                    );
                    break;
                case 'uc':
                    sessions.push(
                        ...this.proccessMappings(
                            mappings[mapping],
                            'url_change',
                        ),
                    );
                    break;
                case 'mov':
                    sessions.push(
                        ...this.proccessMappings(
                            mappings[mapping],
                            'mouse_over',
                        ),
                    );
                    break;
                case 'mm':
                    sessions.push(
                        ...this.proccessMappings(
                            mappings[mapping],
                            'mouse_move',
                        ),
                    );
                    break;
                case 'mou':
                    sessions.push(
                        ...this.proccessMappings(
                            mappings[mapping],
                            'mouse_out',
                        ),
                    );
                    break;

                case 'crd':
                    sessions.push(
                        ...this.proccessMappings(
                            mappings[mapping],
                            'css_rule_delete',
                        ),
                    );
                    break;
                case 'cri':
                    sessions.push(
                        ...this.proccessMappings(
                            mappings[mapping],
                            'css_rule_insert',
                        ),
                    );
                    break;
                case 'vc':
                    sessions.push(
                        ...this.proccessMappings(
                            mappings[mapping],
                            'visibility_change',
                        ),
                    );
                    break;
                case 'cbc':
                    sessions.push(
                        ...this.proccessMappings(
                            mappings[mapping],
                            'checkbox_change',
                        ),
                    );
                    break;
                case 'rbc':
                    sessions.push(
                        ...this.proccessMappings(
                            mappings[mapping],
                            'radio_button_change',
                        ),
                    );
                    break;
                case 'spc':
                    sessions.push(
                        ...this.proccessMappings(
                            mappings[mapping],
                            'scroll_position_change',
                        ),
                    );
                    break;
                case 'ds':
                    sessions.push(
                        ...this.proccessMappings(
                            mappings[mapping],
                            'dom_snapshot',
                        ),
                    );
                    break;
                case 'wr':
                    sessions.push(
                        ...this.proccessMappings(
                            mappings[mapping],
                            'window_resize',
                        ),
                    );
                    break;

                case 'evc':
                    sessions.push(
                        ...this.proccessMappings(
                            mappings[mapping],
                            'dom_element_value_change',
                        ),
                    );
                    break;
                case 'la':
                    lastActive = mappings[mapping];
                    break;
            }
        }

        return {
            lastActive,
            sessions,
        };
    }

    private proccessMappings(mappings, type) {
        return mappings.map(value => {
            return {
                ...value,
                data: value.data,
                type: type,
            };
        });
    }
}
