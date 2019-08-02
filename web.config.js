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
}

module.exports = config;