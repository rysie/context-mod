import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    JoinColumn,
    OneToMany,
    VersionColumn,
    ManyToOne,
    PrimaryColumn,
    CreateDateColumn, UpdateDateColumn, BeforeUpdate
} from "typeorm";
import {RuleResultEntity} from "./RuleResultEntity";
import {Rule} from "./Rule";
import {ObjectPremise} from "../interfaces";
import objectHash from "object-hash";
import {TimeAwareBaseEntity} from "./Base/TimeAwareBaseEntity";
import dayjs, {Dayjs} from "dayjs";

export interface RulePremiseOptions {
    rule: Rule
    config: ObjectPremise
}

@Entity()
export class RulePremise extends TimeAwareBaseEntity  {

    @ManyToOne(() => Rule, undefined,{cascade: ['insert'], eager: true})
    @JoinColumn({name: 'ruleId'})
    rule!: Rule;

    @PrimaryColumn()
    ruleId!: string;

    @PrimaryColumn("varchar", {length: 300})
    configHash!: string;

    @Column("simple-json")
    config!: ObjectPremise

    @OneToMany(type => RuleResultEntity, obj => obj.premise) // note: we will create author property in the Photo class below
    ruleResults!: RuleResultEntity[]

    @VersionColumn()
    version!: number;

    @Column({ type: 'datetime', nullable: false, readonly: true })
    updatedAt: Dayjs = dayjs();

    convertToDomain() {
        if(this.createdAt !== undefined) {
            this.createdAt = dayjs(this.createdAt);
        }
        if(this.updatedAt !== undefined) {
            this.updatedAt = dayjs(this.createdAt);
        }
    }

    public convertToDatabase() {
        if(dayjs.isDayjs(this.createdAt)) {
            // @ts-ignore
            this.createdAt = this.createdAt.toDate();
        }
        if(dayjs.isDayjs(this.updatedAt)) {
            // @ts-ignore
            this.updatedAt = this.updatedAt.toDate();
        }
    }

    @BeforeUpdate()
    public updateTimestamp() {
        // @ts-ignore
        this.updatedAt = dayjs().toDate();
    }

    constructor(data?: RulePremiseOptions) {
        super();
        if(data !== undefined) {
            this.rule = data.rule;
            this.config = data.config;
            this.configHash = objectHash.sha1(data.config);
        }
    }
}
