// 验证用户名 正则表达式
export const USERNAME_REGEX = /^\w[\d\w]{5,11}$/
// 验证用户密码 正则表达式
export const PASSWORD_REGEX = /^[\d\w~!@#$%^&()_+=-]{6,12}$/
// 验证邮箱 正则表达式
export const EMAIL_REGEX = /^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$/
