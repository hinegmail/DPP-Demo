-- ========================================================
-- 数据库初始化全量脚本: DPP_Full_System (22张表)
-- 包含: 
-- 1. 系统权限域 (RBAC: 6张表)
-- 2. 审计溯源域 (Audit Log: 1张表) - 快照结构已精简
-- 3. 核心业务域 (10张表，带 Base Object、数据分级与数据来源标注，及全量显式物理索引)
-- 4. 后生产预留域 [MVP-DEFERRED] (5张表)
-- ========================================================

CREATE DATABASE IF NOT EXISTS dpp_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE dpp_system;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ========================================================
-- 第一部分：系统权限域 (System & RBAC)
-- ========================================================

-- 1. 企业租户表
DROP TABLE IF EXISTS sys_enterprise;
CREATE TABLE sys_enterprise (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '物理主键',
    enterprise_code VARCHAR(100) NOT NULL UNIQUE      COMMENT '统一社会信用代码',
    enterprise_name VARCHAR(255) NOT NULL              COMMENT '企业全称',
    enterprise_type ENUM('PLATFORM','BRAND','TIER1_GARMENT','TIER2_FABRIC','TIER3_DYEING','TIER4_YARN','TIER5_FIBER','AUDITOR') NOT NULL COMMENT '企业类型',
    contact_person  VARCHAR(100)                       COMMENT '主要联系人',
    contact_phone   VARCHAR(50)                        COMMENT '联系人电话',
    is_verified     BOOLEAN DEFAULT FALSE              COMMENT '资质认证状态',
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
    is_deleted      BOOLEAN DEFAULT FALSE              COMMENT '逻辑删除标志'
) COMMENT '企业租户表';

-- 2. 系统用户表
DROP TABLE IF EXISTS sys_user;
CREATE TABLE sys_user (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '物理主键',
    tenant_id       BIGINT NOT NULL                   COMMENT '所属企业(租户)ID',
    username        VARCHAR(100) NOT NULL UNIQUE      COMMENT '登录账号',
    password_hash   VARCHAR(255) NOT NULL             COMMENT '加密密码(BCrypt/Argon2)',
    real_name       VARCHAR(100)                      COMMENT '真实姓名',
    last_login_time TIMESTAMP NULL                    COMMENT '最后登录时间',
    status          INT DEFAULT 1                     COMMENT '账号状态: 1正常 0禁用 2冻结',
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
    is_deleted      BOOLEAN DEFAULT FALSE             COMMENT '逻辑删除标志',
    FOREIGN KEY (tenant_id) REFERENCES sys_enterprise(id),
    INDEX idx_tenant_id (tenant_id)
) COMMENT '系统用户表';

-- 3. 系统角色表
DROP TABLE IF EXISTS sys_role;
CREATE TABLE sys_role (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '物理主键',
    tenant_id       BIGINT NOT NULL                   COMMENT '所属租户ID(0为系统预置)',
    role_name       VARCHAR(100) NOT NULL             COMMENT '角色名称',
    role_code       VARCHAR(100) NOT NULL             COMMENT '角色编码',
    description     VARCHAR(255)                      COMMENT '角色功能描述',
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
    is_deleted      BOOLEAN DEFAULT FALSE             COMMENT '逻辑删除标志',
    INDEX idx_tenant_id (tenant_id)
) COMMENT '系统角色表';

-- 4. 权限菜单表
DROP TABLE IF EXISTS sys_permission;
CREATE TABLE sys_permission (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '物理主键',
    parent_id       BIGINT DEFAULT 0                  COMMENT '父级菜单ID',
    perm_name       VARCHAR(100) NOT NULL             COMMENT '资源名称',
    perm_type       INT                               COMMENT '权限类型: 1目录 2菜单 3按钮',
    route_path      VARCHAR(255)                      COMMENT '前端路由地址',
    perm_code       VARCHAR(100)                      COMMENT '后端鉴权行为标识',
    icon            VARCHAR(100)                      COMMENT '菜单图标',
    sort_order      INT DEFAULT 0                     COMMENT '排序优先级',
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
    is_deleted      BOOLEAN DEFAULT FALSE             COMMENT '逻辑删除标志',
    INDEX idx_parent_id (parent_id)
) COMMENT '权限菜单表';

-- 5. 用户角色中间表
DROP TABLE IF EXISTS sys_user_role;
CREATE TABLE sys_user_role (
    id       BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '物理主键',
    user_id  BIGINT NOT NULL                   COMMENT '用户ID',
    role_id  BIGINT NOT NULL                   COMMENT '角色ID',
    FOREIGN KEY (user_id) REFERENCES sys_user(id),
    FOREIGN KEY (role_id) REFERENCES sys_role(id),
    INDEX idx_user_id (user_id),
    INDEX idx_role_id (role_id)
) COMMENT '用户角色中间表';

-- 6. 角色权限中间表
DROP TABLE IF EXISTS sys_role_permission;
CREATE TABLE sys_role_permission (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '物理主键',
    role_id       BIGINT NOT NULL                   COMMENT '角色ID',
    permission_id BIGINT NOT NULL                   COMMENT '权限ID',
    FOREIGN KEY (role_id) REFERENCES sys_role(id),
    FOREIGN KEY (permission_id) REFERENCES sys_permission(id),
    INDEX idx_role_id (role_id),
    INDEX idx_permission_id (permission_id)
) COMMENT '角色权限中间表';


-- ========================================================
-- 第二部分：审计溯源域 (Audit & Blockchain)
-- 听从 DBA 建议：移除 raw_content 和 new_content，瘦身防止数据爆炸
-- ========================================================

-- 7. 审计溯源操作日志表
DROP TABLE IF EXISTS sys_audit_log;
CREATE TABLE sys_audit_log (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '物理主键',
    tenant_id       BIGINT NOT NULL                   COMMENT '当前操作租户ID',
    user_id         BIGINT NOT NULL                   COMMENT '当前操作人ID',
    operation_type  VARCHAR(100)                      COMMENT '动作类型(SUBMIT_NODE/BLOCK_SYNC等)',
    target_table    VARCHAR(100)                      COMMENT '受影响的物理表名',
    target_id       BIGINT                            COMMENT '受影响的业务记录主键',
    data_hash       VARCHAR(255)                      COMMENT '数据完整性指纹(SHA-256)',
    blockchain_tx   VARCHAR(255)                      COMMENT '区块链交易哈希(TxID)',
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '记录生成时间(禁止后置修改)',
    FOREIGN KEY (tenant_id) REFERENCES sys_enterprise(id),
    FOREIGN KEY (user_id) REFERENCES sys_user(id),
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_user_id (user_id),
    INDEX idx_target (target_table, target_id)
) COMMENT '审计溯源操作日志表';


-- ========================================================
-- 第三部分：核心业务域 (10张表，带 Base Object、数据分级、数据来源与显式外键索引)
-- ========================================================

-- 8. Product_Master (产品静态档案表)
DROP TABLE IF EXISTS product_master;
CREATE TABLE product_master (
    id                     BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '物理主键',
    tenant_id              BIGINT NOT NULL              COMMENT '归属租户(品牌商)',
    product_id             VARCHAR(100) NOT NULL UNIQUE COMMENT '产品唯一标识(款号)',
    sku                    VARCHAR(100) NOT NULL        COMMENT '产品SKU编码',
    product_name           VARCHAR(255)                 COMMENT '产品名称',
    brand_name             VARCHAR(255)                 COMMENT '品牌名称',
    material_composition   JSON                         COMMENT '材料组成 [{fiber,pct}]',
    packaging              VARCHAR(255)                 COMMENT '产品包装',
    gb18401_category       VARCHAR(10)                  COMMENT 'GB 18401 安全技术类别(A/B/C)',
    care_label_symbols     JSON                         COMMENT 'GB/T 8685 洗护符号',
    data_classification    VARCHAR(20) DEFAULT 'PUBLIC' COMMENT '数据分级: PUBLIC, RESTRICTED, CONFIDENTIAL',
    source_type            VARCHAR(20) DEFAULT 'ENTERPRISE' COMMENT '数据来源: ENTERPRISE(企业填报), CERTIFICATE(证书兜底), MODEL_EST(模型估算)',
    created_by             BIGINT NOT NULL              COMMENT '录入人ID',
    updated_by             BIGINT                       COMMENT '最后修改人ID',
    created_at             TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at             TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
    is_deleted             BOOLEAN DEFAULT FALSE        COMMENT '逻辑删除标志',
    FOREIGN KEY (tenant_id) REFERENCES sys_enterprise(id),
    FOREIGN KEY (created_by) REFERENCES sys_user(id),
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_created_by (created_by)
) COMMENT '产品静态档案表';

-- 9. Garment_Batch_Node (成衣节点表 / Tier 1)
DROP TABLE IF EXISTS garment_batch_node;
CREATE TABLE garment_batch_node (
    id                      BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '物理主键',
    tenant_id               BIGINT NOT NULL              COMMENT '填报企业/产权归属',
    garment_batch_id        VARCHAR(100) NOT NULL UNIQUE COMMENT '成衣批次号/GTIN',
    product_master_id       BIGINT NOT NULL              COMMENT '关联产品档案ID',
    manufacturer_name       VARCHAR(255)                 COMMENT '制造商名称',
    manufacturing_date      DATE                         COMMENT '生产日期',
    renewable_energy_ratio  FLOAT                        COMMENT '绿电占比(%)',
    data_classification    VARCHAR(20) DEFAULT 'PUBLIC' COMMENT '数据分级: PUBLIC, RESTRICTED, CONFIDENTIAL',
    source_type            VARCHAR(20) DEFAULT 'ENTERPRISE' COMMENT '数据来源: ENTERPRISE(企业填报), CERTIFICATE(证书兜底), MODEL_EST(模型估算)',
    created_by              BIGINT NOT NULL              COMMENT '录入人ID',
    updated_by              BIGINT                       COMMENT '最后修改人ID',
    created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
    is_deleted              BOOLEAN DEFAULT FALSE        COMMENT '逻辑删除标志',
    FOREIGN KEY (tenant_id) REFERENCES sys_enterprise(id),
    FOREIGN KEY (product_master_id) REFERENCES product_master(id),
    FOREIGN KEY (created_by) REFERENCES sys_user(id),
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_product_master (product_master_id),
    INDEX idx_created_by (created_by)
) COMMENT '成衣节点表(Tier 1)';

-- 10. Fabric_Batch_Node (面料织造节点表 / Tier 2)
DROP TABLE IF EXISTS fabric_batch_node;
CREATE TABLE fabric_batch_node (
    id                      BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '物理主键',
    tenant_id               BIGINT NOT NULL              COMMENT '填报企业ID',
    fabric_batch_id         VARCHAR(100) NOT NULL UNIQUE COMMENT '面料批次号',
    garment_batch_node_id   BIGINT NOT NULL              COMMENT '关联成衣批次ID',
    fabric_supplier         VARCHAR(255)                 COMMENT '面料企业名称',
    fiber_percentage        JSON                         COMMENT '纤维比例明细 [{fiber,pct}]',
    renewable_energy_ratio  FLOAT                        COMMENT '绿电占比(%)',
    data_classification    VARCHAR(20) DEFAULT 'PUBLIC' COMMENT '数据分级: PUBLIC, RESTRICTED, CONFIDENTIAL',
    source_type            VARCHAR(20) DEFAULT 'ENTERPRISE' COMMENT '数据来源: ENTERPRISE(企业填报), CERTIFICATE(证书兜底), MODEL_EST(模型估算)',
    created_by              BIGINT NOT NULL              COMMENT '录入人ID',
    updated_by              BIGINT                       COMMENT '最后修改人ID',
    created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
    is_deleted              BOOLEAN DEFAULT FALSE        COMMENT '逻辑删除标志',
    FOREIGN KEY (tenant_id) REFERENCES sys_enterprise(id),
    FOREIGN KEY (garment_batch_node_id) REFERENCES garment_batch_node(id),
    FOREIGN KEY (created_by) REFERENCES sys_user(id),
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_garment_batch (garment_batch_node_id),
    INDEX idx_created_by (created_by)
) COMMENT '面料织造节点表(Tier 2)';

-- 11. Dyeing_Batch_Node (印染节点表 / Tier 3)
DROP TABLE IF EXISTS dyeing_batch_node;
CREATE TABLE dyeing_batch_node (
    id                      BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '物理主键',
    tenant_id               BIGINT NOT NULL              COMMENT '填报企业ID',
    dyeing_batch_id         VARCHAR(100) NOT NULL UNIQUE COMMENT '染色批次号',
    fabric_batch_node_id    BIGINT NOT NULL              COMMENT '关联面料批次ID',
    dyeing_factory          VARCHAR(255)                 COMMENT '印染厂名称',
    chemical_list           JSON                         COMMENT '使用化学品清单 [{name,cas_no,usage_kg}]',
    reach_compliance        BOOLEAN                      COMMENT '是否符合REACH',
    zdhc_compliance         BOOLEAN                      COMMENT 'ZDHC合规声明',
    renewable_energy_ratio  FLOAT                        COMMENT '绿电占比(%)',
    data_classification    VARCHAR(20) DEFAULT 'PUBLIC' COMMENT '数据分级: PUBLIC, RESTRICTED, CONFIDENTIAL',
    source_type            VARCHAR(20) DEFAULT 'ENTERPRISE' COMMENT '数据来源: ENTERPRISE(企业填报), CERTIFICATE(证书兜底), MODEL_EST(模型估算)',
    created_by              BIGINT NOT NULL              COMMENT '录入人ID',
    updated_by              BIGINT                       COMMENT '最后修改人ID',
    created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
    is_deleted              BOOLEAN DEFAULT FALSE        COMMENT '逻辑删除标志',
    FOREIGN KEY (tenant_id) REFERENCES sys_enterprise(id),
    FOREIGN KEY (fabric_batch_node_id) REFERENCES fabric_batch_node(id),
    FOREIGN KEY (created_by) REFERENCES sys_user(id),
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_fabric_batch (fabric_batch_node_id),
    INDEX idx_created_by (created_by)
) COMMENT '印染节点表(Tier 3)';

-- 12. Yarn_Batch_Node (纺纱节点表 / Tier 4)
DROP TABLE IF EXISTS yarn_batch_node;
CREATE TABLE yarn_batch_node (
    id                      BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '物理主键',
    tenant_id               BIGINT NOT NULL              COMMENT '填报企业ID',
    yarn_batch_id           VARCHAR(100) NOT NULL UNIQUE COMMENT '纱线批次号',
    fabric_batch_node_id    BIGINT NOT NULL              COMMENT '关联面料批次ID',
    yarn_supplier           VARCHAR(255)                 COMMENT '纺纱企业名称',
    renewable_energy_ratio  FLOAT                        COMMENT '绿电占比(%)',
    data_classification    VARCHAR(20) DEFAULT 'PUBLIC' COMMENT '数据分级: PUBLIC, RESTRICTED, CONFIDENTIAL',
    source_type            VARCHAR(20) DEFAULT 'ENTERPRISE' COMMENT '数据来源: ENTERPRISE(企业填报), CERTIFICATE(证书兜底), MODEL_EST(模型估算)',
    created_by              BIGINT NOT NULL              COMMENT '录入人ID',
    updated_by              BIGINT                       COMMENT '最后修改人ID',
    created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
    is_deleted              BOOLEAN DEFAULT FALSE        COMMENT '逻辑删除标志',
    FOREIGN KEY (tenant_id) REFERENCES sys_enterprise(id),
    FOREIGN KEY (fabric_batch_node_id) REFERENCES fabric_batch_node(id),
    FOREIGN KEY (created_by) REFERENCES sys_user(id),
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_fabric_batch (fabric_batch_node_id),
    INDEX idx_created_by (created_by)
) COMMENT '纺纱节点表(Tier 4)';

-- 13. Fiber_Batch_Node (原材料供应节点表 / Tier 5)
DROP TABLE IF EXISTS fiber_batch_node;
CREATE TABLE fiber_batch_node (
    id                 BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '物理主键',
    tenant_id          BIGINT NOT NULL              COMMENT '填报企业ID',
    fiber_batch_id     VARCHAR(100) NOT NULL UNIQUE COMMENT '原料批次号',
    yarn_batch_node_id BIGINT NOT NULL              COMMENT '关联纱线批次ID',
    fiber_supplier     VARCHAR(255)                 COMMENT '原料供应商名称',
    data_classification  VARCHAR(20) DEFAULT 'PUBLIC' COMMENT '数据分级: PUBLIC, RESTRICTED, CONFIDENTIAL',
    source_type          VARCHAR(20) DEFAULT 'ENTERPRISE' COMMENT '数据来源: ENTERPRISE(企业填报), CERTIFICATE(证书兜底), MODEL_EST(模型估算)',
    created_by         BIGINT NOT NULL              COMMENT '录入人ID',
    updated_by         BIGINT                       COMMENT '最后修改人ID',
    created_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
    is_deleted         BOOLEAN DEFAULT FALSE        COMMENT '逻辑删除标志',
    FOREIGN KEY (tenant_id) REFERENCES sys_enterprise(id),
    FOREIGN KEY (yarn_batch_node_id) REFERENCES yarn_batch_node(id),
    FOREIGN KEY (created_by) REFERENCES sys_user(id),
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_yarn_batch (yarn_batch_node_id),
    INDEX idx_created_by (created_by)
) COMMENT '原材料供应节点表(Tier 5)';

-- 14. Accessories_Batch_Node (辅料节点表)
DROP TABLE IF EXISTS accessories_batch_node;
CREATE TABLE accessories_batch_node (
    id                    BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '物理主键',
    tenant_id             BIGINT NOT NULL              COMMENT '填报企业ID',
    accessory_batch_id    VARCHAR(100) NOT NULL UNIQUE COMMENT '辅料批次号',
    garment_batch_node_id BIGINT NOT NULL              COMMENT '关联成衣批次ID',
    accessory_supplier    VARCHAR(255)                 COMMENT '辅料供应商名称',
    data_classification   VARCHAR(20) DEFAULT 'PUBLIC' COMMENT '数据分级: PUBLIC, RESTRICTED, CONFIDENTIAL',
    source_type           VARCHAR(20) DEFAULT 'ENTERPRISE' COMMENT '数据来源: ENTERPRISE(企业填报), CERTIFICATE(证书兜底), MODEL_EST(模型估算)',
    created_by            BIGINT NOT NULL              COMMENT '录入人ID',
    updated_by            BIGINT                       COMMENT '最后修改人ID',
    created_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
    is_deleted            BOOLEAN DEFAULT FALSE        COMMENT '逻辑删除标志',
    FOREIGN KEY (tenant_id) REFERENCES sys_enterprise(id),
    FOREIGN KEY (garment_batch_node_id) REFERENCES garment_batch_node(id),
    FOREIGN KEY (created_by) REFERENCES sys_user(id),
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_garment_batch (garment_batch_node_id),
    INDEX idx_created_by (created_by)
) COMMENT '辅料节点表';

-- 15. Logistics_Node (运输节点表)
DROP TABLE IF EXISTS logistics_node;
CREATE TABLE logistics_node (
    id                    BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '物理主键',
    tenant_id             BIGINT NOT NULL              COMMENT '填报企业ID',
    shipment_id           VARCHAR(100) NOT NULL UNIQUE COMMENT '运输单号',
    garment_batch_node_id BIGINT NOT NULL              COMMENT '关联成衣批次ID',
    carrier               VARCHAR(255)                 COMMENT '承运商名称',
    data_classification   VARCHAR(20) DEFAULT 'PUBLIC' COMMENT '数据分级: PUBLIC, RESTRICTED, CONFIDENTIAL',
    source_type           VARCHAR(20) DEFAULT 'ENTERPRISE' COMMENT '数据来源: ENTERPRISE(企业填报), CERTIFICATE(证书兜底), MODEL_EST(模型估算)',
    created_by            BIGINT NOT NULL              COMMENT '录入人ID',
    updated_by            BIGINT                       COMMENT '最后修改人ID',
    created_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
    is_deleted            BOOLEAN DEFAULT FALSE        COMMENT '逻辑删除标志',
    FOREIGN KEY (tenant_id) REFERENCES sys_enterprise(id),
    FOREIGN KEY (garment_batch_node_id) REFERENCES garment_batch_node(id),
    FOREIGN KEY (created_by) REFERENCES sys_user(id),
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_garment_batch (garment_batch_node_id),
    INDEX idx_created_by (created_by)
) COMMENT '运输节点表';

-- 16. DPP_Instance (数字护照实例主表)
DROP TABLE IF EXISTS dpp_instance;
CREATE TABLE dpp_instance (
    id                    BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '物理主键',
    tenant_id             BIGINT NOT NULL              COMMENT '发放护照的品牌商ID',
    dpp_id                VARCHAR(100) NOT NULL UNIQUE COMMENT '数字护照ID/SGTIN',
    product_master_id     BIGINT NOT NULL              COMMENT '关联产品档案ID',
    garment_batch_node_id BIGINT NOT NULL              COMMENT '关联成品批次ID',
    digital_link          VARCHAR(500)                 COMMENT 'GS1数字链接URL',
    blockchain_record     VARCHAR(255)                 COMMENT '区块链存证记录ID',
    data_classification   VARCHAR(20) DEFAULT 'PUBLIC' COMMENT '数据分级: PUBLIC, RESTRICTED, CONFIDENTIAL',
    source_type           VARCHAR(20) DEFAULT 'ENTERPRISE' COMMENT '数据来源: ENTERPRISE(企业填报), CERTIFICATE(证书兜底), MODEL_EST(模型估算)',
    created_by            BIGINT NOT NULL              COMMENT '录入人ID',
    updated_by            BIGINT                       COMMENT '最后修改人ID',
    created_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
    is_deleted            BOOLEAN DEFAULT FALSE        COMMENT '逻辑删除标志',
    FOREIGN KEY (tenant_id) REFERENCES sys_enterprise(id),
    FOREIGN KEY (product_master_id) REFERENCES product_master(id),
    FOREIGN KEY (garment_batch_node_id) REFERENCES garment_batch_node(id),
    FOREIGN KEY (created_by) REFERENCES sys_user(id),
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_product_master (product_master_id),
    INDEX idx_garment_batch (garment_batch_node_id),
    INDEX idx_created_by (created_by)
) COMMENT '数字护照实例主表';

-- 17. Compliance_Cert_Asset (合规凭证表)
DROP TABLE IF EXISTS compliance_cert_asset;
CREATE TABLE compliance_cert_asset (
    id               BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '物理主键',
    tenant_id        BIGINT NOT NULL              COMMENT '上传证明的企业ID',
    cert_id          VARCHAR(100) NOT NULL UNIQUE COMMENT '证书逻辑业务号',
    dpp_instance_id  BIGINT NOT NULL              COMMENT '关联护照实例ID',
    cert_type        VARCHAR(100)                 COMMENT '认证类型(OEKO-TEX/GOTS/GRS/ISO)',
    audit_report     VARCHAR(500)                 COMMENT '第三方审核报告PDF(OSS地址)',
    blockchain_hash  VARCHAR(255)                 COMMENT '上链指纹(SHA-256)',
    data_classification VARCHAR(20) DEFAULT 'PUBLIC' COMMENT '数据分级: PUBLIC, RESTRICTED, CONFIDENTIAL',
    source_type         VARCHAR(20) DEFAULT 'ENTERPRISE' COMMENT '数据来源: ENTERPRISE(企业填报), CERTIFICATE(证书兜底), MODEL_EST(模型估算)',
    created_by       BIGINT NOT NULL              COMMENT '录入人ID',
    updated_by       BIGINT                       COMMENT '最后修改人ID',
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
    is_deleted       BOOLEAN DEFAULT FALSE        COMMENT '逻辑删除标志',
    FOREIGN KEY (tenant_id) REFERENCES sys_enterprise(id),
    FOREIGN KEY (dpp_instance_id) REFERENCES dpp_instance(id),
    FOREIGN KEY (created_by) REFERENCES sys_user(id),
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_dpp_instance (dpp_instance_id),
    INDEX idx_created_by (created_by)
) COMMENT '合规凭证表';


-- ========================================================
-- 第四部分：后生产阶段预留表 [MVP-DEFERRED]
-- 说明：物理表已创建，但后端 CRUD / 前端 / API 不在本次 MVP 实现
-- ========================================================

-- 18. Distribution_Node (分销/零售渠道记录表) [MVP-DEFERRED]
DROP TABLE IF EXISTS distribution_node;
CREATE TABLE distribution_node (
    id               BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '物理主键',
    tenant_id        BIGINT NOT NULL              COMMENT '所属企业ID',
    distribution_id  VARCHAR(100) NOT NULL UNIQUE COMMENT '分销流水号',
    dpp_instance_id  BIGINT NOT NULL              COMMENT '关联护照实例ID',
    channel_type     VARCHAR(100)                 COMMENT '渠道类型(直营/电商/批发/门店)',
    retailer_name    VARCHAR(255)                 COMMENT '零售商名称',
    ship_to_country  VARCHAR(10)                  COMMENT '目的地国家(ISO-3166)',
    sale_date        DATE                         COMMENT '出售日期',
    sale_price       DECIMAL(12,2)                COMMENT '售价(含税)',
    created_by       BIGINT NOT NULL              COMMENT '录入人ID',
    updated_by       BIGINT                       COMMENT '最后修改人ID',
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
    is_deleted       BOOLEAN DEFAULT FALSE        COMMENT '逻辑删除标志',
    FOREIGN KEY (tenant_id) REFERENCES sys_enterprise(id),
    FOREIGN KEY (dpp_instance_id) REFERENCES dpp_instance(id),
    FOREIGN KEY (created_by) REFERENCES sys_user(id),
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_dpp_instance (dpp_instance_id),
    INDEX idx_created_by (created_by)
) COMMENT '分销渠道记录表 [MVP-DEFERRED]';

-- 19. Usage_Record (消费者使用登记表) [MVP-DEFERRED]
DROP TABLE IF EXISTS usage_record;
CREATE TABLE usage_record (
    id                       BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '物理主键',
    tenant_id                BIGINT NOT NULL              COMMENT '所属企业ID',
    usage_record_id          VARCHAR(100) NOT NULL UNIQUE COMMENT '使用记录编号',
    dpp_instance_id          BIGINT NOT NULL              COMMENT '关联护照实例ID',
    owner_type               VARCHAR(50)                  COMMENT '持有者类型(原始买家/二手)',
    activation_date          DATE                         COMMENT '护照首次激活日期',
    wash_count               INT DEFAULT 0                COMMENT '累计洗涤次数',
    condition_grade          VARCHAR(10)                  COMMENT '品相等级(A/B/C/D)',
    ownership_transfer_count INT DEFAULT 0                COMMENT '转手次数',
    created_by               BIGINT NOT NULL              COMMENT '录入人ID',
    updated_by               BIGINT                       COMMENT '最后修改人ID',
    created_at               TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at               TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
    is_deleted               BOOLEAN DEFAULT FALSE        COMMENT '逻辑删除标志',
    FOREIGN KEY (tenant_id) REFERENCES sys_enterprise(id),
    FOREIGN KEY (dpp_instance_id) REFERENCES dpp_instance(id),
    FOREIGN KEY (created_by) REFERENCES sys_user(id),
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_dpp_instance (dpp_instance_id),
    INDEX idx_created_by (created_by)
) COMMENT '消费者使用登记表 [MVP-DEFERRED]';

-- 20. Repair_Work_Order (维修工单表) [MVP-DEFERRED]
DROP TABLE IF EXISTS repair_work_order;
CREATE TABLE repair_work_order (
    id                    BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '物理主键',
    tenant_id             BIGINT NOT NULL              COMMENT '所属企业ID',
    work_order_id         VARCHAR(100) NOT NULL UNIQUE COMMENT '工单编号',
    dpp_instance_id       BIGINT NOT NULL              COMMENT '关联护照实例ID',
    repair_type           VARCHAR(100)                 COMMENT '维修类型(裁缝/补色/更换拉链等)',
    repair_provider       VARCHAR(255)                 COMMENT '维修服务商名称',
    parts_replaced        JSON                         COMMENT '更换零件清单 [{part,material}]',
    repair_date           DATE                         COMMENT '维修完成日期',
    repair_cost           DECIMAL(12,2)                COMMENT '维修费用',
    life_extension_months INT                          COMMENT '预估延寿时间(月)',
    created_by            BIGINT NOT NULL              COMMENT '录入人ID',
    updated_by            BIGINT                       COMMENT '最后修改人ID',
    created_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
    is_deleted            BOOLEAN DEFAULT FALSE        COMMENT '逻辑删除标志',
    FOREIGN KEY (tenant_id) REFERENCES sys_enterprise(id),
    FOREIGN KEY (dpp_instance_id) REFERENCES dpp_instance(id),
    FOREIGN KEY (created_by) REFERENCES sys_user(id),
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_dpp_instance (dpp_instance_id),
    INDEX idx_created_by (created_by)
) COMMENT '维修工单表 [MVP-DEFERRED]';

-- 21. Recycling_Record (回收记录表) [MVP-DEFERRED]
DROP TABLE IF EXISTS recycling_record;
CREATE TABLE recycling_record (
    id                     BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '物理主键',
    tenant_id              BIGINT NOT NULL              COMMENT '所属企业ID',
    recycling_record_id    VARCHAR(100) NOT NULL UNIQUE COMMENT '回收记录编号',
    dpp_instance_id        BIGINT NOT NULL              COMMENT '关联护照实例ID',
    collection_channel     VARCHAR(100)                 COMMENT '回收渠道(门店回收/邮寄/捕获站)',
    disassembly_method     VARCHAR(100)                 COMMENT '拆解方式(手工/半自动/化学)',
    material_recovery_rate FLOAT                        COMMENT '材料回收率(%)',
    recycled_output_type   VARCHAR(100)                 COMMENT '再生产出物类型',
    recycling_date         DATE                         COMMENT '回收处理日期',
    carbon_saving          FLOAT                        COMMENT '碳减排贡献(kg CO2e)',
    created_by             BIGINT NOT NULL              COMMENT '录入人ID',
    updated_by             BIGINT                       COMMENT '最后修改人ID',
    created_at             TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at             TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
    is_deleted             BOOLEAN DEFAULT FALSE        COMMENT '逻辑删除标志',
    FOREIGN KEY (tenant_id) REFERENCES sys_enterprise(id),
    FOREIGN KEY (dpp_instance_id) REFERENCES dpp_instance(id),
    FOREIGN KEY (created_by) REFERENCES sys_user(id),
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_dpp_instance (dpp_instance_id),
    INDEX idx_created_by (created_by)
) COMMENT '回收记录表 [MVP-DEFERRED]';

-- 22. Sorting_Guide (收集分类指导表) [MVP-DEFERRED]
DROP TABLE IF EXISTS sorting_guide;
CREATE TABLE sorting_guide (
    id                BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '物理主键',
    tenant_id         BIGINT NOT NULL              COMMENT '所属企业ID',
    sorting_guide_id  VARCHAR(100) NOT NULL UNIQUE COMMENT '分类指导编号',
    product_master_id BIGINT NOT NULL              COMMENT '关联产品档案ID',
    bin_type          VARCHAR(100)                 COMMENT '回收箱类型(纺织回收箱/混合回收等)',
    instructions      JSON                         COMMENT '分类操作步骤',
    prohibited_actions JSON                        COMMENT '禁止事项',
    local_regulation  VARCHAR(255)                 COMMENT '当地回收法规参考',
    created_by        BIGINT NOT NULL              COMMENT '录入人ID',
    updated_by        BIGINT                       COMMENT '最后修改人ID',
    created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
    is_deleted        BOOLEAN DEFAULT FALSE        COMMENT '逻辑删除标志',
    FOREIGN KEY (tenant_id) REFERENCES sys_enterprise(id),
    FOREIGN KEY (product_master_id) REFERENCES product_master(id),
    FOREIGN KEY (created_by) REFERENCES sys_user(id),
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_product_master (product_master_id),
    INDEX idx_created_by (created_by)
) COMMENT '收集分类指导表 [MVP-DEFERRED]';

SET FOREIGN_KEY_CHECKS = 1;

-- ========================================================
-- 样例基础数据插入
-- ========================================================

-- 1. 插入企业
INSERT INTO sys_enterprise (id, enterprise_code, enterprise_name, enterprise_type, is_verified) VALUES 
(1, '91310000PLATFORM', 'DPP 监管管理平台 (运营方)', 'PLATFORM', TRUE),
(2, '91310000BRAND001', 'EcoMode 环保时尚服饰集团', 'BRAND', TRUE),
(3, '91310000TIER1001', '苏南精工成衣代工厂', 'TIER1_GARMENT', TRUE);

-- 2. 插入用户 (密码均为 '123456' 的伪哈希)
INSERT INTO sys_user (id, tenant_id, username, password_hash, real_name) VALUES 
(1, 1, 'admin', 'pbkdf2:sha256:hash_admin', '系统管理员'),
(2, 2, 'brand_user', 'pbkdf2:sha256:hash_brand', '品牌经理-小李'),
(3, 3, 'factory_user', 'pbkdf2:sha256:hash_factory', '成衣厂生产主管-张工');

-- 3. 插入业务样例：产品档案 (带分级与来源)
INSERT INTO product_master (id, tenant_id, product_id, sku, product_name, brand_name, material_composition, gb18401_category, care_label_symbols, data_classification, source_type, created_by) VALUES 
(1, 2, 'PRD-2026-TEE', 'TEE-WHT-ORG-M', '可持续有机纯棉经典丝巾', 'EcoMode', '[{"fiber":"棉","pct":100}]', 'B', '["wash_40","no_bleach","tumble_dry_low"]', 'PUBLIC', 'ENTERPRISE', 2);

-- 4. 插入业务样例：成衣批次
INSERT INTO garment_batch_node (id, tenant_id, garment_batch_id, product_master_id, manufacturer_name, manufacturing_date, data_classification, source_type, created_by) VALUES 
(1, 3, 'GTIN-6901002233', 1, '苏南精工成衣代工厂', '2026-03-15', 'RESTRICTED', 'ENTERPRISE', 3);

-- 5. 插入业务样例：单品护照
INSERT INTO dpp_instance (id, tenant_id, dpp_id, product_master_id, garment_batch_node_id, digital_link, blockchain_record, data_classification, source_type, created_by) VALUES 
(1, 2, 'urn:epc:id:sgtin:0614141.112345.401', 1, 1, 'https://dpp.com/api/06901002233/401', '0x7788aabbccdd', 'PUBLIC', 'ENTERPRISE', 2);

-- 6. 插入一条审计日志 (仅保留 hash 和 txId)
INSERT INTO sys_audit_log (tenant_id, user_id, operation_type, target_table, target_id, data_hash) VALUES 
(2, 2, 'PUBLISH_DPP', 'dpp_instance', 1, 'sha256_mock_hash_value');
