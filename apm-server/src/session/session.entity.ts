import { BaseEntity, Entity, Column, ObjectID, ObjectIdColumn } from 'typeorm';

import {
    IsArray,
    IsEmail,
    IsString,
    MinLength,
    Validate,
    IsEmpty,
} from 'class-validator';

@Entity('apm_sessions')
export class SessionEntity extends BaseEntity {
    @ObjectIdColumn() id: ObjectID;

    @Column({ comment: 'jssdk' }) accessToken: string;
    @Column({ nullable: false }) websiteId: string;

    // 设备
    @Column({ comment: '浏览器名称' }) browserName: string;
    @Column({ comment: '浏览器版本' }) browserVersion: string;
    @Column({ comment: '系统' }) os: string;
    @Column({ comment: '生产商' }) manufacturer: string;

    @Column({ comment: '文档类型' }) docType: string;
    @Column({ comment: '引擎' }) layoutName: string;
    @Column({ comment: '访问链接' }) origin: string;
    @Column({ comment: '访问页面' }) pageUrl: string;
    @Column({ comment: '产品' }) product: string;
    @Column({ comment: '来源' }) referrer: string;
    @Column({ comment: '宽度' }) screenWidth: number;
    @Column({ comment: '高度' }) screenHeight: number;

    //
    @Column({ comment: '时间戳' }) timestamp: number;
    @Column() left: number;
    @Column() top: number;

    @Column() sensitiveInputFields: boolean;
    @Column() version: string;
    @Column() visibilityState: string;
    @Column() hostname: string;

    @Column({ comment: '开始时间' }) start: number;
    @Column({ comment: '结束时间' }) lastActive: number;

    // 地理位置
    @Column({ comment: '国家' }) country: string;
    @Column({ comment: '城市' }) city: string;
    @Column() ip: string;

    @Column() clientStartMilliseconds: number;
    @Column() hasInaccessibleResources: string;
    @Column() isLive: boolean = false;
    @Column() isWatched: boolean = true;
    @Column({ comment: '时长' }) length: number;

    @Column({ comment: '用户自定义变量' }) userIdentity: Object;

    // 关联表
    // @Column({ comment: '设备' }) device: Object;
    // @Column({ comment: '地理位置' }) location: Object;
}
