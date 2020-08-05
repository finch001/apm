import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CrudController } from '../common/crud/crud.controller';
import { SettingService } from './setting.service';
import { SettingEntity } from './setting.entity';

@ApiTags('setting')
@Controller('setting')
export class SettingController extends CrudController<SettingEntity> {
    constructor(protected service: SettingService) {
        super();
    }

    @Get()
    async setting() {
        return {
            website: {
                autoLogErrors: 1,
                autoStartRecording: 1,
                sensitiveInputFields: 0,
                autoLogNetworkRequests: 'failed',
                autoLogConsoleLog: 1,
                autoLogConsoleError: 1,
                autoLogConsoleWarn: 1,
                autoLogConsoleInfo: 1,
                autoLogConsoleDebug: 1,
                maxLogMessageLength: 1000,
                storeStaticResources: 1,
                origin: null,
                isToolkitEnabled: 1,
                captureMetadataOnly: 1,
                isControlTakeoverEnabled: 1,
                maxNodesCount: null,
                liveSessionsEnabled: 1,
                inactivityThreshold: 1800000,
                sensitiveElementsSelector: '',
                shouldRecordPage: true,
            },
            session: {
                maxSessionInactivityMinutes: 1,
                isActive: true,
                hasEvents: true,
                sensitiveInputFields: false,
                sessionId: '5eddfe31d0308854dcd1f267',
            },
            mappings: {
                lastActive: 'la',
                logs: 'lg',
                network_request: 'nr',
                console_debug: 'cd',
                console_error: 'ce',
                console_warn: 'cw',
                console_log: 'cl',
                full_screen_leave: 'fsl',
                full_screen_enter: 'fse',
                adopted_style_sheet_change: 'assc',
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
            },
        };
    }
}
