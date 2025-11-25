
// src/types/fund.ts (Mapped to types.ts for project structure)

/** 基金产品类型（对应fund_product表） */
export interface FundProduct {
    id: number;
    fundCode: string; // 对应数据库fund_code
    fundName: string; // fund_name
    fundType: 1 | 2 | 3 | 4 | 5; // 1=股票型，2=债券型...（对应fund_type）
    fundTypeLabel: string; // 前端显示用（如"股票型"）
    riskLevel: 1 | 2 | 3 | 4 | 5; // 风险等级
    riskLevelLabel: string; // 如"中高风险"
    issueDate: string; // 成立日期（ISO格式：YYYY-MM-DD）
    lockupPeriod: number; // 锁定期（天）
    navInitial: number; // 初始净值
    subscriptionFeeRate: number; // 申购费率（如0.015=1.5%）
    redemptionFeeRate: number; // 赎回费率
    managementFeeRate: number; // 年管理费
    status: 1 | 2 | 3 | 4; // 基金状态（1=募集期...）
    statusLabel: string; // 如"存续期"
    simulateSettlementDays: number; // 模拟赎回到账天数（T+N）
    extJson?: {
        manager?: string;
        strategy?: string;
        description?: string;
    }; // 扩展字段
    createTime: string;
    updateTime: string;
}

/** 基金净值类型（对应fund_nav表） */
export interface FundNav {
    id: number;
    fundId: number;
    navDate: string; // 净值日期（YYYY-MM-DD）
    nav: number; // 单位净值
    navAccumulated: number; // 累计净值
    dailyReturnRate?: number; // 当日收益率
    createTime: string;
}

/** 用户类型（对应user表） */
export interface User {
    id: number;
    username: string;
    realName: string;
    userType: 1 | 2; // 1=管理员，2=投资者
    virtualAccount: string; // 虚拟账户号
    accountBalance: number; // 虚拟账户余额
    unsettledCash?: number; // 前端扩展：在途资金
    status: 1 | 2 | 3; // 账户状态 1=Normal, 2=Frozen, 3=Cancelled
    riskLevel?: number; // 前端缓存用户风险等级
    riskLevelLabel?: string;
    permissions?: string[]; // 权限列表 (Admin only)
    extJson?: {
        isQualifiedInvestor?: boolean;
        phone?: string;
        riskScore?: number;
        roleName?: string; // 角色名称 e.g. "超级管理员"
    };
    createTime: string;
}

/** 用户持仓类型（对应user_position表） */
export interface UserPosition {
    id: number;
    userId: number;
    fundId: number;
    holdShares: number; // 持有份额
    averageCost: number; // 平均成本
    holdDays: number; // 持有天数
    latestNav: number; // 最新净值
    totalAsset: number; // 持仓总资产
    profitAmount: number; // 浮动盈亏
    profitRate: number; // 盈亏比例（如0.0285=2.85%）
    fundInfo: Pick<FundProduct, "fundCode" | "fundName" | "fundTypeLabel" | "simulateSettlementDays">; // 关联基金基本信息（前端显示用）
}

/** 交易记录类型（对应transaction_record表） */
export interface TransactionRecord {
    id: number;
    tradeNo: string; // 交易流水号
    userId: number;
    fundId: number;
    tradeType: 1 | 2 | 3 | 4; // 1=申购，2=赎回，3=充值，4=分红
    tradeTypeLabel: string; // 如"申购"
    tradeAmount: number; // 交易金额
    tradeShares?: number; // 交易份额
    navDate: string; // 净值日期
    nav: number; // 交易净值
    feeAmount: number; // 交易费用
    actualAmount: number; // 实际收付金额
    tradeStatus: 1 | 2 | 3 | 4 | 5 | 6; // 1=待确认, 2=已确认, 3=清算中, 4=已完成, 5=冷静期, 6=已驳回
    tradeStatusLabel: string; // 如"已完成"
    applyTime: string; // 申请时间
    confirmTime?: string; // 确认时间
    settleTime?: string; // 到账时间（赎回用）
    
    // 合规字段
    coolingOffDeadline?: string; // 冷静期截止时间 (ISO)
    contractSignTime?: string;   // 电子合同签署时间 (ISO)
    signature?: string;          // 电子签名 (用户姓名)
    
    remark?: string;
    fundInfo?: Pick<FundProduct, "fundCode" | "fundName">; // 关联基金信息
}

/** 分红记录类型（对应dividend_record表） */
export interface DividendRecord {
    id: number;
    dividendNo: string;
    fundId: number;
    fundName: string;
    dividendDate: string; // 权益登记日
    dividendType: 1 | 2; // 1=现金分红，2=红利再投资
    dividendTypeLabel: string;
    dividendPerShare: number; // 每份分红
    totalDividendAmount: number; // 本次分红总金额
    affectedUserCount: number; // 涉及用户数
    confirmTime: string;
}

/** 操作日志 (对应operation_log) */
export interface OperationLog {
    id: number;
    operatorId: number;
    operatorName: string;
    actionType: string; // e.g. 'UPDATE_NAV', 'AUDIT_TX'
    targetObject: string; // e.g. 'Fund: 1001'
    content: string; // Description
    ipAddress: string;
    createTime: string;
}

/** 回测任务 (对应simulation_task) */
export interface BacktestTask {
    id: number;
    userId: number;
    userName: string;
    strategyName: string;
    status: 'RUNNING' | 'COMPLETED' | 'FAILED';
    progress: number; // 0-100
    durationSeconds: number;
    startTime: string;
    resultSummary?: string;
}

/** 系统全局配置 (对应sys_config) */
export interface SysConfig {
    largeTxThreshold: number; // 大额交易阈值
    defaultSubFee: number; // 默认申购费
    defaultRedeemFee: number; // 默认赎回费
    platformName: string;
    enableAutoAudit: boolean; // 自动审核小额交易
    navUpdateFreq: 'daily' | 'weekly'; // 净值更新频率
    riskAlertThreshold: number; // 净值波动预警阈值 %
    features: {
        enableSIP: boolean; // 定投
        enableDividend: boolean; // 分红
    }
}

/** 聊天消息 */
export interface ChatMessage {
    id: string;
    sender: 'user' | 'agent';
    text: string;
    image?: string; // Base64 string for image
    timestamp: string;
}

/** 聊天会话 */
export interface ChatSession {
    sessionId: string;
    userId: number;
    userName: string;
    messages: ChatMessage[];
    unreadByUser: boolean; // 是否有客服回复未读
    unreadByAdmin: boolean; // 是否有用户消息未读
    lastActiveTime: string;
}

// --- Frontend Helper Types ---

/** 基金列表视图模型 (合并了产品信息和最新净值) */
export type FundViewModel = FundProduct & Partial<FundNav> & {
    // 兼容旧代码的辅助字段，逐步废弃
    maxDrawdown?: number;
    sharpeRatio?: number;
    yearToDate?: number;
};

export interface NewsItem {
    id: string;
    title: string;
    summary: string;
    date: string;
    category: 'Market' | 'Education' | 'Company';
    imageUrl?: string;
    source?: string;
    sourceUrl?: string;
}

export interface AppContextType {
    user: User;
    managedUsers: User[]; // Admin managed users
    holdings: UserPosition[];
    transactions: TransactionRecord[];
    funds: FundViewModel[]; // Global Funds Data
    navLogs: Record<number, FundNav[]>; // Key: fundId, Value: Historical NAVs
    dividendRecords: DividendRecord[];
    sysConfig: SysConfig;
    operationLogs: OperationLog[];
    backtestTasks: BacktestTask[];
    
    // Chat State
    chatSessions: ChatSession[];
    sendUserMessage: (text: string, image?: string) => void;
    
    login: (phone: string, isAdmin?: boolean) => void;
    logout: () => void;
    updateUserRisk: (score: number, level: number, label: string) => void;
    certifyInvestor: () => void;
    
    buyFund: (fund: FundViewModel, amount: number, signature: string) => Promise<{ success: boolean; message: string }>;
    redeemFund: (fundId: number, shares: number) => Promise<{ success: boolean; message: string }>;
    depositCash: (amount: number) => void;
    processSettlement: () => void;
    
    // Admin Actions
    adminActions: {
        addFund: (fund: FundViewModel) => void;
        updateFund: (fund: FundViewModel) => void;
        auditTransaction: (txId: number, action: 'confirm' | 'reject', remark?: string) => void;
        updateNav: (fundId: number, navRecord: FundNav) => void; // Update/Insert single NAV
        batchUpdateNav: (fundId: number, navRecords: FundNav[]) => void; // Batch import
        liquidateFund: (fundId: number) => void; // 基金清算
        adjustHolding: (holdingId: number, newShares: number, newCost: number, remark: string) => void; // 手动调整持仓
        executeDividend: (fundId: number, type: 1|2, amountPerShare: number, date: string) => void; // 执行分红
        
        // New Actions
        updateSysConfig: (config: SysConfig) => void;
        logOperation: (action: string, target: string, content: string) => void;
        backupData: () => void;
        generateMockUsers: (count: number) => void;
        generateMockTransactions: (count: number) => void;
        
        // Chat Actions
        sendAdminMessage: (sessionId: string, text: string) => void;
        markSessionRead: (sessionId: string) => void;
        // 新增财务服务提醒功能
        sendFinancialServiceReminder: (sessionId: string) => void;

        // User Management Actions
        addUser: (u: User) => void;
        updateUser: (u: User) => void;
        deleteUser: (id: number) => void;
        toggleUserStatus: (id: number, status: 1 | 2 | 3) => void;
        resetUserPassword: (id: number) => void;
        // 新增资金管理功能
        addUserBalance: (id: number, amount: number, remark?: string) => void;
        deductUserBalance: (id: number, amount: number, remark?: string) => void;
    }
}
