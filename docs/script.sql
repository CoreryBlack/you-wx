create table audit_logs
(
    audit_id      bigint auto_increment
        primary key,
    actor_type    varchar(32)                        not null,
    actor_id      varchar(36)                        null,
    action        varchar(128)                       not null,
    resource_type varchar(64)                        null,
    resource_id   varchar(64)                        null,
    details       json                               null,
    create_time   datetime default CURRENT_TIMESTAMP not null
);

create index idx_audit_actor
    on audit_logs (actor_type, actor_id);

create index idx_audit_time
    on audit_logs (create_time);

create table pending_tx
(
    pending_id   varchar(36)                        not null
        primary key,
    client_tx_id varchar(64)                        null,
    terminal_id  varchar(64)                        null,
    card_no      varchar(64)                        null,
    payload      json                               not null,
    status       tinyint  default 0                 not null comment '0=local 1=uploading 2=uploaded 3=failed',
    attempts     int      default 0                 not null,
    last_attempt datetime                           null,
    create_time  datetime default CURRENT_TIMESTAMP not null
);

create index idx_pending_card
    on pending_tx (card_no);

create index idx_pending_terminal
    on pending_tx (terminal_id);

create table station
(
    station_id  varchar(36)                        not null
        primary key,
    name        varchar(100)                       null,
    address     varchar(255)                       null,
    status      tinyint  default 1                 not null,
    create_time datetime default CURRENT_TIMESTAMP not null
);

create table merchant_terminal
(
    terminal_id        varchar(64)                        not null
        primary key,
    station_id         varchar(36)                        null,
    model              varchar(50)                        null,
    device_secret_hash varchar(255)                       null,
    last_seen          datetime                           null,
    status             tinyint  default 1                 not null,
    create_time        datetime default CURRENT_TIMESTAMP not null,
    constraint fk_term_station
        foreign key (station_id) references station (station_id)
            on delete set null
);

create index idx_term_station
    on merchant_terminal (station_id);

create table pos_order
(
    order_id     varchar(36)                        not null
        primary key,
    client_tx_id varchar(64)                        null,
    amount_cents bigint                             not null,
    oil_gun      varchar(20)                        null,
    station_id   varchar(36)                        null,
    terminal_id  varchar(64)                        null,
    status       tinyint  default 0                 not null comment '0=待支付 1=成功 2=失败',
    pay_time     datetime                           null,
    create_time  datetime default CURRENT_TIMESTAMP not null,
    constraint fk_pos_station
        foreign key (station_id) references station (station_id)
            on delete set null
);

create index idx_pos_station_time
    on pos_order (station_id, create_time);

create table reconciliation_log
(
    id                 bigint auto_increment
        primary key,
    date               date                               not null,
    station_id         varchar(36)                        null,
    terminal_id        varchar(64)                        null,
    total_amount_cents bigint   default 0                 not null,
    total_count        int      default 0                 not null,
    status             tinyint  default 1                 not null comment '1=成功 2=差异',
    detail             json                               null comment '结构化差异明细或引用外部文件信息',
    raw_file_path      varchar(1024)                      null,
    create_time        datetime default CURRENT_TIMESTAMP not null,
    constraint fk_recon_station
        foreign key (station_id) references station (station_id)
            on delete set null
);

create index idx_recon_station_date
    on reconciliation_log (station_id, date);

create table staff
(
    staff_id           varchar(36)                        not null
        primary key,
    username           varchar(50)                        not null,
    password_hash      varchar(255)                       not null,
    name               varchar(50)                        null,
    role               tinyint                            not null comment '1=收银员 2=站长 3=管理员',
    station_id         varchar(36)                        null,
    status             tinyint  default 1                 not null comment '1=正常 2=停用',
    failed_login_count int      default 0                 not null,
    locked_until       datetime                           null,
    last_login_at      datetime                           null,
    create_time        datetime default CURRENT_TIMESTAMP not null,
    update_time        datetime default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP,
    constraint username
        unique (username),
    constraint fk_staff_station
        foreign key (station_id) references station (station_id)
            on delete set null
);

create index idx_staff_station
    on staff (station_id);

create table user
(
    user_id     varchar(36)                        not null
        primary key,
    phone       varchar(20)                        null,
    nickname    varchar(50)                        null,
    status      tinyint  default 1                 not null comment '1=正常 2=冻结',
    create_time datetime default CURRENT_TIMESTAMP not null,
    update_time datetime default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP,
    constraint phone
        unique (phone)
);

create table fuel_card
(
    card_no       varchar(64)                        not null
        primary key,
    user_id       varchar(36)                        not null,
    balance_cents bigint   default 0                 not null comment '以分为单位',
    status        tinyint  default 1                 not null comment '1=正常 2=冻结',
    create_time   datetime default CURRENT_TIMESTAMP not null,
    update_time   datetime default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP,
    constraint fk_fuelcard_user
        foreign key (user_id) references user (user_id)
            on delete cascade
);

create table card_token_map
(
    token       varchar(128)                       not null
        primary key,
    card_no     varchar(64)                        not null,
    expire_time datetime                           not null,
    used        tinyint  default 0                 not null,
    used_by     varchar(36)                        null,
    used_at     datetime                           null,
    create_time datetime default CURRENT_TIMESTAMP not null,
    constraint fk_cardtoken_card
        foreign key (card_no) references fuel_card (card_no)
            on delete cascade
);

create index idx_token_card
    on card_token_map (card_no);

create index idx_token_expire
    on card_token_map (expire_time);

create index idx_fuelcard_user
    on fuel_card (user_id);

create table fuel_card_txn
(
    txn_id         varchar(36)                        not null
        primary key,
    client_tx_id   varchar(64)                        null comment '幂等 id，设备生成，建议 UUID',
    card_no        varchar(64)                        not null,
    user_id        varchar(36)                        null,
    order_id       varchar(36)                        null,
    amount_cents   bigint                             not null comment '消费为正（扣款），充值为负或用 type 标识',
    type           tinyint                            not null comment '1=扣款 2=充值 3=退款 4=冲正',
    status         tinyint  default 1                 not null comment '1=成功 2=失败 3=pending',
    terminal_id    varchar(64)                        null,
    operator_id    varchar(36)                        null,
    balance_before bigint                             null,
    balance_after  bigint                             null,
    remark         varchar(255)                       null,
    create_time    datetime default CURRENT_TIMESTAMP not null,
    constraint ux_txn_client_card
        unique (client_tx_id, card_no),
    constraint fk_txn_card
        foreign key (card_no) references fuel_card (card_no)
            on delete cascade,
    constraint fk_txn_user
        foreign key (user_id) references user (user_id)
            on delete set null
);

create index idx_txn_card
    on fuel_card_txn (card_no);

create index idx_txn_order
    on fuel_card_txn (order_id);

create index idx_txn_terminal
    on fuel_card_txn (terminal_id);

create index idx_txn_user
    on fuel_card_txn (user_id);

create table points_account
(
    user_id     varchar(36)                        not null
        primary key,
    points      int      default 0                 not null,
    update_time datetime default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP,
    constraint fk_points_user
        foreign key (user_id) references user (user_id)
            on delete cascade
);

create table points_txn
(
    points_txn_id varchar(36)                        not null
        primary key,
    user_id       varchar(36)                        not null,
    order_id      varchar(36)                        null,
    points        int                                not null,
    type          tinyint                            not null comment '1=发放 2=扣减',
    expire_time   datetime                           null,
    balance_after int                                null,
    create_time   datetime default CURRENT_TIMESTAMP not null,
    constraint fk_pointstxn_user
        foreign key (user_id) references user (user_id)
            on delete cascade
);

create index idx_points_user
    on points_txn (user_id);


