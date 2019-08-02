const config={
    server:{
        port:80
    },
    /**
     * 数据库连接配置
     */
    db: {
        user: "postgres",
        database: "sjy",
        password: "123456",
        port: 5432,
        host: "127.0.0.1",
        max: 20,
        idleTimeoutMillis: 3000
    },
    user:{
        defaultAdmin:{
            username:"adminu",
            password:"admin123"
        },
        enableRegisterEmail:true,
        differentEnable:true
    },
    /**
     * 邮件发送配置
     */
    emali: {
        /**
         * 发件邮箱
         */
        from: "498814515@qq.com",
        /**
         * SMTP密码
         */
        SMTPPassword: "vjukyysvqfxtbjfj",
        /**
         * 服务商
         */
        service: 'qq',
        /**
         * 端口
         */
        port: 465,
        /**
         * 向同一个邮箱发送邮件的最小间隔
         */
        minInterval: 60000
    }
}

module.exports = config;