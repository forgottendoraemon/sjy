import * as globalConst from '@/assets/js/globalConst.js'
import Vue from "vue";
export default {
    methods: {
        /**
         *   
         * 验证用户名 (获取数据库是否存在)
         * @param {string} name 用户名
         * @param {boolean} isExist  是否要验证用户是否存在 
         */
        checkName(name, isExist = false) {
            return new Promise((resolve, reject) => {
                const reg = globalConst.USERNAME_REGEX
                if (name.length < 6) {
                    resolve("用户名长度必须为6到12位")
                    return;
                } else if (!reg.test(name)) {
                    resolve("请输入合法用户名(字母开头的字母/数字任意组合)")
                    return;
                }
                if (isExist) {
                    this.getUserExist(name).then(res => {
                        if (!res) {
                            resolve("")
                        } else {
                            resolve("用户名已存在")
                        }
                    })
                }
            })
        },
        /**
         * 验证密码
         * @param {string} Pass 密码
         */
        checkPass(Pass) {
            return new Promise((resolve, reject) => {
                const reg = globalConst.PASSWORD_REGEX
                let Message = "";
                if (Pass.length < 6) {
                    Message = "请输入6到12位长度的密码"
                } else if (!reg.test(Pass)) {
                    Message = "含有非法字符,请重新输入"
                }
                resolve(Message)
            })
        },
        /**
         * 验证邮箱
         * @param {string} email 邮箱地址
         * @param {boolean} isExist  是否要验证邮箱是否存在 
         */
        checkEmail(email, isExist = false) {
            return new Promise((resolve, reject) => {
                const reg = globalConst.EMAIL_REGEX
                if (!reg.test(email)) {
                    resolve("请输入正确的邮箱地址")
                    return;
                }
                if (isExist) {
                    Vue.axios.get(`/user/emailexist?email=${email}`).then(ctx => {
                        if (ctx.data) {
                            resolve('邮箱已被使用,请绑定其他邮箱')
                        } else {
                            resolve("")
                        }
                    })
                }
            })
        },
        /**
         * 验证给定的手机号是否存在
         */
        checkPhoneNumberExist(phonenumber) {
            return new Promise((resolve, reject) => {
                const reg = /^1([38]\d|5[0-35-9]|7[3678])\d{8}$/;
                if (reg.test(phonenumber)) {
                    Vue.axios.get(`/user/phonenumberexist?phonenumber=${phonenumber}`).then(ctx => {
                        if (ctx.data) {
                            resolve('');
                        } else {
                            resolve("输入的手机号未注册");
                        }
                    })
                } else {
                    resolve("请输入正确的手机号");
                }
            })
        },
        /**
         * 验证手机号
         * @param {*} phonenumber 
         */
        checkPhoneNumber(phonenumber) {
            return new Promise((resolve, reject) => {
                const reg = /^1([38]\d|5[0-35-9]|7[3678])\d{8}$/;
                if (reg.test(phonenumber)) {
                    Vue.axios.get(`/user/phonenumberexist?phonenumber=${phonenumber}`).then(ctx => {
                        if (ctx.data) {
                            resolve('手机号已被使用,请绑定其他号码')
                        } else {
                            resolve("");
                        }
                    })
                } else {
                    resolve("请输入正确的手机号");
                }
            })
        },
        /**
         * 获取用户名是否被占用
         * @param {string} name 
         */
        async getUserExist(name) {
            let result
            await Vue.axios.get(`/user/userexist?username=${name}`).then(ctx => {
                result = ctx.data
            })
            return result
        },
    }
}